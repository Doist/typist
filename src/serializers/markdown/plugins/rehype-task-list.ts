import { visit } from 'unist-util-visit'

import { isHastElementNode } from '../../../helpers/unified'

import type { Element, Node as HastNode } from 'hast'
import type { Transformer } from 'unified'

/**
 * A rehype plugin to transform Tiptap-style task list items (i.e. `<li data-type="taskItem"
 * data-checked="true|false">`) into standard GFM task list items (i.e. `<li><input type="checkbox"
 * disabled checked> ...</li>`), so that `hast-util-to-mdast` and `remark-gfm` can serialize them
 * as standard Markdown task list items (i.e. `- [ ]` and `- [x]`).
 */
function rehypeTaskList(): Transformer {
    return (tree: HastNode) => {
        visit(tree, 'element', (node: HastNode) => {
            if (!isHastElementNode(node, 'li')) {
                return
            }

            if (node.properties?.dataType !== 'taskItem') {
                return
            }

            const isChecked = node.properties?.dataChecked === 'true'

            const checkbox: Element = {
                type: 'element',
                tagName: 'input',
                properties: {
                    type: 'checkbox',
                    disabled: true,
                    ...(isChecked ? { checked: true } : {}),
                },
                children: [],
            }

            node.children = [checkbox, ...node.children]
        })

        return tree
    }
}

export { rehypeTaskList }
