import { visit } from 'unist-util-visit'

import type { Root } from 'mdast'
import type { Transformer } from 'unified'

/**
 * Treats angle-bracket HTTP(S) autolinks as plain text because they are not a supported rich-text
 * Markdown shortcut.
 */
function remarkIgnoreAngleBracketAutolinks(): Transformer<Root> {
    return (tree, file) => {
        visit(tree, 'link', (node, index, parent) => {
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
                parent.children[index] = { type: 'text', value: source }
            }
        })
    }
}

export { remarkIgnoreAngleBracketAutolinks }
