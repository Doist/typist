import { remove } from 'unist-util-remove'
import { visit } from 'unist-util-visit'

import { isHastElementNode } from '../../../helpers/unified'

import type { Schema } from '@tiptap/pm/model'
import type { Node as HastNode, Parent as HastParent } from 'hast'
import type { Transformer } from 'unified'

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
        return (tree) => tree
    }

    return (...[tree]: Parameters<Transformer>): ReturnType<Transformer> => {
        visit(tree, 'element', (node: HastNode, index: number, parent: HastParent) => {
            if (isHastElementNode(node, 'p')) {
                const areAllChildrenImages = node.children.every((c) => isHastElementNode(c, 'img'))

                // Replace the paragraph with the image children if all children are images, or
                // remove all images from the paragraph if it contains non-image children since the
                // editor does not support inline images
                if (areAllChildrenImages) {
                    parent.children.splice(index, 1, ...node.children)
                } else {
                    remove(node, (n) => isHastElementNode(n, 'img'))
                }
            }
        })

        return tree
    }
}

export { rehypeImage }
