import { Extension } from '@tiptap/core'
import { History, HistoryOptions } from '@tiptap/extension-history'
import { Text } from '@tiptap/extension-text'
import { Typography } from '@tiptap/extension-typography'

import { CopyMarkdownSource } from '../shared/copy-markdown-source'
import { PasteHTMLTableAsString } from '../shared/paste-html-table-as-string'
import { PasteSinglelineText } from '../shared/paste-singleline-text'

import { SmartMarkdownTyping } from './smart-markdown-typing/smart-markdown-typing'
import { PasteMultilineText } from './paste-multiline-text'
import { PlainTextDocument } from './plain-text-document'
import { PlainTextParagraph } from './plain-text-paragraph'

import type { Extensions } from '@tiptap/core'
import type { PlainTextDocumentOptions } from './plain-text-document'
import type { PlainTextParagraphOptions } from './plain-text-paragraph'

/**
 * The options available to customize the `PlainTextKit` extension.
 */
type PlainTextKitOptions = {
    /**
     * Set options for the `Document` extension, or `false` to disable.
     */
    document: Partial<PlainTextDocumentOptions> | false

    /**
     * Set options for the `History` extension, or `false` to disable.
     */
    history: Partial<HistoryOptions> | false

    /**
     * Set options for the `Paragraph` extension, or `false` to disable.
     */
    paragraph: Partial<PlainTextParagraphOptions> | false

    /**
     * Set to `false` to disable the `PasteHTMLTableAsString` extension.
     */
    pasteHTMLTableAsString: false

    /**
     * Set to `false` to disable the `Text` extension.
     */
    text: false

    /**
     * Set to `false` to disable the `Typography` extension.
     */
    typography: false

    /**
     * Set to `false` to disable the `SmartMarkdownTyping` extension.
     */
    smartMarkdownTyping: false
}

/**
 * The `PlainTextKit` extension is a collection of the minimal required extensions to have a basic
 * plain-text editor working. This extension is based on the official `StarterKit` extension
 * implementation, allowing almost every extension to be customized or disabled.
 */
const PlainTextKit = Extension.create<PlainTextKitOptions>({
    name: 'plainTextKit',
    addExtensions() {
        const extensions: Extensions = []

        if (this.options.document !== false) {
            extensions.push(
                PlainTextDocument.configure(this.options?.document),

                // Supports copying the underlying Markdown source to the clipboard
                CopyMarkdownSource,

                // Supports pasting plain-text into both a singleline and multiline editor
                this.options?.document?.multiline === false
                    ? PasteSinglelineText
                    : PasteMultilineText,
            )

            if (this.options?.pasteHTMLTableAsString !== false) {
                // Supports pasting tables (from spreadsheets and websites) into the editor
                extensions.push(PasteHTMLTableAsString)
            }
        }

        if (this.options.history !== false) {
            extensions.push(History.configure(this.options?.history))
        }

        if (this.options.paragraph !== false) {
            extensions.push(PlainTextParagraph.configure(this.options?.paragraph))
        }

        if (this.options.text !== false) {
            extensions.push(Text)
        }

        if (this.options.typography !== false) {
            extensions.push(Typography)
        }

        if (this.options.smartMarkdownTyping !== false) {
            extensions.push(SmartMarkdownTyping)
        }

        return extensions
    },
})

export { PlainTextKit }

export type { PlainTextKitOptions }
