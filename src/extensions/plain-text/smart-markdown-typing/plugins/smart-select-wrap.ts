import { Plugin, PluginKey, TextSelection } from 'prosemirror-state'

import type { EditorView } from 'prosemirror-view'

/**
 * An object holding the acceptable wrapping symbols. The key represents the trigger character, and
 * the character to be added before the selection, while the value represents the character to be
 * added after the selection.
 */
const WRAPPING_SYMBOLS: Record<string, string> = {
    '*': '*',
    _: '_',
    '~': '~',
    '"': '"',
    "'": "'",
    '`': '`',
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>',
}

/**
 * This plugin wraps a selection with matching symbols based on the typed character, wrapping the
 * selection with the corresponding opening and closing bracket symbols when appropriate. This
 * plugin does not have support for multiple selection ranges.
 */
const smartSelectWrap = new Plugin({
    key: new PluginKey('smartSelectWrap'),
    props: {
        handleTextInput(view: EditorView, from, to, symbol) {
            const { selection, tr } = view.state

            // Do not handle the event if the selection is empty
            if (selection.empty) {
                return false
            }

            const wrappingSymbol = WRAPPING_SYMBOLS[symbol]

            // Do not handle the event if no wrapping symbol was typed
            if (wrappingSymbol === undefined) {
                return false
            }

            // Insert wrapping symbols around the selected text
            view.dispatch(
                tr
                    .insertText(symbol, from, from)
                    .insertText(wrappingSymbol, to + 1, to + 1)
                    .setSelection(TextSelection.create(tr.doc, from + 1, to + 1))
                    .scrollIntoView(),
            )

            // Suppress the default handling behaviour
            return true
        },
    },
})

export { smartSelectWrap }
