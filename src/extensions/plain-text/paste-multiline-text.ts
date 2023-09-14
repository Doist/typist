/* eslint-disable no-console */

import { Extension } from '@tiptap/core'
import { Fragment, Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { ClipboardDataType } from '../../constants/common'
import { REGEX_LINE_BREAKS } from '../../constants/regular-expressions'

import type { Schema } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

/**
 * Handles a text input or paste event, and replaces all found line breaks with paragraph nodes.
 *
 * @param view The current editor view to process.
 * @param text The multiline text input to parse.
 */
function handleTextInputOrPaste(view: EditorView, text: string): boolean {
    const { schema } = view.state as { schema: Schema }
    const { tr } = view.state

    const textLines = text.split(REGEX_LINE_BREAKS)

    // Do not handle the event without a multiline input
    // (i.e. when the user is only typing)
    if (textLines.length === 1) {
        return false
    }

    // Build an array of paragraphs nodes (including empty ones)
    const paragraphNodes = textLines.map((textLine) => {
        if (textLine.length === 0) {
            return schema.nodes.paragraph.create()
        }

        return schema.nodes.paragraph.create(null, schema.text(textLine))
    })

    // Inserts the new paragraph nodes at the current cursor position
    // (takes into account if a selection needs to be replaced)
    view.dispatch(
        tr.replaceSelection(Slice.maxOpen(Fragment.fromArray(paragraphNodes))).scrollIntoView(),
    )

    // Suppress the default handling behaviour
    return true
}

/**
 * The `MultilineDocumentPaste` extension preserves paragraphs (including empty ones) when
 * copying-and-pasting text into the editor, or when inputting multiline text with some sort of
 * automatic text insertion shortcut. This custom extension is required for a plain-text editor
 * configured with `multiline: true`, so that multiline clipboard text is pasted correctly.
 */
const PasteMultilineText = Extension.create({
    name: 'pasteMultilineText',
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('pasteMultilineText'),
                props: {
                    handleTextInput(view: EditorView, _, __, inputText) {
                        return handleTextInputOrPaste(view, inputText)
                    },
                    handlePaste(view: EditorView, event) {
                        const clipboardText = event.clipboardData
                            ?.getData(ClipboardDataType.Text)
                            .trim()

                        // Do not handle the event if the clipboard doesn't contain text
                        if (!clipboardText) {
                            return false
                        }

                        return handleTextInputOrPaste(view, clipboardText)
                    },
                },
            }),
        ]
    },
})

export { PasteMultilineText }
