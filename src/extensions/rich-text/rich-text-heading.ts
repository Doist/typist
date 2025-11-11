import { Heading } from '@tiptap/extension-heading'
import { textblockTypeInputRule } from '@tiptap/react'

import type { HeadingOptions } from '@tiptap/extension-heading'

/**
 * The options available to customize the `RichTextHeading` extension.
 */
type RichTextHeadingOptions = HeadingOptions

/**
 * Custom extension that extends the built-in `Heading` extension to override the input rule for
 * headings to trigger only on space (e.g., `## `), preventing conflicts with suggestion extensions
 * that use `#` as their trigger character.
 *
 * This was properly fixed in Tiptap v3 where input rules respect extension priorities, making this
 * extension likely unnecessary after migrating.
 *
 * @see https://github.com/ueberdosis/tiptap/issues/2570
 * @see https://github.com/ueberdosis/tiptap/pull/6832
 */
const RichTextHeading = Heading.extend<RichTextHeadingOptions>({
    addInputRules() {
        return this.options.levels.map((level: number) => {
            return textblockTypeInputRule({
                find: new RegExp(`^(#{1,${level}}) $`),
                type: this.type,
                getAttributes: {
                    level,
                },
            })
        })
    },
})

export { RichTextHeading }

export type { RichTextHeadingOptions }
