import { useCallback } from 'react'

import { Button } from '@doist/reactist'

import { action } from 'storybook/actions'

import type { TypistEditorRef } from '../../../src'

type EditorRefHelperButtonsProps = {
    editorRef: React.RefObject<TypistEditorRef | null>
}

function EditorRefHelperButtons({ editorRef }: EditorRefHelperButtonsProps) {
    const handleGetEditorClick = useCallback(() => {
        action('getEditor')(editorRef.current?.getEditor())
    }, [editorRef])

    const handleGetMarkdownClick = useCallback(() => {
        action('getMarkdown')(editorRef.current?.getMarkdown() || '<empty>')
    }, [editorRef])

    const handleGetAllNodesAttributesByTypeClick = useCallback(() => {
        action('getAllNodesAttributesByType')(editorRef.current?.getAllNodesAttributesByType('mentionSuggestion'))
    }, [editorRef])

    return (
        <>
            <Button variant="secondary" onClick={handleGetEditorClick}>
                getEditor
            </Button>
            <Button variant="secondary" onClick={handleGetMarkdownClick}>
                getMarkdown
            </Button>
            <Button variant="secondary" onClick={handleGetAllNodesAttributesByTypeClick}>
                {"getAllNodesAttributesByType('mentionSuggestion')"}
            </Button>
        </>
    )
}

export { EditorRefHelperButtons }
