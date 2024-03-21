import { useCallback, useRef } from 'react'

import { Button } from '@doist/reactist'

import { action } from '@storybook/addon-actions'
import { Selection } from '@tiptap/pm/state'

import { TypistEditor, TypistEditorRef } from '../../src'

import { DEFAULT_ARG_TYPES } from './constants/defaults'
import { MARKDOWN_PLACEHOLDER_LONG, MARKDOWN_PLACEHOLDER_SHORT } from './constants/markdown'
import { TypistEditorDecorator } from './decorators/typist-editor-decorator/typist-editor-decorator'
import { Default } from './rich-text.stories'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof TypistEditor> = {
    title: 'Typist Editor/Rich-text/Functions',
    component: TypistEditor,
    argTypes: DEFAULT_ARG_TYPES,
    parameters: {
        layout: 'fullscreen',
    },
}

export default meta

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
                    .insertMarkdownContent(MARKDOWN_PLACEHOLDER_LONG)
                    .run()
            }, [])

            const handleInsertMarkdownContentAtClick = useCallback(() => {
                typistEditorRef.current
                    ?.getEditor()
                    .chain()
                    .focus()
                    .insertMarkdownContentAt(
                        Selection.atEnd(typistEditorRef.current?.getEditor().state.doc),
                        MARKDOWN_PLACEHOLDER_SHORT,
                    )
                    .run()
            }, [])

            function renderBottomFunctions() {
                return (
                    <>
                        <Button variant="secondary" onClick={handleCreateParagraphEndClick}>
                            createParagraphEnd
                        </Button>
                        <Button variant="secondary" onClick={handleExtendWordRangeClick}>
                            extendWordRange
                        </Button>
                        <Button variant="secondary" onClick={handleInsertMarkdownContentClick}>
                            insertMarkdownContent
                        </Button>
                        <Button variant="secondary" onClick={handleInsertMarkdownContentAtClick}>
                            insertMarkdownContentAt
                        </Button>
                    </>
                )
            }

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={{ ...context.args }}
                    withToolbar={true}
                    renderBottomFunctions={renderBottomFunctions}
                    ref={typistEditorRef}
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

            function renderBottomFunctions() {
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
            }

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={{ ...context.args }}
                    withToolbar={true}
                    renderBottomFunctions={renderBottomFunctions}
                    ref={typistEditorRef}
                />
            )
        },
    ],
}
