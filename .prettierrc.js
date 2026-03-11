import doistPrettierConfig from '@doist/prettier-config' with { type: 'json' }

export default {
    ...doistPrettierConfig,
    overrides: [
        {
            files: ['tsconfig.json'],
            options: {
                parser: 'jsonc',
            },
        },
    ],
}
