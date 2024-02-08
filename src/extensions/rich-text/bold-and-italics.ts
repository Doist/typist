import { Mark, markInputRule, markPasteRule } from '@tiptap/core'

export const starInputRegex = /(?:^|\s)(\*\*\*(?!\s+\*\*\*)((?:[^*]+))\*\*\*(?!\s+\*\*\*))$/
export const starPasteRegex = /(?:^|\s)(\*\*\*(?!\s+\*\*\*)((?:[^*]+))\*\*\*(?!\s+\*\*\*))/g
export const underscoreInputRegex = /(?:^|\s)(___(?!\s+___)((?:[^_]+))___(?!\s+___))$/
export const underscorePasteRegex = /(?:^|\s)(___(?!\s+___)((?:[^_]+))___(?!\s+___))/g

/**
 * The `BoldAndItalics` extension adds the ability to use the `***` and `___` Markdown shortcuts
 * when typing and pasting into the editor.
 */
const BoldAndItalics = Mark.create({
    name: 'boldAndItalics',
    renderHTML({ HTMLAttributes }) {
        return ['strong', ['em', HTMLAttributes, 0]]
    },
    addInputRules() {
        return [
            markInputRule({
                find: starInputRegex,
                type: this.type,
            }),
            markInputRule({
                find: underscoreInputRegex,
                type: this.type,
            }),
        ]
    },
    addPasteRules() {
        return [
            markPasteRule({
                find: starPasteRegex,
                type: this.type,
            }),
            markPasteRule({
                find: underscorePasteRegex,
                type: this.type,
            }),
        ]
    },
})

export { BoldAndItalics }
