import { isActive, isTextSelection, RawCommands } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { clamp } from 'lodash-es'

/**
 * Augment the official `@tiptap/core` module with extra commands so that the compiler knows about
 * them. For this to work externally, a wildcard export needs to be added to the root `index.ts`.
 */
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        extendWordRange: {
            /**
             * Selects the word at the caret, or expands partial-word selection boundaries without
             * shrinking the selection or changing its direction. Complete-word selections stay
             * unchanged.
             */
            extendWordRange: () => ReturnType
        }
    }
}

/**
 * Selects the word at the caret, or expands partial-word selection boundaries without shrinking the
 * selection or changing its direction. Complete-word selections stay unchanged.
 *
 * Words are non-whitespace runs in adjacent text nodes, independent of link ranges. Does nothing
 * for non-text selections or when code or a code block is active.
 *
 * The solution for this function was inspired by the official `extendMarkRange` and
 * `setTextSelection` commands.
 */
function extendWordRange(): ReturnType<RawCommands['extendWordRange']> {
    return ({ state, tr, dispatch }) => {
        const { doc, selection } = tr
        const { $from, $to, empty } = selection

        // Do nothing if cursor position is not valid for a text selection
        if (
            !isTextSelection(selection) ||
            isActive(state, 'code') ||
            isActive(state, 'codeBlock')
        ) {
            return false
        }

        // Check if the transaction should be dispatched
        // ref: https://tiptap.dev/api/commands#dry-run-for-commands
        if (dispatch) {
            // At a caret, include the word fragment on the left. For a selection, check its first
            // character so leading whitespace doesn't pull in the preceding word
            const textBefore =
                empty || /^\S/.test($from.nodeAfter?.text ?? '')
                    ? ($from.nodeBefore?.text?.match(/\S+$/)?.[0] ?? '')
                    : ''

            // At a caret, include the word fragment on the right. For a selection, check its last
            // character so trailing whitespace doesn't pull in the following word
            const textAfter =
                empty || /\S$/.test($to.nodeBefore?.text ?? '')
                    ? ($to.nodeAfter?.text?.match(/^\S+/)?.[0] ?? '')
                    : ''

            const minPos = TextSelection.atStart(doc).from
            const maxPos = TextSelection.atEnd(doc).to
            const from = clamp(selection.from - textBefore.length, minPos, maxPos)
            const to = clamp(selection.to + textAfter.length, minPos, maxPos)
            const backward = selection.anchor > selection.head

            // Preserve the anchor/head order so backward selections keep their direction
            tr.setSelection(TextSelection.create(doc, backward ? to : from, backward ? from : to))
        }

        return true
    }
}

export { extendWordRange }
