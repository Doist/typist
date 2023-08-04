import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { action } from '@storybook/addon-actions'
import { clamp, random } from 'lodash-es'

import { RichTextKit, TypistEditor } from '../../src'

import {
    DEFAULT_ARG_TYPES,
    DEFAULT_RICH_TEXT_KIT_OPTIONS,
    DEFAULT_STORY_ARGS,
} from './constants/defaults'
import { TypistEditorDecorator } from './decorators/typist-editor-decorator/typist-editor-decorator'
import { HashtagSuggestion } from './extensions/hashtag-suggestion'
import { MentionSuggestion } from './extensions/mention-suggestion'
import { RichTextImageWrapper } from './wrappers/rich-text-image-wrapper'

import type { Meta, StoryObj } from '@storybook/react'
import type { Extensions } from '@tiptap/core'
import type { EditorView, TypistEditorRef } from '../../src'

export default {
    title: 'Typist Editor/Rich-text',
    component: TypistEditor,
    argTypes: DEFAULT_ARG_TYPES,
    parameters: {
        layout: 'fullscreen',
    },
} as Meta<typeof TypistEditor>

const COMMON_STORY_EXTENSIONS: Extensions = [HashtagSuggestion, MentionSuggestion]

export const Default: StoryObj<typeof TypistEditor> = {
    args: {
        ...DEFAULT_STORY_ARGS,
        placeholder: 'A full rich-text editor, be creative…',
        extensions: [
            RichTextKit.configure(DEFAULT_RICH_TEXT_KIT_OPTIONS),
            ...COMMON_STORY_EXTENSIONS,
        ],
    },
    decorators: [
        (Story, context) => {
            const typistEditorRef = useRef<TypistEditorRef>(null)

            const [imageAttachmentsProgress, setImageAttachmentsProgress] = useState<{
                [attachmentId: string]: number
            }>({})

            useEffect(
                function simulateImageAttachmentsUploadProgress() {
                    if (
                        Object.keys(imageAttachmentsProgress).length === 0 ||
                        Object.values(imageAttachmentsProgress).every((p) => p === 100)
                    ) {
                        return
                    }

                    setTimeout(
                        () => {
                            setImageAttachmentsProgress((prevState) => {
                                return Object.keys(prevState).reduce(
                                    (acc, attachmentId) => ({
                                        ...acc,
                                        [attachmentId]: clamp(
                                            acc[attachmentId] + random(1, 8),
                                            0,
                                            100,
                                        ),
                                    }),
                                    prevState,
                                )
                            })
                        },
                        random(1, 500),
                    )
                },
                [imageAttachmentsProgress],
            )

            useEffect(
                function updateImageAttachmentsMetadata() {
                    Object.keys(imageAttachmentsProgress).forEach((attachmentId) => {
                        typistEditorRef.current?.getEditor()?.commands.updateImage({
                            metadata: {
                                attachmentId,
                                isUploadFailed: false,
                                uploadProgress: imageAttachmentsProgress[attachmentId],
                            },
                        })
                    })
                },
                [imageAttachmentsProgress],
            )

            const handleImageFilePaste = useCallback((file: File) => {
                const attachmentId = Math.random().toString(16).slice(2, 10)

                setImageAttachmentsProgress((prevState) => ({ ...prevState, [attachmentId]: 0 }))

                const fileReader = new FileReader()

                fileReader.onload = () => {
                    typistEditorRef.current?.getEditor()?.commands.insertImage({
                        alt: `${attachmentId}.${file.type.split('/')[1]}`,
                        src: String(fileReader.result),
                        metadata: {
                            attachmentId,
                            isUploadFailed: false,
                            uploadProgress: 0,
                        },
                    })
                }

                fileReader.readAsDataURL(file)
            }, [])

            const extensions = useMemo(
                function configureExtensions() {
                    return [
                        RichTextKit.configure({
                            ...DEFAULT_RICH_TEXT_KIT_OPTIONS,
                            image: {
                                NodeViewComponent: RichTextImageWrapper,
                                onImageFilePaste: handleImageFilePaste,
                            },
                        }),
                        ...COMMON_STORY_EXTENSIONS,
                    ]
                },
                [handleImageFilePaste],
            )

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={{
                        ...context.args,
                        extensions,
                        ref: typistEditorRef,
                    }}
                    withToolbar={true}
                />
            )
        },
    ],
}

export const Singleline: StoryObj<typeof TypistEditor> = {
    argTypes: {
        onKeyDown: {
            table: {
                disable: true,
            },
        },
    },
    args: {
        ...Default.args,
        placeholder: 'A single-line full rich-text editor, be creative…',
        extensions: [
            RichTextKit.configure({
                document: {
                    multiline: false,
                },
            }),
            ...COMMON_STORY_EXTENSIONS,
        ],
    },
    decorators: [
        (Story, context) => {
            const handleKeyDown = useCallback((event: KeyboardEvent, view: EditorView) => {
                if (event.key === 'Enter') {
                    action('onEnterPressed')({
                        event,
                        view,
                    })
                    return true
                }
            }, [])

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={{
                        ...context.args,
                        onKeyDown: handleKeyDown,
                    }}
                    withToolbar={true}
                />
            )
        },
    ],
}
