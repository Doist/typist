import { create } from 'storybook/theming'

export const theme = create({
    base: 'light',

    // Brand
    brandTitle: '@doist/typist',
    brandImage: './logo.png',

    // UI
    appBg: '#f5f4f2',
    appContentBg: '#ffffff',
    appBorderColor: '#dfded9',
    appBorderRadius: 5,
    colorPrimary: '#e34432',
    colorSecondary: '#6b8767',

    // Typography
    fontBase: '"Open Sans", sans-serif',
    fontCode: '"Fira Code", monospace',
    textColor: '#2a1d30',
    textMutedColor: '#9d9d9d',

    // Toolbars
    barBg: '#f6f7f3',
    barTextColor: '#9ba399',
    barSelectedColor: '#6b8767',

    // Inputs
    buttonBg: '#f2f2f2',
    buttonBorder: '#dfded9',
    booleanBg: '#dfded9',
    booleanSelectedBg: '#f5f4f2',
})
