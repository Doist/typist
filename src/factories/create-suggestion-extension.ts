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
} from '@tiptap/suggestion'
import type { ConditionalKeys, RequireAtLeastOne } from 'type-fest'

/**
 * The properties that describe the suggestion node attributes.
 */
type SuggestionAttributes = {
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
 * The properties that describe the minimal props that an autocomplete dropdown must receive.
 */
type SuggestionRendererProps<SuggestionItemType> = {
    /**
     * The function that must be invoked when a suggestion item is selected.
     */
    command: (item: SuggestionItemType) => void

    /**
     * The list of suggestion items to be rendered by the autocomplete dropdown.
     */
    items: SuggestionItemType[]
}

/**
 * A type that describes the forwarded ref that an autocomplete dropdown must implement with
 * `useImperativeHandle` to receive `keyDown` events from the render function.
 */
type SuggestionRendererRef = {
    onKeyDown: (props: CoreSuggestionKeyDownProps) => boolean
}

/**
 * The options available to customize the extension created by the factory function.
 */
type SuggestionOptions<SuggestionItemType> = {
    /**
     * The character that triggers the autocomplete dropdown.
     */
    triggerChar: '@' | '#' | '+'

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
    renderAriaLabel?: (attrs: SuggestionAttributes) => string

    /**
     * A render function for the autocomplete dropdown.
     */
    dropdownRenderFn?: CoreSuggestionOptions<SuggestionItemType>['render']

    /**
     * The event handler that is fired when the search string has changed.
     */
    onSearchChange?: (
        query: string,
        storage: SuggestionStorage<SuggestionItemType>,
    ) => SuggestionItemType[] | Promise<SuggestionItemType[]>

    /**
     * The event handler that is fired when a suggestion item is selected.
     */
    onItemSelect?: (item: SuggestionItemType) => void
}

/**
 * The storage holding the suggestion items original array, and a collection indexed by the item id.
 */
type SuggestionStorage<SuggestionItemType> = Readonly<{
    /**
     * The original array of suggestion items.
     */
    items: SuggestionItemType[]

    /**
     * A collection of suggestion items indexed by the item id.
     */
    itemsById: { readonly [id: SuggestionAttributes['id']]: SuggestionItemType | undefined }
}>

/**
 * The return type for a suggestion extension created by the factory function.
 */
type SuggestionExtensionResult<SuggestionItemType> = Node<SuggestionOptions<SuggestionItemType>>

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
 * @param type A unique identifier for the suggestion extension type.
 * @param attributesMapping An object to map the `data-id` and `data-label` attributes with the
 * source item type properties.
 *
 * @returns A new suggestion extension tailored to a specific use case.
 */
function createSuggestionExtension<
    SuggestionItemType extends { [id: SuggestionAttributes['id']]: unknown } = SuggestionAttributes,
>(
    type: string,
    items: SuggestionItemType[] = [],

    // This type makes sure that if a generic type variable is specified, the `attributesMapping`
    // is also defined (and vice versa) along with making sure that at least one attribute is
    // specified, and that all constraints are satisfied.
    ...attributesMapping: SuggestionItemType extends SuggestionAttributes
        ? []
        : [
              RequireAtLeastOne<{
                  id: ConditionalKeys<SuggestionItemType, SuggestionAttributes['id']>
                  label: ConditionalKeys<SuggestionItemType, SuggestionAttributes['label']>
              }>,
          ]
): SuggestionExtensionResult<SuggestionItemType> {
    // Normalize the node type and add the `Suggestion` suffix so that it can be easily identified
    // when parsing the editor schema programatically (useful for Markdown/HTML serialization)
    const nodeType = `${camelCase(type)}Suggestion`

    // Normalize the node type to kebab-case to be used as a `data-*` HTML attribute
    const attributeType = kebabCase(type)

    // Get the specified attributes, if available, or use the defaults
    const idAttribute = String(attributesMapping[0]?.id ?? 'id')
    const labelAttribute = String(attributesMapping[0]?.label ?? 'label')

    // Create a personalized suggestion extension
    return Node.create<
        SuggestionOptions<SuggestionItemType>,
        SuggestionStorage<SuggestionItemType>
    >({
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
                [idAttribute]: {
                    default: null,
                    parseHTML: (element) => element.getAttribute('data-id'),
                    renderHTML: (attributes) => ({
                        'data-id': String(attributes[idAttribute]),
                    }),
                },
                [labelAttribute]: {
                    default: null,
                    parseHTML: (element: Element) => {
                        const id = String(element.getAttribute('data-id'))
                        const item = this.storage.itemsById[id]

                        // Read the latest item label from the storage, if available, otherwise
                        // fallback to the item label in the `data-label` attribute
                        return String(item?.[labelAttribute] ?? element.getAttribute('data-label'))
                    },
                    renderHTML: (attributes) => ({
                        'data-label': String(attributes[labelAttribute]),
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
                            id: String(node.attrs[idAttribute]),
                            label: String(node.attrs[labelAttribute]),
                        }),
                    },
                    HTMLAttributes,
                ),
                `${String(this.options.triggerChar)}${String(node.attrs[labelAttribute])}`,
            ]
        },
        renderText({ node }) {
            return `${String(this.options.triggerChar)}${String(node.attrs[labelAttribute])}`
        },
        addProseMirrorPlugins() {
            const {
                triggerChar,
                allowSpaces,
                allowedPrefixes,
                startOfLine,
                onSearchChange,
                onItemSelect,
                dropdownRenderFn,
            } = this.options

            return [
                TiptapSuggestion<SuggestionItemType, SuggestionItemType>({
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
                                editor.storage[nodeType] as SuggestionStorage<SuggestionItemType>,
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

                        onItemSelect?.(props)
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
