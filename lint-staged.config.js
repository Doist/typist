export default {
    './**/*.{js,jsx,ts,tsx,mts,css,json,jsonc,md,yml,yaml,html,svg}': [
        'oxfmt --no-error-on-unmatched-pattern',
    ],
    './**/*.{js,jsx,ts,tsx,mts}': ['oxlint --fix'],
}
