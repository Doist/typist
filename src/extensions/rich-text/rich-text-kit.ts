import { Extension } from '@tiptap/core'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Bold } from '@tiptap/extension-bold'
import { BulletList } from '@tiptap/extension-bullet-list'
import { Code } from '@tiptap/extension-code'
import { CodeBlock } from '@tiptap/extension-code-block'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Heading } from '@tiptap/extension-heading'
import { History } from '@tiptap/extension-history'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { Italic } from '@tiptap/extension-italic'
import { ListItem } from '@tiptap/extension-list-item'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Strike } from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'
import { Typography } from '@tiptap/extension-typography'

import { BLOCKQUOTE_EXTENSION_PRIORITY } from '../../constants/extension-priorities'
import { CopyMarkdownSource } from '../shared/copy-markdown-source'
import { PasteSinglelineText } from '../shared/paste-singleline-text'
import { PasteSpreadsheetTable } from '../shared/paste-spreadsheet-table'

import { BoldAndItalics } from './bold-and-italics'
import { CurvenoteCodemark } from './curvenote-codemark'
import { PasteEmojis } from './paste-emojis'
import { PasteMarkdown } from './paste-markdown'
import { RichTextDocument } from './rich-text-document'
import { RichTextImage } from './rich-text-image'
import { RichTextLink } from './rich-text-link'

import type { Extensions } from '@tiptap/core'
import type { BlockquoteOptions } from '@tiptap/extension-blockquote'
import type { BoldOptions } from '@tiptap/extension-bold'
import type { BulletListOptions } from '@tiptap/extension-bullet-list'
import type { CodeOptions } from '@tiptap/extension-code'
import type { CodeBlockOptions } from '@tiptap/extension-code-block'
import type { DropcursorOptions } from '@tiptap/extension-dropcursor'
import type { HardBreakOptions } from '@tiptap/extension-hard-break'
import type { HeadingOptions } from '@tiptap/extension-heading'
import type { HistoryOptions } from '@tiptap/extension-history'
import type { HorizontalRuleOptions } from '@tiptap/extension-horizontal-rule'
import type { ItalicOptions } from '@tiptap/extension-italic'
import type { ListItemOptions } from '@tiptap/extension-list-item'
import type { OrderedListOptions } from '@tiptap/extension-ordered-list'
import type { ParagraphOptions } from '@tiptap/extension-paragraph'
import type { StrikeOptions } from '@tiptap/extension-strike'
import type { RichTextDocumentOptions } from './rich-text-document'
import type { RichTextImageOptions } from './rich-text-image'
import type { RichTextLinkOptions } from './rich-text-link'

/**
 * The options available to customize the `RichTextKit` extension.
 */
type RichTextKitOptions = {
    /**
     * Set options for the `Blockquote` extension, or `false` to disable.
     */
    blockquote: Partial<BlockquoteOptions> | false

    /**
     * Set options for the `Bold` extension, or `false` to disable.
     */
    bold: Partial<BoldOptions> | false

    /**
     * Set options for the `BulletList` extension, or `false` to disable.
     */
    bulletList: Partial<BulletListOptions> | false

    /**
     * Set options for the `Code` extension, or `false` to disable.
     */
    code: Partial<CodeOptions> | false

    /**
     * Set options for the `CodeBlock` extension, or `false` to disable.
     */
    codeBlock: Partial<CodeBlockOptions> | false

    /**
     * Set options for the `Document` extension, or `false` to disable.
     */
    document: Partial<RichTextDocumentOptions> | false

    /**
     * Set options for the `Dropcursor` extension, or `false` to disable.
     */
    dropCursor: Partial<DropcursorOptions> | false

    /**
     * Set to `false` to disable the `Gapcursor` extension.
     */
    gapCursor: false

    /**
     * Set options for the `HardBreak` extension, or `false` to disable.
     */
    hardBreak: Partial<HardBreakOptions> | false

    /**
     * Set options for the `Heading` extension, or `false` to disable.
     */
    heading: Partial<HeadingOptions> | false

    /**
     * Set options for the `History` extension, or `false` to disable.
     */
    history: Partial<HistoryOptions> | false

    /**
     * Set options for the `HorizontalRule` extension, or `false` to disable.
     */
    horizontalRule: Partial<HorizontalRuleOptions> | false

    /**
     * Set options for the `Image` extension, or `false` to disable.
     */
    image: Partial<RichTextImageOptions> | false

    /**
     * Set options for the `Italic` extension, or `false` to disable.
     */
    italic: Partial<ItalicOptions> | false

    /**
     * Set options for the `Link` extension, or `false` to disable.
     */
    link: Partial<RichTextLinkOptions> | false

    /**
     * Set options for the `ListItem` extension, or `false` to disable.
     */
    listItem: Partial<ListItemOptions> | false

    /**
     * Set options for the `OrderedList` extension, or `false` to disable.
     */
    orderedList: Partial<OrderedListOptions> | false

    /**
     * Set options for the `Paragraph` extension, or `false` to disable.
     */
    paragraph: Partial<ParagraphOptions> | false

    /**
     * Set to `false` to disable the `PasteEmojis` extension.
     */
    pasteEmojis: false

    /**
     * Set to `false` to disable the `PasteMarkdown` extension.
     */
    pasteMarkdown: false

    /**
     * Set to `false` to disable the `PasteSinglelineText` extension.
     */
    pasteSinglelineText: false

    /**
     * Set to `false` to disable the `PasteSpreadsheetTable` extension.
     */
    pasteSpreadsheetTable: false

    /**
     * Set options for the `Strike` extension, or `false` to disable.
     */
    strike: Partial<StrikeOptions> | false

    /**
     * Set to `false` to disable the `Text` extension.
     */
    text: false

    /**
     * Set to `false` to disable the `Typography` extension.
     */
    typography: false
}

