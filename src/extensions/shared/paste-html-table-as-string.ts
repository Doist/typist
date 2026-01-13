import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { PASTE_HTML_TABLE_AS_STRING_EXTENSION_PRIORITY } from '../../constants/extension-priorities'
import { parseHtmlToElement } from '../../helpers/dom'

/**
 * Transforms pasted HTML by converting tables to paragraphs while preserving surrounding content.
 */
function transformPastedHTML(html: string): string {
    const body = parseHtmlToElement(html)
    const tables = body.querySelectorAll('table')

    if (tables.length === 0) {
        return html
    }

    for (const table of Array.from(tables)) {
        if (!table.rows) {
            continue
        }

        // Convert table rows to paragraphs (using innerHTML to preserve formatting)
        const paragraphs = Array.from(table.rows)
            .map((row) =>
                Array.from(row.cells)
                    .map((cell) => {
                        // Unwrap paragraphs but preserve inline formatting
                        const paragraphs = cell.querySelectorAll('p')

                        for (const p of Array.from(paragraphs)) {
                            p.replaceWith(...Array.from(p.childNodes))
                        }

                        return cell.innerHTML
                    })
                    .join(' '),
            )
            .filter((row) => row.trim().length > 0)
            .map((row) => {
                const p = document.createElement('p')
                p.innerHTML = row
                return p
            })

        table.replaceWith(...paragraphs)
    }

    return body.innerHTML
}

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
                    transformPastedHTML,
                },
            }),
        ]
    },
})

export { PasteHTMLTableAsString, transformPastedHTML }
