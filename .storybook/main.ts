import type { StorybookConfig } from '@storybook/react-vite'
import type { UserConfig } from 'vite'

const config: StorybookConfig = {
    core: {
        disableTelemetry: true,
    },
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    stories: [{ directory: '../stories' }],
    typescript: {
        // This causes the warning "The CJS build of Vite's Node API is deprecated" when running
        // Storybook. The warning goes away when using `react-docgen` instead, however, it doesn't
        // generate the full table of properties for components that use TypeScript.
        // ref: https://github.com/storybookjs/storybook/discussions/26551
        reactDocgen: 'react-docgen-typescript',
    },
    addons: [
        {
            name: '@storybook/addon-essentials',
            options: {
                configureJSX: true,
                babelOptions: {},
                sourceLoaderOptions: null,
                backgrounds: false,
                measure: false,
                outline: false,
                viewport: false,
            },
        },
        '@storybook/addon-a11y',
        'storybook-css-modules',
        './addons/expand-sidebar/register.js',
        './addons/hide-dark-logo/register.js',
    ],
    staticDirs: ['./public'],
    async viteFinal(config: UserConfig) {
        const { mergeConfig } = await import('vite')

        return mergeConfig(config, {
            build: {
                assetsDir: '.',
                sourcemap: false,
            },
        })
    },
}

export default config
