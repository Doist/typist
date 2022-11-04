import { extractTagsFromParseRules } from '../../../helpers/serializer'
import { BULLET_LIST_MARKER } from '../markdown'

import type { NodeType } from 'prosemirror-model'
import type Turndown from 'turndown'

/**
 * A Turndown plugin which adds a rule for task list items (i.e., `* [ ] Task`), based on the
 * original list item rule. This rule not only avoids conflicts with standard list items, but also
 * normalizes the Markdown output.
 *
 * @see https://github.com/mixmark-io/turndown/blob/v7.1.1/src/commonmark-rules.js#L61
 *
 * @param nodeType The node object that matches this rule.
 */
function taskItem(nodeType: NodeType): Turndown.Plugin {
    const tags = extractTagsFromParseRules(nodeType.spec.parseDOM)

    return (turndown: Turndown) => {
        turndown.addRule(nodeType.name, {
            filter: (node) => {
                return (
                    tags.some((tag) => tag.toUpperCase().startsWith(node.nodeName)) &&
                    node.getAttribute('data-type') === 'taskItem'
                )
            },
            replacement: function (content, node) {
                const parentNode = node.parentNode as HTMLElement
                let listItemMarker = `${BULLET_LIST_MARKER} `

                if (parentNode?.nodeName === 'UL') {
                    const checked = (node as HTMLLIElement).getAttribute('data-checked')
                    listItemMarker = `${listItemMarker}${checked === 'true' ? '[x]' : '[ ]'} `
                }

                const newContent = content
                    // Remove leading newlines
                    .replace(/^\n+/, '')
                    // Replace trailing newlines with a single one
                    .replace(/\n+$/, '\n')
                    // Indent list items with 4 spaces
                    .replace(/\s*\n/gm, '\n    ')

                return `${listItemMarker}${newContent.trim()}${
                    node.nextSibling && !newContent.endsWith('\n') ? '\n' : ''
                }`
            },
        })
    }
}

export { taskItem }
