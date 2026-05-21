import { camelCase } from 'lodash-es'
import { visit } from 'unist-util-visit'

import { buildSuggestionSchemaInfo } from '../../../helpers/serializer'
import { isHastElementNode } from '../../../helpers/unified'

import type { Schema } from '@tiptap/pm/model'
import type { Node as HastNode } from 'hast'
import type { Transformer } from 'unified'

/**
 * A rehype plugin to add support for suggestions nodes (e.g., `@username` or `#channel`) by
 * transforming `<span data-{scheme}>` elements back into `<a href="{scheme}://{id}">{label}</a>`
 * link elements, so that `rehype-remark` can serialize them as standard Markdown links.
 *
 * @param schema The editor schema to be used for suggestion nodes detection.
 */
function rehypeSuggestions(schema: Schema): Transformer {
    const suggestionSchemaInfo = buildSuggestionSchemaInfo(schema)

    // Return the tree as-is if the editor does not support suggestions
    if (!suggestionSchemaInfo) {
        return (tree: HastNode) => tree
    }

    // Precompute a map from each suggestion data attribute (as `rehype-parse` exposes it on the
    // hast node `properties`) to its corresponding URL scheme. `rehype-parse` normalizes data
    // attributes to camelCase, so `data-mention` becomes `dataMention`.
    const urlSchemeByDataAttribute = new Map(
        [...suggestionSchemaInfo.triggerCharByScheme.keys()].map(
            (scheme) => [camelCase(`data-${scheme}`), scheme] as const,
        ),
    )

    return (tree: HastNode) => {
        visit(tree, 'element', (node: HastNode) => {
            if (!isHastElementNode(node, 'span')) {
                return
            }

            const urlScheme = [...urlSchemeByDataAttribute.entries()].find(
                ([dataAttribute]) => dataAttribute in (node.properties ?? {}),
            )?.[1]

            if (!urlScheme) {
                return
            }

            const id = String(node.properties?.dataId ?? '')
            const label = String(node.properties?.dataLabel ?? '')

            if (!id || !label) {
                return
            }

            // Replace the span with an anchor element so `rehype-remark` serializes it as a
            // standard Markdown link (i.e. `[label](scheme://id)`)
            node.tagName = 'a'
            node.properties = {
                href: `${urlScheme}://${id}`,
            }
            node.children = [{ type: 'text', value: label }]
        })

        return tree
    }
}

export { rehypeSuggestions }
