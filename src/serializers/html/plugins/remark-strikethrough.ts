import {
    gfmStrikethroughFromMarkdown,
    gfmStrikethroughToMarkdown,
} from 'mdast-util-gfm-strikethrough'
import { gfmStrikethrough } from 'micromark-extension-gfm-strikethrough'

import type { Options } from 'micromark-extension-gfm-strikethrough'
import type { Processor } from 'unified'

/**
 * A remark plugin to add support for the strikethrough extension from the GitHub Flavored Markdown
 * (GFM) specification.
 *
 * This is an standalone plugin which makes use of both the `mdast-util-gfm-strikethrough` and
 * `micromark-extension-gfm-strikethrough` packages, and the implementation is inspired by the
 * third-party `remark-gfm` plugin.
 *
 * The reason why we don't use `remark-gfm` directly is because we don't want to support all other
 * GFM features (footnotes, tables, tagfilter, and tasklists).
 *
 * @param options Configuration options for the plugin.
 */
function remarkStrikethrough(this: Processor, options: Options = {}) {
    const data = this.data()

    function add(field: string, value: unknown) {
        const list = (data[field] ? data[field] : (data[field] = [])) as unknown[]

        list.push(value)
    }

    add('micromarkExtensions', gfmStrikethrough(options))
    add('fromMarkdownExtensions', gfmStrikethroughFromMarkdown())
    add('toMarkdownExtensions', gfmStrikethroughToMarkdown())
}

export { remarkStrikethrough }
