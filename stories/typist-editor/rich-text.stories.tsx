import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@doist/reactist'

import { clamp, random } from 'lodash-es'
import { action } from 'storybook/actions'

import preview from '../../.storybook/preview'
import { RichTextKit, TypistEditor } from '../../src'

import landscapeDay from './assets/landscape-day.svg'
import landscapeLake from './assets/landscape-lake.svg'
import landscapeSunset from './assets/landscape-sunset.svg'
import { DEFAULT_ARG_TYPES, DEFAULT_RICH_TEXT_KIT_OPTIONS, DEFAULT_STORY_ARGS } from './constants/defaults'
import { TypistEditorDecorator } from './decorators/typist-editor-decorator/typist-editor-decorator'
import { HashtagSuggestion } from './extensions/hashtag-suggestion'
import { MentionSuggestion } from './extensions/mention-suggestion'
import { RichTextImageWrapper } from './wrappers/rich-text-image-wrapper'

import type { Extensions } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'
import type { TypistEditorRef } from '../../src'

const meta = preview.meta({
    title: 'Typist Editor/Rich-text',
    component: TypistEditor,
    argTypes: DEFAULT_ARG_TYPES,
    parameters: {
        layout: 'fullscreen',
    },
})

const COMMON_STORY_EXTENSIONS: Extensions = [HashtagSuggestion, MentionSuggestion]

const SAMPLE_IMAGE_URLS = [landscapeDay, landscapeSunset, landscapeLake]

export const Default = meta.story({
    args: {
        ...DEFAULT_STORY_ARGS,
        placeholder: 'A full rich-text editor, be creative…',
        extensions: [RichTextKit.configure(DEFAULT_RICH_TEXT_KIT_OPTIONS), ...COMMON_STORY_EXTENSIONS],
    },
    decorators: [
        (Story, context) => {
            const { inlineImages = false } = context.parameters as { inlineImages?: boolean }

            const typistEditorRef = useRef<TypistEditorRef>(null)
            const sampleImageIndexRef = useRef(0)

            const [inlineAttachments, setInlineAttachments] = useState<{
                [attachmentId: string]: {
                    type: 'image'
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
                                    Object.entries(prevState).map(([attachmentId, { progress, type }]) => [
                                        attachmentId,
                                        {
                                            progress: clamp(progress + random(1, 8), 0, 100),
                                            type,
                                        },
                                    ]),
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
                            inlineAttachments[attachmentId].type === 'image' ? commands?.updateImage : () => {}

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

                if (fileType !== 'image') {
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

                fileReader.addEventListener('load', () => {
                    const commands = typistEditorRef.current?.getEditor().commands

                    if (fileType === 'image') {
                        commands?.insertImage({
                            alt: `${attachmentId}.${file.type.split('/')[1]}`,
                            src: typeof fileReader.result === 'string' ? fileReader.result : '',
                            metadata,
                        })
                    }
                })

                fileReader.readAsDataURL(file)
            }, [])

            const extensions = useMemo(
                () => [
                    RichTextKit.configure({
                        ...DEFAULT_RICH_TEXT_KIT_OPTIONS,
                        image: {
                            inline: inlineImages,
                            NodeViewComponent: RichTextImageWrapper,
                            onImageFilePaste: handleInlineFilePaste,
                        },
                    }),
                    ...COMMON_STORY_EXTENSIONS,
                ],
                [inlineImages, handleInlineFilePaste],
            )

            const getNextSampleImageUrl = useCallback(function getNextSampleImageUrl() {
                const sampleImageUrl = SAMPLE_IMAGE_URLS[sampleImageIndexRef.current % SAMPLE_IMAGE_URLS.length]

                sampleImageIndexRef.current += 1

                return sampleImageUrl
            }, [])

            const handleInsertImageClick = useCallback(
                function handleInsertImageClick() {
                    typistEditorRef.current
                        ?.getEditor()
                        .chain()
                        .focus()
                        .insertImage({ src: getNextSampleImageUrl() })
                        .run()
                },
                [getNextSampleImageUrl],
            )

            const handleInsertImageWithinTextClick = useCallback(
                function handleInsertImageWithinTextClick() {
                    typistEditorRef.current
                        ?.getEditor()
                        .chain()
                        .focus()
                        .insertImage({ src: getNextSampleImageUrl() }, { inline: true })
                        .run()
                },
                [getNextSampleImageUrl],
            )

            const storyArgs = useMemo(
                () => ({
                    ...context.args,
                    extensions,
                }),
                [context.args, extensions],
            )

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={storyArgs}
                    withRichTextFeatures={true}
                    ref={typistEditorRef}
                    bottomFunctions={
                        inlineImages ? (
                            <>
                                <Button variant="secondary" onClick={handleInsertImageClick}>
                                    Insert image
                                </Button>
                                <Button variant="secondary" onClick={handleInsertImageWithinTextClick}>
                                    Insert image within text
                                </Button>
                            </>
                        ) : undefined
                    }
                />
            )
        },
    ],
})

export const Singleline = meta.story({
    argTypes: {
        onKeyDown: {
            table: {
                disable: true,
            },
        },
    },
    args: {
        ...Default.composed.args,
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

            const storyArgs = useMemo(
                () => ({
                    ...context.args,
                    onKeyDown: handleKeyDown,
                }),
                [context.args, handleKeyDown],
            )

            return <TypistEditorDecorator Story={Story} args={storyArgs} withRichTextFeatures={true} />
        },
    ],
})

export const EventHandlers = meta.story({
    parameters: {
        controls: {
            disable: true,
        },
    },
    args: {
        ...Default.composed.args,
        onBeforeCreate: action('onBeforeCreate'),
        onCreate: action('onCreate'),
        onUpdate: action('onUpdate'),
        onSelectionUpdate: action('onSelectionUpdate'),
        onTransaction: action('onTransaction'),
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
        onDestroy: action('onDestroy'),
        onClick: action('onClick'),
        onKeyDown: action('onKeyDown'),
    },
    decorators: [
        (Story, context) => {
            const [isMounted, setIsMounted] = useState(true)

            const toggleMounted = useCallback(() => setIsMounted((mounted) => !mounted), [])

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={context.args}
                    withRichTextFeatures={true}
                    editorMounted={isMounted}
                    bottomFunctions={
                        <>
                            <Button variant="secondary" onClick={toggleMounted}>
                                {isMounted ? 'Unmount editor' : 'Mount editor'}
                            </Button>
                        </>
                    }
                />
            )
        },
    ],
})

export const InlineImages = Default.extend({
    args: {
        placeholder: 'A full rich-text editor with inline images support, be creative…',
    },
    parameters: {
        inlineImages: true,
    },
})
