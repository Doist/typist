import type { NodeType } from '@tiptap/pm/model'
import type Turndown from 'turndown'

/**
 * A Turndown plugin which adds a custom rule for videos. This custom rule also disables support for
 * Data URLs (URLs prefixed with the `data: scheme`), while displaying an explicit message in the
 * Markdown output (for debugging and testing).
 *
 * @param nodeType The node object that matches this rule.
 */
function video(nodeType: NodeType): Turndown.Plugin {
    return (turndown: Turndown) => {
        turndown.addRule(nodeType.name, {
            filter: 'video',
            replacement(_, node) {
                const src = String((node as Element).getAttribute('src'))

                // Preserve Data URL image prefix with message about base64 being unsupported
                return src.startsWith('data:') ? `${src.split(',')[0]},NOT_SUPPORTED` : src
            },
        })
    }
}

export { video }
