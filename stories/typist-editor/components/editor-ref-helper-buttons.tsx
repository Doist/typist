import { useCallback } from 'react'

import { Button } from '@doist/reactist'

import { action } from 'storybook/actions'

import type { TypistEditorRef } from '../../../src'

type EditorRefHelperButtonsProps = {
    typistEditorRef: React.RefObject<TypistEditorRef | null>
}

function EditorRefHelperButtons({ typistEditorRef }: EditorRefHelperButtonsProps) {
    const handleGetEditorClick = useCallback(() => {
        action('getEditor')(typistEditorRef.current?.getEditor())
    }, [])

    const handleGetMarkdownClick = useCallback(() => {
        action('getMarkdown')(typistEditorRef.current?.getMarkdown() || '<empty>')
    }, [])

    const handleGetAllNodesAttributesByTypeClick = useCallback(() => {
        action('getAllNodesAttributesByType')(typistEditorRef.current?.getAllNodesAttributesByType('mentionSuggestion'))
    }, [])

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
