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
             * Extends the text selection to the current word.
             */
            extendWordRange: () => ReturnType
        }
    }
}

/**
 * Extends the text selection to the current word.
 *
 * The solution for this function was inspired by the official `extendMarkRange` and
 * `setTextSelection` commands.
 */
function extendWordRange(): ReturnType<RawCommands['extendWordRange']> {
    return ({ state, tr, dispatch }) => {
        const { doc, selection } = tr
        const { $head } = selection

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
            const textBefore = $head.nodeBefore?.text?.match(/[^\s]+$/)?.[0] || ''
            const textAfter = $head.nodeAfter?.text?.match(/^[^\s]+/)?.[0] || ''

            const minPos = TextSelection.atStart(doc).from
            const maxPos = TextSelection.atEnd(doc).to

            tr.setSelection(
                TextSelection.create(
                    doc,
                    clamp(selection.head - textBefore.length, minPos, maxPos),
                    clamp(selection.head + textAfter.length, minPos, maxPos),
                ),
            )
        }

        return true
    }
}

export { extendWordRange }
