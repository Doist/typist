import '@doist/reactist/styles/reactist.css'

import 'github-markdown-css/github-markdown-light.css'

import './preview.style.css'

import { theme } from './theme'

import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
    parameters: {
        docs: {
            theme,
        },
        options: {
            storySort: {
                order: [
                    'README',
                    'Documentation',
                    [
                        'Usage',
                        ['Basic', 'Singleline', 'Helpers', 'Extensions'],
                        'Reference',
                        ['Components', 'Utilities'],
                        'Tips & Tricks',
                        ['Styling', 'Performance'],
                    ],
                    'Typist Editor',
                ],
            },
        },
    },
}

export default preview
