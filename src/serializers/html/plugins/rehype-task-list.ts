import { visit } from 'unist-util-visit'

import { isHastElementNode, isHastTextNode } from '../../../helpers/unified'

import type { Node as HastNode } from 'hast'
import type { Transformer } from 'unified'

/**
 * A rehype plugin to add support for Tiptap task lists (i.e., `* [ ] Task`).
 */
function rehypeTaskList(): Transformer {
    return (...[tree]: Parameters<Transformer>): ReturnType<Transformer> => {
        visit(tree, 'element', (node: HastNode) => {
            if (isHastElementNode(node, 'ul')) {
                const areAllChildrenTaskItems = node.children.every(
                    (c) =>
                        isHastElementNode(c, 'li') &&
                        isHastTextNode(c.children[0]) &&
                        /^\[[ x]\] /i.test(c.children[0].value),
                )

                // Add the required attributes to the list and list items if all children are tasks,
                // removing the `[ ] ` or `[x] ` at the beginning of the task item text
                if (areAllChildrenTaskItems) {
                    node.properties = {
                        ...node.properties,
                        'data-type': 'taskList',
                    }

                    node.children.forEach((c) => {
                        if (isHastElementNode(c, 'li') && isHastTextNode(c.children[0])) {
                            c.properties = {
                                ...c.properties,
                                'data-type': 'taskItem',
                                'data-checked': String(/^\[x\]/i.test(c.children[0].value)),
                            }

                            c.children[0].value = c.children[0].value.substring(4).trim()
                        }
                    })
                }
            }
        })

        return tree
    }
}

export { rehypeTaskList }
