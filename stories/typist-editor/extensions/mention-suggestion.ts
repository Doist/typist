import { action } from '@storybook/addon-actions'
import tippy from 'tippy.js'

import { createSuggestionExtension, ReactRenderer } from '../../../src'
import { DOM_RECT_FALLBACK, MENTION_SUGGESTION_ITEMS } from '../constants/suggestions'

import { MentionSuggestionDropdown } from './suggestions/mention-suggestion-dropdown'

import type { Instance as TippyInstace, Props as TippyProps } from 'tippy.js'
import type { SuggestionExtensionResult, SuggestionRendererRef } from '../../../src'
import type { MentionSuggestionItem } from '../constants/suggestions'

const MENTION_SUGGESTION_TYPE = 'mention'
const MENTION_SUGGESTION_NODE_TYPE = `${MENTION_SUGGESTION_TYPE}Suggestion`

const MentionSuggestion: SuggestionExtensionResult<MentionSuggestionItem> =
    createSuggestionExtension<MentionSuggestionItem>(
        MENTION_SUGGESTION_TYPE,
        MENTION_SUGGESTION_ITEMS,
        {
            id: 'uid',
            label: 'name',
        },
    ).configure({
        triggerChar: '@',
        renderAriaLabel({ label }) {
            return `Name: ${label}`
        },
        onSearchChange(query, storage) {
            return storage.items.filter((item) => {
                return item.name.toLowerCase().includes(query.toLowerCase())
            })
        },
        onItemSelect(item) {
            action('onMentionItemSelect')(item)
        },
        dropdownRenderFn() {
            let reactRenderer: ReactRenderer<SuggestionRendererRef>
            let dropdown: TippyInstace<TippyProps>[]

            // These flag variables control when the renderer functions are allowed to be called,
            // and they are needed to work around a few issues with Tiptap's suggestion utility:
            //   * https://github.com/ueberdosis/tiptap/issues/2547
            //   * https://github.com/ueberdosis/tiptap/issues/2592
            let isDropdownInitialized = false
            let wasDropdownDestroyed = false

            return {
                onStart(props) {
                    if (wasDropdownDestroyed) {
                        wasDropdownDestroyed = false
                        return
                    }

                    reactRenderer = new ReactRenderer(MentionSuggestionDropdown, {
                        props,
                        editor: props.editor,
                    })

                    dropdown = tippy('body', {
                        appendTo() {
                            return document.body
                        },
                        getReferenceClientRect() {
                            return props.clientRect?.() || DOM_RECT_FALLBACK
                        },
                        content: reactRenderer.element,
                        duration: [150, 200],
                        interactive: true,
                        placement: 'bottom-start',
                        showOnCreate: true,
                        trigger: 'manual',
                    })

                    isDropdownInitialized = true
                },
                onUpdate(props) {
                    if (!isDropdownInitialized) {
                        return
                    }

                    reactRenderer.updateProps(props)

                    dropdown[0].setProps({
                        getReferenceClientRect() {
                            return props.clientRect?.() || DOM_RECT_FALLBACK
                        },
                    })
                },
                onKeyDown(props) {
                    if (!isDropdownInitialized) {
                        return false
                    }

                    if (props.event.key === 'Escape') {
                        dropdown[0].hide()
                        return true
                    }

                    return Boolean(reactRenderer.ref?.onKeyDown(props))
                },
                onExit() {
                    if (!isDropdownInitialized) {
                        wasDropdownDestroyed = true
                        return
                    }

                    dropdown[0].destroy()
                    reactRenderer.destroy()
                },
            }
        },
    })

export { MENTION_SUGGESTION_NODE_TYPE, MentionSuggestion }
