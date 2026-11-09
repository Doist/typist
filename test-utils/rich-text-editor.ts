import { Editor } from '@tiptap/core'

import { RichTextKit } from '../src/extensions/rich-text/rich-text-kit'

import type { RichTextKitOptions } from '../src/extensions/rich-text/rich-text-kit'

/**
 * The options available to customize the editor created by `createEditorWithCaretAfter`.
 */
type CreateEditorWithCaretAfterOptions = Partial<Omit<RichTextKitOptions, 'code'>> & {
    /**
     * Selects the given text itself, instead of placing the caret right after it.
     */
    selectText?: boolean
}

/**
 * Creates a rich-text editor with the given initial content and `RichTextKit` options, and places
 * the caret right after the first occurrence of the given text within the document (or selects
 * the text itself, with `selectText`).
 *
 * The `Code` extension is disabled because `prosemirror-codemark` (which it registers) loads a
 * second CJS copy of `prosemirror-state` in the Vitest environment, crashing `Editor`
 * instantiation with "Adding different instances of a keyed plugin".
 */
function createEditorWithCaretAfter(
    content: string,
    text: string,
    { selectText = false, ...richTextKitOptions }: CreateEditorWithCaretAfterOptions = {},
): Editor {
    const editor = new Editor({
        extensions: [RichTextKit.configure({ ...richTextKitOptions, code: false })],
        content,
    })
    onTestFinished(() => editor.destroy())

    let caretPosition: number | null = null
    editor.state.doc.descendants((node, position) => {
        if (caretPosition === null && node.isText && node.text?.includes(text)) {
            caretPosition = position + node.text.indexOf(text) + text.length
        }
    })

    if (caretPosition === null) {
        throw new Error(`Text "${text}" was not found in the document`)
    }

    editor.commands.setTextSelection(
        selectText ? { from: caretPosition - text.length, to: caretPosition } : caretPosition,
    )

    return editor
}

export { createEditorWithCaretAfter }
