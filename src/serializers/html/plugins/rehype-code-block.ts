import { visit } from 'unist-util-visit'

import { isHastElement, isHastTextNode } from '../../../helpers/unified'

import type { Transformer } from 'unified'
import type { Node } from 'unist'

/**
 * A rehype plugin to remove the trailing newline from code blocks (i.e. the newline between the
 * last code line and `</code></pre>`). Although that newline is part of the CommonMark
 * specification, this custom plugin is required to prevent Tiptap from rendering a blank line at
 * the end of the code block.
 */
function rehypeCodeBlock(): Transformer {
    return (...[tree]: Parameters<Transformer>): ReturnType<Transformer> => {
        visit(tree, 'element', (node: Node) => {
            if (
                isHastElement(node, 'pre') &&
                isHastElement(node.children[0], 'code') &&
                isHastTextNode(node.children[0].children[0])
            ) {
                node.children[0].children[0].value = node.children[0].children[0].value.replace(
                    /\n$/,
                    '',
                )
            }
        })

        return tree
    }
}

export { rehypeCodeBlock }
