import { findParentNode } from '@tiptap/core'
import { Image } from '@tiptap/extension-image'
import { NodeSelection, Plugin, PluginKey, Selection, TextSelection } from '@tiptap/pm/state'
import { CellSelection } from '@tiptap/pm/tables'
import { ReactNodeViewRenderer } from '@tiptap/react'

import type { Transaction } from '@tiptap/pm/state'
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
     * table cells), and the `insertImage` command inserts them at the caret.
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
 * Places the caret on a new line right after the given position (i.e., right after an inserted
 * image), reusing an empty textblock there or inserting an empty paragraph (where the schema
 * allows it), so that typing continues below the image instead of replacing it.
 *
 * @param tr The transaction to update.
 * @param position The position right after the inserted image.
 */
function placeCaretAfter(tr: Transaction, position: number) {
    const $position = tr.doc.resolve(position)
    const { paragraph } = tr.doc.type.schema.nodes
    const { nodeAfter } = $position

    if (
        !(nodeAfter?.isTextblock && nodeAfter.content.size === 0) &&
        paragraph &&
        $position.parent.canReplaceWith($position.index(), $position.index(), paragraph)
    ) {
        tr.insert(position, paragraph.create())
    }

    // Keep the current selection when there's nothing after the image to place the caret in
    // (e.g., in single-line editors)
    if (position < tr.doc.content.size) {
        tr.setSelection(TextSelection.near(tr.doc.resolve(position + 1)))
    }
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
            insertImage(attributes) {
                return ({ editor, tr, dispatch, commands }) => {
                    const image = { type: nodeTypeName, attrs: attributes }
                    const imageType = tr.doc.type.schema.nodes[nodeTypeName]

                    // Collapse a selection of table cells to the end of the cell where it ends, so
                    // that inserting the image doesn't replace the content of the selected cells
                    if (dispatch && tr.selection instanceof CellSelection) {
                        const { $headCell } = tr.selection
                        const headCellEnd = $headCell.pos + ($headCell.nodeAfter?.nodeSize ?? 0) - 1

                        tr.setSelection(Selection.near(tr.doc.resolve(headCellEnd), -1))
                    }

                    const table = findParentNode((node) => node.type.name === 'table')(tr.selection)

                    // Insert block images after the table, instead of splitting it at the caret,
                    // since table cells can't hold block images
                    if (!options.inline && table && tr.selection.to < table.pos + table.node.nodeSize) {
                        // Check if the transaction should be dispatched
                        if (dispatch) {
                            const tableEnd = table.pos + table.node.nodeSize

                            tr.insert(tableEnd, imageType.create(attributes))
                            placeCaretAfter(tr, tableEnd + 1)
                        }

                        return true
                    }

                    const { $from, empty } = tr.selection
                    const isAtTextblockStart = empty && $from.parent.isTextblock && $from.parentOffset === 0

                    // Insert block images before the block when the caret is at its start, instead of
                    // splitting it, so that no empty block is left above the image (unless the schema
                    // requires that block to come first, e.g., in list items)
                    if (
                        !options.inline &&
                        isAtTextblockStart &&
                        $from.node(-1).canReplaceWith($from.index(-1), $from.index(-1), imageType)
                    ) {
                        return commands.insertContentAt($from.before(), image, { updateSelection: false })
                    }

                    const selectionAtEnd = Selection.atEnd(editor.state.doc)

                    const isInserted = commands.insertContent([
                        image,
                        // Insert a blank paragraph after block images when at the end of the document
                        ...(!options.inline && editor.state.selection.to === selectionAtEnd.to
                            ? [{ type: 'paragraph' }]
                            : []),
                    ])

                    // Move the caret below block images left selected after inserting them (e.g., at
                    // the end of a block, or in an empty list item), so typing doesn't replace them
                    if (
                        dispatch &&
                        isInserted &&
                        !options.inline &&
                        tr.selection instanceof NodeSelection &&
                        tr.selection.node.type.name === nodeTypeName
                    ) {
                        placeCaretAfter(tr, tr.selection.to)
                    }

                    return isInserted
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

export type { RichTextImageAttributes, RichTextImageOptions }
