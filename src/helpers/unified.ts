import { is } from 'unist-util-is'

import type { Element, Node as HastNode, Text } from 'hast'

/**
 * Determines whether a given hast node is an element node with a specific tag name.
 *
 * @param node The hast node to check.
 * @param tagName The tag name to check for.
 *
 * @returns `true` if the hast node is an element node with the specified tag name, `false`
 * otherwise.
 */
function isHastElementNode(node: HastNode, tagName: Element['tagName']): node is Element {
    return is(node, { type: 'element', tagName })
}

/**
 * Determines whether a given hast node is a text node.
 *
 * @param node The hast node to check.
 *
 * @returns `true` if the hast node is a text node, `false` otherwise.
 */
function isHastTextNode(node: HastNode): node is Text {
    return is(node, { type: 'text' })
}

/**
 * Collects the plain text content of a hast node by concatenating the values of all its descendant
 * text nodes, in document order.
 *
 * @param node The hast node to extract text content from.
 *
 * @returns The concatenated text content of the node and all its descendants.
 */
function getHastTextContent(node: HastNode): string {
    if (isHastTextNode(node)) {
        return node.value
    }

    if ('children' in node) {
        return (node.children as HastNode[]).map(getHastTextContent).join('')
    }

    return ''
}

export { getHastTextContent, isHastElementNode, isHastTextNode }
