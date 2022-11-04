import { escape } from 'lodash-es'
import { marked } from 'marked'

/**
 * A Marked extension which tweaks the `html` renderer to escape special characters (i.e. `&`, `<`,
 * `>`, `"`, and `'`) for unsupported tokens. This custom rule is required because the escaping must
 * be performed at the token level to avoid escaping the full input, which would result in unwanted
 * escaped output (i.e. valid HTML would be escaped).
 */
const html: marked.MarkedExtension = {
    renderer: {
        html(html) {
            return escape(html)
        },
    },
}

export { html }
