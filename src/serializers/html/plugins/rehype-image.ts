import { SKIP, visit } from 'unist-util-visit'

import { isHastElementNode } from '../../../helpers/unified'

import type { Element, ElementContent, Node as HastNode, Parent as HastParent } from 'hast'
import type { Transformer } from 'unified'
import type { Schema } from '@tiptap/pm/model'

/**
 * The tag names of block elements that can be direct children of a list item.
 */
const LIST_ITEM_BLOCK_TAG_NAMES = new Set([
    'blockquote',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'ol',
    'p',
    'pre',
    'table',
    'ul',
])

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
            // Wrap the inline content of tight list items in paragraphs, so that images within
            // it are split out like in any other paragraph
            if (isHastElementNode(node, 'li')) {
                wrapListItemInlineContent(node)
                return
            }

            if (!isHastElementNode(node, 'p')) {
                return
            }

            const paragraph = node
            const blocks: Element[] = []
            let inlineContent: ElementContent[] = []
            let hasImages = false

            // Keep the inline content collected so far in its own paragraph, without the
            // whitespace and line breaks around it (e.g., between text and images)
            function flushInlineContent() {
                const children = trimBlankHastNodes(inlineContent)

                if (children.length > 0) {
                    blocks.push({ ...paragraph, children })
                }

                inlineContent = []
            }

            for (const child of paragraph.children) {
                for (const part of splitHastNodeAroundImages(child)) {
                    if (isHastElementNode(part, 'img')) {
                        flushInlineContent()
                        blocks.push(part)
                        hasImages = true
                    } else {
                        inlineContent.push(part)
                    }
                }
            }

            if (!hasImages) {
                return
            }

            flushInlineContent()

            parent.children.splice(index, 1, ...blocks)

            return [SKIP, index + blocks.length]
        })

        // List items must start with a paragraph, so an empty one is kept before a leading image
        visit(tree, 'element', (node: HastNode) => {
            if (!isHastElementNode(node, 'li')) {
                return
            }

            const firstChild = node.children.find((child) => !isBlankHastNode(child) || child.type === 'element')

            if (firstChild && isHastElementNode(firstChild, 'img')) {
                node.children.unshift({ type: 'element', tagName: 'p', properties: {}, children: [] })
            }
        })

        return tree
    }
}

/**
 * Splits a given hast node around the images within it, so that images nested in inline elements
 * (e.g., links or bold text) can be moved out in place, with each inline element split in two.
 *
 * @param node The hast node to split.
 *
 * @returns The parts of the node, in order, with the images as separate parts.
 */
function splitHastNodeAroundImages(node: ElementContent): ElementContent[] {
    if (node.type !== 'element' || node.tagName === 'img') {
        return [node]
    }

    const parts: ElementContent[] = []
    let children: ElementContent[] = []

    for (const child of node.children) {
        for (const part of splitHastNodeAroundImages(child)) {
            if (isHastElementNode(part, 'img')) {
                // Drop the whitespace and line breaks around each image, which would otherwise be
                // left at the edges of the split inline element
                parts.push({ ...node, children: trimBlankHastNodes(children, { start: parts.length > 0 }) }, part)
                children = []
            } else {
                children.push(part)
            }
        }
    }

    return parts.length > 0 ? [...parts, { ...node, children: trimBlankHastNodes(children, { end: false }) }] : [node]
}

/**
 * Determines whether a given hast node is a block element that can be a direct child of a list
 * item.
 *
 * @param node The hast node to check.
 *
 * @returns `true` if the node is a list item block element, `false` otherwise.
 */
function isListItemBlockElement(node: ElementContent): boolean {
    return node.type === 'element' && LIST_ITEM_BLOCK_TAG_NAMES.has(node.tagName)
}

/**
 * Wraps each run of inline content within a list item in a paragraph, if any of those runs
 * contains an image.
 *
 * @param listItem The list item element to wrap the inline content of.
 */
function wrapListItemInlineContent(listItem: Element): void {
    const hasInlineImages = listItem.children.some((child) => {
        let hasImage = false

        if (!isListItemBlockElement(child)) {
            visit(child, 'element', (descendant: HastNode) => {
                hasImage ||= isHastElementNode(descendant, 'img')
            })
        }

        return hasImage
    })

    if (!hasInlineImages) {
        return
    }

    const children: ElementContent[] = []
    let inlineContent: ElementContent[] = []

    function flushInlineContent() {
        if (inlineContent.every(isBlankHastNode)) {
            children.push(...inlineContent)
        } else {
            children.push({ type: 'element', tagName: 'p', properties: {}, children: inlineContent })
        }

        inlineContent = []
    }

    for (const child of listItem.children) {
        if (isListItemBlockElement(child)) {
            flushInlineContent()
            children.push(child)
        } else {
            inlineContent.push(child)
        }
    }

    flushInlineContent()

    listItem.children = children
}

/**
 * Removes the blank nodes (e.g., whitespace or line breaks) from the start and end of the given
 * inline content.
 *
 * @param content The inline content to trim.
 * @param edges Which edges of the inline content to trim (both by default).
 * @param edges.start Whether to trim the blank nodes at the start of the inline content.
 * @param edges.end Whether to trim the blank nodes at the end of the inline content.
 *
 * @returns The inline content without leading and trailing blank nodes.
 */
function trimBlankHastNodes(
    content: ElementContent[],
    { start: trimStart = true, end: trimEnd = true }: { start?: boolean; end?: boolean } = {},
): ElementContent[] {
    let start = 0
    let end = content.length

    if (trimStart) {
        while (start < end && isBlankHastNode(content[start])) {
            start += 1
        }
    }

    if (trimEnd) {
        while (end > start && isBlankHastNode(content[end - 1])) {
            end -= 1
        }
    }

    return content.slice(start, end)
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
        return node.tagName !== 'img' && node.children.every(isBlankHastNode)
    }

    return true
}

export { rehypeImage }
