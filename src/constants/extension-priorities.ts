/**
 * Priority for the extensions created by the suggestion extension factory function. This needs to
 * be higher than most extensions, so that event handlers from the dropdown render function can take
 * precedence over all other event handlers in the chain.
 */
const SUGGESTION_EXTENSION_PRIORITY = 1000

/**
 * Priority for the `SmartMarkdownTyping` extension. This needs to be higher than the
 * `ViewEventHandlers` extension, so that event handlers from the ProseMirror plugins built into the
 * extension can take precedence over the `ViewEventHandlers` extension event handlers.
 */
const SMART_MARKDOWN_TYPING_PRIORITY = 110

/**
 * Priority for the `PasteHTMLTableAsString` extension. This needs to be higher than most paste
 * extensions (e.g., `PasteSinglelineText`, `PasteMarkdown`, etc.), so that the extension can first
 * parse HTML tables that might exist in the clipboard data.
 */
const PASTE_EXTENSION_PRIORITY = 105

/**
 * Priority for the `ViewEventHandlers` extension. This needs to be higher than the default for most
 * of the built-in and official extensions (i.e. `100`), so that the event handlers from the
 * extension can take precedence over the built-in and official extensions event handlers.
 */
const VIEW_EVENT_HANDLERS_PRIORITY = 105

/**
 * Priority for the official `Blockquote` extension. This needs to be higher than the default for
 * most built-in and official extensions (i.e. `100`), so that the keyboard shortcut can take
 * precedence over the `Bold` extension keyboard shortcut.
 */
const BLOCKQUOTE_EXTENSION_PRIORITY = 101

/**
 * Priority for the `RichTextCode` extension. This needs to be lower than the default for most
 * built-in and official extensions (i.e. `100`), so that other marks wrap the `Code` mark, and not
 * the other way around (i.e. prevents `<code><em>code</em></code>` from happening).
 */
const CODE_EXTENSION_PRIORITY = 99

export {
    BLOCKQUOTE_EXTENSION_PRIORITY,
    CODE_EXTENSION_PRIORITY,
    PASTE_EXTENSION_PRIORITY,
    SMART_MARKDOWN_TYPING_PRIORITY,
    SUGGESTION_EXTENSION_PRIORITY,
    VIEW_EVENT_HANDLERS_PRIORITY,
}
