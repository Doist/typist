import { RawCommands, selectionToInsertionEnd } from '@tiptap/core'
import { DOMParser } from 'prosemirror-model'

import { parseHtmlToElement } from '../../../../helpers/dom'
import { getHTMLSerializerInstance } from '../../../../serializers/html/html'

import type { Range } from '@tiptap/core'
import type { ParseOptions } from 'prosemirror-model'

/**
 * Augment the official `@tiptap/core` module with extra commands so that the compiler knows about
 * them. For this to work externally, a wildcard export needs to be added to the root `index.ts`.
 */
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        insertMarkdownContentAt: {
            /**
             * Inserts the provided Markdown content as HTML into the editor at a specific position.
             *
             * @param position The position or range the Markdown will be inserted in.
             * @param markdown The Markdown content to parse and insert as HTML.
             * @param options An optional object with the following parameters:
             * @param options.parseOptions The parse options to use when the HTML content is parsed by ProseMirror.
             * @param options.updateSelection Whether the selection should move to the newly inserted content.
             */
            insertMarkdownContentAt: (
                position: number | Range,
                markdown: string,
                options?: {
                    parseOptions?: ParseOptions
                    updateSelection?: boolean
                },
            ) => ReturnType
        }
    }
}

/**
 * Inserts the provided Markdown content as HTML into the editor at a specific position.
 *
 * The solution for this function was inspired by how ProseMirror pastes content from the clipboard,
 * and how Tiptap inserts content with the `insertContentAt` command.
 */
function insertMarkdownContentAt(
    position: number | Range,
    markdown: string,
    options?: {
        parseOptions?: ParseOptions
        updateSelection?: boolean
    },
): ReturnType<RawCommands['insertMarkdownContentAt']> {
    return ({ editor, tr, dispatch }) => {
        // Check if the transaction should be dispatched
        // ref: https://tiptap.dev/api/commands#dry-run-for-commands
        if (dispatch) {
            // Default values for command options must be set here
            // (they do not work if set in the function signature)
            options = {
                parseOptions: {},
                updateSelection: true,
                ...options,
            }

            // Get the start and end positions from the provided position
            let { from, to } =
                typeof position === 'number'
                    ? { from: position, to: position }
                    : { from: position.from, to: position.to }

            // If the selection is empty, and we're in an empty textblock, expand the start and end
            // positions to include the whole textblock (not leaving empty paragraphs behind)
            if (from === to) {
                const { parent } = tr.doc.resolve(from)

                if (parent.isTextblock && parent.childCount === 0) {
                    from -= 1
                    to += 1
                }
            }

            // Parse the Markdown to HTML and then then into ProseMirror nodes
            const htmlContent = getHTMLSerializerInstance(editor.schema).serialize(markdown)
            const content = DOMParser.fromSchema(editor.schema).parse(
                parseHtmlToElement(htmlContent),
                options.parseOptions,
            )

            // Inserts the content into the editor while preserving the current selection
            tr.replaceWith(from, to, content)

            // Set the text cursor to the end of the inserted content
            if (options.updateSelection) {
                selectionToInsertionEnd(tr, tr.steps.length - 1, -1)
            }
        }

        return true
    }
}

export { insertMarkdownContentAt }
