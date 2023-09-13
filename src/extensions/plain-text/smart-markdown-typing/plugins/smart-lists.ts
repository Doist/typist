import { Plugin, PluginKey } from '@tiptap/pm/state'

import { isMultilineDocument } from '../../../../helpers/schema'

import type { Schema } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

/**
 * A list of the allowed keys that might trigger smart typing.
 */
const ALLOWED_KEYS = ['Enter', 'Tab']

/**
 * The standard and task list item regex for smart typing triggers.
 */
const REGEX_LIST_ITEM = /^( *(?:(?:\*|-)(?: \[[ x]\])?|\d+\.) )[^\n]*$/i

/**
 * A string with the minimum required spaces to properly indent list items.
 */
const INDENT_SPACES = '    '

/**
 * This plugin provides a more plesant typing experience for both standard and task lists, adding
 * the list marker automatically when pressing the `Enter` key, and it also supports list items
 * indentation with the `Tab` and `Shift+Tab` keys, forward and backward, respectively.
 */
const smartLists = new Plugin({
    key: new PluginKey('smartLists'),
    props: {
        handleKeyDown(view: EditorView, event) {
            const { schema } = view.state as { schema: Schema }
            const { selection, tr } = view.state

            // Do not handle the event if not in a multiline document
            if (!isMultilineDocument(schema)) {
                return false
            }

            // Do not handle the event if allowed keys were not pressed
            if (!ALLOWED_KEYS.includes(event.key)) {
                return false
            }

            const match = selection.$from.nodeBefore?.text?.match(REGEX_LIST_ITEM)

            // Do not handle the event if a list/task item was not found
            if (!match) {
                return false
            }

            // Insert a new list marker with `Enter`?
            if (event.key === 'Enter') {
                // If the whole match is different from the first group match, the list item is not
                // empty, and a new list marker is inserted; If they are equal, the list item is
                // empty, and the list marker is deleted
                if (match[0] !== match[1]) {
                    // Attempt to parse the first group match as an ordered list item marker
                    const orderedListItemMarkerIndex = parseInt(match[1], 10)

                    // Increment the ordered list item marker by 1 if it's a number, otherwise
                    // use the first group match as the list item marker
                    const nextListItemMarker = orderedListItemMarkerIndex
                        ? `${orderedListItemMarkerIndex + 1}. `
                        : // Make sure the next task item marker is unchecked
                          match[1].replace(/\[x\]/i, '[ ]')

                    view.dispatch(
                        tr
                            .replaceSelectionWith(
                                schema.node('paragraph', {}, schema.text(nextListItemMarker)),
                            )
                            .scrollIntoView(),
                    )
                } else {
                    view.dispatch(tr.delete(selection.from - match[1].length, selection.to))
                }
            }
            // Indent the list item with `Tab` or `Shift+Tab`?
            else if (event.key === 'Tab') {
                // If the whole match is different from the first group match, the text cursor is
                // not at the beginning of the list item (i.e., `* |<Text>`, where the pipe is), and
                // the event is not handled (for now this restriction is disabled)
                // if (match[0] !== match[1]) {
                //     return false
                // }

                // Indent the list item forward or backward?
                if (!event.shiftKey) {
                    // Indent the list item forward
                    view.dispatch(
                        tr
                            .insertText(INDENT_SPACES, selection.from - match[0].length)
                            .scrollIntoView(),
                    )
                } else {
                    // Indent the list item backward if the whole match starts with a whitespace,
                    // otherwise do nothing as the list item is already at the start of the line
                    if (match[0].startsWith(INDENT_SPACES)) {
                        view.dispatch(
                            tr.delete(
                                selection.from - match[0].length,
                                selection.to - match[0].length + INDENT_SPACES.length,
                            ),
                        )
                    }
                }
            }

            // Suppress the default handling behaviour
            return true
        },
    },
})

export { smartLists }
