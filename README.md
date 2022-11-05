<div align="center">
    <h1>
        <picture>
            <source media="(prefers-color-scheme: dark)" srcSet="https://github.com/Doist/typist/blob/main/.github/assets/logo-dark.png?raw=true" />
            <img src="https://github.com/Doist/typist/blob/main/.github/assets/logo-light.png?raw=true" />
        </picture>
    </h1>
</div>

Typist is the mighty [Tiptap](https://tiptap.dev/)-based rich-text editor that powers Doist products, which can also be used for displaying content in a read-only fashion. Typist also supports a plain-text mode, and comes with HTML/Markdown serializers.

> **Note**
>
> This project is not attempting to be an all-purpose rich-text editor. Whilst everyone is welcome to fork or use this package in their own products, development decisions are centered around Doist product requirements.

<div align="center">

![GitHub: CI Validation](https://github.com/Doist/typist/actions/workflows/check-ci-validation.yml/badge.svg?branch=main)
![npm Version](https://img.shields.io/npm/v/@doist/typist)
![npm Bundle Size (minified)](https://img.shields.io/bundlephobia/min/@doist/typist)
![npm Downloads (monthly)](https://img.shields.io/npm/dm/@doist/typist?color=blue)

[![semantic-release: Conventional Commits](https://img.shields.io/badge/semantic--release-Conventional%20Commits-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![License: MIT](https://img.shields.io/github/license/doist/typist)](LICENSE.md)

</div>

## Installation

```sh
npm install --save @doist/typist
```

### Peer Dependencies

If you are using **npm 7+** and the `legacy-peer-deps` options is not enabled, peer dependencies should have been automatically installed for you with the command above. Otherwise, you can install them with:

```sh
npm info @doist/typist peerDependencies --json \
    | command sed 's/[\{\},]//g ; s/: /@/g' \
    | xargs npm install --save
```

## Usage

```tsx
import { TypistEditor, RichTextKit } from '@doist/typist'

function TypistEditorContainer({ content }) {
    return (
        <TypistEditor
            placeholder="A full rich-text editor, be creative…"
            content={content}
            extensions={[RichTextKit]}
        />
    )
}
```

If you're looking for additional documentation, in-depth examples, or a live demo, please check out our [Storybook](https://typist.doist.dev/).

## Resources

A curated list of open-source rich-text editors powered by Tiptap that we can draw inspiration from:

-   GitLab's content editor:\
    https://gitlab.com/gitlab-org/gitlab/-/tree/master/app/assets/javascripts/content_editor

## Contributing

If you're interested in contributing code and/or documentation, please read our [contributing guide](CONTRIBUTING.md).

## License

The use of this source code is governed by an MIT-style license that can be found in the [LICENSE](LICENSE) file.
