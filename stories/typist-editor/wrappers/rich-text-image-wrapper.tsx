import { Box } from '@doist/reactist'

import classNames from 'classnames'

import { NodeViewWrapper } from '../../../src'

import styles from './rich-text-image-wrapper.module.css'

import type { NodeViewProps, RichTextImageAttributes, RichTextImageOptions } from '../../../src'

function RichTextImageWrapper({ extension, node }: NodeViewProps) {
    const {
        HTMLAttributes: { class: className, ...imageAttributes },
    } = extension.options as RichTextImageOptions

    const { alt, metadata, src, title } = node.attrs as RichTextImageAttributes
    const { attachmentId, isUploadFailed = false, uploadProgress = 0 } = metadata || {}

    const isAttachmentUploading = Boolean(attachmentId && !isUploadFailed && uploadProgress < 100)

    const imageClasses = classNames(className, styles.imageAttachment, {
        // Disallow player interaction during the uploading simulation
        [styles.noPointerEvents]: isAttachmentUploading,
    })

    const progressOverlayStyle: React.CSSProperties = {
        ['--image-upload-progress' as string]: `${100 - uploadProgress}%`,
    }

    return (
        <NodeViewWrapper data-drag-handle="true" className={styles.richTextImageWrapper}>
            <img {...imageAttributes} className={imageClasses} alt={alt} title={title} src={src} />
            {isAttachmentUploading ? (
                <Box className={styles.progressOverlay} style={progressOverlayStyle} />
            ) : null}
        </NodeViewWrapper>
    )
}

export { RichTextImageWrapper }
