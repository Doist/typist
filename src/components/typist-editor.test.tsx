import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PlainTextKit } from '../extensions/plain-text/plain-text-kit'
import { RichTextKit } from '../extensions/rich-text/rich-text-kit'

import { TypistEditor } from './typist-editor'

import type { TypistEditorProps, TypistEditorRef } from './typist-editor'

type TypistEditorRendererProps = Partial<
    TypistEditorProps & {
        ExtensionKit: typeof PlainTextKit | typeof RichTextKit
        multiline: boolean
    }
>

function renderRichTextEditor({
    ExtensionKit = RichTextKit,
    multiline = true,
    editable,
    extensions,
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
}: TypistEditorRendererProps = {}) {
    const typistEditorRef = createRef<TypistEditorRef>()

    render(
        <TypistEditor
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            editable={editable}
            extensions={
                extensions
                    ? extensions
                    : [
                          ExtensionKit.configure({
                              document: {
                                  multiline,
                              },
                          }),
                      ]
            }
            ref={typistEditorRef}
        />,
    )

    return {
        typistEditorRef,
    }
}

function renderPlainTextEditor(props: TypistEditorRendererProps = {}) {
    renderRichTextEditor({
        ...props,
        ExtensionKit: PlainTextKit,
    })
}

describe('<TypistEditor />', () => {
    describe('Plain-text Document', () => {
        test('validate HTML attributes defined by Tiptap/ProseMirror', () => {
            renderPlainTextEditor()

            expect(screen.getByRole('textbox')).toHaveClass('tiptap')
            expect(screen.getByRole('textbox')).toHaveClass('ProseMirror')
            expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'true')
            expect(screen.getByRole('textbox')).toHaveAttribute('tabindex', '0')
            expect(screen.getByRole('textbox')).toHaveAttribute('translate', 'no')
        })

        describe('ARIA Attributes', () => {
            test('validate ARIA attributes available as props', () => {
                renderPlainTextEditor({
                    'aria-describedby': 'describedByElementId',
                    'aria-label': 'The Element Label',
                    'aria-labelledby': 'labeledByElementId',
                })

                expect(screen.getByRole('textbox')).toHaveAttribute(
                    'aria-describedby',
                    'describedByElementId',
                )
                expect(screen.getByRole('textbox')).toHaveAttribute(
                    'aria-label',
                    'The Element Label',
                )
                expect(screen.getByRole('textbox')).toHaveAttribute(
                    'aria-labelledby',
                    'labeledByElementId',
                )
            })

            describe('with multi-line document (default)', () => {
                test('validate `aria-multiline` attribute', () => {
                    renderPlainTextEditor()

                    expect(screen.getByRole('textbox')).toHaveAttribute('aria-multiline', 'true')
                })
            })

            describe('with single-line document', () => {
                test('validate `aria-multiline` attribute', () => {
                    renderPlainTextEditor({ multiline: false })

                    expect(screen.getByRole('textbox')).toHaveAttribute('aria-multiline', 'false')
                })
            })

            describe('with read/write document (default)', () => {
                test('validate `aria-readonly` attribute', () => {
                    renderPlainTextEditor()

                    expect(screen.getByRole('textbox')).toHaveAttribute('aria-readonly', 'false')
                })
            })

            describe('with read-only document', () => {
                test('validate `aria-readonly` attribute', () => {
                    renderPlainTextEditor({ editable: false })

                    expect(screen.getByRole('textbox')).toHaveAttribute('aria-readonly', 'true')
                })
            })
        })

        describe('DATA Attributes', () => {
            test('validate DATA attributes defined by Typist', () => {
                renderPlainTextEditor()

                expect(screen.getByRole('textbox')).toHaveAttribute('data-typist-editor', 'true')

                expect(screen.getByRole('textbox')).not.toHaveAttribute('data-rich-text')
                expect(screen.getByRole('textbox')).toHaveAttribute('data-plain-text', 'true')
            })
        })
    })

    describe('Rich-text Document', () => {
        test('validate HTML attributes defined by Tiptap/ProseMirror', () => {
            renderRichTextEditor()

            expect(screen.getByRole('textbox')).toHaveClass('tiptap')
            expect(screen.getByRole('textbox')).toHaveClass('ProseMirror')
            expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'true')
            expect(screen.getByRole('textbox')).toHaveAttribute('tabindex', '0')
            expect(screen.getByRole('textbox')).toHaveAttribute('translate', 'no')
        })

        describe('ARIA Attributes', () => {
            test('validate ARIA attributes available as props', () => {
                renderRichTextEditor({
                    'aria-describedby': 'describedByElementId',
                    'aria-label': 'The Element Label',
                    'aria-labelledby': 'labeledByElementId',
                })

                expect(screen.getByRole('textbox')).toHaveAttribute(
                    'aria-describedby',
                    'describedByElementId',
                )
                expect(screen.getByRole('textbox')).toHaveAttribute(
                    'aria-label',
                    'The Element Label',
                )
                expect(screen.getByRole('textbox')).toHaveAttribute(
                    'aria-labelledby',
                    'labeledByElementId',
                )
            })

            describe('with multi-line document (default)', () => {
                test('validate `aria-multiline` attribute', () => {
                    renderRichTextEditor()

                    expect(screen.getByRole('textbox')).toHaveAttribute('aria-multiline', 'true')
                })
            })

            describe('with single-line document', () => {
                test('validate `aria-multiline` attribute', () => {
                    renderRichTextEditor({ multiline: false })

                    expect(screen.getByRole('textbox')).toHaveAttribute('aria-multiline', 'false')
                })
            })

            describe('with read/write document (default)', () => {
                test('validate `aria-readonly` attribute', () => {
                    renderRichTextEditor()

                    expect(screen.getByRole('textbox')).toHaveAttribute('aria-readonly', 'false')
                })
            })

            describe('with read-only document', () => {
                test('validate `aria-readonly` attribute', () => {
                    renderRichTextEditor({ editable: false })

                    expect(screen.getByRole('textbox')).toHaveAttribute('aria-readonly', 'true')
                })
            })
        })

        describe('DATA Attributes', () => {
            test('validate DATA attributes defined by Typist', () => {
                renderRichTextEditor()

                expect(screen.getByRole('textbox')).toHaveAttribute('data-typist-editor', 'true')

                expect(screen.getByRole('textbox')).toHaveAttribute('data-rich-text', 'true')
                expect(screen.getByRole('textbox')).not.toHaveAttribute('data-plain-text')
            })
        })
    })

    // The editor is created once and never recreated, so re-rendering with a new handler closure
    // must still reach the latest handler rather than the one captured at mount.
    describe('View Event Handlers', () => {
        const extensions = [RichTextKit]

        const originalElementFromPoint = document.elementFromPoint

        afterEach(() => {
            document.elementFromPoint = originalElementFromPoint
        })

        test('invokes the latest `onKeyDown` handler after the prop changes', async () => {
            const user = userEvent.setup()

            const initialOnKeyDown = vi.fn<NonNullable<TypistEditorProps['onKeyDown']>>()
            const updatedOnKeyDown = vi.fn<NonNullable<TypistEditorProps['onKeyDown']>>()

            const { rerender } = render(
                <TypistEditor extensions={extensions} onKeyDown={initialOnKeyDown} />,
            )

            rerender(<TypistEditor extensions={extensions} onKeyDown={updatedOnKeyDown} />)

            screen.getByRole('textbox').focus()

            // A non-mutating key still triggers the keydown handler without ProseMirror having to
            // reconcile a content change (which needs layout APIs jsdom lacks).
            await user.keyboard('{Escape}')

            expect(initialOnKeyDown).not.toHaveBeenCalled()
            expect(updatedOnKeyDown).toHaveBeenCalled()
        })

        test('invokes the latest `onClick` handler after the prop changes', async () => {
            const user = userEvent.setup()

            const initialOnClick = vi.fn<NonNullable<TypistEditorProps['onClick']>>()
            const updatedOnClick = vi.fn<NonNullable<TypistEditorProps['onClick']>>()

            const { rerender } = render(
                <TypistEditor extensions={extensions} onClick={initialOnClick} />,
            )

            rerender(<TypistEditor extensions={extensions} onClick={updatedOnClick} />)

            const editorElement = screen.getByRole('textbox')

            // jsdom has no layout; ProseMirror resolves a click to a document position with
            // `elementFromPoint`. Point it at the editor so the click reaches the click handler.
            document.elementFromPoint = () => editorElement

            await user.click(editorElement)

            expect(initialOnClick).not.toHaveBeenCalled()
            expect(updatedOnClick).toHaveBeenCalled()
        })
    })

    // The editor is created once and never recreated, so toggling `editable` at runtime must update
    // the existing editor in place rather than relying on a fresh instance.
    describe('Editable State', () => {
        test('toggles editability in place when the `editable` prop changes', () => {
            const extensions = [RichTextKit]

            const typistEditorRef = createRef<TypistEditorRef>()

            const { rerender } = render(
                <TypistEditor editable={true} extensions={extensions} ref={typistEditorRef} />,
            )

            expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'true')
            expect(typistEditorRef.current?.getEditor().isEditable).toBe(true)

            rerender(
                <TypistEditor editable={false} extensions={extensions} ref={typistEditorRef} />,
            )

            expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'false')
            expect(typistEditorRef.current?.getEditor().isEditable).toBe(false)
        })
    })
})
