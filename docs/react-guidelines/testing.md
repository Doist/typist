# React Testing

## Component Tests

Use React Testing Library with `userEvent` for interactions. Query by role, not test ID.

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('completes a task when checkbox is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskItem task={mockTask} onComplete={onComplete} />)

    await user.click(screen.getByRole('checkbox', { name: /buy groceries/i }))

    expect(onComplete).toHaveBeenCalledWith(mockTask.id)
})

test('shows due date when task has one', () => {
    render(<TaskItem task={{ ...mockTask, dueDate: new Date('2025-03-15') }} />)

    expect(screen.getByText('Mar 15')).toBeInTheDocument()
})
```

## Hook Tests

Use `renderHook` with the appropriate wrapper for hooks that depend on context.

```typescript
import { renderHook, act } from '@testing-library/react'

test('increments counter', () => {
    const { result } = renderHook(() => useCounter())

    act(() => {
        result.current.increment()
    })

    expect(result.current.count).toBe(1)
})
```

For hooks that need Router or Redux context, use a wrapper:

```typescript
function createWrapper() {
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <Provider store={createTestStore()}>
                <MemoryRouter>{children}</MemoryRouter>
            </Provider>
        )
    }
}

test('returns current project from URL', () => {
    const { result } = renderHook(() => useCurrentProject(), {
        wrapper: createWrapper(),
    })

    expect(result.current).toBeDefined()
})
```

## Provider Wrappers

For components that need Redux and/or Router context, create a test wrapper:

```typescript
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

function renderWithProviders(
    ui: React.ReactElement,
    { preloadedState, route = '/' }: RenderOptions = {},
) {
    const store = initStore(preloadedState)

    return render(ui, {
        wrapper: ({ children }) => (
            <Provider store={store}>
                <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            </Provider>
        ),
    })
}
```

## Rules

- **`getByRole` over `getByTestId`** - Query the way a user or assistive technology would
- **`userEvent` over `fireEvent`** - `userEvent` simulates real browser behavior (focus, pointer events)
- **`waitFor` over timeouts** - Never use `setTimeout` to wait for async state; use `waitFor` or `findBy` queries
