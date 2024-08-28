import { forwardRef } from 'react'
import { useEvent } from 'react-use-event-hook'

import { Inline, Text } from '@doist/reactist'

import Avatar from 'boring-avatars'

import { BaseSuggestionDropdown } from './base-suggestion-dropdown'

import styles from './mention-suggestion-dropdown.module.css'

import type { SuggestionRendererProps, SuggestionRendererRef } from '../../../../src'
import type { MentionSuggestionItem } from '../../constants/suggestions'

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
            onItemSelect={handleItemSelect}
            renderItem={(item) => (
                <Inline space="small" exceptionallySetClassName={styles.mentionSuggestionItem}>
                    <Avatar
                        size={20}
                        name={item.name}
                        variant="bauhaus"
                        colors={['#e34432', '#ffc93e', '#ffa416', '#6b8767', '#2a1d30']}
                    />
                    <Text size="copy" lineClamp={1}>
                        {item.name}
                    </Text>
                </Inline>
            )}
        />
    )
})

export { MentionSuggestionDropdown }
