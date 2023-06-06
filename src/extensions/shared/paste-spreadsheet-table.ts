import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

import { PASTE_EXTENSION_PRIORITY } from '../../constants/extension-priorities'
import { parseHtmlToElement } from '../../helpers/dom'

/**
 * The `PasteSpreadsheetTable` extension adds the ability to paste a table copied from a spreadsheet
 * web app (e.g., Google Sheets, Microsoft Excel), along with tables rendered by GitHub Flavored
 * Markdown (GFM), into the editor.
 *
 * Since Typist does not yet support tables, this extension simply pastes the table as a string of
 * paragraphs (one paragraph per row), with each cell separated by a space character. However,
 * whenever we do add support for tables, this extension will need to be completely rewritten.
 *
 * Lastly, please note that formatting is lost when the copied table comes from Google Sheets or
 * Microsoft Excel, because unfortunately, these apps style the cell contents using CSS.
 */
const PasteSpreadsheetTable = Extension.create({
    name: 'pasteSpreadsheetTable',
    priority: PASTE_EXTENSION_PRIORITY,
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('pasteSpreadsheetTable'),
                props: {
                    transformPastedHTML(html) {
                        // Attempt to extract a table HTML from the pasted HTML
                        const tableHTML = /<table[^>]+>[\s\S]*?<\/table>/gi.exec(html)

                        // Do not handle the event if a table was not found
                        if (!tableHTML) {
                            return html
                        }

                        const { firstElementChild: tableElement } = parseHtmlToElement(
                            tableHTML[0],
                        ) as {
                            firstElementChild: HTMLTableElement | null
                        }

                        // Do not handle the event if we don't have a table element
                        if (!tableElement) {
                            return html
                        }

                        // Transform the table element into a string of paragraphs
                        return (
                            Array.from(tableElement.rows)
                                // Join each cell into a single string for each row
                                .reduce<string[]>((acc, row) => {
                                    return [
                                        ...acc,
                                        Array.from(row.cells)
                                            // Use `innerHTML` instead of `innerText` to preserve
                                            // potential formatting (e.g., GFM) within each cell
                                            .map((cell) => cell.innerHTML)
                                            .join(' '),
                                    ]
                                }, [])
                                // Discard rows that are completely empty
                                .filter((row) => row.trim().length > 0)
                                // Wrap each row in a paragraph
                                .map((row) => `<p>${row}</p>`)
                                .join('')
                        )
                    },
                },
            }),
        ]
    },
})

export { PasteSpreadsheetTable }
