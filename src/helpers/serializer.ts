import type { ParseRule } from 'prosemirror-model'

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

export { extractTagsFromParseRules }
