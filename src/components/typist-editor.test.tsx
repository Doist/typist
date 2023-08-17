import { createRef } from 'react'

import { render, screen } from '@testing-library/react'

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
})
