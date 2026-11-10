import { Editor } from '@tiptap/core'
import { CellSelection } from '@tiptap/pm/tables'

import { RichTextKit } from './rich-text-kit'

const TABLE = '<table><tr><th><p>A</p></th><th><p>B</p></th></tr><tr><td><p>C</p></td><td><p>D</p></td></tr></table>'

function createEditor(content: string, inline = false) {
    // `Code` is disabled because it crashes `Editor` instantiation in the Vitest environment
    const editor = new Editor({
        extensions: [RichTextKit.configure({ code: false, image: { inline } })],
        content,
    })
    onTestFinished(() => editor.destroy())

    return editor
}

function getTextPosition(editor: Editor, text: string) {
    let textPosition = -1

    editor.state.doc.descendants((node, position) => {
        if (textPosition < 0 && node.isText && node.text?.includes(text)) {
            textPosition = position + node.text.indexOf(text)
        }
    })

    return textPosition
}

function selectCells(editor: Editor, anchorText: string, headText: string) {
    const { doc } = editor.state
    const $anchor = doc.resolve(getTextPosition(editor, anchorText))
    const $head = doc.resolve(getTextPosition(editor, headText))

    editor.view.dispatch(editor.state.tr.setSelection(CellSelection.create(doc, $anchor.before(-1), $head.before(-1))))
}

function getHTMLWithoutTableAttributes(editor: Editor) {
    return editor.getHTML().replace(/<colgroup>.*?<\/colgroup>| style="[^"]*"| colspan="1" rowspan="1"/g, '')
}

