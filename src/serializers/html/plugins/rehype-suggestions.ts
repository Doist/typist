import { visit } from 'unist-util-visit'

import { buildSuggestionSchemaInfo } from '../../../helpers/serializer'
import { getHastTextContent, isHastElementNode } from '../../../helpers/unified'

import type { Schema } from '@tiptap/pm/model'
import type { Node as HastNode } from 'hast'
import type { Transformer } from 'unified'

/**
 * A rehype plugin to add support for suggestions nodes (e.g., `@username` or `#channel).
 *
 * @param schema The editor schema to be used for suggestion nodes detection.
 */
function rehypeSuggestions(schema: Schema): Transformer {
    const suggestionSchemaInfo = buildSuggestionSchemaInfo(schema)

    // Return the tree as-is if the editor does not support suggestions
    if (!suggestionSchemaInfo) {
        return (tree: HastNode) => tree
    }

    const suggestionSchemaRegex = new RegExp(`^${suggestionSchemaInfo.urlSchemeRegex}`)

    return (...[tree]: Parameters<Transformer>): ReturnType<Transformer> => {
        visit(tree, 'element', (node: HastNode) => {
            if (
                isHastElementNode(node, 'a') &&
                suggestionSchemaRegex.test(String(node.properties?.href))
            ) {
                const [, urlScheme, id] =
                    /^([a-z-]+):\/\/(\S+)$/i.exec(String(node.properties?.href)) || []

                // The label is always meant to be plain text, so we flatten the full text content
                // of the link instead of reading a single child. This keeps the label intact when
                // the Markdown parser splits it into multiple inline nodes (e.g. a backtick code
                // span or emphasis within the label).
                const label = getHastTextContent(node)

                // Replace the link element with a span containing the suggestion attributes,
                // keeping the visible label (prefixed with the trigger character) as text content
                // so the span renders correctly when used outside of an editor.
                if (urlScheme && id && label) {
                    // The URL scheme was matched against the regex built from the same map of
                    // suggestion nodes, so the trigger character is guaranteed to exist
                    const triggerChar = suggestionSchemaInfo.triggerCharByScheme.get(
                        urlScheme,
                    ) as string

                    node.tagName = 'span'
                    node.properties = {
                        [`data-${urlScheme}`]: '',
                        'data-id': id,
                        'data-label': label,
                    }
                    node.children = [{ type: 'text', value: `${triggerChar}${label}` }]
                }
            }
        })

        return tree
    }
}

export { rehypeSuggestions }
