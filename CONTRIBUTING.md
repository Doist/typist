# Contributing to Typist

The following is a set of guidelines for contributing to Typist. Please spend several minutes reading these guidelines before you create an issue, pull request or discussion.

## Code of Conduct

Doist has adopted the [Contributor Covenant](https://www.contributor-covenant.org/) as its Code of Conduct, and we expect contributors to Typist to adhere to it. Please read [the full text](https://github.com/doist/typist/blob/main/CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

## Open Development

All work on Typist happens directly on [GitHub](https://github.com/Doist/typist). Both core team members and external contributors send pull requests that go through the same review process.

## Semantic Versioning

Typist follows [semantic versioning](https://semver.org/). We release patch versions for critical bugfixes, minor versions for new features or non-essential changes, and major versions for any breaking changes.

Every significant change is documented in the [CHANGELOG.md](CHANGELOG.md) file.

## Branch Organization

Submit all changes directly to the [main](https://github.com/doist/typist/tree/main) branch. We don't use separate branches for development or for upcoming releases. We do our best to keep `main` in good shape, with all tests passing.

## Proposing a Change

If you intend to change the public API, or make any non-trivial changes to the implementation, we recommend opening a [GitHub Discussion](https://github.com/doist/typist/discussions) with the core team first. Although we welcome all contributions, this lets us reach an agreement on your proposal before you put significant effort into something that might not fit Doist product requirements.

## Your First Pull Request

Working on your first Pull Request? You can learn how from this free video series:

-   [How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)

If you decide to fix an issue, please be sure to check the comment thread in case somebody is already working on a fix. If nobody is working on it at the moment, please leave a comment stating that you intend to work on it so other people don't accidentally duplicate your effort.

## Project Setup

Before you can contribute to the codebase, you will need to fork the Typist repository, and the following steps will help you hit the ground running:

1. Fork the repository (click the <kbd>Fork</kbd> button at the top right of [this page](https://github.com/doist/typist));

2. Clone your fork locally;

```sh
git clone https://github.com/<your_github_username>/typist.git
cd typist
```

3. Install all dependencies by running `npm install`;

    > **Note**
    >
    > If you're not using **npm 7+**, install peer dependencies with `npx npm-install-peers`.

## Development Workflow

After cloning Typist and installing all dependencies, several commands are at your disposal:

-   `npm run build`: Builds the `@doist/typist` package for publishing to [npm](https://www.npmjs.com/) and [GitHub Packages](https://github.com/orgs/Doist/packages?repo_name=typist);
-   `npm run check`: Validates code quality with ESLint, styling with Prettier, and types with TypeScript;
-   `npm run clean`: Removes temporary directories used for multiple caches;
-   `npm run storybook:build`: Builds Storybook as a static Web application;
-   `npm run storybook:start`: Starts Storybook Web application (available at http://localhost:6006/);
-   `npm run test`: Runs all unit test with Jest and end-to-end tests with Storybook.

### Release Process (core team only)

The release process for Typist is almost fully automated with [`semantic-release`](https://github.com/semantic-release/semantic-release), only requiring a core team member to trigger [this workflow](https://github.com/Doist/typist/actions/workflows/publish-typist-package-release.yml) manually whenever a new release needs to be published.

#### Experimental Releases

Sometimes the need for an experimental release arises before a new feature or fix is ready for a stable release. In these cases, we can publish an experimental release by pushing code to the `experimental` branch, and manually triggering the [this workflow](https://github.com/Doist/typist/actions/workflows/publish-typist-package-release.yml). The version number will be automatically picked by `semantic-release`, and `-experimental.x` will be appended at the end of the version number, where `x` represents the number of experimental release published to the `experimental` branch.

> **Warning**
> The `experimental` branch should never be deleted nor rebased with `main`, otherwise we might lose the Git tags required for `semantic-release` to properly pick the next experimental version number. Instead, `main` should be merged into the `experimental` branch with a merge commit before pushing new code to the `experimental` branch, so that those experiments are always published with the latest published stable version.

### Visual Studio Code

#### CSS Modules for Storybook

Typist Storybook makes use of [`typescript-plugin-css-modules`](https://github.com/mrmckeb/typescript-plugin-css-modules), a [TypeScript language service plugin](https://github.com/Microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin) for [CSS Modules](https://github.com/css-modules/css-modules), which provides type information to IDEs and any other tools that work with TypeScript language service plugins.

To use this plugin with Visual Studio Code, you should set your workspace's version of TypeScript, which will load plugins from your tsconfig.json file. For instructions, please see: [Using the workspace version of TypeScript](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript).

## Sending a Pull Request

Pull requests are actively monitored, and only need the approval of one or more core team members. We will review your pull request and either merge it, request changes to it, or close it with an explanation.

Before submitting a pull request, please take the following into consideration:

-   Fork [the repository](https://github.com/doist/typist) and create your branch from `main`;
-   Follow the [Commit Message Guidelines](#commit-message-guidelines) below;
-   Add tests for code that should be tested (like bug fixes);
-   Ensure the test suite passes with flying colours;
-   Do not override built-in validation and formatting checks.

### Commit Message Guidelines

#### Atomic Commits

If possible, make [atomic commits](https://en.wikipedia.org/wiki/Atomic_commit), which means:

-   A commit should not mix whitespace and/or code style changes with functional code changes;
-   A commit should contain exactly one self-contained functional change;
-   A commit should not create an inconsistent state (e.g., test errors, linting errors, partial fix, etc.).

#### Commit Message Format

This repository expects all commit messages to follow the [Conventional Commits Specification](https://www.conventionalcommits.org/) to automate semantic versioning and `CHANGELOG.md` generation.

As a quick summary, each commit message consists of a **header**, an **optional body**, and an **optional footer**. The header has a special format that includes a **type**, an **optional scope**, and a **description**:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Commit types, such as `feat:` or `fix:`, are the only ones that will affect versioning and `CHANGELOG.md` generation, whereas commit types such as `build:`, `chore:`, `ci:`, `docs:`, `perf:`, `refactor:`, `revert:`, `style:` and `test:` will not. They are still valid, and it would be great if you could use them when appropriate.

A commit that has the text `BREAKING CHANGE:` at the beginning of its optional body or footer section, or appends a `!` after the type/scope, introduces a breaking API change (correlating with `MAJOR` in Semantic Versioning). A breaking change can be part of commits of any _type_.

## License

By contributing to Typist, you agree that your contributions will be licensed under its [MIT license](LICENSE).

## Attribution

This document is based on [reactjs.org contributing guidelines](https://reactjs.org/docs/how-to-contribute.html).
