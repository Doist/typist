import { createEditorWithCaretAfter } from '../../../test-utils/rich-text-editor'

describe('Extension: RichTextImage', () => {
    describe('when inline images are enabled', () => {
        test('`insertImage` splits the paragraph to place the image on its own line', () => {
            const editor = createEditorWithCaretAfter('<p>Hello world</p>', 'Hello', { image: { inline: true } })

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toBe('<p>Hello</p><p><img src="image.png"></p><p> world</p>')
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
                { selectText: true },
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
    })
})
