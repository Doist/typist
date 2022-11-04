import { extractTagsFromParseRules } from '../../../helpers/serializer'

import type { MarkType } from 'prosemirror-model'
import type Turndown from 'turndown'

/**
 * A Turndown plugin which adds a rule for strikethrough text, based on the original plugin. This
 * rules forces two tildes instead of one.
 *
 * @see https://github.com/mixmark-io/turndown-plugin-gfm/blob/v1.0.1/src/strikethrough.js
 *
 * @param markType The mark object that matches this rule.
 */
function strikethrough(markType: MarkType): Turndown.Plugin {
    const tags = extractTagsFromParseRules(markType.spec.parseDOM)

    return (turndown: Turndown) => {
        turndown.addRule(markType.name, {
            filter: (node) => {
                return tags.some((tag) => tag.toUpperCase() === node.nodeName)
            },
            replacement: (content) => {
                return `~~${content}~~`
            },
        })
    }
}

export { strikethrough }
