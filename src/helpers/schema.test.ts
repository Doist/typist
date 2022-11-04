import { getSchema } from '@tiptap/core'

import { PlainTextKit } from '../extensions/plain-text/plain-text-kit'
import { RichTextKit } from '../extensions/rich-text/rich-text-kit'

import { isMultilineDocument, isPlainTextDocument } from './schema'

describe('Helper: Schema', () => {
    describe('#isMultilineDocument', () => {
        describe('Plain-text Document', () => {
            test('returns `true` if the document accepts multiple lines of input', () => {
                expect(isMultilineDocument(getSchema([PlainTextKit]))).toBe(true)
            })

            test('returns `false` if the document does NOT accept multiple lines of input', () => {
                expect(
                    isMultilineDocument(
                        getSchema([
                            PlainTextKit.configure({
                                document: {
                                    multiline: false,
                                },
                            }),
                        ]),
                    ),
                ).toBe(false)
            })
        })

        describe('Rich-text Document', () => {
            test('returns `true` if the document accepts multiple lines of input', () => {
                expect(isMultilineDocument(getSchema([RichTextKit]))).toBe(true)
            })

            test('returns `false` if the document does NOT accept multiple lines of input', () => {
                expect(
                    isMultilineDocument(
                        getSchema([
                            RichTextKit.configure({
                                document: {
                                    multiline: false,
                                },
                            }),
                        ]),
                    ),
                ).toBe(false)
            })
        })
    })

    describe('#isPlainTextDocument', () => {
        test('returns `true` if the schema contains the `PlainTextKit` extension', () => {
            expect(isPlainTextDocument(getSchema([PlainTextKit]))).toBe(true)
        })

        test('returns `false` if the schema does NOT contain the `PlainTextKit` extension', () => {
            expect(isPlainTextDocument(getSchema([RichTextKit]))).toBe(false)
        })
    })
})
