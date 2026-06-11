import { InputRule } from '@tiptap/core'
import { Table } from '@tiptap/extension-table'

import type { TableOptions } from '@tiptap/extension-table'

/**
 * The options available to customize the `Table` extension, omitting all resizing-related options
 * since column widths cannot be represented in the GFM table syntax, and would otherwise be
 * silently lost when the editor content is serialized to Markdown.
 */
type RichTextTableOptions = Omit<
    TableOptions,
    'resizable' | 'renderWrapper' | 'handleWidth' | 'cellMinWidth' | 'View' | 'lastColumnResizable'
>

/**
 * Custom extension that extends the built-in `Table` extension with an input rule to insert a
 * table by typing two or more consecutive pipe characters (i.e., the Markdown table column
 * delimiter) followed by a space. The number of typed delimiters defines the number of columns
 * (e.g., `||| ` inserts a table with two columns), and the table is inserted with a heading row
 * and a single body row. New rows can then be created by pressing the `Tab` key at the last cell
 * (a built-in capability of the `Table` extension).
 */
const RichTextTable = Table.extend({
    addInputRules() {
        return [
            new InputRule({
                find: /^(\|{2,})\s$/,
                handler: ({ range, match, chain }) => {
                    // Tables cannot be nested, so do not apply the input rule within a table
                    if (this.editor.isActive('table')) {
                        return null
                    }

                    chain()
                        .deleteRange(range)
                        .insertTable({
                            rows: 2,
                            cols: match[1].length - 1,
                            withHeaderRow: true,
                        })
                        .run()
                },
            }),
        ]
    },
})

export { RichTextTable }

export type { RichTextTableOptions }
