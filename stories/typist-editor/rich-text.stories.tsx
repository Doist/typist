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
import { RichTextVideoWrapper } from './wrappers/rich-text-video-wrapper'

import type { Meta, StoryObj } from '@storybook/react'
import type { Extensions } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'
import type { TypistEditorRef } from '../../src'

const meta: Meta<typeof TypistEditor> = {
    title: 'Typist Editor/Rich-text',
    component: TypistEditor,
    argTypes: DEFAULT_ARG_TYPES,
    parameters: {
        layout: 'fullscreen',
    },
}

export default meta

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

            const [inlineAttachments, setInlineAttachments] = useState<{
                [attachmentId: string]: {
                    type: 'image' | 'video'
                    progress: number
                }
            }>({})

            useEffect(
                function simulateInlineAttachmentsUpload() {
                    if (
                        Object.keys(inlineAttachments).length === 0 ||
                        Object.values(inlineAttachments).every((a) => a.progress === 100)
                    ) {
                        return
                    }

                    setTimeout(
                        () => {
                            setInlineAttachments((prevState) => {
                                return Object.fromEntries(
                                    Object.entries(prevState).map(
                                        ([attachmentId, { progress, type }]) => [
                                            attachmentId,
                                            {
                                                progress: clamp(progress + random(1, 8), 0, 100),
                                                type,
                                            },
                                        ],
                                    ),
                                )
                            })
                        },
                        random(1, 500),
                    )
                },
                [inlineAttachments],
            )

            useEffect(
                function updateInlineAttachmentsMetadata() {
                    Object.keys(inlineAttachments).forEach((attachmentId) => {
                        const commands = typistEditorRef.current?.getEditor().commands

                        const updateInlineAttachmentAttributes =
                            inlineAttachments[attachmentId].type === 'image'
                                ? commands?.updateImage
                                : commands?.updateVideo

                        updateInlineAttachmentAttributes?.({
                            metadata: {
                                attachmentId,
                                isUploadFailed: false,
                                uploadProgress: inlineAttachments[attachmentId].progress,
                            },
                        })
                    })
                },
                [inlineAttachments],
            )

            const handleInlineFilePaste = useCallback(function handleInlineFilePaste(file: File) {
                const fileType = file.type.split('/')[0]

                if (fileType !== 'image' && fileType !== 'video') {
                    return
                }

                const attachmentId = Math.random().toString(16).slice(2, 10)

                const metadata = {
                    attachmentId,
                    isUploadFailed: false,
                    uploadProgress: 0,
                }

                setInlineAttachments((prevState) => ({
                    ...prevState,
                    [attachmentId]: {
                        progress: 0,
                        type: fileType,
                    },
                }))

                const fileReader = new FileReader()

                fileReader.onload = () => {
                    const commands = typistEditorRef.current?.getEditor().commands

                    if (fileType === 'image') {
                        commands?.insertImage({
                            alt: `${attachmentId}.${file.type.split('/')[1]}`,
                            src: String(fileReader.result),
                            metadata,
                        })
                    } else {
                        commands?.insertVideo({
                            src: String(fileReader.result),
                            metadata,
                        })
                    }
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
                                onImageFilePaste: handleInlineFilePaste,
                            },
                            video: {
                                NodeViewComponent: RichTextVideoWrapper,
                                onVideoFilePaste: handleInlineFilePaste,
                            },
                        }),
                        ...COMMON_STORY_EXTENSIONS,
                    ]
                },
                [handleInlineFilePaste],
            )

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={{
                        ...context.args,
                        extensions,
                    }}
                    withToolbar={true}
                    ref={typistEditorRef}
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
