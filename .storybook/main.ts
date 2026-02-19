import { defineMain } from '@storybook/react-vite/node'

export default defineMain({
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },

    core: {
        disableTelemetry: true,
        disableWhatsNewNotifications: true,
    },

    staticDirs: ['./public'],

    stories: [{ directory: '../stories' }],

    addons: ['@storybook/addon-a11y', '@storybook/addon-docs', 'storybook-css-modules'],

    async viteFinal(config) {
        const { mergeConfig } = await import('vite')

        return mergeConfig(config, {
            build: {
                assetsDir: '.',
                sourcemap: false,
            },
        })
    },
})
