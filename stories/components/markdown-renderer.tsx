import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import type { Components } from 'react-markdown'

const REHYPE_PLUGINS = [rehypeRaw]
const REMARK_PLUGINS = [remarkGfm]

const SYNTAX_HIGHLIGHTER_STYLE = {
    background: 'revert-layer',
}

const MARKDOWN_COMPONENTS: Components = {
    pre({ children }) {
        return <>{children}</>
    },
    code({ children, className }) {
        const codeLanguage = /language-(\w+)/.exec(className || '')
        const codeContent = typeof children === 'string' ? children : ''

        return codeLanguage ? (
            <SyntaxHighlighter language={codeLanguage[1]} customStyle={SYNTAX_HIGHLIGHTER_STYLE}>
                {codeContent.replace(/\n$/, '')}
            </SyntaxHighlighter>
        ) : (
            <code className={className}>{children}</code>
        )
    },
}

type MarkdownRendererProps = {
    markdown: string
}

function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
    return (
        <div className="sb-unstyled markdown-body">
            <ReactMarkdown
                rehypePlugins={REHYPE_PLUGINS}
                remarkPlugins={REMARK_PLUGINS}
                components={MARKDOWN_COMPONENTS}
            >
                {markdown}
            </ReactMarkdown>
        </div>
    )
}

export { MarkdownRenderer }
