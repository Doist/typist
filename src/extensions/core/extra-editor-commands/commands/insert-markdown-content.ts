import { RawCommands } from '@tiptap/core'

import type { ParseOptions } from '@tiptap/pm/model'

/**
 * Augment the official `@tiptap/core` module with extra commands so that the compiler knows about
 * them. For this to work externally, a wildcard export needs to be added to the root `index.ts`.
 */
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        insertMarkdownContent: {
            /**
             * Inserts the provided Markdown as HTML into the editor at the current position.
             *
             * @param markdown The Markdown content to parse and insert as HTML.
             * @param options An optional object with the following parameters:
             * @param options.parseOptions The parse options to use when the HTML content is parsed by ProseMirror.
             * @param options.updateSelection Whether the selection should move to the newly inserted content.
             */
            insertMarkdownContent: (
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
 * Inserts the provided Markdown as HTML into the editor at the current position.
 *
 * The solution for this function was inspired by how Tiptap inserts content with the
 * `insertContent` command.
 */
function insertMarkdownContent(
    markdown: string,
    options?: {
        parseOptions?: ParseOptions
        updateSelection?: boolean
    },
): ReturnType<RawCommands['insertMarkdownContent']> {
    return ({ commands, tr }) => {
        return commands.insertMarkdownContentAt(
            { from: tr.selection.from, to: tr.selection.to },
            markdown,
            options,
        )
    }
}

export { insertMarkdownContent }
