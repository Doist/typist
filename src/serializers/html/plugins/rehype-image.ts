import { remove } from 'unist-util-remove'
import { SKIP, visit } from 'unist-util-visit'

import { isHastElementNode } from '../../../helpers/unified'

import type { Element, ElementContent, Node as HastNode, Parent as HastParent } from 'hast'
import type { Transformer } from 'unified'
import type { Schema } from '@tiptap/pm/model'

/**
 * A rehype plugin to move images out of their wrapping paragraph if the editor was configured
 * without inline image support (Tiptap default), splitting the paragraph around the images.
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
            if (!isHastElementNode(node, 'p')) {
                return
            }

            const paragraph = node
            const blocks: Element[] = []
            let inlineContent: ElementContent[] = []
            let hasImages = false

            // Keep the inline content collected so far in its own paragraph, unless it's blank
            // (e.g., whitespace or line breaks between images)
            function flushInlineContent() {
                if (!inlineContent.every(isBlankHastNode)) {
                    blocks.push({ ...paragraph, children: inlineContent })
                }

                inlineContent = []
            }

            for (const child of paragraph.children) {
                if (isHastElementNode(child, 'img')) {
                    flushInlineContent()
                    blocks.push(child)
                    hasImages = true
                    continue
                }

                const images: Element[] = []

                // Images nested in inline elements (e.g., links) are moved after the element,
                // since block images cannot be marked
                visit(child, 'element', (descendant: HastNode) => {
                    if (isHastElementNode(descendant, 'img')) {
                        images.push(descendant)
                    }
                })

                if (images.length === 0) {
                    inlineContent.push(child)
                    continue
                }

                remove(child, (descendant) => isHastElementNode(descendant, 'img'))

                // Drop inline elements left blank without their images (e.g., image-only links)
                if (!isBlankHastNode(child)) {
                    inlineContent.push(child)
                }

                flushInlineContent()
                blocks.push(...images)
                hasImages = true
            }

            if (!hasImages) {
                return
            }

            flushInlineContent()

            parent.children.splice(index, 1, ...blocks)

            return [SKIP, index + blocks.length]
        })

        return tree
    }
}

/**
 * Determines whether a given hast node is blank, i.e. it only holds whitespace or line breaks.
 *
 * @param node The hast node to check.
 *
 * @returns `true` if the node is blank, `false` otherwise.
 */
function isBlankHastNode(node: ElementContent): boolean {
    if (node.type === 'text' || node.type === 'raw') {
        return node.value.trim() === ''
    }

    if (node.type === 'element') {
        return node.children.every(isBlankHastNode)
    }

    return true
}

export { rehypeImage }
