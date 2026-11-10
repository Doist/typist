import { findChildren } from '@tiptap/core'
import { CellSelection } from '@tiptap/pm/tables'

import { createEditorWithCaretAfter } from '../../../test-utils/rich-text-editor'

import type { Editor } from '@tiptap/core'

/**
 * A table with a heading row and a body row of two cells, with `Hello` and `world` as content.
 */
const TABLE_WITH_TWO_BODY_CELLS =
    '<table><tr><th><p>Heading 1</p></th><th><p>Heading 2</p></th></tr><tr><td><p>Hello</p></td><td><p>world</p></td></tr></table>'

/**
 * Selects all body cells of the table in the editor, from the first to the last one.
 */
function selectAllBodyCells(editor: Editor): void {
    const cellPositions = findChildren(editor.state.doc, (node) => node.type.name === 'tableCell').map(({ pos }) => pos)

    editor.view.dispatch(
        editor.state.tr.setSelection(CellSelection.create(editor.state.doc, cellPositions[0], cellPositions.at(-1))),
    )
}

describe('Extension: RichTextImage', () => {
    describe('when inline images are enabled', () => {
        test('`insertImage` splits the paragraph to place the image on its own line', () => {
            const editor = createEditorWithCaretAfter('<p>Hello world</p>', 'Hello', { image: { inline: true } })

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toBe('<p>Hello</p><p><img src="image.png"></p><p> world</p>')
        })

        test('`insertImage` places the image above the paragraph at the start of a paragraph', () => {
            const editor = createEditorWithCaretAfter('<p>Hello world</p>', 'Hello', { image: { inline: true } })
            editor.commands.setTextSelection(1)

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toBe('<p><img src="image.png"></p><p>Hello world</p>')
        })

        test('`insertImage` places the image within the paragraph at the start of a single-line document', () => {
            const editor = createEditorWithCaretAfter('<p>Hello world</p>', 'Hello', {
                document: { multiline: false },
                image: { inline: true },
            })
            editor.commands.setTextSelection(1)

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toBe('<p><img src="image.png">Hello world</p>')
        })

        test('`insertImage` adds a blank paragraph below the image at the end of a paragraph', () => {
            const editor = createEditorWithCaretAfter('<p>Hello world</p>', 'world', { image: { inline: true } })

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toBe('<p>Hello world</p><p><img src="image.png"></p><p></p>')
            expect(editor.state.selection.from).toBe(editor.state.doc.content.size - 1)
        })

        test('`insertImage` places the image between hard breaks within a single cell paragraph', () => {
            const editor = createEditorWithCaretAfter(
                '<table><tr><th><p>Heading</p></th></tr><tr><td><p>Hello world</p></td></tr></table>',
                'Hello',
                { image: { inline: true } },
            )

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toContain(
                '<td colspan="1" rowspan="1"><p>Hello<br><img src="image.png"><br> world</p></td>',
            )
        })

        test('`insertImage` places the image within the cell paragraph at the start of a cell', () => {
            const editor = createEditorWithCaretAfter(
                '<table><tr><th><p>Heading</p></th></tr><tr><td><p>Hello world</p></td></tr></table>',
                'Hello',
                { image: { inline: true }, selectText: true },
            )
            editor.commands.setTextSelection(editor.state.selection.from)

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toContain(
                '<td colspan="1" rowspan="1"><p><img src="image.png"><br>Hello world</p></td>',
            )
        })

        test('`insertImage` adds a hard break below the image at the end of a cell', () => {
            const editor = createEditorWithCaretAfter(
                '<table><tr><th><p>Heading</p></th></tr><tr><td><p>Hello world</p></td></tr></table>',
                'world',
                { image: { inline: true } },
            )

            editor.commands.insertImage({ src: 'image.png' })
            editor.commands.insertContent('typed')

            expect(editor.getHTML()).toContain(
                '<td colspan="1" rowspan="1"><p>Hello world<br><img src="image.png"><br>typed</p></td>',
            )
        })

        test('`insertImage` reuses existing hard breaks next to the image within a cell', () => {
            const editor = createEditorWithCaretAfter(
                '<table><tr><th><p>Heading</p></th></tr><tr><td><p>Hello<br>world</p></td></tr></table>',
                'Hello',
                { image: { inline: true } },
            )

            editor.commands.insertImage({ src: 'image.png' })
            editor.commands.insertContent('typed ')

            expect(editor.getHTML()).toContain(
                '<td colspan="1" rowspan="1"><p>Hello<br><img src="image.png"><br>typed world</p></td>',
            )
        })

        test('`insertImage` fails without changing a cell when hard breaks are disabled', () => {
            const editor = createEditorWithCaretAfter(
                '<table><tr><th><p>Heading</p></th></tr><tr><td><p>Hello world</p></td></tr></table>',
                'Hello',
                { image: { inline: true }, hardBreak: false, selectText: true },
            )

            expect(editor.commands.insertImage({ src: 'image.png' })).toBe(false)
            expect(editor.getHTML()).toContain('<td colspan="1" rowspan="1"><p>Hello world</p></td>')
        })

        test('`insertImage` keeps the content of selected cells, placing the image in the last one', () => {
            const editor = createEditorWithCaretAfter(TABLE_WITH_TWO_BODY_CELLS, 'Hello', { image: { inline: true } })
            selectAllBodyCells(editor)

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toContain(
                '<td colspan="1" rowspan="1"><p>Hello</p></td><td colspan="1" rowspan="1"><p>world<br><img src="image.png"><br></p></td>',
            )
        })

        test('`insertImage` with the `inline` option places the image within the text', () => {
            const editor = createEditorWithCaretAfter('<p>Hello world</p>', 'Hello', { image: { inline: true } })

            editor.commands.insertImage({ src: 'image.png' }, { inline: true })

            expect(editor.getHTML()).toBe('<p>Hello<img src="image.png"> world</p>')
        })
    })

    describe('when inline images are disabled', () => {
        test('`insertImage` with the `inline` option fails without changing the document', () => {
            const editor = createEditorWithCaretAfter('<p>Hello world</p>', 'Hello')

            expect(editor.commands.insertImage({ src: 'image.png' }, { inline: true })).toBe(false)
            expect(editor.getHTML()).toBe('<p>Hello world</p>')
        })

        test('`insertImage` places the image above the paragraph at the start of a paragraph', () => {
            const editor = createEditorWithCaretAfter('<p>Hello world</p>', 'Hello')
            editor.commands.setTextSelection(1)

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toBe('<img src="image.png"><p>Hello world</p>')
        })

        test('`insertImage` keeps the image when typing after inserting it into an empty paragraph', () => {
            const editor = createEditorWithCaretAfter('<p>Hello</p><p></p><p>world</p>', 'Hello')
            editor.commands.setTextSelection(editor.state.selection.from + 2)

            editor.commands.insertImage({ src: 'image.png' })
            editor.commands.insertContent('typed')

            expect(editor.getHTML()).toBe('<p>Hello</p><img src="image.png"><p>typed</p><p>world</p>')
        })

        test('`insertImage` keeps the content of selected cells', () => {
            const editor = createEditorWithCaretAfter(TABLE_WITH_TWO_BODY_CELLS, 'Hello')
            selectAllBodyCells(editor)

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toContain(
                '<td colspan="1" rowspan="1"><p>Hello</p></td><td colspan="1" rowspan="1"><p>world</p></td>',
            )
        })

        test('`insertImage` keeps the image when typing after inserting it below a table', () => {
            const editor = createEditorWithCaretAfter(TABLE_WITH_TWO_BODY_CELLS, 'Hello')
            selectAllBodyCells(editor)

            editor.commands.insertImage({ src: 'image.png' })
            editor.commands.insertContent('typed')

            expect(editor.getHTML()).toContain('</table><img src="image.png"><p>typed</p>')
        })
    })
})
