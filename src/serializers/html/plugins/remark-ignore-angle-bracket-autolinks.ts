import { visit } from 'unist-util-visit'

import type { Transformer } from 'unified'
import type { Parent } from 'unist'

/**
 * Treats angle-bracket HTTP(S) autolinks as plain text because they are not a supported rich-text
 * Markdown shortcut.
 */
function remarkIgnoreAngleBracketAutolinks(): Transformer {
    return (tree, file) => {
        visit(tree as Parent, (node, index, parent) => {
            const startOffset = node.position?.start.offset
            const endOffset = node.position?.end.offset

            if (
                node.type !== 'link' ||
                typeof startOffset !== 'number' ||
                typeof endOffset !== 'number' ||
                typeof index !== 'number' ||
                !parent
            ) {
                return
            }

            const source = String(file.value).slice(startOffset, endOffset)

            if (/^<https?:\/\/\S+>$/i.test(source)) {
                const textNode = { type: 'text', value: source }
                parent.children[index] = textNode
            }
        })
    }
}

export { remarkIgnoreAngleBracketAutolinks }
