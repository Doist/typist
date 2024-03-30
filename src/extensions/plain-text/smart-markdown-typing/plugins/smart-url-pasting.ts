import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'

import { ClipboardDataType } from '../../../../constants/common'
import { REGEX_WEB_URL } from '../../../../constants/regular-expressions'

import type { EditorView } from '@tiptap/pm/view'

/**
 * The perfect URL validation regular expression for exact Web URLs (matches a
 * URL from the beginning to the end without allowing for partial matches).
 */
const REGEX_WEB_URL_EXACT = new RegExp(`^${REGEX_WEB_URL.source}$`, REGEX_WEB_URL.flags)

/**
 * This plugin replaces a selection with the pasted URL using proper link syntax; unless the
 * selection is itself a URL, which in that case the selection will just be replaced by the pasted
 * URL. This plugin does not have support for multiple selection ranges.
 */
const smartUrlPasting = new Plugin({
    key: new PluginKey('smartUrlPasting'),
    props: {
        handlePaste(view: EditorView, event) {
            const { selection, tr } = view.state

            // Do not handle the event if the selection is empty
            if (selection.empty) {
                return false
            }

            // Do not handle the event if the selected text is already a URL
            if (REGEX_WEB_URL_EXACT.test(selection.$head.parent.textContent)) {
                return false
            }

            const clipboardText = event.clipboardData?.getData(ClipboardDataType.Text).trim()

            // Do not handle the event if the clipboard text is not a URL
            if (!clipboardText || !REGEX_WEB_URL_EXACT.test(clipboardText)) {
                return false
            }

            // Apply the Markdown link syntax to the selected and clipboard text pair
            view.dispatch(
                tr
                    .insertText('[', selection.from, selection.from)
                    .insertText(`](${clipboardText})`, selection.to + 1, selection.to + 1)
                    .setSelection(
                        TextSelection.create(tr.doc, selection.from + 1, selection.to + 1),
                    )
                    .scrollIntoView(),
            )

            // Suppress the default handling behaviour
            return true
        },
    },
})

export { smartUrlPasting }
