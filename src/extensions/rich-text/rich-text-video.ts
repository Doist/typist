import { mergeAttributes, Node } from '@tiptap/core'

/**
 * The options available to customize the `RichTextVideo` extension.
 */
type RichTextVideoOptions = {
    // placeholder
}

/**
 * Custom extension that adds support for `<video>` HTML element.
 */
const RichTextVideo = Node.create<RichTextVideoOptions>({
    name: 'video',
    inline: false,
    group: 'block',
    selectable: false,
    draggable: true,
    addOptions() {
        return {
            // placeholder
        }
    },
    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: (element) => element.getAttribute('src'),
                renderHTML: (attributes) => ({
                    src: String(attributes['src']),
                }),
            },
        }
    },
    parseHTML() {
        return [
            {
                tag: 'video',
            },
        ]
    },
    renderHTML({ HTMLAttributes }) {
        return [
            'video',
            mergeAttributes(HTMLAttributes, {
                controls: true,
            }),
        ]
    },
})

export { RichTextVideo }

export type { RichTextVideoOptions }
