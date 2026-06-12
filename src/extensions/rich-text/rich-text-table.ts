import { InputRule } from '@tiptap/core'
import { Table } from '@tiptap/extension-table'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { parseHtmlToElement } from '../../helpers/dom'

import type { TableOptions } from '@tiptap/extension-table'
import type { EditorView } from '@tiptap/pm/view'

/**
 * The regular expression to match a line that looks like a Markdown table row (i.e. a line
 * starting and ending with a pipe character).
 */
const TABLE_ROW_REGEX = /^\s*\|.*\|\s*$/

/**
 * The regular expression to match a Markdown table delimiter row (i.e. `| --- | :-- |`, which
 * separates the heading row from the table body).
 */
const TABLE_DELIMITER_ROW_REGEX = /^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/

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
 * Transforms pasted HTML by adding an empty heading row to tables that don't have one (e.g.,
 * tables copied from spreadsheet apps are composed of data cells only). The GFM table syntax
 * requires tables to have a heading row, so adding one at paste time keeps what is seen in the
 * editor consistent with the serialized Markdown (which would otherwise gain the empty heading
 * row when the content is reloaded).
 */
function transformPastedHTML(html: string): string {
    const body = parseHtmlToElement(html)
    const tables = body.querySelectorAll('table')

    if (tables.length === 0) {
        return html
    }

    for (const table of Array.from(tables)) {
        const firstRow = table.rows[0]

        if (!firstRow || firstRow.cells.length === 0) {
            continue
        }

        const isHeadingRow = Array.from(firstRow.cells).every((cell) => cell.tagName === 'TH')

        if (isHeadingRow) {
            continue
        }

        const headingRow = document.createElement('tr')

        for (let index = 0; index < firstRow.cells.length; index++) {
            headingRow.appendChild(document.createElement('th'))
        }

        firstRow.before(headingRow)
    }

    return body.innerHTML
}

/**
 * Transforms pasted plain text by adding an empty heading row (followed by the required delimiter
 * row) to Markdown tables that don't have one. The GFM table syntax requires a heading row to
 * parse as a table at all, so without this transform, pasted heading-less Markdown tables would
 * be inserted as plain text paragraphs.
 */
function transformPastedText(text: string, _plain: boolean, view: EditorView): string {
    // Do not transform text pasted into a code block (it must be inserted as-is)
    if (view.state.selection.$from.parent.type.spec.code) {
        return text
    }

    const lines = text.split('\n')
    const output: string[] = []

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index]
        const isFirstRowOfTable = !TABLE_ROW_REGEX.test(lines[index - 1] || '')

        // Add the empty heading row (followed by the required delimiter row) before the first
        // row of a table that is not followed by a delimiter row (i.e. a heading-less table)
        if (
            TABLE_ROW_REGEX.test(line) &&
            isFirstRowOfTable &&
            !TABLE_DELIMITER_ROW_REGEX.test(lines[index + 1] || '')
        ) {
            const columnsCount = line.trim().split(/(?<!\\)\|/).length - 2

            output.push(`|${'  |'.repeat(columnsCount)}`, `|${' --- |'.repeat(columnsCount)}`)
        }

        output.push(line)
    }

    return output.join('\n')
}

/**
 * Custom extension that extends the built-in `Table` extension with an input rule to insert a
 * table by typing two or more consecutive pipe characters (i.e., the Markdown table column
 * delimiter) followed by a space. The number of typed delimiters defines the number of columns
 * (e.g., `||| ` inserts a table with two columns), and the table is inserted with a heading row
 * and a single body row. New rows can then be created by pressing the `Tab` key at the last cell
 * (a built-in capability of the `Table` extension).
 *
 * Additionally, this extension makes sure that tables pasted without a heading row (e.g., from
 * spreadsheet apps or as heading-less Markdown tables) get an empty one, since the GFM table
 * syntax requires it.
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
    addProseMirrorPlugins() {
        return [
            // The built-in plugins (e.g., for cell selection handling) must be preserved
            ...(this.parent?.() || []),

            new Plugin({
                key: new PluginKey('pasteTableHeadingRow'),
                props: {
                    transformPastedHTML,
                    transformPastedText,
                },
            }),
        ]
    },
})

export { RichTextTable }

export type { RichTextTableOptions }
