import { extractTagsFromParseRules } from '../../../helpers/serializer'
import { BULLET_LIST_MARKER } from '../markdown'

import type { NodeType } from '@tiptap/pm/model'
import type Turndown from 'turndown'

/**
 * A Turndown plugin which adds a custom rule for standard list items (i.e., not task list items),
 * based on the original list item rule. This custom rule is required to avoid conflicts with task
 * list items, and to normalize the Markdown output.
 *
 * @see https://github.com/mixmark-io/turndown/blob/v7.1.1/src/commonmark-rules.js#L61
 *
 * @param nodeType The node object that matches this rule.
 */
function listItem(nodeType: NodeType): Turndown.Plugin {
    const tags = extractTagsFromParseRules(nodeType.spec.parseDOM)

    return (turndown: Turndown) => {
        turndown.addRule(nodeType.name, {
            filter(node) {
                return (
                    tags.some((tag) => tag.toUpperCase() === node.nodeName) &&
                    node.getAttribute('data-type') !== 'taskItem'
                )
            },
            replacement(content, node) {
                const parentNode = node.parentNode as HTMLElement
                let listItemMarker = `${BULLET_LIST_MARKER} `

                // Use a sequence of 1–9 digits for the ordered list marker (CommonMark specification)
                if (parentNode?.nodeName === 'OL') {
                    const start = parentNode.getAttribute('start')
                    const index = Array.prototype.indexOf.call(parentNode.children, node)

                    listItemMarker = `${start ? Number(start) + index : index + 1}. `
                }

                const newContent = content
                    // Remove leading newlines
                    .replace(/^\n+/, '')
                    // Replace trailing newlines with a single one
                    .replace(/\n+$/, '\n')
                    // Indent list items with 4 spaces
                    .replace(/\n/gm, '\n    ')

                return `${listItemMarker}${newContent.trim()}${
                    node.nextSibling && !newContent.endsWith('\n') ? '\n' : ''
                }`
            },
        })
    }
}

export { listItem }
