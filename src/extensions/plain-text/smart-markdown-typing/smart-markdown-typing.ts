import { Extension } from '@tiptap/core'

import { SMART_MARKDOWN_TYPING_PRIORITY } from '../../../constants/extension-priorities'

import { smartLists } from './plugins/smart-lists'
import { smartSelectWrap } from './plugins/smart-select-wrap'
import { smartUrlPasting } from './plugins/smart-url-pasting'

/**
 * The `SmartMarkdownTyping` extension is a collection of ProseMirror plugins that attempts to mimic
 * a smart GitHub like typing experience, and is only meant to be used with a plain-text editor.
 */
const SmartMarkdownTyping = Extension.create({
    name: 'smartMarkdownTyping',
    priority: SMART_MARKDOWN_TYPING_PRIORITY,
    addProseMirrorPlugins() {
        return [smartLists, smartSelectWrap, smartUrlPasting]
    },
})

export { SmartMarkdownTyping }
