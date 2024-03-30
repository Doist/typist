import { visit } from 'unist-util-visit'

import { buildSuggestionSchemaPartialRegex } from '../../../helpers/serializer'
import { isHastElementNode, isHastTextNode } from '../../../helpers/unified'

import type { Schema } from '@tiptap/pm/model'
import type { Node as HastNode } from 'hast'
import type { Transformer } from 'unified'

/**
 * A rehype plugin to add support for suggestions nodes (e.g., `@username` or `#channel).
 *
 * @param schema The editor schema to be used for suggestion nodes detection.
 */
function rehypeSuggestions(schema: Schema): Transformer {
    const suggestionSchemaPartialRegex = buildSuggestionSchemaPartialRegex(schema)

    // Return the tree as-is if the editor does not support suggestions
    if (!suggestionSchemaPartialRegex) {
        return (tree: HastNode) => tree
    }

    return (...[tree]: Parameters<Transformer>): ReturnType<Transformer> => {
        const suggestionSchemaRegex = new RegExp(`^${suggestionSchemaPartialRegex}`)

        visit(tree, 'element', (node: HastNode) => {
            if (
                isHastElementNode(node, 'a') &&
                suggestionSchemaRegex.test(String(node.properties?.href))
            ) {
                const [, schema, id] =
                    /^([a-z-]+):\/\/(\S+)$/i.exec(String(node.properties?.href)) || []

                // Replace the link element with a span containing the suggestion attributes
                if (schema && id && isHastTextNode(node.children[0])) {
                    node.tagName = 'span'
                    node.properties = {
                        [`data-${schema}`]: '',
                        'data-id': id,
                        'data-label': node.children[0].value,
                    }
                    node.children = []
                }
            }
        })

        return tree
    }
}

export { rehypeSuggestions }
