import { remove } from 'unist-util-remove'
import { SKIP, visit } from 'unist-util-visit'

import { getHastTextContent, isHastElementNode } from '../../../helpers/unified'

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
            if (!isHastElementNode(node, 'p') || !hasImageDescendant(node)) {
                return
            }

            const blocks: ElementContent[] = []
            let inlineContent: ElementContent[] = []

            // Keep the inline content collected so far in its own paragraph, unless it's blank
            // (e.g., whitespace or line breaks between images)
            function flushInlineContent() {
                if (inlineContent.some((child) => getHastTextContent(child).trim() !== '')) {
                    blocks.push({ ...node, children: inlineContent } as Element)
                }

                inlineContent = []
            }

            for (const child of node.children) {
                if (isHastElementNode(child, 'img')) {
                    flushInlineContent()
                    blocks.push(child)
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
                remove(child, (descendant) => isHastElementNode(descendant, 'img'))

                inlineContent.push(child)

                if (images.length > 0) {
                    flushInlineContent()
                    blocks.push(...images)
                }
            }

            flushInlineContent()

            parent.children.splice(index, 1, ...blocks)

            return [SKIP, index + blocks.length]
        })

        return tree
    }
}

/**
 * Determines whether a given hast element contains an image element at any depth.
 *
 * @param node The hast element to check.
 *
 * @returns `true` if the element contains an image element, `false` otherwise.
 */
function hasImageDescendant(node: Element): boolean {
    return node.children.some(
        (child) => child.type === 'element' && (child.tagName === 'img' || hasImageDescendant(child)),
    )
}

export { rehypeImage }
