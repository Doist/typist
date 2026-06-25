import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react'

import { getSchema } from '@tiptap/core'
import { Placeholder } from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'

import { ExtraEditorCommands } from '../extensions/core/extra-editor-commands/extra-editor-commands'
import { ViewEventHandlers, ViewEventHandlersOptions } from '../extensions/core/view-event-handlers'
import { isMultilineDocument, isPlainTextDocument } from '../helpers/schema'
import { getHTMLSerializerInstance } from '../serializers/html/html'
import { getMarkdownSerializerInstance } from '../serializers/markdown/markdown'

import { getAllNodesAttributesByType, resolveContentSelection } from './typist-editor.helper'

import type { Editor as CoreEditor, EditorEvents, Extensions } from '@tiptap/core'
import type { Selection } from '@tiptap/pm/state'

/**
 * The forwarded ref that describes the helper methods that the `TypistEditor` parent component
 * will have access to.
 */
type TypistEditorRef = {
    /**
     * Returns the `Editor` instance associated to the `TypistEditor` component.
     */
    getEditor: () => CoreEditor

    /**
     * Returns the current editor document output as Markdown.
     */
    getMarkdown: () => string

    /**
     * Returns the attributes of a given node type for all the nodes in the editor document.
     */
    getAllNodesAttributesByType: (
        nodeType: string,
    ) => ReturnType<typeof getAllNodesAttributesByType>
}

/**
 * The properties that describe the `beforeCreate` editor event.
 */
type BeforeCreateProps = EditorEvents['beforeCreate']

/**
 * The properties that describe the `create` editor event.
 */
type CreateProps = EditorEvents['create']

/**
 * The properties that describe the `update` editor event.
 */
type UpdateProps = EditorEvents['update'] & Pick<TypistEditorRef, 'getMarkdown'>

/**
 * The properties that describe the `selectionUpdate` editor event.
 */
type SelectionUpdateProps = EditorEvents['selectionUpdate']

/**
 * The properties that describe the `transaction` editor event.
 */
type TransacationProps = EditorEvents['transaction']

/**
 * The properties that describe the `focus` editor event.
 */
type FocusProps = EditorEvents['focus']

/**
 * The properties that describe the `blur` editor event.
 */
type BlurProps = EditorEvents['blur']

/**
 * The properties that describe the `destroy` editor event.
 */
type DestroyProps = EditorEvents['destroy']

/**
 * The properties available to represent an instance of the `TypistEditor` component, including
 * the supported WAI-ARIA 1.1 attributes.
 */
type TypistEditorProps = {
    /**
     * Auto focus the editor to the end of the document on initialization.
     */
    autoFocus?: boolean

    /**
     * The CSS class for the container surrounding the editor DOM element.
     */
    className?: string

    /**
     * The initial Markdown content for the editor.
     *
     * This value is only used when the editor is first mounted, subsequent changes to this prop are
     * ignored. Use `editor.commands.setContent()` to update content at runtime.
     */
    content?: string

    /**
     * The initial content selection (only applied if `autoFocus` is `true`).
     */
    contentSelection?: Selection

    /**
     * Determines if users can write into the editor.
     */
    editable?: boolean

    /**
     * The list of extensions to initialize the editor with.
     *
     * This value is only used when the editor is first mounted, subsequent changes to this prop are
     * ignored. Extensions that depend on data that changes over time should read the current value
     * at the moment it's needed from a mutable source you update from outside (a ref or a store),
     * rather than capturing the value when the extension is created.
     */
    extensions: Extensions

    /**
     * A short hint that gives users an idea what can be entered in the editor.
     *
     * This value is only used when the editor is first mounted, subsequent changes to this prop are
     * ignored.
     */
    placeholder?: string

    /**
     * The event handler that is fired before the editor view is created.
     */
    onBeforeCreate?: (props: BeforeCreateProps) => void

    /**
     * The event handler that is fired when the editor view is ready.
     */
    onCreate?: (props: CreateProps) => void

    /**
     * The event handler that is fired when the editor content has changed.
     */
    onUpdate?: (props: UpdateProps) => void

    /**
     * The event handler that is fired when the editor selection has changed.
     */
    onSelectionUpdate?: (props: SelectionUpdateProps) => void

    /**
     * The event handler that is fired when the editor state has changed.
     */
    onTransaction?: (props: TransacationProps) => void

    /**
     * The event handler that is fired when the editor view gains focus.
     */
    onFocus?: (props: FocusProps) => void

    /**
     * The event handler that is fired when the editor view loses focus.
     */
    onBlur?: (props: BlurProps) => void

    /**
     * The event handler that is fired when the editor view is being destroyed.
     */
    onDestroy?: (props: DestroyProps) => void

    /**
     * Identifies the element (or elements) that describes the object.
     *
     * @see aria-labelledby
     */
    'aria-describedby'?: React.AriaAttributes['aria-describedby']

    /**
     * Defines a string value that labels the current element.
     *
     * @see aria-labelledby.
     */
    'aria-label'?: React.AriaAttributes['aria-label']

    /**
     * Identifies the element (or elements) that labels the current element.
     *
     * @see aria-describedby.
     */
    'aria-labelledby'?: React.AriaAttributes['aria-labelledby']

    /**
     * The event handler that processes `click` events in the editor.
     */
    onClick?: ViewEventHandlersOptions['onClick']

    /**
     * The event handler that processes `keydown` events in the editor.
     */
    onKeyDown?: ViewEventHandlersOptions['onKeyDown']
}

