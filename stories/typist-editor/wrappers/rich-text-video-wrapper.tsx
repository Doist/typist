import { Box } from '@doist/reactist'

import classNames from 'classnames'

import { NodeViewWrapper } from '../../../src'

import styles from './rich-text-video-wrapper.module.css'

import type { NodeViewProps, RichTextVideoAttributes, RichTextVideoOptions } from '../../../src'

function RichTextVideoWrapper({ extension, node }: NodeViewProps) {
    const {
        autoplay,
        controls,
        loop,
        muted,
        HTMLAttributes: { class: className, ...videoAttributes },
    } = extension.options as RichTextVideoOptions

    const { metadata, src } = node.attrs as RichTextVideoAttributes
    const { attachmentId, isUploadFailed = false, uploadProgress = 0 } = metadata || {}

    const isAttachmentUploading = Boolean(attachmentId && !isUploadFailed && uploadProgress < 100)

    const videoClasses = classNames(className, styles.videoAttachment, {
        // Disallow player interaction during the uploading simulation
        [styles.noPointerEvents]: isAttachmentUploading,
    })

    const progressOverlayStyle: React.CSSProperties = {
        ['--video-upload-progress' as string]: `${100 - uploadProgress}%`,
    }

    return (
        <NodeViewWrapper data-drag-handle="true" className={styles.richTextVideoWrapper}>
            <video
                {...videoAttributes}
                className={videoClasses}
                src={src}
                // The following attributes must not be rendered at all if they are `false`,
                // otherwise they will be interpreted as `true` by the browser
                // ref: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
                {...(autoplay ? { autoPlay: true } : undefined)}
                {...(controls ? { controls: true } : undefined)}
                {...(loop ? { loop: true } : undefined)}
                {...(muted ? { muted: true } : undefined)}
            />
            {isAttachmentUploading ? (
                <Box className={styles.progressOverlay} style={progressOverlayStyle} />
            ) : null}
        </NodeViewWrapper>
    )
}

export { RichTextVideoWrapper }
