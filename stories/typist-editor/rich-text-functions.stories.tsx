import { useCallback, useRef } from 'react'

import { Selection } from '@tiptap/pm/state'
import { action } from 'storybook/actions'

import preview from '../../.storybook/preview'
import { TypistEditor, TypistEditorRef } from '../../src'
import { Button } from '../components/button'

import { DEFAULT_ARG_TYPES } from './constants/defaults'
import { MARKDOWN_PLACEHOLDER_LONG, MARKDOWN_PLACEHOLDER_SHORT } from './constants/markdown'
import { TypistEditorDecorator } from './decorators/typist-editor-decorator/typist-editor-decorator'
import { Default } from './rich-text.stories'

const meta = preview.meta({
    title: 'Typist Editor/Rich-text/Functions',
    component: TypistEditor,
    argTypes: DEFAULT_ARG_TYPES,
    parameters: {
        layout: 'fullscreen',
    },
})

export const Commands = meta.story({
    ...Default.composed,
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

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={context.args}
                    withRichTextFeatures={true}
                    bottomFunctions={
                        <>
                            <Button onClick={handleCreateParagraphEndClick}>
                                createParagraphEnd
                            </Button>
                            <Button onClick={handleExtendWordRangeClick}>extendWordRange</Button>
                            <Button onClick={handleInsertMarkdownContentClick}>
                                insertMarkdownContent
                            </Button>
                            <Button onClick={handleInsertMarkdownContentAtClick}>
                                insertMarkdownContentAt
                            </Button>
                        </>
                    }
                    ref={typistEditorRef}
                />
            )
        },
    ],
})

export const Helpers = meta.story({
    ...Default.composed,
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
                    args={context.args}
                    withRichTextFeatures={true}
                    bottomFunctions={
                        <>
                            <Button onClick={handleGetEditorClick}>getEditor</Button>
                            <Button onClick={handleGetMarkdownClick}>getMarkdown</Button>
                            <Button onClick={handleGetAllNodesAttributesByTypeClick}>
                                {"getAllNodesAttributesByType('mentionSuggestion')"}
                            </Button>
                        </>
                    }
                    ref={typistEditorRef}
                />
            )
        },
    ],
})
