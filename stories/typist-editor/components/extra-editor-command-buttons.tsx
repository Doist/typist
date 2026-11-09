import { useCallback } from 'react'

import { Button } from '@doist/reactist'

import { Selection } from '@tiptap/pm/state'

import { MARKDOWN_PLACEHOLDER_LONG, MARKDOWN_PLACEHOLDER_SHORT } from '../constants/markdown'

import type { TypistEditorRef } from '../../../src'

type ExtraEditorCommandButtonsProps = {
    editorRef: React.RefObject<TypistEditorRef | null>
}

function ExtraEditorCommandButtons({ editorRef }: ExtraEditorCommandButtonsProps) {
    const handleCreateParagraphEndClick = useCallback(() => {
        editorRef.current?.getEditor().chain().focus().createParagraphEnd().run()
    }, [editorRef])

    const handleExtendWordRangeClick = useCallback(() => {
        editorRef.current?.getEditor().chain().focus().extendWordRange().run()
    }, [editorRef])

    const handleInsertMarkdownContentClick = useCallback(() => {
        editorRef.current?.getEditor().chain().focus().insertMarkdownContent(MARKDOWN_PLACEHOLDER_LONG).run()
    }, [editorRef])

    const handleInsertMarkdownContentAtClick = useCallback(() => {
        editorRef.current
            ?.getEditor()
            .chain()
            .focus()
            .insertMarkdownContentAt(
                Selection.atEnd(editorRef.current?.getEditor().state.doc),
                MARKDOWN_PLACEHOLDER_SHORT,
            )
            .run()
    }, [editorRef])

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
