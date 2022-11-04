import { Extension } from '@tiptap/core'

import { extendWordRange } from './commands/extend-word-range'
import { insertMarkdownContent } from './commands/insert-markdown-content'

/**
 * The `ExtraEditorCommands` extension is a collection of editor commands that provide additional
 * helper commands not available with the built-in commands. This extension was built similarly to
 * the official `Commands` extension.
 */
const ExtraEditorCommands = Extension.create({
    name: 'extraEditorCommands',
    addCommands() {
        return {
            extendWordRange,
            insertMarkdownContent,
        }
    },
})

export { ExtraEditorCommands }
