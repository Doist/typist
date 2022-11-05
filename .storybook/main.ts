import { UserConfig, mergeConfig } from 'vite'

module.exports = {
    core: {
        disableTelemetry: true,
        builder: '@storybook/builder-vite',
    },
    features: {
        babelModeV7: true,
        previewMdx2: true,
        // Switching between story/docs view mode is not as seamless as it should be (toolbar often
        // flashes on the screen before being hidden in docs mode, and swtiching from a docs page to
        // a story often loads the docs page erroneously), and for the moment this is disabled
        storyStoreV7: false,
    },
    framework: '@storybook/react',
    stories: ['../stories/**/*.@(story|stories).@(mdx|tsx)'],
    addons: [
        {
            name: '@storybook/addon-essentials',
            options: {
                configureJSX: true,
                babelOptions: {},
                sourceLoaderOptions: null,
                transcludeMarkdown: true,
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
        return mergeConfig(config, {
            build: {
                assetsDir: '.',
            },
        })
    },
}
