import { Editor } from '@tiptap/core'

import { RichTextKit } from '../src/extensions/rich-text/rich-text-kit'

import type { RichTextKitOptions } from '../src/extensions/rich-text/rich-text-kit'

/**
 * Creates a rich-text editor with the given initial content and `RichTextKit` options, destroyed
 * when the current test finishes.
 *
 * The `Code` extension is always disabled because `prosemirror-codemark` (which it registers)
 * loads a second CJS copy of `prosemirror-state` in the Vitest environment, crashing `Editor`
 * instantiation with "Adding different instances of a keyed plugin".
 *
 * @param content The initial content of the editor.
 * @param options The `RichTextKit` options to configure the editor with.
 *
 * @returns The created editor.
 */
function createRichTextEditor(content: string, options: Partial<Omit<RichTextKitOptions, 'code'>> = {}): Editor {
    const editor = new Editor({
        extensions: [RichTextKit.configure({ ...options, code: false })],
        content,
    })
    onTestFinished(() => editor.destroy())

    return editor
}

/**
 * Finds the position where the first occurrence of the given text starts within the editor
 * document.
 *
 * @param editor The editor whose document to search.
 * @param text The text to find.
 *
 * @returns The position where the text starts.
 *
 * @throws When the text is not found in the document.
 */
function getTextPosition(editor: Editor, text: string): number {
    let textPosition: number | null = null

    editor.state.doc.descendants((node, position) => {
        if (textPosition === null && node.isText && node.text?.includes(text)) {
            textPosition = position + node.text.indexOf(text)
        }
    })

    if (textPosition === null) {
        throw new Error(`Text "${text}" was not found in the document`)
    }

    return textPosition
}

export { createRichTextEditor, getTextPosition }
