import { is } from 'unist-util-is'

import type { Element, Text } from 'hast'
import type { Node } from 'unist'

/**
 * Determines whether a given node is an hast element with a specific tag name.
 *
 * @param node The node to check.
 * @param tagName The tag name to check for.
 *
 * @returns `true` if the node is an hast element with the specified tag name, `false` otherwise.
 */
function isHastElement(node: Node, tagName: Element['tagName']): node is Element {
    return is(node, { type: 'element', tagName })
}

/**
 * Determines whether a given node is hast a text node.
 *
 * @param node The node to check.
 *
 * @returns `true` if the node is a hast text node, `false` otherwise.
 */
function isHastTextNode(node: Node): node is Text {
    return is(node, { type: 'text' })
}

export { isHastElement, isHastTextNode }
