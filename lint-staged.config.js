export default {
    './**/*.{js,jsx,ts,tsx,mts,css,json,jsonc,md,yml,yaml,html,svg}': [
        'npx oxfmt --no-error-on-unmatched-pattern',
    ],
    './**/*.{js,jsx,ts,tsx,mts}': ['npx oxlint --fix'],
}
