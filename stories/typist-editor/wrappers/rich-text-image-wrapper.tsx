import { Box } from '@doist/reactist'

import classNames from 'classnames'

import { NodeViewWrapper } from '../../../src'

import styles from './rich-text-image-wrapper.module.css'

import type { NodeViewProps, RichTextImageAttributes, RichTextImageOptions } from '../../../src'

function RichTextImageWrapper({ extension, node, selected: isNodeSelected }: NodeViewProps) {
    const {
        HTMLAttributes: { class: className, ...imageAttributes },
    } = extension.options as RichTextImageOptions
    const { alt, metadata, src, title } = node.attrs as RichTextImageAttributes
    const { attachmentId, isUploadFailed = false, uploadProgress = 0 } = metadata || {}

    const isAttachmentUploading = Boolean(attachmentId && !isUploadFailed && uploadProgress < 100)

    const imageClasses = classNames(className, styles.imageAttachment, {
        // Use the same class name as ProseMirror for consistency
        'ProseMirror-selectednode': isNodeSelected,
    })

    const progressOverlay: React.CSSProperties = {
        ['--image-upload-progress' as string]: `${100 - uploadProgress}%`,
    }

    return (
        <NodeViewWrapper data-drag-handle="true" className={styles.richTextImageWrapper}>
            <img {...imageAttributes} className={imageClasses} alt={alt} title={title} src={src} />
            {isAttachmentUploading ? (
                <Box className={styles.progressOverlay} style={progressOverlay} />
            ) : null}
        </NodeViewWrapper>
    )
}

export { RichTextImageWrapper }
