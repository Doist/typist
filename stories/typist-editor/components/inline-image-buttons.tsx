import { useRef } from 'react'

import { Button } from '@doist/reactist'

import landscapeDay from '../assets/landscape-day.svg'
import landscapeLake from '../assets/landscape-lake.svg'
import landscapeSunset from '../assets/landscape-sunset.svg'

import type { RichTextImageInsertOptions, TypistEditorRef } from '../../../src'

const SAMPLE_IMAGE_URLS = [landscapeDay, landscapeSunset, landscapeLake]

type InlineImageButtonsProps = {
    editorRef: React.RefObject<TypistEditorRef | null>
}

function InlineImageButtons({ editorRef }: InlineImageButtonsProps) {
    const sampleImageIndexRef = useRef(0)

    function insertSampleImage(options?: RichTextImageInsertOptions) {
        const src = SAMPLE_IMAGE_URLS[sampleImageIndexRef.current % SAMPLE_IMAGE_URLS.length]

        sampleImageIndexRef.current += 1

        editorRef.current?.getEditor().chain().focus().insertImage({ src }, options).run()
    }

    return (
        <>
            <Button variant="secondary" onClick={() => insertSampleImage()}>
                Insert image
            </Button>
            <Button variant="secondary" onClick={() => insertSampleImage({ inline: true })}>
                Insert image within text
            </Button>
        </>
    )
}

export { InlineImageButtons }
