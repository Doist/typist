const doistPrettierConfig = require('@doist/prettier-config')

module.exports = {
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
