import { Editor } from '@tiptap/core'

import { RichTextKit } from './rich-text-kit'

/**
 * Creates a rich-text editor with inline images support and the given initial content, and places
 * the caret right after the first occurrence of the given text within the document (or selects
 * the text itself, with `selectText`).
 *
 * The `Code` extension is disabled because `prosemirror-codemark` (which it registers) loads a
 * second CJS copy of `prosemirror-state` in the Vitest environment, crashing `Editor`
 * instantiation with "Adding different instances of a keyed plugin"; it has no bearing on the
 * image behavior under test.
 */
function createEditorWithCaretAfter(
    content: string,
    text: string,
    { hardBreak, selectText = false }: { hardBreak?: false; selectText?: boolean } = {},
): Editor {
    const editor = new Editor({
        extensions: [RichTextKit.configure({ code: false, hardBreak, image: { inline: true } })],
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

describe('Extension: RichTextImage', () => {
    describe('when inline images are enabled', () => {
        test('`insertImage` splits the paragraph to place the image on its own line', () => {
            const editor = createEditorWithCaretAfter('<p>Hello world</p>', 'Hello')

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toBe('<p>Hello</p><p><img src="image.png"></p><p> world</p>')
        })

        test('`insertImage` adds a blank paragraph below the image at the end of a paragraph', () => {
            const editor = createEditorWithCaretAfter('<p>Hello world</p>', 'world')

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toBe('<p>Hello world</p><p><img src="image.png"></p><p></p>')
            expect(editor.state.selection.from).toBe(editor.state.doc.content.size - 1)
        })

        test('`insertImage` places the image between hard breaks within a single cell paragraph', () => {
            const editor = createEditorWithCaretAfter(
                '<table><tr><th><p>Heading</p></th></tr><tr><td><p>Hello world</p></td></tr></table>',
                'Hello',
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
            )

            editor.commands.insertImage({ src: 'image.png' })
            editor.commands.insertContent('typed')

            expect(editor.getHTML()).toContain(
                '<td colspan="1" rowspan="1"><p>Hello world<br><img src="image.png"><br>typed</p></td>',
            )
        })

        test('`insertImage` fails without changing a cell when hard breaks are disabled', () => {
            const editor = createEditorWithCaretAfter(
                '<table><tr><th><p>Heading</p></th></tr><tr><td><p>Hello world</p></td></tr></table>',
                'Hello',
                { hardBreak: false, selectText: true },
            )

            expect(editor.commands.insertImage({ src: 'image.png' })).toBe(false)
            expect(editor.getHTML()).toContain('<td colspan="1" rowspan="1"><p>Hello world</p></td>')
        })

        test('`insertImage` with the `inline` option places the image within the text', () => {
            const editor = createEditorWithCaretAfter('<p>Hello world</p>', 'Hello')

            editor.commands.insertImage({ src: 'image.png' }, { inline: true })

            expect(editor.getHTML()).toBe('<p>Hello<img src="image.png"> world</p>')
        })
    })

    describe('when inline images are disabled', () => {
        test('`insertImage` with the `inline` option fails without changing the document', () => {
            const editor = new Editor({
                extensions: [RichTextKit.configure({ code: false })],
                content: '<p>Hello world</p>',
            })
            onTestFinished(() => editor.destroy())

            expect(editor.commands.insertImage({ src: 'image.png' }, { inline: true })).toBe(false)
            expect(editor.getHTML()).toBe('<p>Hello world</p>')
        })
    })
})
