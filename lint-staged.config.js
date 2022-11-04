module.exports = {
    './**/*.{js,jsx,ts,tsx}': 'eslint --cache --cache-location ./.cache/.eslintcache --fix',
    './**/*.{json,css,yml,md}': 'prettier --write',
    './**/.{html,svg}': 'prettier --parser html --write',

    // The function format is required to prevent the input files (in this case `.gitignore`) from
    // being appended to the `ignore-sync` and `git` commands
    '.gitignore': () => [
        'ignore-sync .eslintignore-sync .prettierignore-sync',
        'git add .eslintignore .prettierignore',
    ],
}
