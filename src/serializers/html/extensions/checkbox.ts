import { marked } from 'marked'

/**
 * A Marked extension which tweaks the `checkbox` renderer to prevent rendering of task lists with
 * GitHub's Flavored Markdown syntax, which is unsupported by Tiptap.
 */
const checkbox: marked.MarkedExtension = {
    renderer: {
        checkbox(checked) {
            return `[${checked ? 'x' : ' '}] `
        },
    },
}

export { checkbox }
