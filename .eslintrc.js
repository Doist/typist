module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    globals: {
        global: true,
        module: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    plugins: ['unicorn'],
    extends: [
        '@doist/eslint-config/recommended-type-checked',
        '@doist/eslint-config/simple-import-sort',
        '@doist/eslint-config/react',
        'plugin:storybook/recommended',
    ],
    parserOptions: {
        ecmaFeatures: {
            impliedStrict: true,
        },
        sourceType: 'module',
        project: ['./tsconfig.json'],
    },
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
                project: ['./tsconfig.json'],
            },
        },
    },
    rules: {
        // Rules no longer necessary with the new JSX Transformer
        // ref: https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
        // Experimental `eslint-plugin-unicorn` rules
        // ref: https://github.com/Doist/eslint-config/issues/46
        'unicorn/throw-new-error': 'error',
        'unicorn/prefer-optional-catch-binding': 'error',
    },
    overrides: [
        // Configure rules specific for Vitest test specifications
        {
            files: ['**/*.test.{j,t}s?(x)'],
            plugins: ['vitest'],
            extends: ['plugin:vitest-globals/recommended', 'plugin:vitest/recommended'],
            env: {
                'vitest-globals/env': true,
            },
        },
        // Disable rules that conflict how configuration files are written
        {
            files: ['./*.config.{j,t}s'],
            rules: {
                'import/no-default-export': 'off',
            },
        },
        // Disable rules that are pointless for Typescript files (this shouldn't be needed, but for
        // some reason `react/prop-types` is being flagged for TypeScript files)
        {
            files: ['./{src,stories}/**/*.tsx'],
            rules: {
                'react/prop-types': 'off',
            },
        },
        // Disable rules that conflict with Storybook stories and TypeScript typings
        {
            files: ['./stories/**/*.{story,stories}.tsx', './typings/**/*.d.ts'],
            rules: {
                'func-style': 'off',
                'import/no-default-export': 'off',
            },
        },
    ],
}
