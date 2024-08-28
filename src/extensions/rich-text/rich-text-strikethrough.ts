import { Strike } from '@tiptap/extension-strike'

import type { StrikeOptions } from '@tiptap/extension-strike'

/**
 * The options available to customize the `RichTextStrikethrough` extension.
 */
type RichTextStrikethroughOptions = StrikeOptions

/**
 * Custom extension that extends the built-in `Strike` extension to overwrite the default keyboard.
 */
const RichTextStrikethrough = Strike.extend<RichTextStrikethroughOptions>({
    addKeyboardShortcuts() {
        return {
            'Mod-Shift-x': () => this.editor.commands.toggleStrike(),
        }
    },
})

export { RichTextStrikethrough }

export type { RichTextStrikethroughOptions }
