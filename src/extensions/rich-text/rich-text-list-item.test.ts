import { createEditorWithCaretAfter } from '../../../test-utils/rich-text-editor'

import type { Editor } from '@tiptap/core'

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
            const editor = createEditorWithCaretAfter('<ol start="17"><li><p>Juli</p></li></ol>', 'Juli')

            pressShiftTab(editor)

            expect(editor.getHTML()).toBe('<p>17. Juli</p>')
        })

        test('preserves the marker of an explicitly decimal ordered list', () => {
            const editor = createEditorWithCaretAfter('<ol start="17" type="1"><li><p>Juli</p></li></ol>', 'Juli')

            pressShiftTab(editor)

            expect(editor.getHTML()).toBe('<p>17. Juli</p>')
        })

        test('preserves the rendered marker matching the item position within the list', () => {
            const editor = createEditorWithCaretAfter(
                '<ol><li><p>one</p></li><li><p>two</p></li><li><p>three</p></li></ol>',
                'two',
            )

            pressShiftTab(editor)

            expect(editor.getHTML()).toBe('<ol><li><p>one</p></li></ol><p>2. two</p><ol><li><p>three</p></li></ol>')
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
