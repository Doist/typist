import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'

import { REGEX_PUNCTUATION } from '../../constants/regular-expressions'
import { computeSchemaId, isPlainTextDocument } from '../../helpers/schema'

import { rehypeImage } from './plugins/rehype-image'
import { rehypeSuggestions } from './plugins/rehype-suggestions'
import { rehypeTaskList } from './plugins/rehype-task-list'
import { remarkStrikethrough } from './plugins/remark-strikethrough'
import { remarkTaskList } from './plugins/remark-task-list'

import type { Schema } from '@tiptap/pm/model'
import type { Options as RemarkStringifyOptions } from 'remark-stringify'

type RehypeRemarkOptions = NonNullable<Parameters<typeof rehypeRemark>[1]>
type Handle = NonNullable<NonNullable<RehypeRemarkOptions['handlers']>[string]>
type Join = NonNullable<RemarkStringifyOptions['join']>[number]

/**
 * The return type for the `createMarkdownSerializer` function.
 */
type MarkdownSerializerReturnType = {
    /**
     * Serializes an input HTML string to an output Markdown string.
     *
     * @param html The HTML string to serialize.
     *
     * @returns The serialized Markdown.
     */
    serialize: (html: string) => string
}

/**
 * The type for the object that holds multiple Markdown serializer instances.
 */
type MarkdownSerializerInstanceById = {
    [id: string]: MarkdownSerializerReturnType
}

/**
 * The bullet list marker for both standard and task list items.
 */
const BULLET_LIST_MARKER = '-'

/**
 * Regular expression matching a backslash followed by any punctuation mark. Used to escape the
 * backslash itself so it isn't interpreted as an escape sequence for the subsequent character.
 */
const REGEX_ESCAPED_PUNCTUATION = new RegExp(`(\\\\${REGEX_PUNCTUATION.source})`, 'g')

/**
 * Regular expression matching text that looks like an ordered list item at the start of a line
 * (e.g. `1. Foo`). Used to escape the period so the text isn't interpreted as a list.
 */
const REGEX_ORDERED_LIST_PREFIX = /^(\d+)\.(\s.+|$)/

/**
 * Builds the rehype-remark options for the given editor schema. Element handlers are added
 * conditionally based on which marks and nodes are available, so unsupported elements are
 * preserved as their text content rather than being dropped or causing errors.
 *
 * @see https://github.com/rehypejs/rehype-remark#api
 *
 * @param schema The editor schema to be used for nodes and marks detection.
 */
function getRehypeRemarkOptions(schema: Schema): RehypeRemarkOptions {
    const handlers: Record<string, Handle> = {}

    // When the schema does not support strikethrough, unwrap the strikethrough tags into their
    // children so the inner text is preserved without a `delete` mdast node being created
    // (`hast-util-to-mdast` maps all three tags to the same node type)
    if (!schema.marks.strike) {
        handlers.s = (state, node) => state.all(node)
        handlers.del = (state, node) => state.all(node)
        handlers.strike = (state, node) => state.all(node)
    }

    return { handlers }
}

/**
 * Builds the remark-stringify options for the given editor mode. For plain-text editors, Markdown
 * escaping is disabled (so user-authored content is preserved as-is) and consecutive paragraphs
 * are separated by a single newline instead of a blank line.
 *
 * @see https://github.com/remarkjs/remark/tree/main/packages/remark-stringify#options
 *
 * @param isPlainText Whether the editor is a plain-text editor.
 */
function getRemarkStringifyOptions(isPlainText: boolean): RemarkStringifyOptions {
    return {
        bullet: BULLET_LIST_MARKER,
        emphasis: '*',
        strong: '*',
        rule: '-',
        ruleRepetition: 3,
        fences: true,
        fence: '`',
        listItemIndent: 'one',
        resourceLink: true,
        handlers: {
            // Output a plain newline for hard breaks instead of the CommonMark backslash syntax
            // (i.e. `\\\n`), since `remark-breaks` treats plain newlines as hard breaks
            break() {
                return '\n'
            },
            // Apply the minimal custom escape rules required for rich-text content. Plain-text
            // mode returns text values as-is, so user-authored content is preserved without any
            // Markdown escaping.
            text(node) {
                if (isPlainText) {
                    return node.value
                }

                return (
                    node.value
                        // Escape backslashes that precede any punctuation mark, to prevent the
                        // backslash itself from being interpreted as an escape sequence for the
                        // subsequent character. It's important to apply this rule first to avoid
                        // double escaping.
                        .replace(REGEX_ESCAPED_PUNCTUATION, '\\$1')
                        // Escape text content that looks like an ordered list item at the start of
                        // a line, to prevent it from being interpreted as a list whenserialized
                        .replace(REGEX_ORDERED_LIST_PREFIX, '$1\\.$2')
                )
            },
        },
        join: [
            // Force tight list rendering regardless of the `spread` attribute on lists or list
            // items, so that simple list items are not separated by blank lines (matching the
            // previous behavior and the common user expectation). Consecutive paragraphs inside
            // a list item keep the default blank-line separation, so multi-paragraph items
            // serialize as valid loose-list content and survive round-tripping.
            (left, right, parent) => {
                if (parent.type === 'list') {
                    return 0
                }

                if (
                    parent.type === 'listItem' &&
                    !(left.type === 'paragraph' && right.type === 'paragraph')
                ) {
                    return 0
                }
            },
            // Separate consecutive paragraphs with a single newline instead of a blank line
            // (plain-text only)
            ...(isPlainText
                ? [
                      ((left, right) => {
                          if (left.type === 'paragraph' && right.type === 'paragraph') {
                              return 0
                          }
                      }) as Join,
                  ]
                : []),
        ],
    }
}

