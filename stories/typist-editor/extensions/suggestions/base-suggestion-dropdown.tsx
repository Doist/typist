import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { Box, Inline, Text } from '@doist/reactist'

import { SuggestionRendererRef } from '../../../../src'

import styles from './base-suggestion-dropdown.module.css'

type BaseSuggestionDropdownProps<TItem> = {
    forwardedRef: React.ForwardedRef<SuggestionRendererRef>
    items: TItem[]
    itemSize?: number
    renderItem: (item: TItem) => JSX.Element
    onItemSelect: (item: TItem) => void
}

function BaseSuggestionDropdown<TItem extends object>({
    forwardedRef,
    items,
    itemSize = 6,
    renderItem,
    onItemSelect,
}: BaseSuggestionDropdownProps<TItem>): JSX.Element | null {
    const selectedItemRef = useRef<HTMLLIElement>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)

    const suggestionDropdownStyle: React.CSSProperties = {
        ['--suggestion-dropdown-item-size' as string]: itemSize,
    }

    const areSuggestionsLoading = items.length === 1 && 'isLoading' in items[0]
    const areSuggestionsEmpty = items.length === 0

    const handleItemSelect = useCallback(
        (index: number) => {
            const item = items[index]

            if (item) {
                onItemSelect(item)
            }
        },
        [items, onItemSelect],
    )

    useEffect(
        function scrollSelectedItemIntoView() {
            selectedItemRef.current?.scrollIntoView({
                block: 'nearest',
            })
        },
        [selectedIndex],
    )

    useEffect(
        function autoSelectLastItemIfNeeded() {
            if (selectedIndex > items.length) {
                setSelectedIndex(items.length - 1)
            }
        },
        [items, selectedIndex],
    )

    useImperativeHandle(
        forwardedRef,
        function exposeKeyboardHandlersToReactRenderer() {
            return {
                onKeyDown({ event }) {
                    if (event.key === 'ArrowUp') {
                        setSelectedIndex((selectedIndex + items.length - 1) % items.length)
                        return true
                    }

                    if (event.key === 'ArrowDown') {
                        setSelectedIndex((selectedIndex + 1) % items.length)
                        return true
                    }

                    if (event.key === 'Enter') {
                        handleItemSelect(selectedIndex)
                        return true
                    }

                    return false
                },
            }
        },
        [items.length, handleItemSelect, selectedIndex],
    )

    return (
        <Box
            borderRadius="standard"
            overflow="auto"
            className={styles.baseSuggestionDropdown}
            style={suggestionDropdownStyle}
        >
            {areSuggestionsEmpty ? (
                <Inline paddingX="small">
                    <Text>No results found…</Text>
                </Inline>
            ) : areSuggestionsLoading ? (
                <Inline paddingX="small" space="xsmall">
                    <svg width="20" height="20" viewBox="0 0 50 50">
                        <path
                            fill="currentColor"
                            d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"
                        >
                            <animateTransform
                                attributeType="xml"
                                attributeName="transform"
                                type="rotate"
                                from="0 25 25"
                                to="360 25 25"
                                dur="0.6s"
                                repeatCount="indefinite"
                            />
                        </path>
                    </svg>
                    <Text>Loading…</Text>
                </Inline>
            ) : (
                <Box
                    as="ul"
                    role="listbox"
                    aria-multiselectable={false}
                    aria-activedescendant={`suggestion-${selectedIndex}`}
                >
                    {items.map((item, index) => (
                        <Box
                            key={index}
                            as="li"
                            id={`suggestion-${index}`}
                            role="option"
                            aria-selected={index === selectedIndex}
                            display="flex"
                            alignItems="center"
                            borderRadius="standard"
                            onClick={() => handleItemSelect(index)}
                            ref={index === selectedIndex ? selectedItemRef : null}
                        >
                            {renderItem(item)}
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    )
}

export { BaseSuggestionDropdown }
