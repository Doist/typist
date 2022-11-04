/**
 * An enum-like constant for clipboard `DataTransfer.types` that are supported by the editor.
 */
const ClipboardDataType = {
    Text: 'text/plain',
    HTML: 'text/html',
    VSCode: 'vscode-editor-data',
} as const

export { ClipboardDataType }
