import { Extension, getHTMLFromFragment } from '@tiptap/core'

import { getMarkdownSerializerInstance } from '../../serializers/markdown/markdown'

/**
 * The options available to customize the `CopyMarkdownSource` extension.
 */
type CopyMarkdownSourceOptions = {
    /**
     * The keyboard shortcut to copy the editor underlying Markdown source to the system clipboard
     * (default: `Mod-c`).
     */
    keyboardShortcut: string
}

/**
 * The `CopyMarkdownSource` extension adds the ability to copy the editor underlying Markdown
 * source, and write it to the system clipboard. This extension has full support for both the
 * plain-text and rich-text editors, considering that it's powered by the Markdown serializer.
 */
const CopyMarkdownSource = Extension.create<CopyMarkdownSourceOptions>({
    name: 'copyMarkdownSource',
    addOptions() {
        return {
            keyboardShortcut: 'Mod-c',
        }
    },
    addKeyboardShortcuts() {
        return {
            [this.options.keyboardShortcut]: ({ editor }) => {
                // Get a fragment of the editor's content based on the selection
                const nodeSelection = editor.state.doc.cut(
                    editor.state.selection.from,
                    editor.state.selection.to,
                )

                // Serialize the selected content HTML to Markdown
                const markdownContent = getMarkdownSerializerInstance(editor.schema).serialize(
                    getHTMLFromFragment(nodeSelection.content, editor.schema),
                )

                // Writes the selected Markdown content to the system clipboard
                navigator?.clipboard
                    ?.writeText(markdownContent)
                    // No need to handle the success of the writeText call
                    .then(() => undefined)
                    // No need to handle the failure of the writeText call
                    .catch(() => undefined)

                // Suppress the default handling behaviour
                return true
            },
        }
    },
})

export { CopyMarkdownSource }

export type { CopyMarkdownSourceOptions }
