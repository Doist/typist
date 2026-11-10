import { Editor } from '@tiptap/core'

import { RichTextKit } from './rich-text-kit'

describe('Extension: RichTextImage', () => {
    test.each([
        { inline: false, html: '<p>Hello</p><img src="image.png"><p></p>' },
        { inline: true, html: '<p>Hello<img src="image.png"></p>' },
    ])('`insertImage` at the end of the document with `inline: $inline`', ({ inline, html }) => {
        // `Code` is disabled because it crashes `Editor` instantiation in the Vitest environment
        const editor = new Editor({
            extensions: [RichTextKit.configure({ code: false, image: { inline } })],
            content: '<p>Hello</p>',
        })
        onTestFinished(() => editor.destroy())

        editor.commands.focus('end')
        editor.commands.insertImage({ src: 'image.png' })

        expect(editor.getHTML()).toBe(html)
    })
})
