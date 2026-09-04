import { forwardRef } from 'react'
import { useEvent } from 'react-use-event-hook'

import Avatar from 'boring-avatars'

import { BaseSuggestionDropdown } from './base-suggestion-dropdown'

import styles from './base-suggestion-dropdown.module.css'

import type { SuggestionRendererProps, SuggestionRendererRef } from '../../../../src'
import type { MentionSuggestionItem } from '../../constants/suggestions'

const MENTION_AVATAR_COLORS = ['#e34432', '#ffc93e', '#ffa416', '#6b8767', '#2a1d30']

function getMentionItemKey(item: MentionSuggestionItem) {
    return item.uid
}

function renderMentionItem(item: MentionSuggestionItem) {
    return (
        <div className={styles.suggestionItem}>
            <Avatar size={20} name={item.name} variant="bauhaus" colors={MENTION_AVATAR_COLORS} />
            <span className={styles.suggestionLabel}>{item.name}</span>
        </div>
    )
}

const MentionSuggestionDropdown = forwardRef<
    SuggestionRendererRef,
    SuggestionRendererProps<MentionSuggestionItem>
>(function MentionSuggestionDropdown({ items, command }, ref) {
    const handleItemSelect = useEvent((index: number) => {
        const item = items[index] as MentionSuggestionItem | undefined

        if (item) {
            command({
                id: item.uid,
                label: item.name,
            })
        }
    })

    return (
        <BaseSuggestionDropdown
            forwardedRef={ref}
            items={items}
            getItemKey={getMentionItemKey}
            onItemSelect={handleItemSelect}
            renderItem={renderMentionItem}
        />
    )
})

export { MentionSuggestionDropdown }
