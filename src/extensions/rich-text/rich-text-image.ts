import { Image } from '@tiptap/extension-image'
import { Plugin, PluginKey, Selection, TextSelection } from '@tiptap/pm/state'
import { CellSelection } from '@tiptap/pm/tables'
import { ReactNodeViewRenderer } from '@tiptap/react'

import type { NodeView } from '@tiptap/pm/view'
import type { ReactNodeViewProps } from '@tiptap/react'

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
 * The options available to customize the `insertImage` command.
 */
type RichTextImageInsertOptions = {
    /**
     * Inserts the image at the cursor position within the text, instead of on its own line.
     * Requires the `inline` extension option to be enabled, otherwise the command returns `false`.
     */
    inline?: boolean
}

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
            insertImage: (attributes: RichTextImageAttributes, options?: RichTextImageInsertOptions) => ReturnType

            /**
             * Updates the attributes for an existing image in the editor.
             */
            updateImage: (
                attributes: Partial<RichTextImageAttributes> & Required<Pick<RichTextImageAttributes, 'metadata'>>,
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
     * Renders the image node inline (e.g., <p><img src="doist.jpg"></p>). By default images are on
     * the same level as paragraphs.
     *
     * When enabled, images can be placed anywhere inline content is allowed (e.g., within text, or
     * table cells), but the `insertImage` command still inserts images on their own line (within
     * their own paragraph, or between hard breaks inside table cells), unless its `inline` option
     * is set.
     */
    inline: boolean

    /**
     * Custom HTML attributes that should be added to the rendered HTML tag.
     */
    HTMLAttributes: Record<string, string>

    /**
     * A React component to render inside the interactive node view. When `inline` is enabled, the
     * component should render inline elements (e.g., `NodeViewWrapper` with `as="span"`).
     */
    NodeViewComponent?: React.ComponentType<ReactNodeViewProps>

    /**
     * The event handler that is fired when an image file is pasted.
     */
    onImageFilePaste?: (file: File) => void
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
                default: null,
                rendered: false,
            },
        }
    },
    addCommands() {
        const { name: nodeTypeName, options } = this

        return {
            ...this.parent?.(),
            insertImage(attributes, insertOptions) {
                return ({ editor, state, tr, commands }) => {
                    const image = { type: nodeTypeName, attrs: attributes }

                    // Inserting the image within the text requires inline images support
                    if (insertOptions?.inline && !options.inline) {
                        return false
                    }

                    // Collapse a selection of table cells to the end of the cell where it ends, as
                    // replacing it would clear the content of every selected cell
                    if (tr.selection instanceof CellSelection) {
                        const headCellEnd = tr.doc.resolve(tr.selection.$headCell.pos + 1).end()

                        tr.setSelection(TextSelection.near(tr.doc.resolve(headCellEnd), -1))
                    }

                    if (insertOptions?.inline) {
                        return commands.insertContent(image)
                    }

                    // Insert inline images on their own line, by wrapping them in a paragraph that
                    // splits the current block (or between hard breaks inside table cells)
                    if (options.inline) {
                        const { $from, $to } = tr.selection
                        const isAtBlockStart = $from.parentOffset === 0
                        const isAtBlockEnd = $to.parentOffset === $to.parent.content.size
                        const cellTypeName = $from.depth > 0 ? $from.node(-1).type.name : ''

                        // Table cells are restricted to a single paragraph, so the image is placed
                        // on its own line with hard breaks instead
                        if (cellTypeName === 'tableCell' || cellTypeName === 'tableHeader') {
                            if (!state.schema.nodes.hardBreak) {
                                return false
                            }

                            const isAfterHardBreak = isAtBlockStart || $from.nodeBefore?.type.name === 'hardBreak'
                            const isBeforeHardBreak = $to.nodeAfter?.type.name === 'hardBreak'

                            // Hard breaks are only added where the image isn't already next to one
                            const isInserted = commands.insertContent([
                                ...(isAfterHardBreak ? [] : [{ type: 'hardBreak' }]),
                                image,
                                ...(isBeforeHardBreak ? [] : [{ type: 'hardBreak' }]),
                            ])

                            // Move the caret past an existing hard break after the image, so that it
                            // always lands on the line below the image
                            if (isInserted && isBeforeHardBreak) {
                                tr.setSelection(TextSelection.create(tr.doc, tr.selection.to + 1))
                            }

                            return isInserted
                        }

                        return commands.insertContent([
                            { type: 'paragraph', content: [image] },
                            // Insert a blank paragraph after the image when at the end of a block
                            ...(isAtBlockEnd ? [{ type: 'paragraph' }] : []),
                        ])
                    }

                    const selectionAtEnd = Selection.atEnd(editor.state.doc)

                    // Insert block images directly, which the schema places on their own line
                    return commands.insertContent([
                        image,
                        // Insert a blank paragraph after the image when at the end of the document
                        ...(editor.state.selection.to === selectionAtEnd.to ? [{ type: 'paragraph' }] : []),
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
        const { inline, NodeViewComponent } = this.options

        // Do not add a node view if component was not specified
        if (!NodeViewComponent) {
            return () => ({}) as NodeView
        }

        // Render the node view with the provided React component
        return ReactNodeViewRenderer(NodeViewComponent, {
            as: inline ? 'span' : 'div',
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

export type { RichTextImageAttributes, RichTextImageInsertOptions, RichTextImageOptions }
