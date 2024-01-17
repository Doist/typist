import { BulletList } from '@tiptap/extension-bullet-list'
import { ListItem } from '@tiptap/extension-list-item'
import { TextStyle } from '@tiptap/extension-text-style'
import { Fragment, Slice } from '@tiptap/pm/model'

import type { BulletListOptions } from '@tiptap/extension-bullet-list'

/**
 * Augment the official `@tiptap/core` module with extra commands, relevant for this extension, so
 * that the compiler knows about them.
 */
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        richTextBulletList: {
            /**
             * Smartly toggles the selection into a bullet list, converting any hard breaks into
             * paragraphs before doing so.
             *
             * @see https://discuss.prosemirror.net/t/how-to-convert-a-selection-of-text-lines-into-paragraphs/6099
             */
            smartToggleBulletList: () => ReturnType
        }
    }
}

/**
 * Custom extension that extends the built-in `BulletList` extension to add a smart toggle command
 * with support for hard breaks, which are automatically converted into paragraphs before toggling
 * the selection into a bullet list.
 */
const RichTextBulletList = BulletList.extend({
    addCommands() {
        const { editor, name, options } = this

        return {
            smartToggleBulletList() {
                return ({ commands, state, tr, chain }) => {
                    const { schema } = state
                    const { selection } = tr
                    const { $from, $to } = selection

                    const hardBreakPositions: number[] = []

                    // Find and store the positions of all hard breaks in the selection
                    tr.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
                        if (node.type.name === 'hardBreak') {
                            hardBreakPositions.push(pos)
                        }
                    })

                    // Replace each hard break with a slice that closes and re-opens a paragraph,
                    // effectively inserting a "paragraph break" in place of a "hard break"
                    // (this is performed in reverse order to compensate for content shifting that
                    // occurs with each replacement, ensuring accurate insertion points)
                    hardBreakPositions.reverse().forEach((pos) => {
                        tr.replace(
                            pos,
                            pos + 1,
                            Slice.maxOpen(
                                Fragment.fromArray([
                                    schema.nodes.paragraph.create(),
                                    schema.nodes.paragraph.create(),
                                ]),
                            ),
                        )
                    })

                    // Toggle the selection into a bullet list, optionally keeping attributes
                    // (this is a verbatim copy of the built-in`toggleBulletList` command)

                    if (options.keepAttributes) {
                        return chain()
                            .toggleList(name, options.itemTypeName, options.keepMarks)
                            .updateAttributes(ListItem.name, editor.getAttributes(TextStyle.name))
                            .run()
                    }

                    return commands.toggleList(name, options.itemTypeName, options.keepMarks)
                }
            },
        }
    },
})

export { RichTextBulletList }

export type { BulletListOptions as RichTextBulletListOptions }
