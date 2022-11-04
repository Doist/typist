import { escape, kebabCase } from 'lodash-es'
import { marked } from 'marked'

import { REGEX_LINE_BREAKS } from '../../constants/regular-expressions'
import { isPlainTextDocument } from '../../helpers/schema'

import { checkbox } from './extensions/checkbox'
import { code } from './extensions/code'
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
    breaks: true,
    gfm: true,
    headerIds: false,
    silent: true,
}

/**
 * Serialize the Markdown input to HTML with a custom serializer, ready for a plain-text editor.
 *
 * @param schema The editor schema to be used for nodes and marks detection.
 *
 * @returns The serialized HTML output.
 */
function serializeForPlainTextEditor(markdown: string, schema: Schema): string {
    // Converts special characters (i.e. `&`, `<`, `>`, `"`, and `'`) to their corresponding HTML
    // entities. Unlike the `sanitize` option that is used by the rich-text serializer, it's safe
    // for the plain-text serializer to escape the full input considering we need to output the full
    // content as valid HTML (i.e. the editor should not drop invalid HTML).
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
}

/**
 * Serialize the Markdown input to HTML with Marked, ready for a rich-text editor.
 *
 * @param markdown The input Markdown to be serialized to HTML.
 * @param schema The editor schema to be used for nodes and marks detection.
 *
 * @returns The serialized HTML output.
 */
function serializeForRichTextEditor(markdown: string, schema: Schema): string {
    // Reset Marked to the defaults and set custom options
    marked.setOptions({
        ...marked.getDefaults(),
        ...INITIAL_MARKED_OPTIONS,
    })

    // Disable built-in rules that the editor does not yet support
    marked.use({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Returning `undefined` is acceptable to disable tokens
        tokenizer: {
            ...(!schema.marks.strike
                ? {
                      del() {
                          /* noop: disables tokenizer */
                      },
                  }
                : {}),
            ...(!schema.nodes.heading
                ? {
                      heading() {
                          /* noop: disables tokenizer */
                      },
                  }
                : {}),
            ...(!schema.nodes.table
                ? {
                      table() {
                          /* noop: disables tokenizer */
                      },
                  }
                : {}),
        },
    })

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

    // Get all the available suggestion nodes from the schema
    const suggestionNodes = Object.values(schema.nodes).filter((node) =>
        node.name.endsWith('Suggestion'),
    )

    // Overwrite the built-in link rule if any suggestion node exists in the schema
    if (suggestionNodes.length > 0) {
        marked.use(link(suggestionNodes))
    }

    // Return the serialized HTML parsed with Marked
    return (
        marked
            .parse(markdown)
            // Removes newlines after tags from the HTML output with a specially crafted RegExp
            // (needed to prevent the editor from converting newlines to blank paragraphs)
            .replace(new RegExp(`>${REGEX_LINE_BREAKS.source}`, REGEX_LINE_BREAKS.flags), '>')
    )
}

/**
 * Create a Markdown to HTML serializer with the Marked library for a rich-text editor, or use a
 * custom serializer for a plain-text editor. The editor schema is used to detect which nodes and
 * marks are available in the editor, and only parses the input with the minimal required rules.
 *
 * @param schema The editor schema to be used for nodes and marks detection.
 *
 * @returns A normalized `serialize` function.
 */
function createHTMLSerializer(schema: Schema): HTMLSerializerReturnType {
    return {
        serialize(markdown: string) {
            return isPlainTextDocument(schema)
                ? serializeForPlainTextEditor(markdown, schema)
                : serializeForRichTextEditor(markdown, schema)
        },
    }
}

export { createHTMLSerializer }

export type { HTMLSerializerReturnType }
