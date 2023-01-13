import { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react'

import { getSchema } from '@tiptap/core'
import { Placeholder } from '@tiptap/extension-placeholder'
import { EditorContent } from '@tiptap/react'

import { ExtraEditorCommands } from '../extensions/core/extra-editor-commands/extra-editor-commands'
import { ViewEventHandlers, ViewEventHandlersOptions } from '../extensions/core/view-event-handlers'
import { isMultilineDocument, isPlainTextDocument } from '../helpers/schema'
import { useEditor } from '../hooks/use-editor'
import { getHTMLSerializerInstance } from '../serializers/html/html'
import { getMarkdownSerializerInstance } from '../serializers/markdown/markdown'

import { getAllNodesAttributesByType, resolveContentSelection } from './typist-editor.helper'

import type { Editor as CoreEditor, EditorEvents, Extensions } from '@tiptap/core'
import type { Plugin, Selection } from 'prosemirror-state'

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
     * The list of required extensions to initialize the editor.
     *
     * You may consider wrapping this prop with `useMemo` to prevent unnecessary re-renders.
     */
    extensions: Extensions

    /**
     * A short hint that gives users an idea what can be entered in the editor.
     */
    placeholder?: string

    /**
     * The event handler that is fired before the editor view is created.
     *
     * You may consider wrapping this prop with `useCallback` to prevent unnecessary re-renders.
     */
    onBeforeCreate?: (props: BeforeCreateProps) => void

    /**
     * The event handler that is fired when the editor view is ready.
     *
     * You may consider wrapping this prop with `useCallback` to prevent unnecessary re-renders.
     */
    onCreate?: (props: CreateProps) => void

    /**
     * The event handler that is fired when the editor content has changed.
     *
     * You may consider wrapping this prop with `useCallback` to prevent unnecessary re-renders.
     */
    onUpdate?: (props: UpdateProps) => void

    /**
     * The event handler that is fired when the editor selection has changed.
     *
     * You may consider wrapping this prop with `useCallback` to prevent unnecessary re-renders.
     */
    onSelectionUpdate?: (props: SelectionUpdateProps) => void

    /**
     * The event handler that is fired when the editor state has changed.
     *
     * You may consider wrapping this prop with `useCallback` to prevent unnecessary re-renders.
     */
    onTransaction?: (props: TransacationProps) => void

    /**
     * The event handler that is fired when the editor view gains focus.
     *
     * You may consider wrapping this prop with `useCallback` to prevent unnecessary re-renders.
     */
    onFocus?: (props: FocusProps) => void

    /**
     * The event handler that is fired when the editor view loses focus.
     *
     * You may consider wrapping this prop with `useCallback` to prevent unnecessary re-renders.
     */
    onBlur?: (props: BlurProps) => void

    /**
     * The event handler that is fired when the editor view is being destroyed.
     *
     * You may consider wrapping this prop with `useCallback` to prevent unnecessary re-renders.
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
    const allExtensions = useMemo(
        function initializeExtensions() {
            return [
                ...(placeholder
                    ? [
                          Placeholder.configure({
                              placeholder,
                          }),
                      ]
                    : []),
                ExtraEditorCommands,
                ViewEventHandlers.configure({
                    onClick,
                    onKeyDown,
                }),
                // Always register external extensions at the end so they get a higher priority and
                // are loaded earlier (necessary to override behaviors from built-in extensions)
                ...extensions,
            ]
        },
        [extensions, onClick, onKeyDown, placeholder],
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
            return htmlSerializer.serialize(content)
        },
        [content, htmlSerializer],
    )

    const ariaAttributes = useMemo(
        function initializeAriaAttributes() {
            return {
                'aria-readonly': String(!editable),
                'aria-multiline': String(isMultilineDocument(schema)),
                ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
                ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
                ...(ariaLabelledBy ? { 'aria-labelledby': ariaLabelledBy } : {}),
            }
        },
        [ariaDescribedBy, ariaLabel, ariaLabelledBy, editable, schema],
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

            // Move the suggestion plugins to the top of the plugins list so they have a higher priority
            // than all input rules (such as the ones used for Markdown shortcuts)
            // ref: https://github.com/ueberdosis/tiptap/issues/2570
            if (view.state.plugins.length > 0) {
                const restOfPlugins: Plugin[] = []
                const suggestionPlugins: Plugin[] = []

                view.state.plugins.forEach((plugin) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore: The `Plugin` type does not include `key`
                    if ((plugin.key as string).includes('Suggestion')) {
                        suggestionPlugins.push(plugin)
                    } else {
                        restOfPlugins.push(plugin)
                    }
                })

                view.updateState(
                    view.state.reconfigure({
                        plugins: [...suggestionPlugins, ...restOfPlugins],
                    }),
                )
            }

            // Invoke the user `onCreate` handle after all internal initializations
            onCreate?.(props)
        },
        [autoFocus, contentSelection, onCreate],
    )

    const editor = useEditor(
        {
            autofocus: autoFocus ? 'end' : false,
            content: htmlContent,
            editable,
            editorProps: {
                attributes: {
                    'data-typist-editor': 'true',
                    ...(isPlainTextDocument(schema)
                        ? { 'data-plain-text': 'true' }
                        : { 'data-rich-text': 'true' }),
                    role: 'textbox',
                    ...ariaAttributes,
                },
            },
            extensions: allExtensions,
            parseOptions: {
                preserveWhitespace: isPlainTextDocument(schema),
            },
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
        },
        [
            allExtensions,
            ariaAttributes,
            autoFocus,
            editable,
            handleCreate,
            htmlContent,
            markdownSerializer,
            onBeforeCreate,
            onBlur,
            onDestroy,
            onFocus,
            onSelectionUpdate,
            onTransaction,
            onUpdate,
            schema,
        ],
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
