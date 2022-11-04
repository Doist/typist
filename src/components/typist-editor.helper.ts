import { clamp } from 'lodash-es'
import { Selection, TextSelection } from 'prosemirror-state'

import type { Node as ProseMirrorNode } from 'prosemirror-model'

/**
 * Given a ProseMirror document, and a selection, resolves that selection within the bounds of the
 * document size. This works similarly to the official `autoFocus` implementation.
 */
function resolveContentSelection(doc: ProseMirrorNode, selection: Selection): Selection {
    const minPos = Selection.atStart(doc).from
    const maxPos = Selection.atEnd(doc).to

    return TextSelection.create(
        doc,
        clamp(selection.anchor, minPos, maxPos),
        clamp(selection.head, minPos, maxPos),
    )
}

/**
 * The return type for the node attributes, an object mapping attribute names to values.
 */
type NodeAttributes = {
    [key: string]: unknown
}

/**
 * Given a ProseMirror document and a node type, returns the attributes of the given node type for
 * all the nodes in the document. This is based on the official implementation for the
 * `findChildren` helper function.
 */
function getAllNodesAttributesByType(
    doc: ProseMirrorNode,
    nodeType: string,
): Array<NodeAttributes> {
    const result: Array<NodeAttributes> = []

    doc.descendants((node) => {
        if (node.type.name === nodeType) {
            result.push(node.attrs)
        }
    })

    return result
}

export { getAllNodesAttributesByType, resolveContentSelection }

export type { NodeAttributes }
