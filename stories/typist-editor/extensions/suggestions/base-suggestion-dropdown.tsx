import { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'

import { Box, Inline, Text } from '@doist/reactist'

import { SuggestionRendererRef } from '../../../../src'

import styles from './base-suggestion-dropdown.module.css'

type BaseSuggestionDropdownItemProps = {
    index: number
    isSelected: boolean
    children: React.ReactNode
    registerItemRef: (index: number, node: HTMLLIElement | null) => void
    onItemSelect: (index: number) => void
}

function BaseSuggestionDropdownItem({
    index,
    isSelected,
    children,
    registerItemRef,
    onItemSelect,
}: BaseSuggestionDropdownItemProps) {
    const handleClick = useCallback(
        function handleClick() {
            onItemSelect(index)
        },
        [index, onItemSelect],
    )

    const handleRef = useCallback(
        function handleRef(node: HTMLLIElement | null) {
            registerItemRef(index, node)
        },
        [index, registerItemRef],
    )

    return (
        <Box
            as="li"
            id={`suggestion-${index}`}
            role="option"
            tabIndex={-1}
            aria-selected={isSelected}
            display="flex"
            alignItems="center"
            borderRadius="standard"
            onClick={handleClick}
            ref={handleRef}
        >
            {children}
        </Box>
    )
}

type BaseSuggestionDropdownProps<TSuggestionItem> = {
    forwardedRef: React.ForwardedRef<SuggestionRendererRef>
    items: TSuggestionItem[]
    itemSize?: number
    getItemKey: (item: TSuggestionItem) => React.Key
    renderItem: (item: TSuggestionItem) => React.ReactElement
    onItemSelect: (index: number) => void
}

function BaseSuggestionDropdown<TSuggestionItem extends object>({
    forwardedRef,
    items,
    itemSize = 6,
    getItemKey,
    renderItem,
    onItemSelect,
}: BaseSuggestionDropdownProps<TSuggestionItem>) {
    const itemRefs = useRef<Map<number, HTMLLIElement>>(new Map())

    const [selectedIndex, setSelectedIndex] = useState(0)

    const suggestionDropdownStyle = useMemo(
        function buildSuggestionDropdownStyle() {
            return {
                '--suggestion-dropdown-item-size': itemSize,
            } as React.CSSProperties
        },
        [itemSize],
    )

    const areSuggestionsLoading = items.length === 1 && 'isLoading' in items[0]
    const areSuggestionsEmpty = items.length === 0

    const registerItemRef = useCallback(function registerItemRef(
        index: number,
        node: HTMLLIElement | null,
    ) {
        if (node) {
            itemRefs.current.set(index, node)
        } else {
            itemRefs.current.delete(index)
        }
    }, [])

    function updateSelectedItem(index: number) {
        setSelectedIndex(index)
        itemRefs.current.get(index)?.scrollIntoView({ block: 'nearest' })
    }

    useImperativeHandle(
        forwardedRef,
        function exposeKeyboardHandlersToReactRenderer() {
            return {
                onKeyDown({ event }) {
                    if (event.key === 'ArrowUp') {
                        updateSelectedItem((selectedIndex + items.length - 1) % items.length)
                        return true
                    }

                    if (event.key === 'ArrowDown') {
                        updateSelectedItem((selectedIndex + 1) % items.length)
                        return true
                    }

                    if (event.key === 'Enter') {
                        onItemSelect(selectedIndex)
                        return true
                    }

                    return false
                },
            }
        },
        [items.length, onItemSelect, selectedIndex],
    )

    return (
        <Box
            borderRadius="standard"
            overflow="auto"
            tabIndex={-1}
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
                    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
                    role="listbox"
                    aria-multiselectable={false}
                    aria-activedescendant={`suggestion-${selectedIndex}`}
                >
                    {items.map((item, index) => (
                        <BaseSuggestionDropdownItem
                            key={getItemKey(item)}
                            index={index}
                            isSelected={index === selectedIndex}
                            registerItemRef={registerItemRef}
                            onItemSelect={onItemSelect}
                        >
                            {renderItem(item)}
                        </BaseSuggestionDropdownItem>
                    ))}
                </Box>
            )}
        </Box>
    )
}

export { BaseSuggestionDropdown }
