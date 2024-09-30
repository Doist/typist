import { action } from '@storybook/addon-actions'
import { random } from 'lodash-es'
import tippy from 'tippy.js'

import { createSuggestionExtension, ReactRenderer } from '../../../src'
import { DOM_RECT_FALLBACK, HASHTAG_SUGGESTION_ITEMS } from '../constants/suggestions'

import { HashtagSuggestionDropdown } from './suggestions/hashtag-suggestion-dropdown'

import type { Instance as TippyInstace, Props as TippyProps } from 'tippy.js'
import type { SuggestionExtensionResult, SuggestionRendererRef } from '../../../src'
import type { HashtagSuggestionItem } from '../constants/suggestions'

const HASHTAG_SUGGESTION_TYPE = 'hashtag'
const HASHTAG_SUGGESTION_NODE_TYPE = `${HASHTAG_SUGGESTION_TYPE}Suggestion`

const HashtagSuggestion: SuggestionExtensionResult<HashtagSuggestionItem> =
    createSuggestionExtension<HashtagSuggestionItem>(
        HASHTAG_SUGGESTION_TYPE,
        HASHTAG_SUGGESTION_ITEMS,
        {
            label: 'name',
        },
    ).configure({
        triggerChar: '#',
        renderAriaLabel({ label }) {
            return `Hashtag: #${label}`
        },
        async onSearchChange(query, storage) {
            const storageItems = await new Promise((resolve) =>
                setTimeout(resolve, random(500, 1500)),
            ).then(() => storage.items)

            return storageItems.filter((item) => {
                return item.name.toLowerCase().includes(query.toLowerCase())
            })
        },
        onItemSelect(item) {
            action('onHashtagItemSelect')(item)
        },
        dropdownRenderFn() {
            let reactRenderer: ReactRenderer<SuggestionRendererRef>
            let dropdown: TippyInstace<TippyProps>[]

            // These flag variables control when the renderer functions are allowed to be called,
            // and they are needed to work around a few issues with Tiptap's suggestion utility:
            //   * https://github.com/ueberdosis/tiptap/issues/214
            //   * https://github.com/ueberdosis/tiptap/issues/2547
            //   * https://github.com/ueberdosis/tiptap/issues/2592
            let isDropdownHidden = false
            let isDropdownInitialized = false
            let wasDropdownDestroyed = false

            return {
                onBeforeStart(props) {
                    if (wasDropdownDestroyed) {
                        wasDropdownDestroyed = false
                        return
                    }

                    reactRenderer = new ReactRenderer(HashtagSuggestionDropdown, {
                        props: {
                            ...props,
                            items: [{ isLoading: true }],
                        },
                        editor: props.editor,
                    })

                    dropdown = tippy('body', {
                        appendTo() {
                            return document.body
                        },
                        getReferenceClientRect() {
                            return props.clientRect?.() || DOM_RECT_FALLBACK
                        },
                        onHide() {
                            isDropdownHidden = true
                        },
                        onShow() {
                            isDropdownHidden = false
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
                onStart(props) {
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
                onBeforeUpdate(props) {
                    if (!isDropdownInitialized) {
                        return
                    }

                    reactRenderer.updateProps({
                        ...props,
                        items: [{ isLoading: true }],
                    })

                    dropdown[0].setProps({
                        getReferenceClientRect() {
                            return props.clientRect?.() || DOM_RECT_FALLBACK
                        },
                    })
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
                    if (!isDropdownInitialized || isDropdownHidden) {
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

export { HASHTAG_SUGGESTION_NODE_TYPE, HashtagSuggestion }
