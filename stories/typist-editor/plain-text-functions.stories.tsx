import { useCallback, useRef } from 'react'

import { Button } from '@doist/reactist'

import { action } from '@storybook/addon-actions'

import { TypistEditor, TypistEditorRef } from '../../src'

import { DEFAULT_ARG_TYPES } from './constants/defaults'
import { MARKDOWN_PLACEHOLDER } from './constants/markdown'
import { TypistEditorDecorator } from './decorators/typist-editor-decorator/typist-editor-decorator'
import { Default } from './plain-text.stories'

import type { Meta, StoryObj } from '@storybook/react'

export default {
    title: 'Typist Editor/Plain-text/Functions',
    component: TypistEditor,
    argTypes: DEFAULT_ARG_TYPES,
    parameters: {
        layout: 'fullscreen',
    },
} as Meta<typeof TypistEditor>

export const Commands: StoryObj<typeof TypistEditor> = {
    ...Default,
    decorators: [
        (Story, context) => {
            const typistEditorRef = useRef<TypistEditorRef>(null)

            const handleCreateParagraphEndClick = useCallback(() => {
                typistEditorRef.current?.getEditor().chain().focus().createParagraphEnd().run()
            }, [])

            const handleExtendWordRangeClick = useCallback(() => {
                typistEditorRef.current?.getEditor().chain().focus().extendWordRange().run()
            }, [])

            const handleInsertMarkdownContentClick = useCallback(() => {
                typistEditorRef.current
                    ?.getEditor()
                    .chain()
                    .focus()
                    .insertMarkdownContent(MARKDOWN_PLACEHOLDER)
                    .run()
            }, [])

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={{ ...context.args, ref: typistEditorRef }}
                    withToolbar={true}
                    renderBottomFunctions={() => {
                        return (
                            <>
                                <Button variant="secondary" onClick={handleCreateParagraphEndClick}>
                                    createParagraphEnd
                                </Button>
                                <Button variant="secondary" onClick={handleExtendWordRangeClick}>
                                    extendWordRange
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={handleInsertMarkdownContentClick}
                                >
                                    insertMarkdownContent
                                </Button>
                            </>
                        )
                    }}
                />
            )
        },
    ],
}

export const Helpers: StoryObj<typeof TypistEditor> = {
    ...Default,
    decorators: [
        (Story, context) => {
            const typistEditorRef = useRef<TypistEditorRef>(null)

            const handleGetEditorClick = useCallback(() => {
                action('getEditor')(typistEditorRef.current?.getEditor())
            }, [])

            const handleGetMarkdownClick = useCallback(() => {
                action('getMarkdown')(typistEditorRef.current?.getMarkdown() || '<empty>')
            }, [])

            const handleGetAllNodesAttributesByTypeClick = useCallback(() => {
                action('getAllNodesAttributesByType')(
                    typistEditorRef.current?.getAllNodesAttributesByType('mentionSuggestion'),
                )
            }, [])

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={{ ...context.args, ref: typistEditorRef }}
                    withToolbar={true}
                    renderBottomFunctions={() => {
                        return (
                            <>
                                <Button variant="secondary" onClick={handleGetEditorClick}>
                                    getEditor
                                </Button>
                                <Button variant="secondary" onClick={handleGetMarkdownClick}>
                                    getMarkdown
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={handleGetAllNodesAttributesByTypeClick}
                                >
                                    {"getAllNodesAttributesByType('mentionSuggestion')"}
                                </Button>
                            </>
                        )
                    }}
                />
            )
        },
    ],
}
