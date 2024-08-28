import { Code } from '@tiptap/extension-code'

import { CODE_EXTENSION_PRIORITY } from '../../constants/extension-priorities'

import type { CodeOptions } from '@tiptap/extension-code'

/**
 * The options available to customize the `RichTextCode` extension.
 */
type RichTextCodeOptions = CodeOptions

/**
 * Custom extension that extends the built-in `Code` extension to allow all marks (e.g., Bold,
 * Italic, and Strikethrough) to coexist with the `Code` mark (as opposed to disallowing all any
 * other mark by default).
 *
 * @see https://tiptap.dev/api/schema#excludes
 * @see https://prosemirror.net/docs/ref/#model.MarkSpec.excludes
 */
const RichTextCode = Code.extend<RichTextCodeOptions>({
    priority: CODE_EXTENSION_PRIORITY,
    excludes: Code.name,
})

export { RichTextCode }

export type { RichTextCodeOptions }
