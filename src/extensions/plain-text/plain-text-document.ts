import { Document } from '@tiptap/extension-document'

/**
 * The options available to customize the `PlainTextDocument` extension.
 */
type PlainTextDocumentOptions = {
    /**
     * Indicates whether the document accepts multiple lines of input or only a single line.
     */
    multiline: boolean
}

/**
 * Custom extension that extends the built-in `Document` extension to define a schema for multiline
 * or singleline plain-text documents (as opposed to the multiple block nodes by default).
 */
const PlainTextDocument = Document.extend<PlainTextDocumentOptions>({
    addOptions() {
        return {
            multiline: true,
        }
    },
    content() {
        // ref: https://tiptap.dev/api/schema#content
        return `paragraph${this.options.multiline ? '+' : ''}`
    },
})

export { PlainTextDocument }

export type { PlainTextDocumentOptions }
