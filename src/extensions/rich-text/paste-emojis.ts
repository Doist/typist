import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import emojiRegex from 'emoji-regex'

// Regular expression to match all emoji symbols and sequences (including textual representations)
const baseEmojiRegExp = emojiRegex()

// Regular expression to match `<img>` tags with emoji unicode characters in the `alt` attribute
const imgWithEmojiRegExp = new RegExp(
    `<img[^>]+alt="(${baseEmojiRegExp.source})"[^>]+/?>`,
    baseEmojiRegExp.flags,
)

/**
 * The `PasteEmojis` extension adds the ability to paste HTML image emojis as unicode characters
 * into the editor, ignoring the HTML image source. This extension works by replacing all `<img>`
 * tags with the emoji unicode character, if one is found in the `alt` attribute.
 */
const PasteEmojis = Extension.create({
    name: 'pasteEmojis',
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('pasteEmojis'),
                props: {
                    transformPastedHTML(html) {
                        return html.replace(imgWithEmojiRegExp, (_, alt: string) => alt)
                    },
                },
            }),
        ]
    },
})

export { PasteEmojis }
