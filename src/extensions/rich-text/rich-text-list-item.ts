import { ListItem } from '@tiptap/extension-list-item'

import type { Editor } from '@tiptap/core'

/**
 * Lifts the list item at the caret out of an ordered list while preserving the rendered list
 * marker (e.g. `17.`) as literal text at the start of the lifted paragraph.
 *
 * This only applies when the lift would remove the item from the list altogether (i.e. the list
 * is not nested within another list item), which is when the marker – rendered from the list's
 * `start` attribute and the item's position – would otherwise be lost. The prime example is the
 * automatic input rule for ordered lists swallowing a number the user meant as text (e.g. dates
 * in German, like `17. Juli`), with `Shift-Tab` being the intuitive way to revert the conversion.
 *
 * @returns `true` if the marker-preserving lift was applied, `false` if the situation doesn't
 * apply and the caller should fall back to the default behavior.
 */
function liftOutOfOrderedListPreservingMarker(
    editor: Editor,
    itemTypeName: string,
    orderedListTypeName: string,
): boolean {
    const { selection } = editor.state

    // Lifting a range of items merges them into a single item, making a single preserved marker
    // ambiguous, so only handle a collapsed selection
    if (!selection.empty) {
        return false
    }

    const { $from } = selection

    // Find the innermost list item the caret is placed within
    let itemDepth: number | null = null
    for (let depth = $from.depth; depth >= 2; depth--) {
        if ($from.node(depth).type.name === itemTypeName) {
            itemDepth = depth
            break
        }
    }

    if (itemDepth === null) {
        return false
    }

    const list = $from.node(itemDepth - 1)

    if (list.type.name !== orderedListTypeName) {
        return false
    }

    // When the list is nested within another list item, lifting only unindents the item into the
    // parent list (it remains a list item, and no marker is lost)
    if ($from.node(itemDepth - 2).type.name === itemTypeName) {
        return false
    }

    // Non-decimal markers (e.g. `<ol type="a">`) cannot be reconstructed as `<number>.` text
    if (list.attrs.type) {
        return false
    }

    if (!editor.can().liftListItem(itemTypeName)) {
        return false
    }

    // The number the item is rendered with, given the list start and the item's position
    const marker = `${Number(list.attrs.start ?? 1) + $from.index(itemDepth - 1)}. `

    // The position at the start of the item's first paragraph, where the marker text belongs
    const markerPosition = $from.start(itemDepth) + 1

    return editor
        .chain()
        .liftListItem(itemTypeName)
        .command(({ tr }) => {
            tr.insertText(marker, tr.mapping.map(markerPosition))
            return true
        })
        .run()
}

/**
 * Custom extension that extends the built-in `ListItem` extension to preserve the rendered list
 * marker as literal text when `Shift-Tab` lifts an item out of an ordered list, making sure that
 * a number the user typed themselves – swallowed into the list's `start` attribute by the
 * automatic input rule – is never lost.
 */
const RichTextListItem = ListItem.extend({
    addKeyboardShortcuts() {
        return {
            ...this.parent?.(),
            'Shift-Tab': () => {
                return (
                    liftOutOfOrderedListPreservingMarker(
                        this.editor,
                        this.name,
                        this.options.orderedListTypeName,
                    ) || this.editor.commands.liftListItem(this.name)
                )
            },
        }
    },
})

export { RichTextListItem }
