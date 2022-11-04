import { Mark, markInputRule, markPasteRule } from '@tiptap/core'

const starInputRegex = /(?:^|\s)((?:\*{3})((?:[^*]+))(?:\*{3}))$/
const starPasteRegex = /(?:^|\s)((?:\*{3})((?:[^*]+))(?:\*{3}))/g
const underscoreInputRegex = /(?:^|\s)((?:_{3})((?:[^_]+))(?:_{3}))$/
const underscorePasteRegex = /(?:^|\s)((?:_{3})((?:[^_]+))(?:_{3}))/g

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
