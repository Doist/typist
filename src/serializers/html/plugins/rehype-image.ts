import { isElement } from 'hast-util-is-element'
import { remove } from 'unist-util-remove'
import { visit } from 'unist-util-visit'

import type { Schema } from 'prosemirror-model'
import type { Transformer } from 'unified'
import type { Node, Parent } from 'unist'

/**
 * A rehype plugin to remove the wrapping paragraph from images and to remove all inline images if
 * the editor was configured without inline image support (Tiptap default).
 *
 * @param schema The editor schema to be used for nodes and marks detection.
 */
function rehypeImage(schema: Schema): Transformer {
    const allowInlineImages = schema.nodes.image ? schema.nodes.image.spec.inline : false

    // Return the tree as-is if the editor does not support inline images
    if (allowInlineImages) {
        return (tree: Node) => tree
    }

    return (...[tree]: Parameters<Transformer>): ReturnType<Transformer> => {
        visit(tree, 'element', (node: Node, index: number, parent: Parent) => {
            if (isElement(node, 'p')) {
                const areAllChildrenImages = node.children.every((c) => isElement(c, 'img'))

                // Replace the paragraph with the image children if all children are images, or
                // remove all images from the paragraph if it contains non-image children since the
                // editor does not support inline images
                if (areAllChildrenImages) {
                    parent.children.splice(index, 1, ...node.children)
                } else {
                    remove(node, (n) => isElement(n, 'img'))
                }
            }
        })

        return tree
    }
}

export { rehypeImage }
