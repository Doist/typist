import { kebabCase } from 'lodash-es'
import { marked } from 'marked'

import type { NodeType } from 'prosemirror-model'

const markedRenderer = new marked.Renderer()

/**
 * A Marked extension which tweaks the `link` renderer to add support for suggestion nodes, while
 * preserving the original renderer for standard links.
 *
 * @param suggestionNodes An array of the suggestion nodes to serialize.
 */
function link(suggestionNodes: NodeType[]): marked.MarkedExtension {
    const linkSchemaRegex = new RegExp(
        `^(?:${suggestionNodes
            .map((suggestionNode) => kebabCase(suggestionNode.name.replace(/Suggestion$/, '')))
            .join('|')})://`,
    )

    return {
        renderer: {
            link(href, title, text) {
                if (href && linkSchemaRegex.test(href)) {
                    const [, schema, id] = /^([a-z-]+):\/\/(\d+)$/i.exec(href) || []

                    if (schema && id && text) {
                        return `<span data-${schema} data-id="${id}" data-label="${text}"></span>`
                    }
                }

                // Return a `<video>` element for a link that is meant to be rendered by the
                // `RichTextVideo` extension (this will be parsed by the `paragraph` rule next)
                if (href?.includes('commondatastorage.googleapis.com') && /\.(mp4|mov)$/) {
                    return `<video src="${href}"></video>`
                }

                return markedRenderer.link.apply(this, [href, title, text])
            },
        },
    }
}

export { link }
