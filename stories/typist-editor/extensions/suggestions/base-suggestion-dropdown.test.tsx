import { createRef } from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Schema } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { expect, test, vi } from 'vitest'

import { type SuggestionRendererRef } from '../../../../src'

import { BaseSuggestionDropdown } from './base-suggestion-dropdown'

function getItemKey(item: { name: string }) {
    return item.name
}

function renderItem(item: { name: string }) {
    return <span>{item.name}</span>
}

test('editor keyboard navigation selects suggestions without moving focus', async () => {
    const user = userEvent.setup()
    const ref = createRef<SuggestionRendererRef>()
    const view = new EditorView(null, {
        state: EditorState.create({
            schema: new Schema({ nodes: { doc: { content: 'text*' }, text: {} } }),
        }),
    })
    const range = { from: 0, to: 0 }
    const onItemSelect = vi.fn<(index: number) => void>()
    render(
        <>
            <input aria-label="Editor" />
            <BaseSuggestionDropdown
                forwardedRef={ref}
                items={[{ name: 'Alice' }, { name: 'Bob' }]}
                getItemKey={getItemKey}
                renderItem={renderItem}
                onItemSelect={onItemSelect}
            />
        </>,
    )
    for (const option of screen.getAllByRole('option')) {
        option.scrollIntoView = vi.fn<() => void>()
    }
    const editor = screen.getByRole('textbox', { name: 'Editor' })
    await user.click(editor)

    act(() => {
        ref.current?.onKeyDown({
            view,
            range,
            event: new KeyboardEvent('keydown', { key: 'ArrowDown' }),
        })
    })
    expect(screen.getByRole('option', { name: 'Bob' })).toHaveAttribute('aria-selected', 'true')
    expect(editor).toHaveFocus()
    act(() => {
        ref.current?.onKeyDown({
            view,
            range,
            event: new KeyboardEvent('keydown', { key: 'Enter' }),
        })
    })
    expect(onItemSelect).toHaveBeenLastCalledWith(1)

    await user.click(screen.getByRole('option', { name: 'Alice' }))
    expect(onItemSelect).toHaveBeenLastCalledWith(0)
    view.destroy()
})
