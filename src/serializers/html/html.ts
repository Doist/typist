import { escape, kebabCase } from 'lodash-es'
import { marked } from 'marked'

import { REGEX_LINE_BREAKS } from '../../constants/regular-expressions'
import { isPlainTextDocument } from '../../helpers/schema'
import { buildSuggestionSchemaPartialRegex } from '../../helpers/serializer'

import { checkbox } from './extensions/checkbox'
import { code } from './extensions/code'
import { disabled } from './extensions/disabled'
import { html } from './extensions/html'
import { link } from './extensions/link'
import { paragraph } from './extensions/paragraph'
import { taskList } from './extensions/task-list'

import type { Schema } from 'prosemirror-model'

/**
 * The return type for the `createHTMLSerializer` function.
 */
type HTMLSerializerReturnType = {
    /**
     * Serializes an input Markdown string to an output HTML string.
     *
     * @param markdown The Markdown string to serialize.
     *
     * @returns The serialized HTML.
     */
    serialize: (markdown: string) => string
}

/**
 * Sensible default options to initialize the Marked parser with.
 *
 * @see https://marked.js.org/using_advanced#options
 */
const INITIAL_MARKED_OPTIONS: marked.MarkedOptions = {
    ...marked.getDefaults(),
    breaks: true,
    gfm: true,
    headerIds: false,
    silent: true,
}

/**
 * Create a custom Markdown to HTML serializer for plain-text editors only.
 *
 * @param schema The editor schema to be used for nodes and marks detection.
 *
 * @returns A normalized object for the HTML serializer.
 */
function createHTMLSerializerForPlainTextEditor(schema: Schema) {
    return {
        serialize(markdown: string) {
            // Converts special characters (i.e. `&`, `<`, `>`, `"`, and `'`) to their corresponding
            // HTML entities because we need to output the full content as valid HTML (i.e. the
            // editor should not drop invalid HTML).
            let htmlResult = escape(markdown)

            // Serialize all suggestion links if any suggestion node exists in the schema
            Object.values(schema.nodes)
                .filter((node) => node.name.endsWith('Suggestion'))
                .forEach((suggestionNode) => {
                    const linkSchema = kebabCase(suggestionNode.name.replace(/Suggestion$/, ''))

                    htmlResult = htmlResult.replace(
                        new RegExp(`\\[([^\\[]+)\\]\\((?:${linkSchema}):\\/\\/(\\d+)\\)`, 'gm'),
                        `<span data-${linkSchema} data-id="$2" data-label="$1"></span>`,
                    )
                })

            // Return the serialized HTML with every line wrapped in a paragraph element
            return htmlResult.replace(/^([^\n]+)\n?|\n+/gm, `<p>$1</p>`)
        },
    }
}

/**
 * Create a Markdown to HTML serializer with the Marked library for a rich-text editor, or use a
 * custom serializer for a plain-text editor. The editor schema is used to detect which nodes and
 * marks are available in the editor, and only parses the input with the minimal required rules.
 *
 * @param schema The editor schema to be used for nodes and marks detection.
 *
 * @returns A normalized object for the HTML serializer.
 */
function createHTMLSerializer(schema: Schema): HTMLSerializerReturnType {
    // Returns a custom HTML serializer for plain-text editors
    if (isPlainTextDocument(schema)) {
        return createHTMLSerializerForPlainTextEditor(schema)
    }

    // Reset Marked instance to the initial options
    marked.setOptions(INITIAL_MARKED_OPTIONS)

    // Disable built-in rules that are not supported by the schema
    marked.use(disabled(schema))

    // Overwrite some built-in rules for handling of special behaviours
    // (see documentation for each extension for more details)
    marked.use(checkbox, html, paragraph(schema.nodes.image))

    // Overwrite the built-in `code` rule if the corresponding node exists in the schema
    if (schema.nodes.codeBlock) {
        marked.use(code)
    }

    // Add a rule for a task list if the corresponding nodes exists in the schema
    if (schema.nodes.taskList && schema.nodes.taskItem) {
        marked.use(taskList)
    }

    // Build a regular expression with all the available suggestion nodes from the schema
    const suggestionSchemaPartialRegex = buildSuggestionSchemaPartialRegex(schema)

    // Overwrite the built-in link rule if any suggestion node exists in the schema
    if (suggestionSchemaPartialRegex) {
        marked.use(link(new RegExp(`^${suggestionSchemaPartialRegex}`)))
    }

    return {
        serialize(markdown: string) {
            return (
                marked
                    .parse(markdown)
                    // Removes line breaks after HTML tags from the HTML output with a specially
                    // crafted RegExp (this is needed to prevent the editor from converting newline
                    // control characters to blank paragraphs).
                    .replace(
                        new RegExp(`>${REGEX_LINE_BREAKS.source}`, REGEX_LINE_BREAKS.flags),
                        '>',
                    )
            )
        },
    }
}

export { createHTMLSerializer, INITIAL_MARKED_OPTIONS }

export type { HTMLSerializerReturnType }
