import type { Editor } from '@tiptap/core'

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

export { getTextPosition }
