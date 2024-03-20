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