/**
 * The `RichTextKit` extension is a collection of the minimal required extensions to have a full
 * WYSIWYG text editor working. This extension is based on the official `StarterKit` extension
 * implementation, allowing almost every extension to be customized or disabled.
 */
const RichTextKit = Extension.create<RichTextKitOptions>({
    name: 'richTextKit',
    addExtensions() {
        const extensions: Extensions = []

        if (this.options.blockquote !== false) {
            extensions.push(
                Blockquote.extend({
                    priority: BLOCKQUOTE_EXTENSION_PRIORITY,
                }).configure(this.options?.blockquote),
            )
        }

        if (this.options.bold !== false) {
            extensions.push(Bold.configure(this.options?.bold))
        }

        if (this.options.bulletList !== false) {
            extensions.push(BulletList.configure(this.options?.bulletList))
        }

        if (this.options.code !== false) {
            extensions.push(
                Code.configure(this.options?.code),

                // Enhances the Code extension capabilities with additional features
                CurvenoteCodemark,
            )
        }

        if (this.options.codeBlock !== false) {
            extensions.push(CodeBlock.configure(this.options?.codeBlock))
        }

        if (this.options.document !== false) {
            extensions.push(
                RichTextDocument.configure(this.options?.document),

                // Supports copying the underlying Markdown source to the clipboard
                CopyMarkdownSource.configure({
                    keyboardShortcut: 'Mod-Shift-c',
                }),
            )

            if (this.options?.pasteEmojis !== false) {
                // Supports pasting HTML image emojis as unicode characters
                extensions.push(PasteEmojis)
            }

            if (this.options?.pasteMarkdown !== false) {
                // Supports pasting Markdown content as HTML into the editor
                extensions.push(PasteMarkdown)
            }

            if (
                this.options?.document?.multiline === false &&
                this.options?.pasteSinglelineText !== false
            ) {
                // Supports pasting multiple lines into a singleline editor, by joining all the
                // pasted lines together
                extensions.push(PasteSinglelineText)
            }

            if (this.options?.pasteSpreadsheetTable !== false) {
                // Supports pasting tables (from spreadsheets and websites) into the editor
                extensions.push(PasteSpreadsheetTable)
            }
        }

        if (this.options.dropCursor !== false) {
            extensions.push(Dropcursor.configure(this.options?.dropCursor))
        }

        if (this.options.gapCursor !== false) {
            extensions.push(Gapcursor)
        }

        if (this.options.hardBreak !== false) {
            extensions.push(HardBreak.configure(this.options?.hardBreak))
        }

        if (this.options.heading !== false) {
            extensions.push(Heading.configure(this.options?.heading))
        }

        if (this.options.history !== false) {
            extensions.push(History.configure(this.options?.history))
        }

        if (this.options.horizontalRule !== false) {
            extensions.push(HorizontalRule.configure(this.options?.horizontalRule))
        }

        if (this.options.image !== false) {
            extensions.push(RichTextImage.configure(this.options?.image))
        }

        if (this.options.italic !== false) {
            extensions.push(Italic.configure(this.options?.italic))
        }

        if (this.options.bold !== false && this.options.italic !== false) {
            extensions.push(BoldAndItalics)
        }

        if (this.options.link !== false) {
            extensions.push(RichTextLink.configure(this.options?.link))
        }

        if (this.options.listItem !== false) {
            extensions.push(ListItem.configure(this.options?.listItem))
        }

        if (this.options.orderedList !== false) {
            extensions.push(OrderedList.configure(this.options?.orderedList))
        }

        if (this.options.paragraph !== false) {
            extensions.push(Paragraph.configure(this.options?.paragraph))
        }

        if (this.options.strike !== false) {
            extensions.push(Strike.configure(this.options?.strike))
        }

        if (this.options.text !== false) {
            extensions.push(Text)
        }

        if (this.options.typography !== false) {
            extensions.push(Typography)
        }

        return extensions
    },
})

export { RichTextKit }

export type { RichTextKitOptions }
