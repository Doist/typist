import { RichTextKit } from './rich-text-kit'

import type { RichTextKitOptions } from './rich-text-kit'

/**
 * Resolves the extensions that `RichTextKit` registers for a given set of options and returns their
 * names. Invokes `addExtensions()` directly (rather than instantiating an `Editor`) so the registration
 * logic can be asserted without building a ProseMirror view.
 */
function getRegisteredExtensionNames(options?: Partial<RichTextKitOptions>): string[] {
    const kit = options ? RichTextKit.configure(options) : RichTextKit
    const childExtensions =
        kit.config.addExtensions?.call({
            name: kit.name,
            options: kit.options,
            storage: kit.storage,
            parent: undefined,
        }) ?? []

    return childExtensions.map((extension) => extension.name)
}

describe('Extension: RichTextKit', () => {
    describe('PasteHTMLTableAsString registration', () => {
        test('registers native tables (not the paste-as-string fallback) by default', () => {
            const names = getRegisteredExtensionNames()

            expect(names).toContain('table')
            expect(names).not.toContain('pasteHTMLTableAsString')
        })

        test('registers the paste-as-string fallback when tables are disabled', () => {
            const names = getRegisteredExtensionNames({ table: false })

            expect(names).toContain('pasteHTMLTableAsString')
            expect(names).not.toContain('table')
        })

        test('registers the paste-as-string fallback for singleline documents', () => {
            const names = getRegisteredExtensionNames({ document: { multiline: false } })

            expect(names).toContain('pasteHTMLTableAsString')
            expect(names).not.toContain('table')
        })

        test('does not register the fallback when disabled via `pasteHTMLTableAsString: false`', () => {
            const names = getRegisteredExtensionNames({
                table: false,
                pasteHTMLTableAsString: false,
            })

            expect(names).not.toContain('pasteHTMLTableAsString')
            expect(names).not.toContain('table')
        })
    })
})
