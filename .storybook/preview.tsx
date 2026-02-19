import '@doist/reactist/styles/reactist.css'

import 'github-markdown-css/github-markdown-light.css'

import './preview.style.css'

import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import { definePreview } from '@storybook/react-vite'

import { theme } from './themes'

export default definePreview({
    addons: [addonA11y(), addonDocs()],
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
})
