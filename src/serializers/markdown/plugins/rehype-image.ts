import { SKIP, visit } from 'unist-util-visit'

import { isHastElementNode } from '../../../helpers/unified'

import type { Node as HastNode, Parent as HastParent } from 'hast'
import type { Transformer } from 'unified'

/**
 * A rehype plugin to handle two edge cases for images that the default `rehype-remark` and
 * `remark-stringify` handlers do not handle correctly:
 *
 * 1. Images with a Data URL source have their base64 content replaced with `NOT_SUPPORTED`,
 *    to prevent enormous base64 strings from being dumped into the Markdown output.
 * 2. Images with an empty or missing source are removed entirely, to prevent broken Markdown
 *    syntax (i.e. `![]()` from being generated.
 */
function rehypeImage(): Transformer {
    return (tree: HastNode) => {
        visit(tree, 'element', (node: HastNode, index, parent: HastParent | undefined) => {
            if (!isHastElementNode(node, 'img')) {
                return
            }

            const src = String(node.properties?.src ?? '')

            // Remove images with an empty or missing source (prevents `![]()` output)
            if (!src) {
                if (parent && typeof index === 'number') {
                    parent.children.splice(index, 1)
                    return [SKIP, index]
                }

                return
            }

            // Replace base64 content with `NOT_SUPPORTED` for Data URL images
            if (src.startsWith('data:')) {
                node.properties = {
                    ...node.properties,
                    src: `${src.split(',')[0]},NOT_SUPPORTED`,
                }
            }
        })

        return tree
    }
}

export { rehypeImage }
