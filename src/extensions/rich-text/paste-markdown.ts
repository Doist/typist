import { Extension } from '@tiptap/core'
import { Fragment, Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import * as linkify from 'linkifyjs'

import { ClipboardDataType } from '../../constants/common'
import { PASTE_MARKDOWN_EXTENSION_PRIORITY } from '../../constants/extension-priorities'
import { REGEX_PUNCTUATION } from '../../constants/regular-expressions'

/**
 * A partial type for the the clipboard metadata coming from VS Code.
 *
 * @see https://github.com/microsoft/vscode/blob/1.66.2/src/vs/editor/browser/controller/textAreaInput.ts
 */
type VSCodeClipboardMetadata = {
    mode?: string
}

/**
 * The `PasteMarkdown` extension adds the ability to paste Markdown as HTML into the editor,
 * providing full rich-text support to the pasted content. The pasting behavior was inspired from
 * the GitLab implementation, and adapted to our requirements.
 *
 * @see https://gitlab.com/gitlab-org/gitlab/-/blob/v14.10.0-ee/app/assets/javascripts/content_editor/extensions/paste_markdown.js
 */
const PasteMarkdown = Extension.create({
    name: 'pasteMarkdown',
    priority: PASTE_MARKDOWN_EXTENSION_PRIORITY,
    addProseMirrorPlugins() {
        const { editor } = this

        return [
            new Plugin({
                key: new PluginKey('pasteMarkdown'),
                props: {
                    clipboardTextParser(text) {
                        // Override the default parser behavior of splitting text into lines (which
                        // does not match the CommonMark spec for handling break lines), and instead
                        // return a document slice with a single text node containing the whole
                        // clipboard text, so that we can rely on the slice on `handlePaste` below)
                        return Slice.maxOpen(Fragment.from(editor.schema.text(text)))
                    },
                    handlePaste(_, event, slice) {
                        const isInsideCodeBlockNode =
                            editor.state.selection.$from.parent.type.name === 'codeBlock'

                        // The clipboard contains text if the slice content size is greater than
                        // zero, otherwise it contains other data types (like files or images)
                        const clipboardContainsText = Boolean(slice.content.size)

                        // Do not handle the paste event if the user is pasting inside a code block
                        // or if the clipboard does not contain text
                        if (isInsideCodeBlockNode || !clipboardContainsText) {
                            return false
                        }

                        // Get the clipboard text from the slice content instead of getting it from
                        // the clipboard data because the pasted content could have already been
                        // transformed by other ProseMirror plugins
                        const textContent = slice.content.textBetween(0, slice.content.size, '\n')

                        // Do not handle the paste event if the clipboard text is only a link (in
                        // this case we want the built-in handlers in Tiptap to handle the event)
                        if (linkify.test(textContent)) {
                            return false
                        }

                        const clipboardContainsHTML = Boolean(
                            event.clipboardData?.types.some(
                                (type) => type === ClipboardDataType.HTML,
                            ),
                        )

                        // Unfortunately, the VS Code clipboard data type is not supported by
                        // Firefox or Safari, which means that copy/paste experience from VS Code
                        // into the editor with either of those browsers is subpar:
                        //  * The Markdown syntax is not fully converted to rich-text
                        //  * Code is not detected nor converted to a code-block
                        const clipboardContainsVSCodeMetadata = Boolean(
                            event.clipboardData?.types.some(
                                (type) => type === ClipboardDataType.VSCode,
                            ),
                        )

                        const clipboardContainsHTMLFromUnknownSource =
                            clipboardContainsHTML && !clipboardContainsVSCodeMetadata

                        const vsCodeClipboardMetadata: VSCodeClipboardMetadata =
                            clipboardContainsVSCodeMetadata
                                ? (JSON.parse(
                                      event.clipboardData?.getData(ClipboardDataType.VSCode) ||
                                          '{}',
                                  ) as VSCodeClipboardMetadata)
                                : {}

                        const clipboardContainsHTMLFromVSCodeOtherThanTextOrMarkdown =
                            clipboardContainsVSCodeMetadata &&
                            // If `mode` from the VS Code metadata is `null` it probably means that
                            // the user has the VS Code `editor.copyWithSyntaxHighlighting` setting
                            // set to `false`, thus returning plain-text
                            vsCodeClipboardMetadata.mode !== null &&
                            vsCodeClipboardMetadata.mode !== 'markdown'

                        // Do not handle the paste event if the clipboard contains HTML from an
                        // unknown source (e.g., Google Drive, Dropbox Paper, etc.) or from VS Code
                        // that it's NOT plain-text or Markdown (e.g., Python, TypeScript, etc.)
                        if (
                            clipboardContainsHTMLFromUnknownSource ||
                            clipboardContainsHTMLFromVSCodeOtherThanTextOrMarkdown
                        ) {
                            return false
                        }

                        // Escape all backslash characters that precede any punctuation marks, to
                        // prevent the backslash itself from being interpreted as an escape sequence
                        // for the subsequent character.
                        const escapedTextContent = textContent.replace(
                            new RegExp(`(\\\\${REGEX_PUNCTUATION.source})`, 'g'),
                            '\\$1',
                        )

                        // Send the clipboard text through the HTML serializer to convert potential
                        // Markdown into HTML, and then insert it into the editor
                        editor.commands.insertMarkdownContent(escapedTextContent)

                        // Suppress the default handling behaviour
                        return true
                    },
                },
            }),
        ]
    },
})

export { PasteMarkdown }
