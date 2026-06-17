import { escapeSuggestionLabel, getSuggestionUrlScheme } from '../../../helpers/serializer'

import type { NodeType } from '@tiptap/pm/model'
import type Turndown from 'turndown'

/**
 * A Turndown plugin which adds a custom rule for suggestion nodes created by the suggestion
 * extension factory function.
 *
 * @param nodeType The node object that matches this rule.
 * @param isPlainText Specifies if the schema represents a plain-text document.
 */
function suggestion(nodeType: NodeType, isPlainText: boolean): Turndown.Plugin {
    const attributeType = getSuggestionUrlScheme(nodeType)

    return (turndown: Turndown) => {
        turndown.addRule(nodeType.name, {
            filter(node: Element) {
                return node.hasAttribute(`data-${attributeType}`)
            },
            replacement(_, node) {
                const label = String((node as Element).getAttribute('data-label'))
                const id = String((node as Element).getAttribute('data-id'))

                // Rich-text editors parse the label back as inline Markdown, so its Markdown
                // characters are escaped to keep the label intact across a serialize then parse
                // round-trip. Plain-text editors keep the label verbatim when parsing it back, so
                // it must not be escaped.
                const serializedLabel = isPlainText ? label : escapeSuggestionLabel(label)

                return `[${serializedLabel}](${attributeType}://${id})`
            },
        })
    }
}

export { suggestion }
