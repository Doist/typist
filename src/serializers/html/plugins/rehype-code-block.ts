import { isElement } from 'hast-util-is-element'
import { visit } from 'unist-util-visit'

import { isTextNode } from '../../../helpers/unified'

import type { Node } from 'hast'
import type { Transformer } from 'unified'

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
                isElement(node, 'pre') &&
                isElement(node.children[0], 'code') &&
                isTextNode(node.children[0].children[0])
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
