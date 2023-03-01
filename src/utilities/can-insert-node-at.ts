import { Editor, Range } from '@tiptap/core'

/**
 * Check if a node of a specific type can be inserted at a specific position in the editor.
 *
 * @return True if the node can be inserted, false otherwise.
 */
function canInsertNodeAt({
    editor,
    nodeType,
    range,
}: {
    editor: Editor
    nodeType: string
    range: Range
}) {
    return editor.can().insertContentAt(range, {
        type: nodeType,
    })
}

export { canInsertNodeAt }
