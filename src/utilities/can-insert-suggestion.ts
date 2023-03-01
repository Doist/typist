import { Editor } from '@tiptap/core'
import { EditorState } from '@tiptap/pm/state'

/**
 * Check if a suggestion can be inserted within the current editor selection.
 *
 * @return True if the suggestion can be inserted, false otherwise.
 */
function canInsertSuggestion({ editor, state }: { editor: Editor; state: EditorState }) {
    const { selection } = state

    const isInsideCodeMark = editor.isActive('code')

    const isInsideCodeBlockNode = selection.$from.parent.type.name === 'codeBlock'

    const hasCodeMarkBefore = state.doc
        .nodeAt(selection.$from.parentOffset - 1)
        ?.marks.some((mark) => mark.type.name === 'code')

    const isComposingInlineCode = selection.$from.nodeBefore?.text
        ?.split(' ')
        .some((word) => word.startsWith('`'))

    return (
        !isInsideCodeMark && !isInsideCodeBlockNode && !hasCodeMarkBefore && !isComposingInlineCode
    )
}

export { canInsertSuggestion }
