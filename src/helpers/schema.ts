import type { Schema } from 'prosemirror-model'

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
 * [[DESCRIPTION]]
 *
 * @param schema The current editor document schema.
 *
 * @returns [[DESCRIPTION]]
 */
// TODO: Needs unit tests!
function computeSchemaId(schema: Schema) {
    return [...Object.keys(schema.marks), ...Object.keys(schema.nodes)].join()
}

export { computeSchemaId, isMultilineDocument, isPlainTextDocument }
