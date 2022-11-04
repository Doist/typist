import { marked } from 'marked'

/**
 * Initialize a new instance of the original renderer to be used by the extension.
 */
const markedRenderer = new marked.Renderer()

/**
 * A Marked extension which tweaks the `code` renderer to remove the newline between the last code
 * line and `</code></pre>`. Although that newline is part of the CommonMark spec, this custom rule
 * is required to prevent Tiptap from rendering a blank line at the end of the code block.
 */
const code: marked.MarkedExtension = {
    renderer: {
        code(code, infostring, escaped) {
            return markedRenderer.code
                .apply(this, [code, infostring, escaped])
                .replace(/\n(<\/code><\/pre>)$/m, '$1')
        },
    },
}

export { code }
