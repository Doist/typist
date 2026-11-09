import { useCallback } from 'react'

import { Button } from '@doist/reactist'

import { Selection } from '@tiptap/pm/state'

import { MARKDOWN_PLACEHOLDER_LONG, MARKDOWN_PLACEHOLDER_SHORT } from '../constants/markdown'

import type { TypistEditorRef } from '../../../src'

type ExtraEditorCommandButtonsProps = {
    typistEditorRef: React.RefObject<TypistEditorRef | null>
}

function ExtraEditorCommandButtons({ typistEditorRef }: ExtraEditorCommandButtonsProps) {
    const handleCreateParagraphEndClick = useCallback(() => {
        typistEditorRef.current?.getEditor().chain().focus().createParagraphEnd().run()
    }, [])

    const handleExtendWordRangeClick = useCallback(() => {
        typistEditorRef.current?.getEditor().chain().focus().extendWordRange().run()
    }, [])

    const handleInsertMarkdownContentClick = useCallback(() => {
        typistEditorRef.current?.getEditor().chain().focus().insertMarkdownContent(MARKDOWN_PLACEHOLDER_LONG).run()
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

export { ExtraEditorCommandButtons }
