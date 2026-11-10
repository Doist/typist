import { useCallback } from 'react'

import { Button } from '@doist/reactist'

import sampleImage from '../assets/sample-image.svg'

import type { TypistEditorRef } from '../../../src'

type RichTextImageCommandButtonsProps = {
    editorRef: React.RefObject<TypistEditorRef | null>
}

function RichTextImageCommandButtons({ editorRef }: RichTextImageCommandButtonsProps) {
    const handleInsertImageClick = useCallback(() => {
        editorRef.current?.getEditor().chain().focus().insertImage({ src: sampleImage }).run()
    }, [editorRef])

    return (
        <Button variant="secondary" onClick={handleInsertImageClick}>
            Insert image
        </Button>
    )
}

export { RichTextImageCommandButtons }
