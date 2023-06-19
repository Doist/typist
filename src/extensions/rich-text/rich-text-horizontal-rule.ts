import { InputRule } from '@tiptap/core'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'

import type { HorizontalRuleOptions } from '@tiptap/extension-horizontal-rule'

/**
 * The input regex for Markdown horizontal rules.
 */
const inputRegex = /^(?:---|—-|___\s|\*\*\*\s)$/

/**
 * Custom extension that extends the built-in `HorizontalRule` extension to fix an issue with the
 * built-in input rule that adds extra paragraph node above the horizontal rule.
 *
 * @see https://github.com/ueberdosis/tiptap/issues/3809
 * @see https://github.com/ueberdosis/tiptap/pull/3859#issuecomment-1536799740
 */
const RichTextHorizontalRule = HorizontalRule.extend({
    addInputRules() {
        const { type } = this

        return [
            new InputRule({
                find: inputRegex,
                handler({ state: { tr }, range }) {
                    tr.insert(range.from - 1, type.create({})).delete(
                        tr.mapping.map(range.from),
                        tr.mapping.map(range.to),
                    )
                },
            }),
        ]
    },
})

export { RichTextHorizontalRule }

export type { HorizontalRuleOptions as RichTextHorizontalRuleOptions }
