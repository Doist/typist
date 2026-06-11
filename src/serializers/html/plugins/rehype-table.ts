import { visit } from 'unist-util-visit'

import { isHastElementNode } from '../../../helpers/unified'

import type { Node as HastNode } from 'hast'
import type { Transformer } from 'unified'

/**
 * A rehype plugin to add support for hard breaks within table cells.
 *
 * Since the GFM table syntax cannot represent multiple lines within a cell, the Markdown
 * serializer outputs hard breaks inside table cells as literal `<br>` elements (which GFM renders as line
 * breaks). However, the HTML serializer persists raw HTML as escaped text (i.e. raw HTML is not
 * interpreted), and thus this plugin restores raw `<br>` elements found within table cells into
 * actual hard breaks.
 */
function rehypeTable(): Transformer {
    return (...[tree]: Parameters<Transformer>): ReturnType<Transformer> => {
        visit(tree, 'element', (node: HastNode) => {
            if (!isHastElementNode(node, 'th') && !isHastElementNode(node, 'td')) {
                return
            }

            // Replace raw `<br>` nodes (which would otherwise be output as escaped text) with
            // actual hard break elements
            node.children = node.children.map((child) =>
                child.type === 'raw' &&
                'value' in child &&
                typeof child.value === 'string' &&
                /^<br\s*\/?>$/.test(child.value)
                    ? { type: 'element', tagName: 'br', properties: {}, children: [] }
                    : child,
            )
        })

        return tree
    }
}

export { rehypeTable }
