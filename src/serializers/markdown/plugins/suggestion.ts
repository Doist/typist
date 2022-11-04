import { kebabCase } from 'lodash-es'

import type { NodeType } from 'prosemirror-model'
import type Turndown from 'turndown'

/**
 * A Turndown plugin which adds a custom rule for suggestion nodes created by the suggestion
 * extension factory function.
 *
 * @param nodeType The node object that matches this rule.
 */
function suggestion(nodeType: NodeType): Turndown.Plugin {
    const attributeType = kebabCase(nodeType.name.replace(/Suggestion$/, ''))

    return (turndown: Turndown) => {
        turndown.addRule(nodeType.name, {
            filter: (node: Element) => node.hasAttribute(`data-${attributeType}`),
            replacement: (_, node) => {
                const label = String((node as Element).getAttribute('data-label'))
                const id = String((node as Element).getAttribute('data-id'))

                return `[${label}](${attributeType}://${id})`
            },
        })
    }
}

export { suggestion }
