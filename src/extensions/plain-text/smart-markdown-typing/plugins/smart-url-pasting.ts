import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'

import { ClipboardDataType } from '../../../../constants/common'

import type { EditorView } from '@tiptap/pm/view'

/**
 * The perfect URL validation regex for Web URLs.
 *
 * @see https://mathiasbynens.be/demo/url-regex
 */
const REGEX_WEB_URL =
    /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i

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
            if (REGEX_WEB_URL.test(selection.$head.parent.textContent)) {
                return false
            }

            const clipboardText = event.clipboardData?.getData(ClipboardDataType.Text).trim()

            // Do not handle the event if the clipboard text is not a URL
            if (!clipboardText || !REGEX_WEB_URL.test(clipboardText)) {
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
