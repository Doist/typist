import { RawCommands } from '@tiptap/core'
import { DOMParser } from 'prosemirror-model'

import { parseHtmlToElement } from '../../../../helpers/dom'
import { getHTMLSerializerInstance } from '../../../../serializers/html/html'

import type { ParseOptions } from 'prosemirror-model'
import type { InternalEditorDataStorage } from '../../internal-editor-data'

/**
 * Augment the official `@tiptap/core` module with extra commands so that the compiler knows about
 * them. For this to work externally, a wildcard export needs to be added to the root `index.ts`.
 */
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        insertMarkdownContent: {
            /**
             * Inserts the provided Markdown as HTML into the editor.
             *
             * @param markdown The Markdown to parse and insert as HTML.
             * @param parseOptions The parse options for ProseMirror's DOMParser.
             */
            insertMarkdownContent: (markdown: string, parseOptions?: ParseOptions) => ReturnType
        }
    }
}

/**
 * Inserts the provided Markdown as HTML into the editor.
 *
 * The solution for this function was inspired how ProseMirror pastes content from the clipboard,
 * and how Tiptap inserts content with the `insertContentAt` command.
 */
function insertMarkdownContent(
    markdown: string,
    parseOptions?: ParseOptions,
): ReturnType<RawCommands['insertMarkdownContent']> {
    return ({ dispatch, editor, tr }) => {
        // Check if the transaction should be dispatched
        // ref: https://tiptap.dev/api/commands#dry-run-for-commands
        if (dispatch) {
            const htmlContent = getHTMLSerializerInstance(
                (editor.storage.internalEditorData as InternalEditorDataStorage).id,
                editor.schema,
            ).serialize(markdown)

            // Inserts the HTML content into the editor while preserving the current selection
            tr.replaceSelection(
                DOMParser.fromSchema(editor.schema).parseSlice(
                    parseHtmlToElement(htmlContent),
                    parseOptions,
                ),
            )
        }

        return true
    }
}

export { insertMarkdownContent }
