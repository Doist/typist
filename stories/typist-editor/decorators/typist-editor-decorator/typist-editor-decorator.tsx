import { useCallback, useEffect, useState } from 'react'

import { Box, Column, Columns } from '@doist/reactist'

import classNames from 'classnames'

import { TypistEditorToolbar } from './typist-editor-toolbar'

import styles from './typist-editor-decorator.module.css'

import type { PartialStoryFn } from '@storybook/csf'
import type { ReactFramework } from '@storybook/react'
import type { CoreEditor, TypistEditorProps, TypistEditorRef, UpdateProps } from '../../../../src'

type TypistEditorArgs = Partial<
    TypistEditorProps & {
        ref: React.ForwardedRef<TypistEditorRef>
    }
>

type TypistEditorDecoratorProps = {
    Story: PartialStoryFn<ReactFramework, TypistEditorArgs>
    args: TypistEditorArgs
    withToolbar?: boolean
    renderBottomFunctions?: () => JSX.Element
}

function TypistEditorDecorator({
    Story,
    args,
    withToolbar = false,
    renderBottomFunctions,
}: TypistEditorDecoratorProps) {
    const [typistEditor, setTypistEditor] = useState<CoreEditor | null>(null)
    const [markdownOutput, setMarkdownOutput] = useState(args.content)

    const storyClassName = classNames('markdown-body', args.className)

    const shouldRenderToolbar = typistEditor && withToolbar

    const handleUpdate = useCallback((props: UpdateProps) => {
        setMarkdownOutput(props.getMarkdown())
    }, [])

    useEffect(
        function updateMarkdownOutputOnContentControlChange() {
            setMarkdownOutput(args.content)
        },
        [args.content],
    )

    return (
        <Box display="flex" flexDirection="column" height="full">
            <Columns exceptionallySetClassName={styles.topContainer}>
                <Column width="1/2">
                    <h3>Typist Editor</h3>
                    {shouldRenderToolbar ? <TypistEditorToolbar editor={typistEditor} /> : null}
                    <Box className={styles.editorContainer} marginX="large" marginBottom="large">
                        <Story
                            args={{
                                ...args,
                                className: storyClassName,
                                onUpdate: handleUpdate,
                                ref: (instance) => {
                                    setTypistEditor(instance?.getEditor() || null)

                                    if (typeof args.ref === 'function') {
                                        args.ref(instance)
                                    } else if (args.ref) {
                                        args.ref.current = instance
                                    }
                                },
                            }}
                        />
                    </Box>
                </Column>
                <Column width="1/2">
                    <h3>Markdown Output</h3>
                    <Box className={styles.outputContainer} marginX="large" marginBottom="large">
                        <pre>{markdownOutput}</pre>
                    </Box>
                </Column>
            </Columns>
            {renderBottomFunctions ? (
                <Box
                    display="flex"
                    justifyContent="center"
                    flexWrap="wrap"
                    className={styles.bottomFunctionsContainer}
                >
                    {renderBottomFunctions()}
                </Box>
            ) : null}
        </Box>
    )
}

export { TypistEditorDecorator }
