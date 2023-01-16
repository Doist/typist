import Turndown from 'turndown'

import { REGEX_PUNCTUATION } from '../../constants/regular-expressions'
import { isPlainTextDocument } from '../../helpers/schema'

import { image } from './plugins/image'
import { listItem } from './plugins/list-item'
import { paragraph } from './plugins/paragraph'
import { strikethrough } from './plugins/strikethrough'
import { suggestion } from './plugins/suggestion'
import { taskItem } from './plugins/task-item'

import type { Schema } from 'prosemirror-model'

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
 * The bullet list marker for both standard and task list items.
 */
const BULLET_LIST_MARKER = '-'

/**
 * Sensible default options to initialize the Turndown with.
 *
 * @see https://github.com/mixmark-io/turndown#options
 */
const INITIAL_TURNDOWN_OPTIONS: Turndown.Options = {
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: BULLET_LIST_MARKER,
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '_',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    /**
     * Special rule to handle blank elements (overrides EVERY rule).
     *
     * @see https://github.com/mixmark-io/turndown#special-rules
     */
    blankReplacement(_, node) {
        const parentNode = node.parentNode as HTMLElement

        // Return the list marker for empty bullet list items
        if (node.nodeName === 'UL' || (parentNode?.nodeName === 'UL' && node.nodeName === 'LI')) {
            return `${BULLET_LIST_MARKER} `
        }

        // Return the list marker for empty ordered list items
        if (node.nodeName === 'OL' || (parentNode?.nodeName === 'OL' && node.nodeName === 'LI')) {
            const start =
                node.nodeName === 'LI'
                    ? parentNode.getAttribute('start')
                    : (node as HTMLElement).getAttribute('start')
            const index = Array.prototype.indexOf.call(parentNode.children, node)

            return `${start ? Number(start) + index : index + 1}. `
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: The `Turndown.Node` type does not include `isBlock`
        return node.isBlock ? '\n\n' : ''
    },
}

/**
 * Create an HTML to Markdown serializer with the Turndown library for both a rich-text editor, and
 * a plain-text editor. The editor schema is used to detect which nodes and marks are available in
 * the editor, and only parses the input with the minimal required rules.
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
    // Initialize Turndown with custom options
    const turndown = new Turndown(INITIAL_TURNDOWN_OPTIONS)

    // Turndown ensures Markdown characters are escaped (i.e. `\`) by default, so they are not
    // interpreted as Markdown when the output is compiled back to HTML. However, for plain-text
    // editors, we need to override the `escape` function to return the input as-is (effectively
    // disabling the escaping behaviour), so that all characters are interpreted as Markdown.
    if (isPlainTextDocument(schema)) {
        turndown.escape = (str) => str
    }
    // As for rich-text editors, we need to override the built-in escaping behaviour with a custom
    // implementation to suit our requirements. Please note that the `escape` function takes the
    // text content of each HTML element, with the exception of code elements, so we can be sure
    // that the escaping behaviour will only touch relevant Markdown characters.
    else {
        turndown.escape = (str) => {
            return (
                str
                    // Escape all backslash characters that precedes any punctuation characters,
                    // otherwise the backslash character itself will be interpreted as escaping the
                    // character that comes after it (which is not the intent). It's important that
                    // this escape rule is executed before all other escape rules, otherwise we
                    // could be double escaping some backslash characters.
                    .replace(new RegExp(`(\\\\${REGEX_PUNCTUATION.source})`, 'g'), '\\$1')

                    // Although the CommonMark specification allows for bulleted or ordered lists
                    // inside other bulleted or ordered lists (i.e. `- 1. - 1. Item`), the markup
                    // generated by Markdown compilers is not supported by Tiptap, and we need to
                    // make sure that text context that matches the ordered list syntax is
                    // correctly escaped in order to be interpreted as text.
                    .replace(/^(\d+)\.(\s.+|$)/, '$1\\.$2')
            )
        }
    }

    // Overwrite some built-in rules for handling of special behaviours
    // (see documentation for each extension for more details)
    turndown.use(paragraph(schema.nodes.paragraph, isPlainTextDocument(schema)))

    // Overwrite the built-in `image` rule if the corresponding node exists in the schema
    if (schema.nodes.image) {
        turndown.use(image(schema.nodes.image))
    }

    // Overwrite the built-in `listItem` rule if the corresponding node exists in the schema
    if ((schema.nodes.bulletList || schema.nodes.orderedList) && schema.nodes.listItem) {
        turndown.use(listItem(schema.nodes.listItem))
    }

    // Add a rule for `strikethrough` if the corresponding node exists in the schema
    if (schema.marks.strike) {
        turndown.use(strikethrough(schema.marks.strike))
    }

    // Add a rule for `taskItem` if the corresponding nodes exists in the schema
    if (schema.nodes.taskList && schema.nodes.taskItem) {
        turndown.use(taskItem(schema.nodes.taskItem))
    }

    // Add a custom rule for all suggestion nodes available in the schema
    Object.values(schema.nodes)
        .filter((node) => node.name.endsWith('Suggestion'))
        .forEach((suggestionNode) => {
            turndown.use(suggestion(suggestionNode))
        })

    // Return a normalized `serialize` function
    return {
        serialize(html: string) {
            let markdownResult = html

            // Turndown was built to convert HTML into Markdown, expecting the input to be
            // standard-compliant HTML. As such, it collapses all whitespace by default, and there's
            // currently no way to opt-out of this behavior. However, for plain-text editors, we
            // need to preserve Markdown whitespace (otherwise we lose syntax like nested lists) by
            // replacing all instances of the space character (but only if it's preceded by another
            // space character) by the non-breaking space character, and after processing the input
            // with Turndown, we restore the original space character.
            if (isPlainTextDocument(schema)) {
                markdownResult = markdownResult.replace(/ {2,}/g, (m) => m.replace(/ /g, '\u00a0'))
            }

            // Get the serialized Markdown parsed with Turndown
            markdownResult = turndown.turndown(markdownResult)

            // Restore the original space character for plain-text editors (as mentioned above),
            // after Markdown serialization has been performed
            if (isPlainTextDocument(schema)) {
                markdownResult = markdownResult.replace(/\u00a0/g, ' ')
            }

            // Return the serialized Markdown parsed with Turndown, and with trailing space
            // characters removed
            return markdownResult.replace(/ +$/gm, '')
        },
    }
}

export { BULLET_LIST_MARKER, createMarkdownSerializer }

export type { MarkdownSerializerReturnType }
