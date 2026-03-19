# React Conventions

## JSX Conventions

- **Functional components only** - No class components
- **Self-closing tags** for elements without children: `<Input />`
- **Fragments** over wrapper divs: `<>...</>`
- **Ternary over `&&`** for conditional rendering (avoids rendering `0`):

```typescript
// Good: ternary
{hasItems ? <ItemList items={items} /> : null}

// Bad: && can render falsy values
{items.length && <ItemList items={items} />}
```

- **Multiline JSX in parens**:

```typescript
return (
    <div className={styles.container}>
        <Header />
        <Content />
    </div>
)
```

## Named Effect Callbacks

All `useEffect`, `useLayoutEffect`, and similar hook callbacks must be named functions. This improves stack traces and makes the effect's purpose clear.

```typescript
// Good: named function
useEffect(
    function fetchProjectData() {
        loadProject(projectId)
    },
    [projectId],
)

// Good: named cleanup
useEffect(
    function subscribeToUpdates() {
        const unsubscribe = subscribe(channelId)

        return function unsubscribeFromUpdates() {
            unsubscribe()
        }
    },
    [channelId],
)

// Bad: anonymous
useEffect(() => {
    loadProject(projectId)
}, [projectId])
```

## Component Types

Define props as a `type` (named `Props` or with a descriptive prefix). Type children, event handlers, and refs explicitly.

```typescript
type TaskItemProps = {
    task: Task
    onComplete: (id: string) => void
    onDelete: (id: string) => void
}

function TaskItem({ task, onComplete, onDelete }: TaskItemProps) {
    // ...
}

// Children typing
type LayoutProps = {
    children: React.ReactNode
    sidebar?: React.ReactNode
}

// Event handler typing
type SearchProps = {
    onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void
}

// ForwardRef
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
    return <input ref={ref} {...props} />
})
```
