import { useCallback } from 'react'

import { action } from '@storybook/addon-actions'

import { PlainTextKit, TypistEditor } from '../../src'

import { DEFAULT_ARG_TYPES, DEFAULT_STORY_ARGS } from './constants/defaults'
import { TypistEditorDecorator } from './decorators/typist-editor-decorator/typist-editor-decorator'
import { HashtagSuggestion } from './extensions/hashtag-suggestion'
import { MentionSuggestion } from './extensions/mention-suggestion'

import type { Meta, StoryObj } from '@storybook/react'
import type { EditorView } from '../../src'

export default {
    title: 'Typist Editor/Plain-text',
    component: TypistEditor,
    argTypes: DEFAULT_ARG_TYPES,
    parameters: {
        layout: 'fullscreen',
    },
} as Meta<typeof TypistEditor>

export const Default: StoryObj<typeof TypistEditor> = {
    args: {
        ...DEFAULT_STORY_ARGS,
        placeholder: 'A plain-text editor, with smart Markdown typing…',
        extensions: [PlainTextKit, HashtagSuggestion, MentionSuggestion],
    },
    decorators: [
        (Story, context) => {
            return <TypistEditorDecorator Story={Story} args={context.args} />
        },
    ],
}

export const Singleline: StoryObj<typeof TypistEditor> = {
    argTypes: {
        onKeyDown: {
            table: {
                disable: true,
            },
        },
    },
    args: {
        ...Default.args,
        placeholder: 'A single-line plain-text editor, with smart Markdown typing…',
        extensions: [
            PlainTextKit.configure({
                document: {
                    multiline: false,
                },
            }),
            HashtagSuggestion,
            MentionSuggestion,
        ],
    },
    decorators: [
        (Story, context) => {
            const handleKeyDown = useCallback((event: KeyboardEvent, view: EditorView) => {
                if (event.key === 'Enter') {
                    action('onEnterPressed')({
                        event,
                        view,
                    })
                    return true
                }
            }, [])

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={{
                        ...context.args,
                        onKeyDown: handleKeyDown,
                    }}
                />
            )
        },
    ],
}
