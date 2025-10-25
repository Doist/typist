import { mergeAttributes, Node } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import { Suggestion as TiptapSuggestion } from '@tiptap/suggestion'
import { camelCase, kebabCase } from 'lodash-es'

import { SUGGESTION_EXTENSION_PRIORITY } from '../constants/extension-priorities'
import { canInsertNodeAt } from '../utilities/can-insert-node-at'
import { canInsertSuggestion } from '../utilities/can-insert-suggestion'

import type {
    SuggestionKeyDownProps as CoreSuggestionKeyDownProps,
    SuggestionOptions as CoreSuggestionOptions,
    SuggestionProps as CoreSuggestionProps,
} from '@tiptap/suggestion'
import type { ConditionalKeys, RequireAtLeastOne } from 'type-fest'

/**
 * A type that describes the suggestion node attributes.
 */
type SuggestionNodeAttributes = {
    /**
     * The suggestion node unique identifier to be rendered by the editor as a `data-id` attribute.
     */
    id: number | string

    /**
     * The suggestion node label to be rendered by the editor as a `data-label` attribute and the
     * display text itself.
     */
    label: string
}

/**
 * A type that describes the minimal props that an autocomplete dropdown must receive.
 */
type SuggestionRendererProps<TSuggestionItem> = {
    /**
     * The list of suggestion items to be rendered by the autocomplete dropdown.
     */
    items: CoreSuggestionProps<TSuggestionItem>['items']

    /**
     * The function that must be invoked when a suggestion item is selected.
     */
    command: CoreSuggestionProps<TSuggestionItem, SuggestionNodeAttributes>['command']
}

/**
 * A type that describes the forwarded ref that an autocomplete dropdown must implement with
 * `useImperativeHandle` to handle `keydown` events in the dropdown render function.
 */
type SuggestionRendererRef = {
    onKeyDown: (props: CoreSuggestionKeyDownProps) => boolean
}

/**
 * The options available to customize the extension created by the factory function.
 */
type SuggestionOptions<TSuggestionItem> = {
    /**
     * The character that triggers the autocomplete dropdown.
     */
    triggerChar: string

    /**
     * Allows or disallows spaces in suggested items.
     */
    allowSpaces: CoreSuggestionOptions['allowSpaces']

    /**
     * The prefix characters that are allowed to trigger a suggestion.
     */
    allowedPrefixes: CoreSuggestionOptions['allowedPrefixes']

    /**
     * Trigger the autocomplete dropdown at the start of a line only.
     */
    startOfLine: CoreSuggestionOptions['startOfLine']

    /**
     * Define how the suggestion item `aria-label` attribute should be rendered.
     */
    renderAriaLabel?: (attrs: SuggestionNodeAttributes) => string

    /**
     * A render function for the autocomplete dropdown.
     */
    dropdownRenderFn?: CoreSuggestionOptions<TSuggestionItem>['render']

    /**
     * The event handler that is fired when the search string has changed.
     */
    onSearchChange?: (
        query: string,
        storage: SuggestionStorage<TSuggestionItem>,
    ) => TSuggestionItem[] | Promise<TSuggestionItem[]>

    /**
     * The event handler that is fired when a suggestion item is selected.
     */
    onItemSelect?: (item: TSuggestionItem) => void
}

/**
 * The storage holding the suggestion items original array, and a collection indexed by the item id.
 */
type SuggestionStorage<TSuggestionItem> = Readonly<{
    /**
     * The original array of suggestion items.
     */
    items: TSuggestionItem[]

    /**
     * A collection of suggestion items indexed by the item id.
     */
    itemsById: { readonly [id: SuggestionNodeAttributes['id']]: TSuggestionItem | undefined }
}>

/**
 * The return type for a suggestion extension created by the factory function.
 */
type SuggestionExtensionResult<TSuggestionItem> = Node<SuggestionOptions<TSuggestionItem>>

/**
 * A factory function responsible for creating different types of suggestion extensions with
 * flexibility and customizability in mind.
 *
 * Extensions created by this factory function render editor nodes with internal `data-id` and
 * `data-label` attributes (as a way to save and restore the editor nodes data) based on properties
 * of the same name (minus the `data-` prefix) from the source item type. However, in the event of
 * unmatched properties between the internal attributes and the source item type, you should
 * specify the source item type, and use the optional `attributesMapping` option to map the
 * source properties to the internal `data-id` and `data-label` attributes.
 *
 * This factory function also stores the suggestion items internally in the editor storage (as-is,
 * and indexed by an identifier), as a way to make sure that if a previously referenced suggestion
 * changes its label, the editor will always render the most up-to-date label for the suggestion by
 * reading it from the storage. An example use case for this is when a user mention is added to the
 * editor, and the user changed its name afterwards, the editor will always render the most
 * up-to-date user name for the mention.
 *
 * @param type A unique identifier for the suggestion extension type.
 * @param items An array of suggestion items to be stored in the editor storage.
 * @param attributesMapping An object to map the `data-id` and `data-label` attributes with the
 * source item type properties.
 *
 * @returns A new suggestion extension tailored to a specific use case.
 */
function createSuggestionExtension<
    TSuggestionItem extends {
        [id: SuggestionNodeAttributes['id']]: unknown
    } = SuggestionNodeAttributes,
