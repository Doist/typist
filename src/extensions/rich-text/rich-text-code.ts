import { Code } from '@tiptap/extension-code'

/**
 * Custom extension that extends the built-in `Code` extension to allow all marks (e.g., Bold,
 * Italic, and Strikethrough) to coexist with the `Code` mark (as opposed to disallowing all any
 * other mark by default).
 *
 * @see https://tiptap.dev/api/schema#excludes
 * @see https://prosemirror.net/docs/ref/#model.MarkSpec.excludes
 */
const RichTextCode = Code.extend({
    excludes: Code.name,
})

export { RichTextCode }
