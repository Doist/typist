## [7.0.2](https://github.com/Doist/typist/compare/v7.0.1...v7.0.2) (2024-09-30)

### Bug Fixes

-   **deps:** update tiptap packages to v2.7.2 ([#909](https://github.com/Doist/typist/issues/909)) ([910d1e1](https://github.com/Doist/typist/commit/910d1e194b323382d47eaaf944a87d7c5ad6cefd))

## [7.0.1](https://github.com/Doist/typist/compare/v7.0.0...v7.0.1) (2024-09-19)

### Bug Fixes

-   Destroy React renderer and dropdown on Escape ([4f8d5be](https://github.com/Doist/typist/commit/4f8d5beadfd1235a8f4d4c032905ecb07fccf785))

## [7.0.0](https://github.com/Doist/typist/compare/v6.0.11...v7.0.0) (2024-08-28)

### ⚠ BREAKING CHANGES

-   Fix TypeScript types for the Suggestion plugin
    `command` function (allowing for generic override).

Although this was not causing any issues for us due to the convoluted
implementation, the same fix was recently applied to Tiptap, and this
aligns our suggestion factory function implementation with the original
one. Unfortunately, this comes as a breaking change (examples were also
updated to reflect the required changes).

Additionally, other smaller TypeScript types were refactored for
consistency and clarity, but these are safe changes.

### Code Refactoring

-   General improvements for TypeScript types ([#883](https://github.com/Doist/typist/issues/883)) ([b235eaf](https://github.com/Doist/typist/commit/b235eaf9506c5bf8ed0a94e863f9262b9735ad7e))

## [6.0.11](https://github.com/Doist/typist/compare/v6.0.10...v6.0.11) (2024-08-23)

### Bug Fixes

-   **deps:** update tiptap packages to v2.6.6 ([#882](https://github.com/Doist/typist/issues/882)) ([691e909](https://github.com/Doist/typist/commit/691e90920ed29897d66d8f54e90e8ef30129d821))

## [6.0.10](https://github.com/Doist/typist/compare/v6.0.9...v6.0.10) (2024-08-21)

### Bug Fixes

-   **deps:** update tiptap packages to v2.6.5 ([#881](https://github.com/Doist/typist/issues/881)) ([b72cf19](https://github.com/Doist/typist/commit/b72cf192cd50035a87a54ff83f194cb41b5ad700))

## [6.0.9](https://github.com/Doist/typist/compare/v6.0.8...v6.0.9) (2024-08-20)

### Bug Fixes

-   **deps:** update tiptap packages to v2.6.4 ([#875](https://github.com/Doist/typist/issues/875)) ([a28caac](https://github.com/Doist/typist/commit/a28caac30770e7062971c662c0577f78f8f8d8af))

## [6.0.8](https://github.com/Doist/typist/compare/v6.0.7...v6.0.8) (2024-08-16)

### Bug Fixes

-   Empty list items returns incorrectly formatted Markdown ([#874](https://github.com/Doist/typist/issues/874)) ([9c8bcb5](https://github.com/Doist/typist/commit/9c8bcb5e00040a24b0287a227baed27eb2ecf0d7))

## [6.0.7](https://github.com/Doist/typist/compare/v6.0.6...v6.0.7) (2024-08-14)

### Bug Fixes

-   **deps:** update tiptap packages to v2.6.2 ([#872](https://github.com/Doist/typist/issues/872)) ([f75fb41](https://github.com/Doist/typist/commit/f75fb41bc56c89f0d7218e13d28a02cda2c9b52f))

## [6.0.6](https://github.com/Doist/typist/compare/v6.0.5...v6.0.6) (2024-08-12)

### Bug Fixes

-   **deps:** update tiptap packages to v2.5.9 ([#773](https://github.com/Doist/typist/issues/773)) ([80247dd](https://github.com/Doist/typist/commit/80247ddd911131513c84f17b390091bdaffa5480))

## [6.0.5](https://github.com/Doist/typist/compare/v6.0.4...v6.0.5) (2024-08-09)

### Bug Fixes

-   **paste-markdown:** Escape backslashes before punctuation ([#866](https://github.com/Doist/typist/issues/866)) ([e7e83de](https://github.com/Doist/typist/commit/e7e83dec4f522ca14533f8ad0ffb81e8492664ff))

## [6.0.4](https://github.com/Doist/typist/compare/v6.0.3...v6.0.4) (2024-08-02)

### Bug Fixes

-   Remove `@react-hookz/web` peer dependency ([#861](https://github.com/Doist/typist/issues/861)) ([ad7644d](https://github.com/Doist/typist/commit/ad7644d0c5f33225607198b3f549a19d9632f405))

## [6.0.3](https://github.com/Doist/typist/compare/v6.0.2...v6.0.3) (2024-05-13)

### Bug Fixes

-   Check `code` mark presence instead of any mark in `canInsertSuggestion` ([#791](https://github.com/Doist/typist/issues/791)) ([2f70959](https://github.com/Doist/typist/commit/2f709597c029e1d68bf7d39fb20c8a9a17a0f800))

## [6.0.2](https://github.com/Doist/typist/compare/v6.0.1...v6.0.2) (2024-04-15)

### Bug Fixes

-   **rich-text-link:** Change `openOnClick` default to `whenNotEditable` ([#744](https://github.com/Doist/typist/issues/744)) ([db729d4](https://github.com/Doist/typist/commit/db729d48702231b78c77313510a7069d5c36fdde))

## [6.0.1](https://github.com/Doist/typist/compare/v6.0.0...v6.0.1) (2024-04-15)

### Bug Fixes

-   **deps:** update tiptap packages to v2.3.0 ([#736](https://github.com/Doist/typist/issues/736)) ([bbf77a8](https://github.com/Doist/typist/commit/bbf77a809458160d3acbfd69a61d6eb92556a4b4))

## [6.0.0](https://github.com/Doist/typist/compare/v5.0.1...v6.0.0) (2024-04-11)

### ⚠ BREAKING CHANGES

-   Use a wildcard export for ProseMirror model, state and view (#733)

### Code Refactoring

-   Use a wildcard export for ProseMirror model, state and view ([#733](https://github.com/Doist/typist/issues/733)) ([496e976](https://github.com/Doist/typist/commit/496e976553f7de235dde8c9e50e934b85fb9f217))

## [5.0.1](https://github.com/Doist/typist/compare/v5.0.0...v5.0.1) (2024-04-11)

### Bug Fixes

-   **deps:** update tiptap packages to v2.2.5 ([#732](https://github.com/Doist/typist/issues/732)) ([f1fc6d3](https://github.com/Doist/typist/commit/f1fc6d37861322f2ccceaf77d7ed6c520670418a))

## [5.0.0](https://github.com/Doist/typist/compare/v4.0.5...v5.0.0) (2024-03-20)

### ⚠ BREAKING CHANGES

-   This option was unused and was not intended for
    consumer use. However, its removal technically constitutes a breaking
    change, so we have marked it accordingly.

### Miscellaneous Chores

-   Remove unused `onImageNodeDelete` option ([#702](https://github.com/Doist/typist/issues/702)) ([ebd0678](https://github.com/Doist/typist/commit/ebd06784c14d00b748af7ad38bb030afcba41c35))

## [4.0.5](https://github.com/Doist/typist/compare/v4.0.4...v4.0.5) (2024-03-06)

### Bug Fixes

-   Prevent extra blank lines on list items ([#685](https://github.com/Doist/typist/issues/685)) ([b538ebe](https://github.com/Doist/typist/commit/b538ebef9a43d6b1af2f68efcdad445ec9e0cc17))

## [4.0.4](https://github.com/Doist/typist/compare/v4.0.3...v4.0.4) (2024-03-06)

### Bug Fixes

-   **deps:** update tiptap packages to v2.2.4 ([#660](https://github.com/Doist/typist/issues/660)) ([b603996](https://github.com/Doist/typist/commit/b603996c64b98388f43d0e7489b3fec7629b2b7d))

## [4.0.3](https://github.com/Doist/typist/compare/v4.0.2...v4.0.3) (2024-03-06)

### Bug Fixes

-   **deps:** update dependency hast-util-is-element to v3 ([#683](https://github.com/Doist/typist/issues/683)) ([97c6428](https://github.com/Doist/typist/commit/97c64288edabf924b524711d0691d7e3ecc4c25a))

## [4.0.2](https://github.com/Doist/typist/compare/v4.0.1...v4.0.2) (2024-02-08)

### Bug Fixes

-   **bold-and-italics:** Disallow only whitespace in the markdown shortcuts ([#651](https://github.com/Doist/typist/issues/651)) ([4c740dd](https://github.com/Doist/typist/commit/4c740ddedc487ad27f2fc8b56e2440913911e40f))

## [4.0.1](https://github.com/Doist/typist/compare/v4.0.0...v4.0.1) (2024-02-07)

### Bug Fixes

-   **deps:** update tiptap packages to v2.2.1 ([#643](https://github.com/Doist/typist/issues/643)) ([0abbe97](https://github.com/Doist/typist/commit/0abbe9755a9acb14ee8004202ae3f7f48ff47a0f))

## [4.0.0](https://github.com/Doist/typist/compare/v3.0.0...v4.0.0) (2024-01-30)

### ⚠ BREAKING CHANGES

-   **deps:** update unified ecosystem dependencies (#395)

### Bug Fixes

-   **deps:** update unified ecosystem dependencies ([#395](https://github.com/Doist/typist/issues/395)) ([e97ad83](https://github.com/Doist/typist/commit/e97ad83e7015cf49044bc72cf8ef6dce1be1f2c8))

## [3.0.0](https://github.com/Doist/typist/compare/v2.3.1...v3.0.0) (2024-01-18)

### ⚠ BREAKING CHANGES

-   **extensions:** The `smartToggleBulletList` and
    `smartToggleOrderedList` commands were renamed to have the same name as
    the built-in toggle functions so that they can easily be used by the
    default keyboard shortcuts without having to change the
    `addKeyboardShortcuts` function.

The `BulletList` and `OrderedList` extensions now take an additional
option, `smartToggle` (default: `false`), that indicates whether hard
breaks should be replaced by paragraphs before toggling the
selection into a bullet/ordered list, or not.

### Features

-   **extensions:** Overwrite built-in List/Ordered toggle functions with a `smartToggle` option ([#620](https://github.com/Doist/typist/issues/620)) ([059da61](https://github.com/Doist/typist/commit/059da61605370f8a3534d3c7669acbc952ea40d3))

## [2.3.1](https://github.com/Doist/typist/compare/v2.3.0...v2.3.1) (2024-01-17)

### Bug Fixes

-   **commands:** Restore built-in `toggleBulletList` and `toggleOrderedList` ([#613](https://github.com/Doist/typist/issues/613)) ([4c4a0dc](https://github.com/Doist/typist/commit/4c4a0dc98e5c7351d6a0d2e8b16661c1e8f54fdd))

## [2.3.0](https://github.com/Doist/typist/compare/v2.2.1...v2.3.0) (2024-01-17)

### Features

-   **commands:** Add `smartToggleBulletList` and `smartToggleOrderedList` ([#612](https://github.com/Doist/typist/issues/612)) ([e5dcc8b](https://github.com/Doist/typist/commit/e5dcc8b523d7596e168f919fd53d9119f7c40ac7))

## [2.2.1](https://github.com/Doist/typist/compare/v2.2.0...v2.2.1) (2024-01-11)

### Bug Fixes

-   **deps:** update tiptap packages to v2.1.13 ([#554](https://github.com/Doist/typist/issues/554)) ([e89007b](https://github.com/Doist/typist/commit/e89007b7da928c3be46f2beaef9207586c3279a4))

## [2.2.0](https://github.com/Doist/typist/compare/v2.1.3...v2.2.0) (2023-11-21)

### Features

-   add support for Node v21 ([#533](https://github.com/Doist/typist/issues/533)) ([87ca351](https://github.com/Doist/typist/commit/87ca35150b03a8a429296a3324b018e1a9121b04))

## [2.1.3](https://github.com/Doist/typist/compare/v2.1.2...v2.1.3) (2023-11-03)

### Bug Fixes

-   **deps:** update tiptap packages to v2.1.12 ([#488](https://github.com/Doist/typist/issues/488)) ([63c619c](https://github.com/Doist/typist/commit/63c619cc085ad14b3909ab6dddd929da04449ff3))

## [2.1.2](https://github.com/Doist/typist/compare/v2.1.1...v2.1.2) (2023-10-19)

### Bug Fixes

-   Change `emDelimiter` to `*` to fix having only part of word in italic ([#490](https://github.com/Doist/typist/issues/490)) ([7496ff2](https://github.com/Doist/typist/commit/7496ff2b3c42ab39a22c253b7d20cca7f19af3b2))

## [2.1.1](https://github.com/Doist/typist/compare/v2.1.0...v2.1.1) (2023-10-03)

### Bug Fixes

-   **deps:** update tiptap packages to v2.1.11 ([#462](https://github.com/Doist/typist/issues/462)) ([80d86e7](https://github.com/Doist/typist/commit/80d86e7c8bb7e7bd3605b8ea9d0ce61c1327f50e))

## [2.1.0](https://github.com/Doist/typist/compare/v2.0.3...v2.1.0) (2023-09-28)

### Features

-   add support for Node v20 and npm v10 ([#465](https://github.com/Doist/typist/issues/465)) ([8e3c1b3](https://github.com/Doist/typist/commit/8e3c1b39f1e4f4d0eabbd113998da29a52e4461f))

## [2.0.3](https://github.com/Doist/typist/compare/v2.0.2...v2.0.3) (2023-09-25)

### Bug Fixes

-   **deps:** update tiptap packages to v2.1.10 ([#447](https://github.com/Doist/typist/issues/447)) ([9ed0371](https://github.com/Doist/typist/commit/9ed037104495be1dd4886f4c4263a886be94a995))

## [2.0.2](https://github.com/Doist/typist/compare/v2.0.1...v2.0.2) (2023-09-14)

### Bug Fixes

-   Update ProseMirror imports to `@tiptap/pm/*` packages ([#443](https://github.com/Doist/typist/issues/443)) ([48e42e8](https://github.com/Doist/typist/commit/48e42e8294bce3b768313047ab8f5268ee900abb))

## [2.0.1](https://github.com/Doist/typist/compare/v2.0.0...v2.0.1) (2023-09-14)

### Bug Fixes

-   **commands:** Buggy `insertMarkdownContentAt` implementation ([#442](https://github.com/Doist/typist/issues/442)) ([b9667f9](https://github.com/Doist/typist/commit/b9667f94d726285438244db1c58662b7c04ed8be))

## [2.0.0](https://github.com/Doist/typist/compare/v1.5.0...v2.0.0) (2023-09-13)

### ⚠ BREAKING CHANGES

-   **commands:** With the introduction of `insertMarkdownContentAt`, the
    API for `insertMarkdownContent` was changed to match the Tiptap's
    implementation of `insertContent`/`insertContentAt`, which the
    `insertMarkdown*` commands draw inspiration from.

### Features

-   **commands:** Add `insertMarkdownContentAt` command ([#439](https://github.com/Doist/typist/issues/439)) ([e87b892](https://github.com/Doist/typist/commit/e87b8929c2c77f1a6fbb065d865d73d45f62134f))

## [1.5.0](https://github.com/Doist/typist/compare/v1.4.12...v1.5.0) (2023-09-12)

### Features

-   Add `createParagraphEnd` command ([#438](https://github.com/Doist/typist/issues/438)) ([28484aa](https://github.com/Doist/typist/commit/28484aa4c5bdc8b5e47f12b0d03e45dacba7b533))

## [1.4.12](https://github.com/Doist/typist/compare/v1.4.11...v1.4.12) (2023-09-08)

### Bug Fixes

-   Hyperlink a text selection when pasting a valid URL ([#435](https://github.com/Doist/typist/issues/435)) ([999455e](https://github.com/Doist/typist/commit/999455ee8bb55df9335ad9ca6e2d07b8833b4d41))

## [1.4.11](https://github.com/Doist/typist/compare/v1.4.10...v1.4.11) (2023-09-08)

### Bug Fixes

-   Remove `handlePaste` escape when clipboard holds multiple types ([#434](https://github.com/Doist/typist/issues/434)) ([4395051](https://github.com/Doist/typist/commit/43950517bcfcc1fa412e4681b4d336dd3bb3ac1b))

## [1.4.10](https://github.com/Doist/typist/compare/v1.4.9...v1.4.10) (2023-09-05)

### Bug Fixes

-   **deps:** update tiptap packages to v2.1.8 ([#427](https://github.com/Doist/typist/issues/427)) ([c3f34bb](https://github.com/Doist/typist/commit/c3f34bb31ad912b1cebc5a2a28adfaa1054492d7))

## [1.4.9](https://github.com/Doist/typist/compare/v1.4.8...v1.4.9) (2023-09-05)

### Bug Fixes

-   **rich-text-kit:** Allow the `ListKeymap` extension to be configured ([#426](https://github.com/Doist/typist/issues/426)) ([7d789bb](https://github.com/Doist/typist/commit/7d789bb8a0a4a4c55c219606e0f0c95e3698ebc7))

## [1.4.8](https://github.com/Doist/typist/compare/v1.4.7...v1.4.8) (2023-08-28)

### Bug Fixes

-   **rich-text-link:** Markdown pasting broken with conflicting `linkOnPaste` option ([#411](https://github.com/Doist/typist/issues/411)) ([2df2ba9](https://github.com/Doist/typist/commit/2df2ba94208357cbeaa3a9ac482503ac843e9b06))

## [1.4.7](https://github.com/Doist/typist/compare/v1.4.6...v1.4.7) (2023-08-24)

### Bug Fixes

-   **deps:** update tiptap packages to v2.1.7 ([#407](https://github.com/Doist/typist/issues/407)) ([0df2f58](https://github.com/Doist/typist/commit/0df2f58ee912b8447d50c63b1790c8623ccf0ab7))

## [1.4.6](https://github.com/Doist/typist/compare/v1.4.5...v1.4.6) (2023-08-24)

### Bug Fixes

-   **deps:** revert update gfm strikethrough and autolink literal packages to v1 ([#408](https://github.com/Doist/typist/issues/408)) ([c231d95](https://github.com/Doist/typist/commit/c231d95bebc9905245930de9ef874c791f74413e))

## [1.4.5](https://github.com/Doist/typist/compare/v1.4.4...v1.4.5) (2023-08-23)

### Bug Fixes

-   **deps:** update tiptap packages to v2.1.6 ([#398](https://github.com/Doist/typist/issues/398)) ([08d1f6a](https://github.com/Doist/typist/commit/08d1f6a47f788a326c46c3e5ecb7f824a8e700e6))

## [1.4.4](https://github.com/Doist/typist/compare/v1.4.3...v1.4.4) (2023-08-04)

### Bug Fixes

-   **deps:** update gfm autolink literal packages to v2 (major) ([#378](https://github.com/Doist/typist/issues/378)) ([d5b0e37](https://github.com/Doist/typist/commit/d5b0e379673e94cacb3f1e78557225f20fb9c9e6))

## [1.4.3](https://github.com/Doist/typist/compare/v1.4.2...v1.4.3) (2023-08-04)

### Bug Fixes

-   **deps:** update gfm strikethrough packages to v2 (major) ([#379](https://github.com/Doist/typist/issues/379)) ([6b99f9d](https://github.com/Doist/typist/commit/6b99f9dc3b2f77b864f31e34a12918ea21d78d90))

## [1.4.2](https://github.com/Doist/typist/compare/v1.4.1...v1.4.2) (2023-08-04)

### Bug Fixes

-   **deps:** update dependency unist-util-remove to v4 ([#380](https://github.com/Doist/typist/issues/380)) ([31d7f63](https://github.com/Doist/typist/commit/31d7f63b4d434e8ed42aa585859b646431ff1b89))

## [1.4.1](https://github.com/Doist/typist/compare/v1.4.0...v1.4.1) (2023-08-04)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.4 ([#374](https://github.com/Doist/typist/issues/374)) ([83c8049](https://github.com/Doist/typist/commit/83c80494bb76947a4080a10cef5e8df6061f2710))

## [1.4.0](https://github.com/Doist/typist/compare/v1.3.2...v1.4.0) (2023-06-20)

### Features

-   Allow all marks to coexist with the Code mark ([#309](https://github.com/Doist/typist/issues/309)) ([ac06735](https://github.com/Doist/typist/commit/ac067352d97f6c7987ae94a47855654cfbf1dda6))

## [1.3.2](https://github.com/Doist/typist/compare/v1.3.1...v1.3.2) (2023-06-19)

### Bug Fixes

-   Extra paragraph node inserted above an Horizontal Rule ([#313](https://github.com/Doist/typist/issues/313)) ([3852309](https://github.com/Doist/typist/commit/38523099af792428531162655a1aabd2bdc9b6ad))

## [1.3.1](https://github.com/Doist/typist/compare/v1.3.0...v1.3.1) (2023-06-13)

### Bug Fixes

-   Add support for literal autolinks (GFM based) ([#303](https://github.com/Doist/typist/issues/303)) ([4537091](https://github.com/Doist/typist/commit/45370914988eed1226722051f18a2fa49d9aa50f))

## [1.3.0](https://github.com/Doist/typist/compare/v1.2.9...v1.3.0) (2023-06-12)

### Features

-   Add the `PasteHTMLTableAsString` extension ([#290](https://github.com/Doist/typist/issues/290)) ([ee90014](https://github.com/Doist/typist/commit/ee90014c4c8bfa8c80b11ab5cae01ba434f942b6))

## [1.2.9](https://github.com/Doist/typist/compare/v1.2.8...v1.2.9) (2023-06-01)

### Bug Fixes

-   **html-serializer:** Don't share instances between editors ([#275](https://github.com/Doist/typist/issues/275)) ([3aba8c7](https://github.com/Doist/typist/commit/3aba8c7b00b44e22a14ea2bc6d6dcad0f4f5ed80))

## [1.2.8](https://github.com/Doist/typist/compare/v1.2.7...v1.2.8) (2023-05-30)

### Notes

-   This version was published by mistake because we were unware that a `revert:` commit would publish a new version. There's no difference between `v1.2.7` and `v1.2.8`, the distributed code is exactly the same.

## [1.2.7](https://github.com/Doist/typist/compare/v1.2.6...v1.2.7) (2023-05-22)

### Bug Fixes

-   **paste-markdown:** Incorrect paste behaviour when HTML source is VSCode ([#260](https://github.com/Doist/typist/issues/260)) ([3326796](https://github.com/Doist/typist/commit/3326796a9093a984113ac76f69bc3ec109004288))

## [1.2.6](https://github.com/Doist/typist/compare/v1.2.5...v1.2.6) (2023-04-18)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.3 ([#226](https://github.com/Doist/typist/issues/226)) ([a1953b0](https://github.com/Doist/typist/commit/a1953b087b51772f5c29671473031cb099c346e0))

## [1.2.5](https://github.com/Doist/typist/compare/v1.2.4...v1.2.5) (2023-04-10)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.2 ([#212](https://github.com/Doist/typist/issues/212)) ([200b339](https://github.com/Doist/typist/commit/200b3398c238dab66eba866a76211f715fe26fb4))

## [1.2.4](https://github.com/Doist/typist/compare/v1.2.3...v1.2.4) (2023-04-04)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.1 ([#201](https://github.com/Doist/typist/issues/201)) ([e31cb2f](https://github.com/Doist/typist/commit/e31cb2f6835a7de55340602f0f0f5d7aa86386df))

## [1.2.3](https://github.com/Doist/typist/compare/v1.2.2...v1.2.3) (2023-04-04)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.0 ([#198](https://github.com/Doist/typist/issues/198)) ([fe4aa82](https://github.com/Doist/typist/commit/fe4aa82d9e9116e09fef285021fc7386782b9daf))

## [1.2.2](https://github.com/Doist/typist/compare/v1.2.1...v1.2.2) (2023-04-02)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.0-rc.2 ([#195](https://github.com/Doist/typist/issues/195)) ([8753f13](https://github.com/Doist/typist/commit/8753f137f4a1c2c0598c0cc98ace29754d971327))

## [1.2.1](https://github.com/Doist/typist/compare/v1.2.0...v1.2.1) (2023-04-01)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.0-rc.1 ([#192](https://github.com/Doist/typist/issues/192)) ([26d090a](https://github.com/Doist/typist/commit/26d090a8a0c93a0795f0714392129aacc30c72b6))

## [1.2.0](https://github.com/Doist/typist/compare/v1.1.2...v1.2.0) (2023-03-17)

### Features

-   **serializers:** Add `get*` functions for reusable singular instances ([#88](https://github.com/Doist/typist/issues/88)) ([b2c77c3](https://github.com/Doist/typist/commit/b2c77c30b15cd3dd676fc01531ecbeb5a6f7b952))

## [1.1.2](https://github.com/Doist/typist/compare/v1.1.1...v1.1.2) (2023-03-06)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.0-beta.220 ([#158](https://github.com/Doist/typist/issues/158)) ([c7fc3d8](https://github.com/Doist/typist/commit/c7fc3d8885e962bd33dc30172206309fbeb4eda4))

## [1.1.1](https://github.com/Doist/typist/compare/v1.1.0...v1.1.1) (2023-03-03)

### Bug Fixes

-   Invalid `hasCodeMarkBefore` check in `canInsertSuggestion` utility function ([#156](https://github.com/Doist/typist/issues/156)) ([21826c5](https://github.com/Doist/typist/commit/21826c58f763d020d3810fe373ab2524e0f0448e))

## [1.1.0](https://github.com/Doist/typist/compare/v1.0.19...v1.1.0) (2023-03-02)

### Features

-   Disallow suggestions inside inline code marks and code blocks ([#154](https://github.com/Doist/typist/issues/154)) ([7d75314](https://github.com/Doist/typist/commit/7d75314b80ef66383c24b06022c47e25d01425f6))

## [1.0.19](https://github.com/Doist/typist/compare/v1.0.18...v1.0.19) (2023-02-23)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.0-beta.218 ([#148](https://github.com/Doist/typist/issues/148)) ([0e9e179](https://github.com/Doist/typist/commit/0e9e179535c2339cc86137ebedf4d2d6cb79b324))

## [1.0.18](https://github.com/Doist/typist/compare/v1.0.17...v1.0.18) (2023-02-23)

### Bug Fixes

-   **deps:** Migrate ProseMirror dependencies to `@tiptap/pm` package ([#151](https://github.com/Doist/typist/issues/151)) ([d2a8eae](https://github.com/Doist/typist/commit/d2a8eaefa0dc57579aa97f170e37dae17c77590d))

## [1.0.17](https://github.com/Doist/typist/compare/v1.0.16...v1.0.17) (2023-02-23)

### Bug Fixes

-   **markdown-serializer:** Override Turndown escaping behaviour with custom rules ([#102](https://github.com/Doist/typist/issues/102)) ([6950afb](https://github.com/Doist/typist/commit/6950afb61bd22a3b029e7f688f5e704402290e5a))

## [1.0.16](https://github.com/Doist/typist/compare/v1.0.15...v1.0.16) (2023-02-22)

### Bug Fixes

-   Replace usage of useEvent with useCallback ([#98](https://github.com/Doist/typist/issues/98)) ([3b175f7](https://github.com/Doist/typist/commit/3b175f77cf0fa638a8ad267959ab720d24815fdd))

## [1.0.15](https://github.com/Doist/typist/compare/v1.0.14...v1.0.15) (2023-02-14)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.0-beta.217 ([#136](https://github.com/Doist/typist/issues/136)) ([eebba15](https://github.com/Doist/typist/commit/eebba150de5f8a972c99a31b77b52af672169a94))

## [1.0.14](https://github.com/Doist/typist/compare/v1.0.13...v1.0.14) (2023-02-13)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.0-beta.216 ([#135](https://github.com/Doist/typist/issues/135)) ([3d31a2e](https://github.com/Doist/typist/commit/3d31a2e2b783c91b9e8858b2234c7ac7f0f0e0a7))

## [1.0.13](https://github.com/Doist/typist/compare/v1.0.12...v1.0.13) (2023-02-13)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.0-beta.215 ([#129](https://github.com/Doist/typist/issues/129)) ([af22d22](https://github.com/Doist/typist/commit/af22d22eff6531c11114cb3122daa184657e504e))

## [1.0.12](https://github.com/Doist/typist/compare/v1.0.11...v1.0.12) (2023-01-06)

### Bug Fixes

-   **html-serializer:** Disables tokenizers if marks/nodes are not found in the editor schema ([#86](https://github.com/Doist/typist/issues/86)) ([0ed4a9b](https://github.com/Doist/typist/commit/0ed4a9b694d2b7dcfadce0c5aa3fdefec6d492c5))

## [1.0.11](https://github.com/Doist/typist/compare/v1.0.10...v1.0.11) (2022-12-21)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.0-beta.209 ([#75](https://github.com/Doist/typist/issues/75)) ([97a41c5](https://github.com/Doist/typist/commit/97a41c58254a06ebf72ea7b2440eb04ca0cda51a))

## [1.0.10](https://github.com/Doist/typist/compare/v1.0.9...v1.0.10) (2022-12-19)

### Bug Fixes

-   Add required ProseMirror dependencies to package ([#73](https://github.com/Doist/typist/issues/73)) ([cd605c0](https://github.com/Doist/typist/commit/cd605c0606a980516e586f3a6d0915f2c13704a9))

## [1.0.9](https://github.com/Doist/typist/compare/v1.0.8...v1.0.9) (2022-12-19)

### Bug Fixes

-   **rich-text-link:** More lenient regex for input/paste rule ([#72](https://github.com/Doist/typist/issues/72)) ([98e363f](https://github.com/Doist/typist/commit/98e363f27e6e403a775ca8fe729ce17dbdf721df))

## [1.0.8](https://github.com/Doist/typist/compare/v1.0.7...v1.0.8) (2022-12-19)

### Bug Fixes

-   **factories:** Allow alphanumeric IDs for suggestion nodes in `createSuggestionExtension` ([#66](https://github.com/Doist/typist/issues/66)) ([a1726a6](https://github.com/Doist/typist/commit/a1726a6be089e3e1452def641dfcfc622ac3e942))

## [1.0.7](https://github.com/Doist/typist/compare/v1.0.6...v1.0.7) (2022-12-14)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.0-beta.207 ([#63](https://github.com/Doist/typist/issues/63)) ([da9889f](https://github.com/Doist/typist/commit/da9889faa3224fcca3b23f05178dca24d30d96d5))

## [1.0.6](https://github.com/Doist/typist/compare/v1.0.5...v1.0.6) (2022-12-13)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.0-beta.206 ([#59](https://github.com/Doist/typist/issues/59)) ([27e0f26](https://github.com/Doist/typist/commit/27e0f26df4b5f4c4dd4c0e577bd1e5f3f5da2fc6))

## [1.0.5](https://github.com/Doist/typist/compare/v1.0.4...v1.0.5) (2022-12-12)

### Bug Fixes

-   Remove unused Tippy.js peer dependency ([#56](https://github.com/Doist/typist/issues/56)) ([85f87a5](https://github.com/Doist/typist/commit/85f87a554db37e331797563c3795180e5e11ddf7))

## [1.0.4](https://github.com/Doist/typist/compare/v1.0.3...v1.0.4) (2022-12-12)

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.0-beta.205 ([#54](https://github.com/Doist/typist/issues/54)) ([2074402](https://github.com/Doist/typist/commit/20744024bda8e4e3263e87dda7a53cca94265407))

## [1.0.3](https://github.com/Doist/typist/compare/v1.0.2...v1.0.3) (2022-12-08)

### Bug Fixes

-   **docs:** correct the render function name ([#50](https://github.com/Doist/typist/issues/50)) ([45dd681](https://github.com/Doist/typist/commit/45dd681c761c1189df740f118d4293d30807a2f7))

## [1.0.2](https://github.com/Doist/typist/compare/v1.0.1...v1.0.2) (2022-12-02)

### Bug Fixes

-   `insertMarkdownContent` didn't insert Markdown correctly in plain-text documents ([#13](https://github.com/Doist/typist/issues/13)) ([74cc623](https://github.com/Doist/typist/commit/74cc6233edb0a0ffb46d3a5786b310c2b59ae3c5))
-   **deps:** update dependency prosemirror-codemark to v0.4.2 ([#34](https://github.com/Doist/typist/issues/34)) ([58938a1](https://github.com/Doist/typist/commit/58938a170e680c4803558ad6f67c7d1f9617c42e))
-   **deps:** update dependency prosemirror-model to v1.18.2 ([#25](https://github.com/Doist/typist/issues/25)) ([5d1fc1b](https://github.com/Doist/typist/commit/5d1fc1b7d313a6e2828992dc4a9251f8bdb9fe0c))
-   **deps:** update dependency prosemirror-model to v1.18.3 ([#30](https://github.com/Doist/typist/issues/30)) ([54bfd56](https://github.com/Doist/typist/commit/54bfd569d2de8929da4546a411b1dfe5c9215f3a))
-   **deps:** update dependency prosemirror-view to v1.29.1 ([#26](https://github.com/Doist/typist/issues/26)) ([9f86a5e](https://github.com/Doist/typist/commit/9f86a5e5cfe2afbe51c493a05c21306fb85d7807))
-   **deps:** update tiptap packages to v2.0.0-beta.202 ([#9](https://github.com/Doist/typist/issues/9)) ([ce43f74](https://github.com/Doist/typist/commit/ce43f744f98b25e1dd6b28bac1baca3c4a0449c4))
-   **deps:** update tiptap packages to v2.0.0-beta.203 ([#35](https://github.com/Doist/typist/issues/35)) ([2188bc6](https://github.com/Doist/typist/commit/2188bc60012822782b7425e5aa971381a6eeacb3))
-   **deps:** update tiptap packages to v2.0.0-beta.204 ([#38](https://github.com/Doist/typist/issues/38)) ([cb5b359](https://github.com/Doist/typist/commit/cb5b35921dac5a5ac40e46948961079ca683eb54))

## [1.0.1](https://github.com/Doist/typist/compare/v1.0.0...v1.0.1) (2022-11-08)

### Bug Fixes

-   Add support for query params in `RichTextLink` extension ([#4](https://github.com/Doist/typist/issues/4)) ([9fac158](https://github.com/Doist/typist/commit/9fac158365f1dcdac0cad8bcf76ec59f276710a8))

## 1.0.0 (2022-11-04)

### Features

-   Initial Typist implementation ([19451ab](https://github.com/Doist/typist/commit/19451ab9eb66de1399585d9a2e06141096d690c4))

### Bug Fixes

-   **deps:** update tiptap packages to v2.0.0-beta.200 ([#3](https://github.com/Doist/typist/issues/3)) ([6e977a9](https://github.com/Doist/typist/commit/6e977a9ee5f687700d2868a834b8d20068c15e3e))
