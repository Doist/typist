import { forwardRef } from 'react'
import { useEvent } from 'react-use-event-hook'

import Avatar from 'boring-avatars'

import { BaseSuggestionDropdown } from './base-suggestion-dropdown'

import styles from './base-suggestion-dropdown.module.css'

import type { SuggestionRendererProps, SuggestionRendererRef } from '../../../../src'
import type { HashtagSuggestionItem } from '../../constants/suggestions'

const HASHTAG_AVATAR_COLORS = ['#f6d5b5', '#ede6b5', '#cde2d9', '#afd2c9', '#f1bab5']

function getHashtagItemKey(item: HashtagSuggestionItem) {
    return item.id
}

function renderHashtagItem(item: HashtagSuggestionItem) {
    return (
        <div className={styles.suggestionItem}>
            <Avatar size={20} name={item.name} variant="marble" colors={HASHTAG_AVATAR_COLORS} />
            <span className={styles.suggestionLabel}>#{item.name}</span>
        </div>
    )
}

const HashtagSuggestionDropdown = forwardRef<
    SuggestionRendererRef,
    SuggestionRendererProps<HashtagSuggestionItem>
>(function HashtagSuggestionDropdown({ items, command }, ref) {
    const handleItemSelect = useEvent((index: number) => {
        const item = items[index] as HashtagSuggestionItem | undefined

        if (item) {
            command({
                id: item.id,
                label: item.name,
            })
        }
    })

    return (
        <BaseSuggestionDropdown
            forwardedRef={ref}
            items={items}
            getItemKey={getHashtagItemKey}
            onItemSelect={handleItemSelect}
            renderItem={renderHashtagItem}
        />
    )
})

export { HashtagSuggestionDropdown }
