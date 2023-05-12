import { Extension } from '@tiptap/core'
import { Fragment, Slice } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'

import { ClipboardDataType } from '../../constants/common'

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
                        // The clipboard contains text if the slice content size is greater than
                        // zero, otherwise it contains other data types (like files or images)
                        const clipboardContainsText = Boolean(slice.content.size)

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

                        const isInsideCodeBlockNode =
                            editor.state.selection.$from.parent.type.name === 'codeBlock'

                        // Do not handle the paste event if:
                        //  * The clipboard does NOT contain plain-text
                        //  * The clipboard contains HTML but from an unknown source (like Google
                        //    Drive, Dropbox Paper, etc.)
                        //  * The clipboard contains HTML from VS Code that it's NOT plain-text or
                        //    Markdown (like Python, TypeScript, JSON, etc.)
                        //  * The user is pasting content inside a code block node
                        // For all the above conditions we want the default handling behaviour from
                        // ProseMirror to kick-in, otherwise we'll handle it ourselves below
                        if (
                            !clipboardContainsText ||
                            clipboardContainsHTMLFromUnknownSource ||
                            clipboardContainsHTMLFromVSCodeOtherThanTextOrMarkdown ||
                            isInsideCodeBlockNode
                        ) {
                            return false
                        }

                        // Send the clipboard text through the HTML serializer to convert potential
                        // Markdown into HTML, and then insert it into the editor
                        editor.commands.insertMarkdownContent(
                            // The slice content is used instead of getting the text directly from
                            // the clipboard data because the pasted content could have already
                            // been transformed by other ProseMirror plugins
                            slice.content.textBetween(0, slice.content.size, '\n'),
                        )

                        // Suppress the default handling behaviour
                        return true
                    },
                },
            }),
        ]
    },
})

export { PasteMarkdown }
