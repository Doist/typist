import { forwardRef } from 'react'

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
    return (
        <BaseSuggestionDropdown
            forwardedRef={ref}
            items={items}
            onItemSelect={command}
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
