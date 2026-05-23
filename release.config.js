/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
    branches: ['main', { name: 'next', prerelease: true }],
    plugins: [
        [
            '@semantic-release/commit-analyzer',
            {
                preset: 'conventionalcommits',
            },
        ],
        [
            '@semantic-release/release-notes-generator',
            {
                preset: 'conventionalcommits',
            },
        ],
        // Only update CHANGELOG.md and commit back on stable releases (main branch)
        ...(process.env.GITHUB_REF_NAME === 'next' ? [] : ['@semantic-release/changelog']),
        '@semantic-release/npm',
        // Only commit artifacts back on stable releases (main branch)
        ...(process.env.GITHUB_REF_NAME === 'next' ? [] : ['@semantic-release/git']),
        '@semantic-release/github',
        [
            '@semantic-release/exec',
            {
                verifyConditionsCmd:
                    'if [ -n "$GITHUB_OUTPUT" ]; then echo "package-published=false" >> "$GITHUB_OUTPUT"; fi',
                successCmd:
                    'if [ -n "$GITHUB_OUTPUT" ]; then echo "package-published=true" >> "$GITHUB_OUTPUT"; fi',
            },
        ],
    ],
}
