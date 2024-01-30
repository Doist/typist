import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

type MarkdownRendererProps = {
    markdown: string
}

function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            className="sb-unstyled markdown-body"
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
                // eslint-disable-next-line react/no-unstable-nested-components
                pre({ children }) {
                    return <>{children}</>
                },
                // eslint-disable-next-line react/no-unstable-nested-components
                code({ children, className }) {
                    const codeLanguage = /language-(\w+)/.exec(className || '')

                    return codeLanguage ? (
                        <SyntaxHighlighter
                            language={codeLanguage[1]}
                            // Match `github-markdown-css` style
                            customStyle={{
                                background: '#f6f8fa',
                            }}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code className={className}>{children}</code>
                    )
                },
            }}
        >
            {markdown}
        </ReactMarkdown>
    )
}

export { MarkdownRenderer }