/**
 * The `TypistEditor` component represents a plain-text or a rich-text editing control, built on
 * top of the amazing [Tiptap](https://tiptap.dev/) library.
 */
const TypistEditor = forwardRef<TypistEditorRef, TypistEditorProps>(function TypistEditor(
    {
        autoFocus,
        className,
        content = '',
        contentSelection,
        editable = true,
        extensions,
        placeholder,
        onBeforeCreate,
        onCreate,
        onUpdate,
        onSelectionUpdate,
        onTransaction,
        onFocus,
        onBlur,
        onDestroy,
        'aria-describedby': ariaDescribedBy,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledBy,
        onClick,
        onKeyDown,
    },
    ref,
) {
    // Extensions and content are captured once at mount. Subsequent changes to these props are
    // ignored because recreating the editor is expensive and unnecessary for runtime updates.
    // Use `editor.commands.setContent()` to update content, and design extensions to handle
    // dynamic data internally (e.g., via stores or refs) rather than requiring reconfiguration.
    const [initialExtensions] = useState(() => extensions)
    const [initialContent] = useState(() => content)
    const [initialPlaceholder] = useState(() => placeholder)

    // Capture the initial click and keydown handlers so they are configured on the extension from
    // the first render. Unlike content and extensions, they stay reactive, so later changes are
    // synced at runtime.
    const [initialOnClick] = useState(() => onClick)
    const [initialOnKeyDown] = useState(() => onKeyDown)

    const allExtensions = useMemo(
        function initializeExtensions() {
            return [
                ...(initialPlaceholder
                    ? [
                          Placeholder.configure({
                              placeholder: initialPlaceholder,
                          }),
                      ]
                    : []),
                ExtraEditorCommands,
                ViewEventHandlers.configure({
                    onClick: initialOnClick,
                    onKeyDown: initialOnKeyDown,
                }),
                // Always register external extensions at the end so they get a higher priority and
                // are loaded earlier (necessary to override behaviors from built-in extensions)
                ...initialExtensions,
            ]
        },
        [initialExtensions, initialPlaceholder, initialOnClick, initialOnKeyDown],
    )

    const schema = useMemo(
        function generateProseMirrorSchema() {
            return getSchema(allExtensions)
        },
        [allExtensions],
    )

    const htmlSerializer = useMemo(
        function initializeHTMLSerializer() {
            return getHTMLSerializerInstance(schema)
        },
        [schema],
    )

    const markdownSerializer = useMemo(
        function initializeMarkdownSerializer() {
            return getMarkdownSerializerInstance(schema)
        },
        [schema],
    )

    const htmlContent = useMemo(
        function generateHTMLContent() {
            return htmlSerializer.serialize(initialContent)
        },
        [initialContent, htmlSerializer],
    )

    const handleCreate = useCallback(
        function handleCreate(props: CreateProps) {
            const { view } = props.editor

            // Apply a selection to the document if one was given and `autoFocus` is `true`
            if (autoFocus && contentSelection) {
                view.dispatch(
                    view.state.tr
                        .setSelection(resolveContentSelection(view.state.doc, contentSelection))
                        .scrollIntoView(),
                )
            }

            // Invoke the user `onCreate` handle after all internal initializations
            onCreate?.(props)
        },
        [autoFocus, contentSelection, onCreate],
    )

    // Keep these option objects memoized so they preserve a stable reference across renders. The
    // built-in `useEditor` compares options by reference and reconfigures the editor in place when
    // they differ, so passing inline objects would trigger that work on every parent re-render.
    const editorProps = useMemo(
        function initializeEditorProps() {
            return {
                attributes: {
                    'data-typist-editor': 'true',
                    ...(isPlainTextDocument(schema)
                        ? { 'data-plain-text': 'true' }
                        : { 'data-rich-text': 'true' }),
                    'aria-readonly': String(!editable),
                    'aria-multiline': String(isMultilineDocument(schema)),
                    ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
                    ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
                    ...(ariaLabelledBy ? { 'aria-labelledby': ariaLabelledBy } : {}),
                    role: 'textbox',
                },
            }
        },
        [schema, editable, ariaDescribedBy, ariaLabel, ariaLabelledBy],
    )

    const parseOptions = useMemo(
        function initializeParseOptions() {
            return {
                preserveWhitespace: isPlainTextDocument(schema),
            }
        },
        [schema],
    )

    const editor = useEditor({
        autofocus: autoFocus ? 'end' : false,
        content: htmlContent,
        editable,
        editorProps,
        extensions: allExtensions,
        parseOptions,

        // Tiptap's `useEditor` returns `null` by default on the first render to support SSR.
        // Typist has no need for SSR, so we opt into immediate rendering to guarantee a
        // non-null editor instance from the first render.
        immediatelyRender: true,

        // Opt-out of the legacy behavior that re-renders the component on every ProseMirror
        // transaction (e.g. keystrokes, selection changes). Typist doesn't read reactive editor
        // state during render, so these re-renders would be wasteful. Consumers that need
        // reactive state (e.g. toolbars) should subscribe directly via `useSyncExternalStore`.
        shouldRerenderOnTransaction: false,

        ...(onBeforeCreate ? { onBeforeCreate } : {}),
        onCreate: handleCreate,
        ...(onUpdate
            ? {
                  onUpdate(props) {
                      onUpdate({
                          ...props,
                          getMarkdown() {
                              return markdownSerializer.serialize(props.editor.getHTML())
                          },
                      })
                  },
              }
            : {}),
        ...(onSelectionUpdate ? { onSelectionUpdate } : {}),
        ...(onTransaction ? { onTransaction } : {}),
        ...(onFocus ? { onFocus } : {}),
        ...(onBlur ? { onBlur } : {}),
        ...(onDestroy ? { onDestroy } : {}),
    })

    // Sync editability in a layout effect so it applies before the browser paints, closing the gap
    // where a read-only editor could still process a queued keystroke or paste
    useLayoutEffect(
        function syncEditableState() {
            // On mount the editor already has the correct editability, so this guard skips setting
            // it again. The redundant call would emit an update event before the editor finishes
            // initializing (a tick later), breaking extensions that initialize with it.
            if (editor.isEditable !== editable) {
                editor.setEditable(editable)
            }
        },
        [editor, editable],
    )

    // The editor is created once, so push the latest handlers into the extension as they change
    useEffect(
        function syncViewEventHandlers() {
            editor.commands.setViewEventHandlers({ onClick, onKeyDown })
        },
        [editor, onClick, onKeyDown],
    )

    useImperativeHandle(
        ref,
        function exposeHelperFunctionsToParent() {
            return {
                getEditor() {
                    return editor
                },
                getMarkdown() {
                    return markdownSerializer.serialize(editor.getHTML())
                },
                getAllNodesAttributesByType(nodeType) {
                    return getAllNodesAttributesByType(editor.state.doc, nodeType)
                },
            }
        },
        [editor, markdownSerializer],
    )

    return <EditorContent className={className} editor={editor} />
})

export { TypistEditor }

export type {
    BeforeCreateProps,
    BlurProps,
    CreateProps,
    DestroyProps,
    FocusProps,
    SelectionUpdateProps,
    TransacationProps,
    TypistEditorProps,
    TypistEditorRef,
    UpdateProps,
}
