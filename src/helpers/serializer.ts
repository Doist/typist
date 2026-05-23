import { kebabCase } from 'lodash-es'

import { DEFAULT_SUGGESTION_TRIGGER_CHAR } from '../constants/suggestions'

import type { NodeType, ParseRule, Schema } from '@tiptap/pm/model'

/**
 * Extracts the URL scheme used by a suggestion node (e.g. `mention`, `channel`) from its node
 * name (e.g. `mentionSuggestion`, `channelSuggestion`).
 *
 * @param node The suggestion node type.
 *
 * @returns The URL scheme as a kebab-case string.
 */
function getSuggestionUrlScheme(node: NodeType): string {
    return kebabCase(node.name.replace(/Suggestion$/, ''))
}

/**
 * Information derived from the suggestion nodes available in the editor schema, used by the
 * HTML serializer to identify and transform suggestion links into spans.
 */
type SuggestionSchemaInfo = {
    /**
     * A partial regular expression that matches the URL schemes used by all the available
     * suggestion nodes (e.g. `(?:mention|channel)://`).
     */
    urlSchemeRegex: string

    /**
     * A map from each URL scheme (e.g. `mention`, `channel`) to its configured trigger character
     * (e.g. `@`, `#`).
     */
    triggerCharByScheme: Map<string, string>
}

/**
 * Returns all suggestion nodes available in the given editor schema (e.g. `mentionSuggestion`,
 * `channelSuggestion`).
 *
 * @param schema The editor schema to be used for suggestion nodes detection.
 *
 * @returns An array of `NodeType` objects for the available suggestion nodes.
 */
function getSuggestionNodes(schema: Schema): NodeType[] {
    return Object.values(schema.nodes).filter((node) => node.name.endsWith('Suggestion'))
}

/**
 * Builds the information derived from all the suggestion nodes available in the given editor
 * schema, in a single iteration. Returns `null` if there are no suggestion nodes in the schema.
 *
 * @param schema The editor schema to be used for suggestion nodes detection.
 *
 * @returns A `SuggestionSchemaInfo` object, or `null` if there are no suggestion nodes.
 */
function buildSuggestionSchemaInfo(schema: Schema): SuggestionSchemaInfo | null {
    const suggestionNodes = getSuggestionNodes(schema)

    if (suggestionNodes.length === 0) {
        return null
    }

    const triggerCharByScheme = new Map(
        suggestionNodes.map((node) => [
            getSuggestionUrlScheme(node),
            String(
                (node.spec as { triggerChar?: string }).triggerChar ??
                    DEFAULT_SUGGESTION_TRIGGER_CHAR,
            ),
        ]),
    )

    const urlSchemes = [...triggerCharByScheme.keys()]

    return {
        urlSchemeRegex: `(?:${urlSchemes.join('|')})://`,
        triggerCharByScheme,
    }
}

/**
 * Computes a string ID that identifies the configured trigger characters of all the suggestion
 * nodes in the given editor schema. Used to discriminate cache keys for serializers whose output
 * depends on the trigger character (e.g. the HTML serializer).
 *
 * @param schema The current editor document schema.
 *
 * @returns A string ID matching the suggestion trigger characters in the schema.
 */
function computeSuggestionTriggerCharsId(schema: Schema): string {
    const suggestionSchemaInfo = buildSuggestionSchemaInfo(schema)

    if (!suggestionSchemaInfo) {
        return ''
    }

    return [...suggestionSchemaInfo.triggerCharByScheme]
        .map(([scheme, triggerChar]) => `${scheme}=${triggerChar}`)
        .join()
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

export {
    buildSuggestionSchemaInfo,
    computeSuggestionTriggerCharsId,
    extractTagsFromParseRules,
    getSuggestionNodes,
    getSuggestionUrlScheme,
}
