import { gfmTaskListItemToMarkdown } from 'mdast-util-gfm-task-list-item'

import type { Processor } from 'unified'

/**
 * A remark plugin to add support for serializing the task list extension from the GitHub Flavored
 * Markdown (GFM) specification (i.e., `- [ ]` and `- [x]`).
 *
 * This is a standalone plugin which makes use of the `mdast-util-gfm-task-list-item` package, and
 * the implementation is inspired by the third-party `remark-gfm` plugin.
 *
 * The reason why we don't use `remark-gfm` directly is because we only want to opt into the
 * specific GFM features the editor supports, rather than enabling all of them at once.
 */
function remarkTaskList(this: Processor) {
    const data = this.data()

    const toMarkdownExtensions = data.toMarkdownExtensions ?? (data.toMarkdownExtensions = [])

    toMarkdownExtensions.push(gfmTaskListItemToMarkdown())
}

export { remarkTaskList }
