import { Document } from '@tiptap/extension-document'

/**
 * The options available to customize the `RichTextDocumentOptions` extension.
 */
type RichTextDocumentOptions = {
    /**
     * Indicates whether the document accepts multiple lines of input or only a single line.
     */
    multiline: boolean
}

/**
 * Custom extension that extends the built-in `Document` extension to define a schema for multiline
 * or singleline rich-text documents (as opposed to the multiple block nodes by default).
 */
const RichTextDocument = Document.extend<RichTextDocumentOptions>({
    addOptions() {
        return {
            multiline: true,
        }
    },
    content() {
        // ref: https://tiptap.dev/api/schema#content
        return `block${this.options.multiline ? '+' : ''}`
    },
})

export { RichTextDocument }

export type { RichTextDocumentOptions }
