import { gfmStrikethroughToMarkdown } from 'mdast-util-gfm-strikethrough'

import type { Processor } from 'unified'

/**
 * A remark plugin to add support for serializing the strikethrough extension from the GitHub
 * Flavored Markdown (GFM) specification (i.e., `~~text~~`).
 *
 * This is a standalone plugin which makes use of the `mdast-util-gfm-strikethrough` package, and
 * the implementation is inspired by the third-party `remark-gfm` plugin.
 *
 * The reason why we don't use `remark-gfm` directly is because we only want to opt into the
 * specific GFM features the editor supports, rather than enabling all of them at once.
 */
function remarkStrikethrough(this: Processor) {
    const data = this.data()

    const toMarkdownExtensions = data.toMarkdownExtensions ?? (data.toMarkdownExtensions = [])

    toMarkdownExtensions.push(gfmStrikethroughToMarkdown())
}

export { remarkStrikethrough }
