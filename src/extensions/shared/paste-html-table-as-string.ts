import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { PASTE_HTML_TABLE_AS_STRING_EXTENSION_PRIORITY } from '../../constants/extension-priorities'
import { parseHtmlToElement } from '../../helpers/dom'

/**
 * The `PasteHTMLTableAsString` extension adds the ability to paste a table copied from a spreadsheet
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
const PasteHTMLTableAsString = Extension.create({
    name: 'pasteHTMLTableAsString',
    priority: PASTE_HTML_TABLE_AS_STRING_EXTENSION_PRIORITY,
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('pasteHTMLTableAsString'),
                props: {
                    transformPastedHTML(html) {
                        // Attempt to extract table(s) HTML from the pasted HTML
                        const tableHTML = html.match(/<table[^>]+>[\s\S]*?<\/table>/gi)

                        // Do not handle the event if no table HTML was found
                        if (!tableHTML) {
                            return html
                        }

                        // Concatenate all tables into a single string of paragraphs
                        return tableHTML.reduce((result, table) => {
                            const { firstElementChild: tableElement } = parseHtmlToElement(table)

                            if (
                                !tableElement ||
                                !(tableElement instanceof HTMLTableElement) ||
                                !tableElement.rows
                            ) {
                                return result
                            }

                            // Transform the table element into a string of paragraphs
                            return (
                                result +
                                Array.from(tableElement.rows)
                                    // Join each cell into a single string for each row
                                    .reduce<string[]>((acc, row) => {
                                        return [
                                            ...acc,
                                            // Use `innerHTML` instead of `innerText` to preserve
                                            // potential formatting (e.g., GFM) within each cell
                                            Array.from(row.cells)
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
                        }, '')
                    },
                },
            }),
        ]
    },
})

export { PasteHTMLTableAsString }
