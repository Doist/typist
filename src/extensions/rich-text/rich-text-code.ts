import { Code } from '@tiptap/extension-code'

const RichTextCode = Code.extend({
    // Instead of not allowing other marks to coexist, allow everything so that
    // inline code can be bolded, linked, etc
    // See https://tiptap.dev/api/schema#excludes
    excludes: Code.name,
})

export { RichTextCode }
