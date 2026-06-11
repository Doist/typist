import { extractTagsFromParseRules } from '../../../helpers/serializer'

import type { NodeType } from '@tiptap/pm/model'
import type Turndown from 'turndown'

/**
 * The node types required by the table rules for tags and names detection.
 *
 * The `hardBreak` node type is optional because hard breaks may not be available in the editor
 * schema, in which case hard breaks within table cells are serialized with the built-in Turndown
 * rule.
 */
type TableNodeTypes = {
    table: NodeType
    tableRow: NodeType
    tableHeader: NodeType
    tableCell: NodeType
    hardBreak?: NodeType
}

/**
 * Serializes the content of a table cell delimited by the GFM table syntax. Since the GFM table
 * syntax cannot represent multiple lines or blocks within a cell, all inner whitespace (including
 * newlines from block content) is collapsed into a single space character, and pipe characters are
 * escaped so they are not interpreted as cell delimiters.
 *
 * @param content The serialized Markdown content of the table cell.
 * @param node The table cell element that matches this rule.
 *
 * @returns The serialized Markdown for the table cell.
 */
function serializeTableCell(content: string, node: Node): string {
    // Only the first cell opens the row with a leading pipe, while every cell (this one
    // included) closes itself with a trailing pipe, forming the full row delimiters
    const prefix = (node as Element).previousElementSibling ? ' ' : '| '

    const cellContent = content
        .replace(/\s*\n\s*/g, ' ')
        .replace(/\|/g, '\\|')
        .trim()

    return `${prefix}${cellContent} |`
}

/**
 * Checks if the given table row is a heading row, that is, a row inside a `<thead>` element, or
 * the very first row of a table in which every cell is a header cell. The first row is looked up
 * with the `rows` collection (instead of sibling-based checks), since it only contains the table
 * rows in document order, regardless of intermingled `<colgroup>`/`<caption>` elements (Tiptap
 * always renders a `<colgroup>` element before the table rows).
 *
 * @param row The table row element to check.
 * @param headerTags The HTML tags that match a header cell.
 *
 * @returns `true` if the table row is a heading row, `false` otherwise.
 */
function isHeadingRow(row: Node, headerTags: string[]): boolean {
    const rowElement = row as HTMLTableRowElement

    if (rowElement.parentNode?.nodeName === 'THEAD') {
        return true
    }

    const tableElement = rowElement.closest('table')

    return (
        tableElement?.rows[0] === rowElement &&
        Array.from(rowElement.children).every((cell) =>
            headerTags.some((tag) => tag.toUpperCase() === cell.nodeName),
        )
    )
}

/**
 * A Turndown plugin which adds rules for tables following the GitHub Flavored Markdown (GFM)
 * specification, based on the original third-party plugin. Unlike the original plugin, which keeps
 * tables without a heading row as raw HTML, this implementation adds an empty heading row instead,
 * since the GFM table syntax requires one.
 *
 * @see https://github.com/mixmark-io/turndown-plugin-gfm/blob/v1.0.1/src/tables.js
 *
 * @param nodeTypes The node objects that match the table rules.
 */
function table(nodeTypes: TableNodeTypes): Turndown.Plugin {
    const tableTags = extractTagsFromParseRules(nodeTypes.table.spec.parseDOM)
    const rowTags = extractTagsFromParseRules(nodeTypes.tableRow.spec.parseDOM)
    const headerTags = extractTagsFromParseRules(nodeTypes.tableHeader.spec.parseDOM)
    const cellTags = extractTagsFromParseRules(nodeTypes.tableCell.spec.parseDOM)

    return (turndown: Turndown) => {
        turndown.addRule(nodeTypes.table.name, {
            filter(node) {
                return tableTags.some((tag) => tag.toUpperCase() === node.nodeName)
            },
            replacement(content, node) {
                // Make sure there is exactly one newline between every table row
                const rows = content.replace(/\n+/g, '\n').trim()

                let headingRows = ''

                const firstRow = (node as HTMLTableElement).rows?.[0]

                // The GFM table syntax requires a heading row, so when the table doesn't have
                // one, an empty heading row (followed by the required delimiter row) is added,
                // with as many cells as the first row of the table
                if (firstRow && !isHeadingRow(firstRow, headerTags)) {
                    const cells = Array.from(firstRow.children)
                    const emptyRow = cells.map((cell) => serializeTableCell('', cell)).join('')
                    const delimiterRow = cells
                        .map((cell) => serializeTableCell('---', cell))
                        .join('')

                    headingRows = `${emptyRow}\n${delimiterRow}\n`
                }

                return `\n\n${headingRows}${rows}\n\n`
            },
        })

        turndown.addRule(nodeTypes.tableRow.name, {
            filter(node) {
                return rowTags.some((tag) => tag.toUpperCase() === node.nodeName)
            },
            replacement(content, node) {
                let delimiterRow = ''

                // The GFM table syntax requires a delimiter row (i.e. `| --- |`) between the
                // heading row and the table body, so one is appended to the heading row
                if (isHeadingRow(node, headerTags)) {
                    delimiterRow = `\n${Array.from(node.children)
                        .map((cell) => serializeTableCell('---', cell))
                        .join('')}`
                }

                return `\n${content}${delimiterRow}`
            },
        })

        turndown.addRule(nodeTypes.tableHeader.name, {
            filter(node) {
                return headerTags.some((tag) => tag.toUpperCase() === node.nodeName)
            },
            replacement: serializeTableCell,
        })

        turndown.addRule(nodeTypes.tableCell.name, {
            filter(node) {
                return cellTags.some((tag) => tag.toUpperCase() === node.nodeName)
            },
            replacement: serializeTableCell,
        })

        // Table sections have no Markdown representation, so they are unwrapped, keeping only
        // their serialized rows
        turndown.addRule('tableSection', {
            filter: ['thead', 'tbody', 'tfoot'],
            replacement(content) {
                return content
            },
        })

        // Serialize hard breaks inside table cells as literal `<br>` elements (instead of the
        // built-in trailing double space followed by a newline), since the GFM table syntax
        // cannot represent multiple lines within a cell, while raw `<br>` elements are rendered
        // as line breaks by GFM, and parsed back into hard breaks by the HTML serializer (the
        // rule is skipped when the schema doesn't support hard breaks, matching the HTML
        // serializer, which only restores `<br>` elements when the schema supports them)
        if (nodeTypes.hardBreak) {
            const cellSelector = [...headerTags, ...cellTags].join(', ')

            turndown.addRule('tableCellHardBreak', {
                filter(node) {
                    return node.nodeName === 'BR' && node.closest(cellSelector) !== null
                },
                replacement() {
                    return '<br>'
                },
            })
        }
    }
}

export { table }
