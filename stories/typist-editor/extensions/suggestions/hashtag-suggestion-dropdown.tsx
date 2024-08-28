import { forwardRef } from 'react'
import { useEvent } from 'react-use-event-hook'

import { Inline, Text } from '@doist/reactist'

import Avatar from 'boring-avatars'

import { BaseSuggestionDropdown } from './base-suggestion-dropdown'

import styles from './hashtag-suggestion-dropdown.module.css'

import type { SuggestionRendererProps, SuggestionRendererRef } from '../../../../src'
import type { HashtagSuggestionItem } from '../../constants/suggestions'

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
            onItemSelect={handleItemSelect}
            renderItem={(item) => (
                <Inline space="small" exceptionallySetClassName={styles.hashtagSuggestionItem}>
                    <Avatar
                        size={20}
                        name={item.name}
                        variant="marble"
                        colors={['#f6d5b5', '#ede6b5', '#cde2d9', '#afd2c9', '#f1bab5']}
                    />
                    <Text size="copy" lineClamp={1}>
                        #{item.name}
                    </Text>
                </Inline>
            )}
        />
    )
})

export { HashtagSuggestionDropdown }
