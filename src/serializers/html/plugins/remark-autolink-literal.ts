import {
    gfmAutolinkLiteralFromMarkdown,
    gfmAutolinkLiteralToMarkdown,
} from 'mdast-util-gfm-autolink-literal'
import { gfmAutolinkLiteral } from 'micromark-extension-gfm-autolink-literal'

import type { Processor } from 'unified'

/**
 * A remark plugin to add support for the autolink literals extension extension from the GitHub
 * Flavored Markdown (GFM) specification.
 *
 * This is an standalone plugin which makes use of both the `mdast-util-gfm-autolink-literal` and
 * `micromark-extension-gfm-autolink-literal` packages, and the implementation is inspired by the
 * third-party `remark-gfm` plugin.
 *
 * The reason why we don't use `remark-gfm` directly is because we don't want to support all other
 * GFM features (footnotes, tables, tagfilter, and tasklists).
 *
 * @param options Configuration options for the plugin.
 */
function remarkAutolinkLiteral(this: Processor) {
    const data = this.data()

    function add(field: string, value: unknown) {
        const list = (data[field] ? data[field] : (data[field] = [])) as unknown[]

        list.push(value)
    }

    add('micromarkExtensions', gfmAutolinkLiteral)
    add('fromMarkdownExtensions', gfmAutolinkLiteralFromMarkdown())
    add('toMarkdownExtensions', gfmAutolinkLiteralToMarkdown())
}

export { remarkAutolinkLiteral }
