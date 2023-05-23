import { is } from 'unist-util-is'

import type { Node, Text } from 'hast'

/**
 * Check if a given node is a unist text node.
 *
 * @param node The node to check.
 *
 * @returns `true` if the node is a unist text node, `false` otherwise.
 */
function isTextNode(node: Node): node is Text {
    return is(node, { type: 'text' })
}

export { isTextNode }