/**
 * Create an HTML to Markdown serializer with the unified ecosystem for both a rich-text editor, and
 * a plain-text editor. The editor schema is used to detect which nodes and marks are available in
 * the editor, and only parses the input with the minimal required plugins.
 *
 * **Note:** Unlike the HTML serializer, built-in rules that are not supported by the schema are not
 * disabled because if the schema does not support certain nodes/marks, the parsing rules don't have
 * valid HTML elements to match in the editor HTML output.
 *
 * @param schema The editor schema to be used for nodes and marks detection.
 *
 * @returns A normalized object for the Markdown serializer.
 */
function createMarkdownSerializer(schema: Schema): MarkdownSerializerReturnType {
    const isPlainText = isPlainTextDocument(schema)

    // Initialize a unified processor with a rehype plugin for parsing HTML fragments
    const unifiedProcessor = unified().use(rehypeParse, { fragment: true })

    // Configure the unified processor with a custom plugin to handle edge cases for images
    // (must run before `rehypeRemark` since it transforms hast nodes)
    if (schema.nodes.image) {
        unifiedProcessor.use(rehypeImage)
    }

    // Configure the unified processor with a custom plugin to add support for Tiptap task lists
    // (must run before `rehypeRemark` since it transforms hast nodes)
    if (schema.nodes.taskList && schema.nodes.taskItem) {
        unifiedProcessor.use(rehypeTaskList)
    }

    // Configure the unified processor with a custom plugin to add support for suggestions nodes
    // (must run before `rehypeRemark` since it transforms hast nodes)
    unifiedProcessor.use(rehypeSuggestions, schema)

    // Configure the unified processor with an official plugin to convert HTML into Markdown to
    // support remark (a tool that transforms Markdown with plugins)
    unifiedProcessor.use(rehypeRemark, getRehypeRemarkOptions(schema))

    // Configure the unified processor with a custom plugin to add support for the strikethrough
    // extension from the GitHub Flavored Markdown (GFM) specification
    if (schema.marks.strike) {
        unifiedProcessor.use(remarkStrikethrough)
    }

    // Configure the unified processor with a custom plugin to add support for the task list
    // extension from the GitHub Flavored Markdown (GFM) specification
    if (schema.nodes.taskList && schema.nodes.taskItem) {
        unifiedProcessor.use(remarkTaskList)
    }

    // Configure the unified processor with an official plugin that defines how to take a syntax
    // tree as input and turn it into serialized Markdown
    unifiedProcessor.use(remarkStringify, getRemarkStringifyOptions(isPlainText))

    return {
        serialize(html: string) {
            // For plain-text editors, preserve runs of 2+ spaces by replacing them with
            // non-breaking spaces before parsing (otherwise `rehype-parse` collapses them), and
            // restoring them after serialization. This is required to preserve syntax like
            // nested lists where leading indentation matters.
            const input = isPlainText
                ? html.replace(/ {2,}/g, (match) => match.replace(/ /g, '\u00a0'))
                : html

            const result = unifiedProcessor.processSync(input).toString().trimEnd()

            return isPlainText ? result.replace(/\u00a0/g, ' ') : result
        },
    }
}

/**
 * Object that holds multiple Markdown serializer instances based on a given ID.
 */
const markdownSerializerInstanceById: MarkdownSerializerInstanceById = {}

/**
 * Returns a singleton instance of a Markdown serializer based on the provided editor schema.
 *
 * @param schema The editor schema connected to the Markdown serializer instance.
 *
 * @returns The Markdown serializer instance for the given editor schema.
 */
function getMarkdownSerializerInstance(schema: Schema) {
    const id = computeSchemaId(schema)

    if (!markdownSerializerInstanceById[id]) {
        markdownSerializerInstanceById[id] = createMarkdownSerializer(schema)
    }

    return markdownSerializerInstanceById[id]
}

export { BULLET_LIST_MARKER, createMarkdownSerializer, getMarkdownSerializerInstance }

export type { MarkdownSerializerReturnType }
