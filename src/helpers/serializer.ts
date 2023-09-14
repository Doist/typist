import { kebabCase } from 'lodash-es'

import type { ParseRule, Schema } from '@tiptap/pm/model'

/**
 * Builds a partial regular expression that includes valid URL schemas used by all the available
 * suggestion nodes from the given editor schema.
 *
 * @param schema The editor schema to be used for suggestion nodes detection.
 *
 * @returns A partial regular expression with valid URL schemas for the available suggestion nodes,
 * `null` if there are no suggestion nodes in the editor schema.
 */
function buildSuggestionSchemaPartialRegex(schema: Schema) {
    const suggestionNodes = Object.values(schema.nodes).filter((node) =>
        node.name.endsWith('Suggestion'),
    )

    if (suggestionNodes.length === 0) {
        return null
    }

    return `(?:${suggestionNodes
        .map((suggestionNode) => kebabCase(suggestionNode.name.replace(/Suggestion$/, '')))
        .join('|')})://`
}

/**
 * Extract all tags from the given parse rules argument, and returns an array of said tags.
 *
 * @param parseRules The parse rules for a DOM node or inline style.
 *
 * @returns An array of tags extracted from the parse rules.
 */
function extractTagsFromParseRules(
    parseRules?: readonly ParseRule[],
): (keyof HTMLElementTagNameMap)[] {
    if (!parseRules || parseRules.length === 0) {
        return []
    }

    return parseRules
        .filter((rule) => rule.tag)
        .map((rule) => rule.tag as keyof HTMLElementTagNameMap)
}

export { buildSuggestionSchemaPartialRegex, extractTagsFromParseRules }
