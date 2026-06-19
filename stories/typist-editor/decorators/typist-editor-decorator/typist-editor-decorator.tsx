import { forwardRef, useCallback, useMemo, useState } from 'react'

import { Box, Column, Columns } from '@doist/reactist'

import classNames from 'classnames'

import { TypistEditorToolbar } from './typist-editor-toolbar'

import styles from './typist-editor-decorator.module.css'

import type { PartialStoryFn as StoryFunction, Renderer } from 'storybook/internal/types'
import type { CoreEditor, TypistEditorProps, TypistEditorRef, UpdateProps } from '../../../../src'

type TypistEditorPropsWithRef = Partial<
    TypistEditorProps & {
        ref: React.LegacyRef<TypistEditorRef>
    }
>

type TypistEditorDecoratorProps = {
    Story: StoryFunction<Renderer, TypistEditorPropsWithRef>
    args: TypistEditorProps
    withRichTextFeatures?: boolean
    bottomFunctions?: React.ReactNode
    editorMounted?: boolean
}

const TypistEditorDecorator = forwardRef<TypistEditorRef, TypistEditorDecoratorProps>(
    function TypistEditorDecorator(
        { Story, args, withRichTextFeatures = false, bottomFunctions, editorMounted = true },
        forwardedRef,
    ) {
        const [typistEditor, setTypistEditor] = useState<CoreEditor | null>(null)
        const [markdownOutput, setMarkdownOutput] = useState(args.content)

        const storyClassName = classNames('markdown-body', args.className)

        const shouldRenderToolbar = typistEditor && withRichTextFeatures

        const handleUpdate = useCallback(
            (props: UpdateProps) => {
                setMarkdownOutput(props.getMarkdown())
                args.onUpdate?.(props)
            },
            [args],
        )

        const handleRef = useCallback(
            (instance: TypistEditorRef | null) => {
                setMarkdownOutput(instance?.getMarkdown() || '')

                // Keep the last editor when it unmounts, so the toolbar stays visible
                if (instance) {
                    setTypistEditor(instance.getEditor())
                }

                if (typeof forwardedRef === 'function') {
                    forwardedRef(instance)
                } else if (forwardedRef) {
                    forwardedRef.current = instance
                }
            },
            [forwardedRef],
        )

        const storyArgs = useMemo(
            () => ({
                ...args,
                className: storyClassName,
                onUpdate: handleUpdate,
                ref: handleRef,
            }),
            [args, storyClassName, handleUpdate, handleRef],
        )

        return (
            <Box display="flex" flexDirection="column" height="full">
                <Columns
                    exceptionallySetClassName={classNames(styles.topContainer, {
                        [styles.topContainerUnmounted]: !editorMounted,
                    })}
                >
                    <Column width="1/2">
                        <h3>Typist Editor</h3>
                        {shouldRenderToolbar ? <TypistEditorToolbar editor={typistEditor} /> : null}
                        <Box
                            className={classNames(styles.editorContainer, {
                                [styles.editorContainerUnmounted]: !editorMounted,
                            })}
                            marginX="large"
                            marginBottom="large"
                        >
                            {editorMounted ? (
                                <Story
                                    key={`${args.content}-${args.placeholder}`}
                                    args={storyArgs}
                                />
                            ) : null}
                        </Box>
                    </Column>
                    <Column width="1/2">
                        <h3>Markdown Output</h3>
                        <Box
                            className={styles.outputContainer}
                            marginX="large"
                            marginBottom="large"
                        >
                            <pre>{markdownOutput}</pre>
                        </Box>
                    </Column>
                </Columns>
                {bottomFunctions ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        flexWrap="wrap"
                        className={styles.bottomFunctionsContainer}
                    >
                        {bottomFunctions}
                    </Box>
                ) : null}
            </Box>
        )
    },
)

export { TypistEditorDecorator }