>(
    type: string,
    items: TSuggestionItem[] = [],

    // This type makes sure that if a generic type variable is specified, the `attributesMapping`
    // is also defined (and vice versa) along with making sure that at least one attribute is
    // specified, and that all constraints are satisfied.
    ...attributesMapping: TSuggestionItem extends SuggestionNodeAttributes
        ? []
        : [
              RequireAtLeastOne<{
                  id: ConditionalKeys<TSuggestionItem, SuggestionNodeAttributes['id']>
                  label: ConditionalKeys<TSuggestionItem, SuggestionNodeAttributes['label']>
              }>,
          ]
): SuggestionExtensionResult<TSuggestionItem> {
    // Normalize the node type and add the `Suggestion` suffix so that it can be easily identified
    // when parsing the editor schema programatically (useful for Markdown/HTML serialization)
    const nodeType = `${camelCase(type)}Suggestion`

    // Normalize the node type to kebab-case to be used as a `data-*` HTML attribute
    const attributeType = kebabCase(type)

    // Get the specified attributes, if available, or use the defaults
    const idAttribute = String(attributesMapping[0]?.id ?? 'id')
    const labelAttribute = String(attributesMapping[0]?.label ?? 'label')

    // Create a personalized suggestion extension
    return Node.create<SuggestionOptions<TSuggestionItem>, SuggestionStorage<TSuggestionItem>>({
        name: nodeType,
        priority: SUGGESTION_EXTENSION_PRIORITY,
        inline: true,
        group: 'inline',
        selectable: false,
        atom: true,
        addOptions() {
            return {
                triggerChar: '@',
                // Disable option by default until the following Tiptap issue is fixed:
                // https://github.com/ueberdosis/tiptap/issues/2159
                allowSpaces: false,
                allowedPrefixes: [' '],
                startOfLine: false,
            }
        },
        addStorage() {
            return {
                items,
                itemsById: items.reduce(
                    (acc, item) => ({ ...acc, [String(item[idAttribute])]: item }),
                    {},
                ),
            }
        },
        addAttributes() {
            return {
                id: {
                    default: null,
                    parseHTML: (element) => element.getAttribute('data-id'),
                    renderHTML: (attributes) => ({
                        'data-id': String(attributes.id),
                    }),
                },
                label: {
                    default: null,
                    parseHTML: (element: Element) => {
                        const id = String(element.getAttribute('data-id'))
                        const item = this.storage.itemsById[id]

                        // Attempt to read the item label from the storage first (as a way to make
                        // sure that a previously referenced suggestion always renders the most
                        // up-to-date label for the suggestion), and fallback to the `data-label`
                        // attribute if the item is not found in the storage
                        const labelValue =
                            item?.[labelAttribute] ?? element.getAttribute('data-label')
                        return typeof labelValue === 'string' ? labelValue : ''
                    },
                    renderHTML: (attributes) => ({
                        'data-label': String(attributes.label),
                    }),
                },
            }
        },
        parseHTML() {
            return [{ tag: `span[data-${attributeType}]` }]
        },
        renderHTML({ node, HTMLAttributes }) {
            return [
                'span',
                mergeAttributes(
                    {
                        [`data-${attributeType}`]: '',
                        'aria-label': this.options.renderAriaLabel?.({
                            id: String(node.attrs.id),
                            label: String(node.attrs.label),
                        }),
                    },
                    HTMLAttributes,
                ),
                `${String(this.options.triggerChar)}${String(node.attrs.label)}`,
            ]
        },
        renderText({ node }) {
            return `${String(this.options.triggerChar)}${String(node.attrs.label)}`
        },
        addProseMirrorPlugins() {
            const {
                options: {
                    triggerChar,
                    allowSpaces,
                    allowedPrefixes,
                    startOfLine,
                    onSearchChange,
                    onItemSelect,
                    dropdownRenderFn,
                },
                storage,
            } = this

            return [
                TiptapSuggestion<TSuggestionItem, SuggestionNodeAttributes>({
                    pluginKey: new PluginKey(nodeType),
                    editor: this.editor,
                    char: triggerChar,
                    allowedPrefixes,
                    allowSpaces,
                    startOfLine,
                    items({ query, editor }) {
                        return (
                            onSearchChange?.(
                                query,
                                editor.storage[nodeType] as SuggestionStorage<TSuggestionItem>,
                            ) || []
                        )
                    },
                    allow({ editor, range, state }) {
                        return (
                            canInsertNodeAt({ editor, nodeType, range }) &&
                            canInsertSuggestion({ editor, state })
                        )
                    },
                    command({ editor, range, props }) {
                        const nodeAfter = editor.view.state.selection.$to.nodeAfter
                        const overrideSpace = nodeAfter?.text?.startsWith(' ')

                        if (overrideSpace) {
                            range.to += 1
                        }

                        editor
                            .chain()
                            .focus()
                            .insertContentAt(range, [
                                {
                                    type: nodeType,
                                    attrs: props,
                                },
                                {
                                    type: 'text',
                                    text: ' ',
                                },
                            ])
                            .run()

                        const item = storage.itemsById[props.id]

                        if (item) {
                            onItemSelect?.(item)
                        }
                    },
                    render: dropdownRenderFn,
                }),
            ]
        },
    })
}

export { createSuggestionExtension }

export type {
    SuggestionExtensionResult,
    SuggestionOptions,
    SuggestionRendererProps,
    SuggestionRendererRef,
    SuggestionStorage,
}
