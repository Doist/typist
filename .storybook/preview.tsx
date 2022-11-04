import '@doist/reactist/styles/reactist.css'

import 'github-markdown-css/github-markdown-light.css'

import './preview.style.css'

import { theme } from './theme'

export const parameters = {
    docs: {
        theme,
    },
    options: {
        isToolshown: true,
        storySort: {
            order: [
                'README',
                'Documentation',
                [
                    'Usage',
                    ['Basic', 'Singleline', 'Helpers', 'Extensions'],
                    'Reference',
                    'Tips & Tricks',
                    ['Styling', 'Performance'],
                ],
                'Typist Editor',
            ],
        },
    },
    viewMode: 'story',
    previewTabs: {
        canvas: {
            hidden: true,
        },
        'storybook/docs/panel': {
            hidden: true,
        },
    },
}
