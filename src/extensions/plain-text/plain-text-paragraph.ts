import { Paragraph, ParagraphOptions } from '@tiptap/extension-paragraph'

/**
 * Custom extension that extends the built-in `Paragraph` extension to add an additional keyboard
 * shortcut to insert a newline (needed to behave more closely to the `<textarea>` component).
 */
const PlainTextParagraph = Paragraph.extend<ParagraphOptions>({
    addKeyboardShortcuts() {
        return {
            'Shift-Enter': () => this.editor.commands.enter(),
        }
    },
})

export { PlainTextParagraph }

export type { ParagraphOptions as PlainTextParagraphOptions }
