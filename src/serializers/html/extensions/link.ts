import { marked } from 'marked'

const markedRenderer = new marked.Renderer()

/**
 * A Marked extension which tweaks the `link` renderer to add support for suggestion nodes, while
 * preserving the original renderer for standard links.
 *
 * @param suggestionSchemaRegex A regular expression with valid URL schemas for the available
 * suggestion nodes.
 */
function link(suggestionSchemaRegex: RegExp): marked.MarkedExtension {
    return {
        renderer: {
            link(href, title, text) {
                if (href && suggestionSchemaRegex?.test(href)) {
                    const [, schema, id] = /^([a-z-]+):\/\/(\S+)$/i.exec(href) || []

                    if (schema && id && text) {
                        return `<span data-${schema} data-id="${id}" data-label="${text}"></span>`
                    }
                }

                return markedRenderer.link.apply(this, [href, title, text])
            },
        },
    }
}

export { link }
