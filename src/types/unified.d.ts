import type { Options as Extension } from 'mdast-util-to-markdown'

// https://github.com/remarkjs/remark/blob/5017a27db024db6feec85a3e1e19f8d78a485680/packages/remark-stringify/index.d.ts#L26-L41
declare module 'unified' {
    interface Data {
        toMarkdownExtensions?: Extension[]
    }
}
