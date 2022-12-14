import { useRef } from 'react'
import { useEvent } from 'react-use-event-hook'

import { Button } from '@doist/reactist'

import { action } from '@storybook/addon-actions'

import { TypistEditor, TypistEditorRef } from '../../src'

import { DEFAULT_ARG_TYPES } from './constants/defaults'
import { MARKDOWN_PLACEHOLDER } from './constants/markdown'
import { TypistEditorDecorator } from './decorators/typist-editor-decorator/typist-editor-decorator'
import { Default } from './rich-text.stories'

import type { ComponentMeta, ComponentStoryObj } from '@storybook/react'

export default {
    title: 'Typist Editor/Rich-text/Functions',
    component: TypistEditor,
    argTypes: DEFAULT_ARG_TYPES,
    parameters: {
        layout: 'fullscreen',
    },
} as ComponentMeta<typeof TypistEditor>

export const Commands: ComponentStoryObj<typeof TypistEditor> = {
    ...Default,
    decorators: [
        (Story, context) => {
            const typistEditorRef = useRef<TypistEditorRef>(null)

            const handleExtendWordRangeClick = useEvent(() => {
                typistEditorRef.current?.getEditor().chain().focus().extendWordRange().run()
            })

            const handleInsertMarkdownContent = useEvent(() => {
                typistEditorRef.current
                    ?.getEditor()
                    .chain()
                    .focus()
                    .insertMarkdownContent(MARKDOWN_PLACEHOLDER)
                    .run()
            })

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={{ ...context.args, ref: typistEditorRef }}
                    withToolbar={true}
                    renderBottomFunctions={() => {
                        return (
                            <>
                                <Button variant="secondary" onClick={handleExtendWordRangeClick}>
                                    extendWordRange
                                </Button>
                                <Button variant="secondary" onClick={handleInsertMarkdownContent}>
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

export const Helpers: ComponentStoryObj<typeof TypistEditor> = {
    ...Default,
    decorators: [
        (Story, context) => {
            const typistEditorRef = useRef<TypistEditorRef>(null)

            const handleGetEditorClick = useEvent(() => {
                action('getEditor')(typistEditorRef.current?.getEditor())
            })

            const handleGetMarkdownClick = useEvent(() => {
                action('getMarkdown')(typistEditorRef.current?.getMarkdown() || '<empty>')
            })

            const handleGetAllNodesAttributesByTypeClick = useEvent(() => {
                action('getAllNodesAttributesByType')(
                    typistEditorRef.current?.getAllNodesAttributesByType('mentionSuggestion'),
                )
            })

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
