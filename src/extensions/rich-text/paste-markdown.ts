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
                        const clipboardText = event.clipboardData
                            ?.getData(ClipboardDataType.Text)
                            .trim()

                        const clipboardContainsHTML = Boolean(
                            event.clipboardData?.types.some(
                                (type) => type === ClipboardDataType.HTML,
                            ),
                        )

                        // Unfortunately, the VS Code clipboard data type is not supported by
                        // Firefox or Safari, which means that copy/paste experience from VS Code
                        // into the editor with any of those browsers is supbar:
                        //  * The Markdown syntax is not fully converted to rich-text
                        //  * Code is not detected nor converted to a code-block
                        const clipboardContainsVSCodeMetadata = Boolean(
                            event.clipboardData?.types.some(
                                (type) => type === ClipboardDataType.VSCode,
                            ),
                        )

                        const vsCodeClipboardMetadata: VSCodeClipboardMetadata =
                            clipboardContainsVSCodeMetadata
                                ? (JSON.parse(
                                      event.clipboardData?.getData(ClipboardDataType.VSCode) ||
                                          '{}',
                                  ) as VSCodeClipboardMetadata)
                                : {}

                        // Do not handle the paste event if:
                        //  * The clipboard doesn't contain plain-text
                        //  * The clipboard HTML content doesn't come with VS Code metadata
                        //  * The clipboard VS Code metadata does not represent plain-Markdown
                        //  * The user is pasting inside a code block element
                        if (
                            !clipboardText ||
                            (clipboardContainsHTML && !clipboardContainsVSCodeMetadata) ||
                            (clipboardContainsVSCodeMetadata &&
                                vsCodeClipboardMetadata.mode !== 'markdown') ||
                            editor.state.selection.$from.parent.type.name === 'codeBlock'
                        ) {
                            return false
                        }

                        // Send the clipboard text through the HTML serializer to convert potential
                        // Markdown into HTML, and then insert it into the editor
                        editor.commands.insertMarkdownContent(
                            // The slice content is used instead of `clipboardText` as the pasted
                            // content could have already been transformed by other plugins
                            slice.content.textBetween(0, slice.content.size),
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
