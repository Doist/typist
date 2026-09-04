import { forwardRef, useCallback, useMemo, useState } from 'react'

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
            <div className={styles.decorator}>
                <div
                    className={classNames(styles.topContainer, {
                        [styles.topContainerUnmounted]: !editorMounted,
                    })}
                >
                    <section className={styles.column}>
                        <h3>Typist Editor</h3>
                        {shouldRenderToolbar ? <TypistEditorToolbar editor={typistEditor} /> : null}
                        <div
                            className={classNames(styles.editorContainer, {
                                [styles.editorContainerUnmounted]: !editorMounted,
                            })}
                        >
                            {editorMounted ? (
                                <Story
                                    key={`${args.content}-${args.placeholder}`}
                                    args={storyArgs}
                                />
                            ) : null}
                        </div>
                    </section>
                    <section className={styles.column}>
                        <h3>Markdown Output</h3>
                        <div className={styles.outputContainer}>
                            <pre>{markdownOutput}</pre>
                        </div>
                    </section>
                </div>
                {bottomFunctions ? (
                    <div className={styles.bottomFunctionsContainer}>{bottomFunctions}</div>
                ) : null}
            </div>
        )
    },
)

export { TypistEditorDecorator }
