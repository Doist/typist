import type { Editor } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'

/**
 * Check if a suggestion can be inserted within the current editor selection.
 *
 * @return True if the suggestion can be inserted, false otherwise.
 */
function canInsertSuggestion({ editor, state }: { editor: Editor; state: EditorState }) {
    const { selection } = state

    const isInsideCodeMark = editor.isActive('code')

    const isInsideCodeBlockNode = selection.$from.parent.type.name === 'codeBlock'

    const wordsBeforeSelection = (selection.$from.nodeBefore?.text ?? '').split(' ')
    const nodeBeforeSelection = selection.$from.parent.cut(
        selection.$from.parentOffset - wordsBeforeSelection.slice(-1)[0].length - 1,
        selection.$from.parentOffset - 1,
    ).content.firstChild

    const hasCodeMarkBefore = (nodeBeforeSelection?.marks ?? []).some(
        (mark) => mark.type.name === 'code',
    )

    const isComposingInlineCode = wordsBeforeSelection.some((word) => word.startsWith('`'))

    return (
        !isInsideCodeMark && !isInsideCodeBlockNode && !hasCodeMarkBefore && !isComposingInlineCode
    )
}

export { canInsertSuggestion }
