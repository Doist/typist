import { Extension } from '@tiptap/core'
import { escape } from 'lodash-es'
import { Plugin, PluginKey } from 'prosemirror-state'

import { REGEX_LINE_BREAKS } from '../../constants/regular-expressions'
import { parseHtmlToElement } from '../../helpers/dom'
import { isPlainTextDocument } from '../../helpers/schema'

/**
 * The `PasteSinglelineText` extension joins all paragraphs into a single fragment when
 * copying-and-pasting text into the editor, adding spaces as block separators. This custom
 * extension is required for an editor configured with `multiline: false`, so that multiline
 * clipboard text is pasted into the singleline editor correctly.
 */
const PasteSinglelineText = Extension.create({
    name: 'pasteSinglelineText',
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('pasteSinglelineText'),
                props: {
                    transformPastedHTML(html, view) {
                        const bodyElement = parseHtmlToElement(html)

                        bodyElement.innerHTML = bodyElement.innerHTML
                            // Join break lines with a space character in-between
                            .replace(/<br>/g, ' ')
                            // Join paragraphs with a space character in-between
                            .replace(/<p[^>]+>(.*?)<\/p>/g, '$1 ')

                        return isPlainTextDocument(view.state.schema)
                            ? escape(bodyElement.innerText)
                            : bodyElement.innerHTML
                    },
                    transformPastedText(text) {
                        return (
                            text
                                // Join new lines with a space character in-between
                                .replace(REGEX_LINE_BREAKS, ' ')
                                // Collapse multiple space characters into one
                                .replace(/\s+/g, ' ')
                        )
                    },
                },
            }),
        ]
    },
})

export { PasteSinglelineText }
