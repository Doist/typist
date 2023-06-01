import { escape, kebabCase } from 'lodash-es'
import rehypeMinifyWhitespace from 'rehype-minify-whitespace'
import rehypeStringify from 'rehype-stringify'
import remarkBreaks from 'remark-breaks'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

import { computeSchemaId, isPlainTextDocument } from '../../helpers/schema'

import { rehypeCodeBlock } from './plugins/rehype-code-block'
import { rehypeImage } from './plugins/rehype-image'
import { rehypeSuggestions } from './plugins/rehype-suggestions'
import { rehypeTaskList } from './plugins/rehype-task-list'
import { remarkDisableConstructs } from './plugins/remark-disable-constructs'
import { remarkStrikethrough } from './plugins/remark-strikethrough'

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
 * The type for the object that holds multiple HTML serializer instances.
 */
type HTMLSerializerInstanceById = {
    [id: string]: HTMLSerializerReturnType
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
 * Create a Markdown to HTML serializer with the unified ecosystem for a rich-text editor, or use a
 * custom serializer for a plain-text editor. The editor schema is used to detect which nodes and
 * marks are available in the editor, and only parses the input with the minimal required plugins.
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

    // Initialize a unified processor with a remark plugin for parsing Markdown
    const unifiedProcessor = unified().use(remarkParse)

    // Configure the unified processor to use a custom plugin to disable constructs based on the
    // supported extensions that are enabled in the editor schema
    unifiedProcessor.use(remarkDisableConstructs, schema)

    // Configure the unified processor to use a third-party plugin to turn soft line endings into
    // hard breaks (i.e. `<br>`), which will display user content closer to how it was authored
    // (although not CommonMark compliant, this resembles the behaviour we always supported)
    if (schema.nodes.hardBreak) {
        unifiedProcessor.use(remarkBreaks)
    }

    // Configure the unified processor to use a custom plugin to add support for the strikethrough
    // extension from the GitHub Flavored Markdown (GFM) specification
    if (schema.marks.strike) {
        unifiedProcessor.use(remarkStrikethrough)
    }

    // Configure the unified processor with an official plugin to convert Markdown into HTML to
    // support rehype (a tool that transforms HTML with plugins), followed by another official
    // plugin to minify whitespace between tags (prevents line feeds from appearing as blank)
    unifiedProcessor
        .use(remarkRehype, {
            // Persist raw HTML (disables support for custom elements/tags)
            // ref: https://github.com/Doist/Issues/issues/5689
            allowDangerousHtml: true,
        })
        // This must come before all rehype plugins that transform the HTML output
        .use(rehypeMinifyWhitespace, {
            // Preserve line breaks when collapsing whitespace (e.g., line feeds)
            newlines: true,
        })

    // Configure the unified processor with a custom plugin to remove the trailing newline from code
    // blocks (i.e. the newline between the last code line and `</code></pre>`)
    if (schema.nodes.codeBlock) {
        unifiedProcessor.use(rehypeCodeBlock)
    }

    // Configure the unified processor with a custom plugin to remove the wrapping paragraph from
    // images and to remove all inline images based on inline images support in the editor schema
    if (schema.nodes.paragraph && schema.nodes.image) {
        unifiedProcessor.use(rehypeImage, schema)
    }

    // Configure the unified processor with a custom plugin to add support Tiptap task lists
    if (schema.nodes.taskList && schema.nodes.taskItem) {
        unifiedProcessor.use(rehypeTaskList)
    }

    // Configure the unified processor with a custom plugin to add support for suggestions nodes
    unifiedProcessor.use(rehypeSuggestions, schema)

    // Configure the unified processor with an official plugin that defines how to take a syntax
    // tree as input and turn it into serialized HTML
    unifiedProcessor.use(rehypeStringify, {
        entities: {
            // Compatibility with the previous implementation in Marked
            useNamedReferences: true,
        },
    })

    return {
        serialize(markdown: string) {
            return unifiedProcessor.processSync(markdown).toString()
        },
    }
}

/**
 * Object that holds multiple HTML serializer instances based on a given ID.
 */
const htmlSerializerInstanceById: HTMLSerializerInstanceById = {}

/**
 * Returns a singleton instance of a HTML serializer based on the provided editor schema.
 *
 * @param schema The editor schema connected to the HTML serializer instance.
 *
 * @returns The HTML serializer instance for the given editor schema.
 */
function getHTMLSerializerInstance(schema: Schema) {
    const id = computeSchemaId(schema)

    if (!htmlSerializerInstanceById[id]) {
        htmlSerializerInstanceById[id] = createHTMLSerializer(schema)
    }

    return htmlSerializerInstanceById[id]
}

export { createHTMLSerializer, getHTMLSerializerInstance }

export type { HTMLSerializerReturnType }
