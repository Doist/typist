import type { NodeType } from '@tiptap/pm/model'
import type Turndown from 'turndown'

/**
 * A Turndown plugin which adds a custom rule for paragraphs. This custom rule is required to avoid
 * adding unnecessary blank lines between paragraphs to plain-text documents, and to list items in
 * rich-text documents.
 *
 * @param nodeType The node object that matches this rule.
 * @param isPlainText Specifies if the schema represents a plain-text document.
 */
function paragraph(nodeType: NodeType, isPlainText: boolean): Turndown.Plugin {
    return (turndown: Turndown) => {
        turndown.addRule(nodeType.name, {
            filter: 'p',
            replacement(content, node) {
                const useSingleLineSpacing =
                    isPlainText ||
                    // Paragraphs within list items should be wrapped with a single line feed to
                    // maintain proper list formatting in rich-text documents.
                    (!isPlainText && node.parentNode?.nodeName === 'LI')

                return useSingleLineSpacing ? `\n${content}\n` : `\n\n${content}\n\n`
            },
        })
    }
}

export { paragraph }
