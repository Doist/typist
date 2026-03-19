# Coding Conventions

## Naming Conventions

| Type               | Convention               | Example             |
| ------------------ | ------------------------ | ------------------- |
| Files              | kebab-case               | `task-list.tsx`     |
| Components         | PascalCase               | `TaskList`          |
| Hooks              | camelCase + `use` prefix | `useTaskList`       |
| Constants          | UPPER_SNAKE_CASE         | `MAX_RETRY_COUNT`   |
| Functions          | camelCase                | `filterActiveTasks` |
| Types / Interfaces | PascalCase               | `TaskItemProps`     |

## Function Style

- Use **function declarations** for named, top-level functions and components
- Use **arrow functions** for anonymous callbacks and inline functions
- Keep functions small and focused on a single responsibility
- Use early returns to reduce nesting

```typescript
// Good: function declaration for component
function TaskList({ tasks }: TaskListProps) {
    return (
        <ul>
            {tasks.map((task) => (
                <li key={task.id}>{task.content}</li>
            ))}
        </ul>
    )
}

// Good: arrow function for callback
const activeTasks = tasks.filter((task) => !task.isCompleted)

// Good: early returns
function handleSubmit(event: React.FormEvent): void {
    event.preventDefault()

    if (!isValid) {
        showValidationErrors()
        return
    }

    if (!user) {
        redirectToLogin()
        return
    }

    submitForm()
}
```

## Code Organization

- Group related functions together
- Place helper functions before the main function/component
- Place constants at the top of the file
- Don't use `index.ts` files for exports only
