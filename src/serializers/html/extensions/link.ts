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

                return markedRenderer.link.apply(this, [href, title, text])
            },
        },
    }
}

export { link }
