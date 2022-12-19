import type { NodeType } from 'prosemirror-model'
import type Turndown from 'turndown'

/**
 * Cleans an attribute value by replacing multiple newlines with a single one.
 *
 * @param attribute The attribute value to clean.
 */
function cleanAttribute(attribute: string | null): string {
    return attribute ? attribute.replace(/(\n+\s*)+/g, '\n') : ''
}

/**
 * A Turndown plugin which adds a custom rule for images. This custom rule is required to disable
 * support for Data URLs (URLs prefixed with the `data: scheme`), while displaying an explicit
 * message in the Markdown output (for debugging and testing).
 *
 * @param nodeType The node object that matches this rule.
 */
function image(nodeType: NodeType): Turndown.Plugin {
    return (turndown: Turndown) => {
        turndown.addRule(nodeType.name, {
            filter: 'img',
            replacement(_, node) {
                const src = String((node as Element).getAttribute('src'))

                // Preserve Data URL image prefix with message about base64 being unsupported
                const link = src.startsWith('data:') ? `${src.split(',')[0]},NOT_SUPPORTED` : src

                const alt = cleanAttribute((node as Element).getAttribute('alt'))
                const title = cleanAttribute((node as Element).getAttribute('title'))

                return src ? `![${alt}](${link}${title.length > 0 ? ` "${title}"` : ''})` : ''
            },
        })
    }
}

export { image }
