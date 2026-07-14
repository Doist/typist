import { Editor } from '@tiptap/core'

import { RichTextKit } from './rich-text-kit'

/**
 * Creates a rich-text editor with the given initial content, and places the caret at the end of
 * the first occurrence of the given text within the document.
 *
 * The `Code` extension is disabled because `prosemirror-codemark` (which it registers) loads a
 * second CJS copy of `prosemirror-state` in the Vitest environment, crashing `Editor`
 * instantiation with "Adding different instances of a keyed plugin"; it has no bearing on the
 * list behavior under test.
 */
function createEditorWithCaretAfter(content: string, text: string): Editor {
    const editor = new Editor({
        extensions: [RichTextKit.configure({ code: false })],
        content,
    })

    let caretPosition: number | null = null
    editor.state.doc.descendants((node, position) => {
        if (caretPosition === null && node.isText && node.text?.includes(text)) {
            caretPosition = position + node.text.indexOf(text) + text.length
        }
    })

    if (caretPosition === null) {
        throw new Error(`Text "${text}" was not found in the document`)
    }

    editor.commands.setTextSelection(caretPosition)

    return editor
}

/**
 * Simulates a `Shift-Tab` key press through the editor's keymap handlers (the same code path a
 * real key press takes, minus the DOM event plumbing).
 */
function pressShiftTab(editor: Editor): void {
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true })
    editor.view.someProp('handleKeyDown', (handleKeyDown) => handleKeyDown(editor.view, event))
}

describe('Extension: RichTextListItem', () => {
    describe('when `Shift-Tab` lifts an item out of an ordered list', () => {
        test('preserves the rendered marker of a single-item list as literal text', () => {
            const editor = createEditorWithCaretAfter(
                '<ol start="17"><li><p>Juli</p></li></ol>',
                'Juli',
            )

            pressShiftTab(editor)

            expect(editor.getHTML()).toBe('<p>17. Juli</p>')
        })

        test('preserves the rendered marker matching the item position within the list', () => {
            const editor = createEditorWithCaretAfter(
                '<ol><li><p>one</p></li><li><p>two</p></li><li><p>three</p></li></ol>',
                'two',
            )

            pressShiftTab(editor)

            expect(editor.getHTML()).toBe(
                '<ol><li><p>one</p></li></ol><p>2. two</p><ol><li><p>three</p></li></ol>',
            )
        })

        test('inserts the marker into the first paragraph of a multi-paragraph item', () => {
            const editor = createEditorWithCaretAfter(
                '<ol start="17"><li><p>Juli</p><p>second paragraph</p></li></ol>',
                'second paragraph',
            )

            pressShiftTab(editor)

            expect(editor.getHTML()).toBe('<p>17. Juli</p><p>second paragraph</p>')
        })
    })

    describe('when `Shift-Tab` does not lift the item out of a list', () => {
        test('does not insert a marker when lifting an item out of a bullet list', () => {
            const editor = createEditorWithCaretAfter('<ul><li><p>Juli</p></li></ul>', 'Juli')

            pressShiftTab(editor)

            expect(editor.getHTML()).toBe('<p>Juli</p>')
        })

        test('does not insert a marker when unindenting a nested ordered list item', () => {
            const editor = createEditorWithCaretAfter(
                '<ol><li><p>parent</p><ol><li><p>child</p></li></ol></li></ol>',
                'child',
            )

            pressShiftTab(editor)

            expect(editor.getHTML()).toBe('<ol><li><p>parent</p></li><li><p>child</p></li></ol>')
        })
    })
})
