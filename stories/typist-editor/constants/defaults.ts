import { action } from '@storybook/addon-actions'
import { Meta } from '@storybook/react'

import { TypistEditor, TypistEditorProps } from '../../../src'
import { RichTextKitOptions } from '../../../src/extensions/rich-text/rich-text-kit'

const DEFAULT_ARG_TYPES: Meta<typeof TypistEditor>['argTypes'] = {
    extensions: {
        table: {
            disable: true,
        },
    },
    onBeforeCreate: {
        type: 'boolean',
        mapping: {
            true: action('onBeforeCreate'),
            false: undefined,
        },
    },
    onCreate: {
        type: 'boolean',
        mapping: {
            true: action('onCreate'),
            false: undefined,
        },
    },
    onUpdate: {
        type: 'boolean',
        mapping: {
            true: action('onUpdate'),
            false: undefined,
        },
    },
    onSelectionUpdate: {
        type: 'boolean',
        mapping: {
            true: action('onSelectionUpdate'),
            false: undefined,
        },
    },
    onTransaction: {
        type: 'boolean',
        mapping: {
            true: action('onTransaction'),
            false: undefined,
        },
    },
    onFocus: {
        type: 'boolean',
        mapping: {
            true: action('onFocus'),
            false: undefined,
        },
    },
    onBlur: {
        type: 'boolean',
        mapping: {
            true: action('onBlur'),
            false: undefined,
        },
    },
    onDestroy: {
        type: 'boolean',
        mapping: {
            true: action('onDestroy'),
            false: undefined,
        },
    },
    onClick: {
        type: 'boolean',
        mapping: {
            true: action('onClick'),
            false: undefined,
        },
    },
    onKeyDown: {
        type: 'boolean',
        mapping: {
            true: action('onKeyDown'),
            false: undefined,
        },
    },
}

const DEFAULT_STORY_ARGS: Partial<TypistEditorProps> = {
    autoFocus: false,
    className: '',
    content: '',
    contentSelection: undefined,
    editable: true,
    extensions: [],
    placeholder: '',
    'aria-label': '',
    'aria-labelledby': '',
    'aria-describedby': '',
    // @ts-expect-error Overridden type by `defaultArgTypes` mapping
    onBeforeCreate: false,
    // @ts-expect-error Overridden type by `defaultArgTypes` mapping
    onCreate: false,
    // @ts-expect-error Overridden type by `defaultArgTypes` mapping
    onUpdate: false,
    // @ts-expect-error Overridden type by `defaultArgTypes` mapping
    onSelectionUpdate: false,
    // @ts-expect-error Overridden type by `defaultArgTypes` mapping
    onTransaction: false,
    // @ts-expect-error Overridden type by `defaultArgTypes` mapping
    onFocus: false,
    // @ts-expect-error Overridden type by `defaultArgTypes` mapping
    onBlur: false,
    // @ts-expect-error Overridden type by `defaultArgTypes` mapping
    onDestroy: false,
    // @ts-expect-error Overridden type by `defaultArgTypes` mapping
    onClick: false,
    // @ts-expect-error Overridden type by `defaultArgTypes` mapping
    onKeyDown: false,
}

const DEFAULT_RICH_TEXT_KIT_OPTIONS: Partial<RichTextKitOptions> = {
    bulletList: {
        smartToggle: true,
    },
    dropCursor: {
        class: 'ProseMirror-dropcursor',
    },
    link: {
        openOnClick: false,
    },
    orderedList: {
        smartToggle: true,
    },
}

export { DEFAULT_ARG_TYPES, DEFAULT_RICH_TEXT_KIT_OPTIONS, DEFAULT_STORY_ARGS }