describe('Extension: RichTextImage', () => {
    test.each([
        { inline: false, html: '<p>Hello</p><img src="image.png"><p></p>' },
        { inline: true, html: '<p>Hello<img src="image.png"></p>' },
    ])('`insertImage` at the end of the document with `inline: $inline`', ({ inline, html }) => {
        const editor = createEditor('<p>Hello</p>', inline)

        editor.commands.focus('end')
        editor.commands.insertImage({ src: 'image.png' })

        expect(editor.getHTML()).toBe(html)
    })

    describe('when inline images are enabled', () => {
        test('`insertImage` with table cells selected places the image after the last cell content', () => {
            const editor = createEditor(TABLE, true)
            selectCells(editor, 'C', 'D')

            editor.commands.insertImage({ src: 'image.png' })

            expect(getHTMLWithoutTableAttributes(editor)).toBe(
                `<table><tbody><tr><th><p>A</p></th><th><p>B</p></th></tr><tr><td><p>C</p></td><td><p>D<img src="image.png"></p></td></tr></tbody></table>`,
            )
        })

        test('`insertImage` with table cells selected backwards places the image after the head cell content', () => {
            const editor = createEditor(TABLE, true)
            selectCells(editor, 'D', 'C')

            editor.commands.insertImage({ src: 'image.png' })

            expect(getHTMLWithoutTableAttributes(editor)).toBe(
                `<table><tbody><tr><th><p>A</p></th><th><p>B</p></th></tr><tr><td><p>C<img src="image.png"></p></td><td><p>D</p></td></tr></tbody></table>`,
            )
        })
    })

    describe('when inline images are disabled', () => {
        test('`insertImage` in an empty paragraph keeps the caret below the image', () => {
            const editor = createEditor('<p>First</p><p></p><p>Next</p>')
            editor.commands.setTextSelection(getTextPosition(editor, 'First') + 'First'.length + 2)

            editor.commands.insertImage({ src: 'image.png' })
            editor.commands.insertContent('Typed')

            expect(editor.getHTML()).toBe('<p>First</p><img src="image.png"><p>Typed</p><p>Next</p>')
        })

        test('`insertImage` at the end of a paragraph keeps the caret below the image', () => {
            const editor = createEditor('<p>First</p><p>Next</p>')
            editor.commands.setTextSelection(getTextPosition(editor, 'First') + 'First'.length)

            editor.commands.insertImage({ src: 'image.png' })
            editor.commands.insertContent('Typed')

            expect(editor.getHTML()).toBe('<p>First</p><img src="image.png"><p>Typed</p><p>Next</p>')
        })

        test('`insertImage` in an empty list item paragraph keeps the caret below the image', () => {
            const editor = createEditor('<ul><li><p>First</p></li><li><p></p></li></ul><p>Next</p>')
            editor.commands.setTextSelection(getTextPosition(editor, 'First') + 'First'.length + 4)

            editor.commands.insertImage({ src: 'image.png' })
            editor.commands.insertContent('Typed')

            expect(editor.getHTML()).toBe(
                '<ul><li><p>First</p></li><li><p></p><img src="image.png"><p>Typed</p></li></ul><p>Next</p>',
            )
        })

        test('`insertImage` in an empty single-line document inserts the image', () => {
            // `Code` is disabled because it crashes `Editor` instantiation in the Vitest environment
            const editor = new Editor({
                extensions: [RichTextKit.configure({ code: false, document: { multiline: false } })],
                content: '<p></p>',
            })
            onTestFinished(() => editor.destroy())
            editor.commands.focus('end')

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toBe('<img src="image.png">')
        })

        test('`insertImage` at the start of a paragraph places the image above it', () => {
            const editor = createEditor('<p>First</p><p>Second</p>')
            editor.commands.setTextSelection(getTextPosition(editor, 'Second'))

            editor.commands.insertImage({ src: 'image.png' })
            editor.commands.insertContent('Typed ')

            expect(editor.getHTML()).toBe('<p>First</p><img src="image.png"><p>Typed Second</p>')
        })

        test('`insertImage` at the start of a list item keeps its first paragraph', () => {
            const editor = createEditor('<ul><li><p>Item</p></li></ul>')
            editor.commands.setTextSelection(getTextPosition(editor, 'Item'))

            editor.commands.insertImage({ src: 'image.png' })

            expect(editor.getHTML()).toBe('<ul><li><p></p><img src="image.png"><p>Item</p></li></ul>')
        })

        test('`insertImage` within a table places the image after the table', () => {
            const editor = createEditor(`${TABLE}<p>After</p>`)
            editor.commands.setTextSelection(getTextPosition(editor, 'C'))

            editor.commands.insertImage({ src: 'image.png' })
            editor.commands.insertContent('Typed')

            expect(getHTMLWithoutTableAttributes(editor)).toBe(
                `<table><tbody><tr><th><p>A</p></th><th><p>B</p></th></tr><tr><td><p>C</p></td><td><p>D</p></td></tr></tbody></table><img src="image.png"><p>Typed</p><p>After</p>`,
            )
        })

        test('`insertImage` within a table keeps consecutive images in order', () => {
            const editor = createEditor(`${TABLE}<p>After</p>`)
            editor.commands.setTextSelection(getTextPosition(editor, 'C'))

            editor.commands.insertImage({ src: 'first.png' })
            editor.commands.insertImage({ src: 'second.png' })

            expect(getHTMLWithoutTableAttributes(editor)).toContain(
                '</table><img src="first.png"><img src="second.png">',
            )
        })

        test('`insertImage` with a selection from a table into the next block keeps the image', () => {
            const editor = createEditor(`${TABLE}<p>After</p>`)
            editor.commands.setTextSelection({
                from: getTextPosition(editor, 'D'),
                to: getTextPosition(editor, 'After') + 2,
            })

            editor.commands.insertImage({ src: 'image.png' })
            editor.commands.insertContent('Typed')

            expect(getHTMLWithoutTableAttributes(editor)).toBe(
                `<table><tbody><tr><th><p>A</p></th><th><p>B</p></th></tr><tr><td><p>C</p></td><td><p></p></td></tr></tbody></table><img src="image.png"><p>Typedter</p>`,
            )
        })

        test('`insertImage` within a table inserts a single image when checked first', () => {
            const editor = createEditor(`${TABLE}<p>After</p>`)
            editor.commands.setTextSelection(getTextPosition(editor, 'C'))

            editor
                .chain()
                .command(
                    ({ can, commands }) =>
                        can().insertImage({ src: 'image.png' }) && commands.insertImage({ src: 'image.png' }),
                )
                .run()

            expect(editor.getHTML().match(/<img /g)).toHaveLength(1)
        })

        test('`insertImage` with table cells selected keeps their content', () => {
            const editor = createEditor(TABLE)
            selectCells(editor, 'C', 'D')

            editor.commands.insertImage({ src: 'image.png' })

            expect(getHTMLWithoutTableAttributes(editor)).toBe(
                `<table><tbody><tr><th><p>A</p></th><th><p>B</p></th></tr><tr><td><p>C</p></td><td><p>D</p></td></tr></tbody></table><img src="image.png"><p></p>`,
            )
        })
    })
})
