import { Image } from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { Plugin, PluginKey, Selection } from 'prosemirror-state'

import type { NodeViewProps } from '@tiptap/react'

/**
 * The properties that describe `RichTextImage` node attributes.
 */
type RichTextImageAttributes = {
    /**
     * Additional metadata about an image attachment upload.
     */
    metadata?: {
        /**
         * A unique ID for the image attachment.
         */
        attachmentId: string

        /**
         * Specifies if the image attachment failed to upload.
         */
        isUploadFailed: boolean

        /**
         * The upload progress for the image attachment.
         */
        uploadProgress: number
    }
} & Pick<HTMLImageElement, 'src'> &
    Pick<Partial<HTMLImageElement>, 'alt' | 'title'>

/**
 * Augment the official `@tiptap/core` module with extra commands, relevant for this extension, so
 * that the compiler knows about them.
 */
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        richTextImage: {
            /**
             * Inserts an image into the editor with the given attributes.
             */
            insertImage: (attributes: RichTextImageAttributes) => ReturnType

            /**
             * Updates the attributes for an existing image in the editor.
             */
            updateImage: (
                attributes: Partial<RichTextImageAttributes> &
                    Required<Pick<RichTextImageAttributes, 'metadata'>>,
            ) => ReturnType
        }
    }
}

/**
 * The options available to customize the `RichTextImage` extension.
 */
type RichTextImageOptions = {
    /**
     * A list of accepted MIME types for images pasting.
     */
    acceptedImageMimeTypes: string[]

    /**
     * Renders the image node inline (e.g., <p><img src="spacer.gif"></p>). By default images are on
     * the same level as paragraphs.
     */
    inline: boolean

    /**
     * Custom HTML attributes that should be added to the rendered HTML tag.
     */
    HTMLAttributes: Record<string, string>

    /**
     * A React component to render inside the interactive node view.
     */
    NodeViewComponent?: React.ComponentType<NodeViewProps>

    /**
     * The event handler that is fired when an image file is pasted.
     */
    onImageFilePaste?: (file: File) => void

    /**
     * The event handler that should be fired when an image node is deleted.
     */
    onImageNodeDelete?: (attachmentId: string) => void
}

/**
 * Custom extension that extends the built-in `Image` extension to add support for image pasting,
 * and also adds the ability to pass aditional metadata about an image attachment upload.
 */
const RichTextImage = Image.extend<RichTextImageOptions>({
    draggable: true,
    addOptions() {
        return {
            ...this.parent?.(),
            acceptedImageMimeTypes: ['image/gif', 'image/jpeg', 'image/jpg', 'image/png'],
            NodeViewComponent: undefined,
        }
    },
    addAttributes() {
        return {
            ...this.parent?.(),
            metadata: {
                default: undefined,
                rendered: false,
            },
        }
    },
    addCommands() {
        const { name: nodeTypeName } = this

        return {
            ...this.parent?.(),
            insertImage(attributes) {
                return ({ editor, commands }) => {
                    const selectionAtEnd = Selection.atEnd(editor.state.doc)

                    return commands.insertContent([
                        {
                            type: nodeTypeName,
                            attrs: attributes,
                        },
                        // Insert a blank paragraph after the image when at the end of the document
                        ...(editor.state.selection.to === selectionAtEnd.to
                            ? [{ type: 'paragraph' }]
                            : []),
                    ])
                }
            },
            updateImage(attributes) {
                return ({ commands }) => {
                    return commands.command(({ tr }) => {
                        tr.doc.descendants((node, position) => {
                            const { metadata } = node.attrs as {
                                metadata: RichTextImageAttributes['metadata']
                            }

                            // Update the image attributes to the corresponding node
                            if (
                                node.type.name === nodeTypeName &&
                                metadata?.attachmentId === attributes.metadata?.attachmentId
                            ) {
                                tr.setNodeMarkup(position, node.type, {
                                    ...node.attrs,
                                    ...attributes,
                                })
                            }
                        })

                        return true
                    })
                }
            },
        }
    },
    addNodeView() {
        const { NodeViewComponent } = this.options

        // Do not add a node view if component was not specified
        if (!NodeViewComponent) {
            return () => ({})
        }

        // Render the node view with the provided React component
        return ReactNodeViewRenderer(NodeViewComponent, {
            as: 'div',
            className: `Typist-${this.type.name}`,
        })
    },
    addProseMirrorPlugins() {
        const { acceptedImageMimeTypes, onImageFilePaste } = this.options

        return [
            new Plugin({
                key: new PluginKey(this.name),
                props: {
                    handlePaste(_, event) {
                        // Do not handle the event if we don't have a callback
                        if (!onImageFilePaste) {
                            return false
                        }

                        // Do not handle the event if there are multiple clipboard types
                        if ((event.clipboardData?.types || []).length > 1) {
                            return false
                        }

                        const pastedFiles = Array.from(event.clipboardData?.files || [])

                        // Do not handle the event if no files were pasted
                        if (pastedFiles.length === 0) {
                            return false
                        }

                        let wasPasteHandled = false

                        // Invoke the callback for every pasted file that is an accepted image type
                        pastedFiles.forEach((pastedFile) => {
                            if (acceptedImageMimeTypes.includes(pastedFile.type)) {
                                onImageFilePaste(pastedFile)
                                wasPasteHandled = true
                            }
                        })

                        // Suppress the default handling behaviour if at least one image was handled
                        return wasPasteHandled
                    },
                },
            }),
        ]
    },
})

export { RichTextImage }

export type { RichTextImageAttributes, RichTextImageOptions }
