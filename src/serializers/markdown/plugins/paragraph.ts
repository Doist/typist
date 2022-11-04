import type { NodeType } from 'prosemirror-model'
import type Turndown from 'turndown'

/**
 * A Turndown plugin which adds a custom rule for paragraphs. This custom rule is required to avoid
 * adding unnecessary blank lines between paragraphs to plain-text documents.
 *
 * @param nodeType The node object that matches this rule.
 * @param isPlainText Specifies if the schema represents a plain-text document.
 */
function paragraph(nodeType: NodeType, isPlainText: boolean): Turndown.Plugin {
    return (turndown: Turndown) => {
        turndown.addRule(nodeType.name, {
            filter: 'p',
            replacement: function (content) {
                return isPlainText ? `\n${content}\n` : `\n\n${content}\n\n`
            },
        })
    }
}

export { paragraph }
