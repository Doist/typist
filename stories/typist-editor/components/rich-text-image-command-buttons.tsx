import { useCallback, useRef } from 'react'

import { Button } from '@doist/reactist'

import landscapeDay from '../assets/landscape-day.svg'
import landscapeLake from '../assets/landscape-lake.svg'
import landscapeSunset from '../assets/landscape-sunset.svg'

import type { RichTextImageInsertOptions, TypistEditorRef } from '../../../src'

const SAMPLE_IMAGE_URLS = [landscapeDay, landscapeSunset, landscapeLake]

type RichTextImageCommandButtonsProps = {
    editorRef: React.RefObject<TypistEditorRef | null>
}

function RichTextImageCommandButtons({ editorRef }: RichTextImageCommandButtonsProps) {
    const sampleImageIndexRef = useRef(0)

    const insertSampleImage = useCallback(
        (options?: RichTextImageInsertOptions) => {
            const src = SAMPLE_IMAGE_URLS[sampleImageIndexRef.current % SAMPLE_IMAGE_URLS.length]

            sampleImageIndexRef.current += 1

            editorRef.current?.getEditor().chain().focus().insertImage({ src }, options).run()
        },
        [editorRef],
    )

    const handleInsertImageClick = useCallback(() => {
        insertSampleImage()
    }, [insertSampleImage])

    const handleInsertImageWithinTextClick = useCallback(() => {
        insertSampleImage({ inline: true })
    }, [insertSampleImage])

    return (
        <>
            <Button variant="secondary" onClick={handleInsertImageClick}>
                Insert image
            </Button>
            <Button variant="secondary" onClick={handleInsertImageWithinTextClick}>
                Insert image within text
            </Button>
        </>
    )
}

export { RichTextImageCommandButtons }
