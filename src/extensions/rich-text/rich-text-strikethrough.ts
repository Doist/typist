import { Strike } from '@tiptap/extension-strike'

import type { StrikeOptions } from '@tiptap/extension-strike'

/**
 * Custom extension that extends the built-in `Strike` extension to overwrite the default keyboard.
 */
const RichTextStrikethrough = Strike.extend({
    addKeyboardShortcuts() {
        return {
            'Mod-Shift-x': () => this.editor.commands.toggleStrike(),
        }
    },
})

export { RichTextStrikethrough }

export type { StrikeOptions as RichTextStrikethroughOptions }
