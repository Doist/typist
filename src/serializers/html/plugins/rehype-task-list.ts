import { visit } from 'unist-util-visit'

import { isHastElement, isHastTextNode } from '../../../helpers/unified'

import type { Transformer } from 'unified'
import type { Node } from 'unist'

/**
 * A rehype plugin to add support for Tiptap task lists (i.e., `* [ ] Task`).
 */
function rehypeTaskList(): Transformer {
    return (...[tree]: Parameters<Transformer>): ReturnType<Transformer> => {
        visit(tree, 'element', (node: Node) => {
            if (isHastElement(node, 'ul')) {
                const areAllChildrenTaskItems = node.children.every(
                    (c) =>
                        isHastElement(c, 'li') &&
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
                        if (isHastElement(c, 'li') && isHastTextNode(c.children[0])) {
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
