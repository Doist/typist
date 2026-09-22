import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'

import { Button } from './button'

test('story actions can be activated with the keyboard without submitting a form', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn<() => void>()
    const onSubmit = vi.fn<(event: React.FormEvent) => void>((event) => event.preventDefault())
    render(
        <form onSubmit={onSubmit}>
            <Button onClick={onClick}>Get markdown</Button>
        </form>,
    )

    await user.tab()
    expect(screen.getByRole('button', { name: 'Get markdown' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
})

test('disabled story actions cannot be activated', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn<() => void>()
    render(
        <Button disabled onClick={onClick}>
            Get markdown
        </Button>,
    )

    await user.click(screen.getByRole('button', { name: 'Get markdown' }))
    expect(onClick).not.toHaveBeenCalled()
})
