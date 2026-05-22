import type { Schema } from '@tiptap/pm/model'

/**
 * Check if the document schema accepts multiple lines of input.
 *
 * @param schema The current editor document schema.
 *
 * @returns True if the schema accepts multiple lines of input, false otherwise.
 */
function isMultilineDocument(schema: Schema): boolean {
    return /(?:\+|\*)$/.test(schema.topNodeType.spec.content || '')
}

/**
 * Check if a document schema contains a plain-text document top node.
 *
 * @param schema The current editor document schema.
 *
 * @returns True if the schema contains a plain-text document, false otherwise.
 */
function isPlainTextDocument(schema: Schema): boolean {
    return Boolean(schema.topNodeType.spec.content?.startsWith('paragraph'))
}

/**
 * Computes a string ID that identifies a given editor schema which can be used for object mapping.
 * The trigger character of each suggestion node is included in the ID so schemas that differ only
 * in suggestion configuration produce distinct cache keys.
 *
 * @param schema The current editor document schema.
 *
 * @returns A string ID matching the editor schema.
 */
function computeSchemaId(schema: Schema) {
    const suggestionTriggers = Object.values(schema.nodes)
        .filter((node) => node.name.endsWith('Suggestion'))
        .map((node) => `${node.name}=${(node.spec as { triggerChar?: string }).triggerChar ?? ''}`)

    return [
        ...Object.keys(schema.marks),
        ...Object.keys(schema.nodes),
        ...suggestionTriggers,
    ].join()
}

export { computeSchemaId, isMultilineDocument, isPlainTextDocument }
