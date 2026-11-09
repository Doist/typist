import { useRef } from 'react'

import preview from '../../.storybook/preview'
import { TypistEditor } from '../../src'

import { EditorRefHelperButtons } from './components/editor-ref-helper-buttons'
import { ExtraEditorCommandButtons } from './components/extra-editor-command-buttons'
import { DEFAULT_ARG_TYPES } from './constants/defaults'
import { TypistEditorDecorator } from './decorators/typist-editor-decorator/typist-editor-decorator'
import { Default } from './plain-text.stories'

import type { TypistEditorRef } from '../../src'

const meta = preview.meta({
    title: 'Typist Editor/Plain-text/Functions',
    component: TypistEditor,
    argTypes: DEFAULT_ARG_TYPES,
    parameters: {
        layout: 'fullscreen',
    },
})

export const Commands = meta.story({
    ...Default.composed,
    decorators: [
        (Story, context) => {
            const typistEditorRef = useRef<TypistEditorRef>(null)

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={context.args}
                    bottomFunctions={<ExtraEditorCommandButtons typistEditorRef={typistEditorRef} />}
                    ref={typistEditorRef}
                />
            )
        },
    ],
})

export const Helpers = meta.story({
    ...Default.composed,
    decorators: [
        (Story, context) => {
            const typistEditorRef = useRef<TypistEditorRef>(null)

            return (
                <TypistEditorDecorator
                    Story={Story}
                    args={context.args}
                    bottomFunctions={<EditorRefHelperButtons typistEditorRef={typistEditorRef} />}
                    ref={typistEditorRef}
                />
            )
        },
    ],
})
