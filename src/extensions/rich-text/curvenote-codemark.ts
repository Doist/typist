import { Extension } from '@tiptap/core'
import codemark from 'prosemirror-codemark'

/**
 * The `CurvenoteCodemark` extension adds a plugin for ProseMirror that makes it easier to handle,
 * and navigate inline code marks. The plugin creates a fake cursor (if necessary) to show if the
 * next character to be typed will or will not be inside the inline code mark.
 *
 * @see https://github.com/curvenote/prosemirror-codemark
 */
const CurvenoteCodemark = Extension.create({
    name: 'curvenoteCodemark',
    addProseMirrorPlugins() {
        return codemark({
            markType: this.editor.schema.marks.code,
        })
    },
})

export { CurvenoteCodemark }
