import { markInputRule, markPasteRule } from '@tiptap/core'
import { Code } from '@tiptap/extension-code'

import { CODE_EXTENSION_PRIORITY } from '../../constants/extension-priorities'

import type { CodeOptions } from '@tiptap/extension-code'

/**
 * The options available to customize the `RichTextCode` extension.
 */
type RichTextCodeOptions = CodeOptions

/**
 * The original input regex for Markdown inline code (i.e. `<code>code</code>`) to prevent the issue
 * introduced in this PR: https://github.com/ueberdosis/tiptap/pull/4468#issuecomment-2575093998
 */
const inputRegex = /(?:^|\s)(`(?!\s+`)((?:[^`]+))`(?!\s+`))$/

/**
 * The original paste regex for Markdown inline code (i.e. `<code>code</code>`) to prevent the issue
 * introduced in this PR: https://github.com/ueberdosis/tiptap/pull/4468#issuecomment-2575093998
 */
const pasteRegex = /(?:^|\s)(`(?!\s+`)((?:[^`]+))`(?!\s+`))/g

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
    addInputRules() {
        return [
            markInputRule({
                find: inputRegex,
                type: this.type,
            }),
        ]
    },
    addPasteRules() {
        return [
            markPasteRule({
                find: pasteRegex,
                type: this.type,
            }),
        ]
    },
})

export { RichTextCode }

export type { RichTextCodeOptions }
