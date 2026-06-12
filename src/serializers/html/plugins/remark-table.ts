import { gfmTableFromMarkdown, gfmTableToMarkdown } from 'mdast-util-gfm-table'
import { gfmTable } from 'micromark-extension-gfm-table'

import type { Processor } from 'unified'

/**
 * A remark plugin to add support for the table extension from the GitHub Flavored Markdown (GFM)
 * specification.
 *
 * This is an standalone plugin which makes use of both the `mdast-util-gfm-table` and
 * `micromark-extension-gfm-table` packages, and the implementation is inspired by the third-party
 * `remark-gfm` plugin.
 *
 * The reason why we don't use `remark-gfm` directly is because we don't want to support all other
 * GFM features (footnotes, tagfilter, and tasklists).
 */
function remarkTable(this: Processor) {
    const data = this.data()

    const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = [])
    const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = [])
    const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = [])

    micromarkExtensions.push(gfmTable())
    fromMarkdownExtensions.push(gfmTableFromMarkdown())
    toMarkdownExtensions.push(gfmTableToMarkdown())
}

export { remarkTable }
