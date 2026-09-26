import { Editor } from '@tiptap/core'
import { Code } from '@tiptap/extension-code'
import { CodeBlock } from '@tiptap/extension-code-block'
import { Document } from '@tiptap/extension-document'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Link } from '@tiptap/extension-link'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'

import { ExtraEditorCommands } from '../extra-editor-commands'

/**
 * Creates a test editor with the command and the node and mark types used by these tests.
 */
function createTestEditor(content = '<p>hello world</p>'): Editor {
    const editor = new Editor({
        extensions: [
            Document,
            Paragraph,
            Text,
            HardBreak,
            Code,
            CodeBlock,
            Link,
            ExtraEditorCommands,
        ],
        content,
        parseOptions: { preserveWhitespace: 'full' },
    })

    onTestFinished(() => editor.destroy())

    return editor
}

describe('Command: extendWordRange', () => {
    describe.each(['forward', 'backward'])('%s selections', (direction) => {
        test.each([
            ['hel[lo wor]ld', 4, 10, 1, 12],
            ['h[el]lo world', 2, 4, 1, 6],
            ['hel[lo ]world', 4, 7, 1, 7],
            ['hello[ wor]ld', 6, 10, 6, 12],
            ['[hello] world', 1, 6, 1, 6],
            ['[hello world]', 1, 12, 1, 12],
            ['hello[ ]world', 6, 7, 6, 7],
        ])(
            'expands only partial-word boundaries in %s',
            (_, from, to, expectedFrom, expectedTo) => {
                const editor = createTestEditor()

                const backward = direction === 'backward'

                expect(
                    editor
                        .chain()
                        .setTextSelection({ from: backward ? to : from, to: backward ? from : to })
                        .extendWordRange()
                        .run(),
                ).toBe(true)

                expect(editor.state.selection).toMatchObject({
                    anchor: backward ? expectedTo : expectedFrom,
                    head: backward ? expectedFrom : expectedTo,
                })
            },
        )
    })

    test.each([
        ['<p>hello world</p>', 4, 1, 6],
        ['<p>hello world</p>', 1, 1, 6],
        ['<p>hello world</p>', 6, 1, 6],
        ['<p>hello world</p>', 7, 7, 12],
        ['<p>hello world</p>', 12, 7, 12],
        ['<p>hello  world</p>', 7, 7, 7],
        ['<p></p>', 1, 1, 1],
        ['<p><a href="https://example.com">hello world</a></p>', 4, 1, 6],
    ])('preserves caret behavior in %s at %i', (content, caret, anchor, head) => {
        const editor = createTestEditor(content)

        editor.commands.setTextSelection(caret)

        expect(editor.commands.extendWordRange()).toBe(true)
        expect(editor.state.selection).toMatchObject({ anchor, head })
    })

    test.each([
        ['<p>hello</p><p>world</p>', 4, 11, 1, 13],
        ['<p>hello<br>world</p>', 4, 10, 1, 12],
        ['<p><a href="https://example.com">hello world again</a></p>', 4, 10, 1, 12],
    ])('preserves selected content in %s', (content, from, to, anchor, head) => {
        const editor = createTestEditor(content)

        editor.commands.setTextSelection({ from, to })

        expect(editor.commands.extendWordRange()).toBe(true)
        expect(editor.state.selection).toMatchObject({ anchor, head })
    })

    test('does not change the transaction during a dry run', () => {
        const editor = createTestEditor()

        editor.commands.setTextSelection({ from: 4, to: 10 })

        editor.commands.command(({ tr, can }) => {
            const selection = tr.selection
            expect(can().extendWordRange()).toBe(true)
            expect(tr.selection).toBe(selection)
            return true
        })
    })

    test.each(['<p><code>hello world</code></p>', '<pre><code>hello world</code></pre>'])(
        'rejects active code in %s',
        (content) => {
            const editor = createTestEditor(content)

            editor.commands.setTextSelection({ from: 4, to: 10 })

            const selection = editor.state.selection

            expect(editor.can().extendWordRange()).toBe(false)
            expect(editor.commands.extendWordRange()).toBe(false)
            expect(editor.state.selection).toBe(selection)
        },
    )

    test('rejects non-text selections', () => {
        const editor = createTestEditor()

        editor.commands.setNodeSelection(0)

        const selection = editor.state.selection

        expect(editor.can().extendWordRange()).toBe(false)
        expect(editor.commands.extendWordRange()).toBe(false)
        expect(editor.state.selection).toBe(selection)
    })
})
