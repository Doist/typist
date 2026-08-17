# Type System

## Interfaces vs Types

Use **interfaces** for object shapes that may be extended. Use **type aliases** for unions and complex types. When extending an interface, prefer `interface extends` over `&` intersections — it produces clearer error messages and is faster for the TypeScript compiler.

```typescript
// Interface: extendable object shape
interface Task {
    id: string
    content: string
    isCompleted: boolean
    dueDate?: Date
    labels: string[]
}

// Type alias: union
type TaskPriority = 1 | 2 | 3 | 4

// Extending an interface (preferred over intersection for TS performance)
interface TaskWithProject extends Task {
    projectId: string
}
```

## Enums

Avoid TypeScript enums. They add runtime code, have surprising type behavior, and are not erasable. Use one of these alternatives instead:

**String literal unions** (preferred for small sets):

```typescript
type Theme = 'light' | 'dark'
type ProjectView = 'list' | 'board' | 'calendar'
```

**`as const` objects** (when you need runtime access to the values):

```typescript
const ProjectView = {
    List: 'list',
    Board: 'board',
    Calendar: 'calendar',
} as const

type ProjectView = (typeof ProjectView)[keyof typeof ProjectView]

// Runtime access: Object.values(ProjectView), ProjectView.List, etc.
```

## Generics

Use generics for reusable functions and components. Choose meaningful parameter names.

```typescript
function filterItems<TItem, TKey extends keyof TItem>(
    items: TItem[],
    property: TKey,
    value: TItem[TKey],
): TItem[] {
    return items.filter((item) => item[property] === value)
}
```

## Type Guards and Discriminated Unions

Use custom `is` predicates for runtime type narrowing. Use `kind` or `type` discriminants for union types.

```typescript
// Custom type guard
function isTask(value: unknown): value is Task {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'content' in value &&
        'isCompleted' in value
    )
}

// Discriminated union
type Result<T> =
    | { kind: 'success'; data: T }
    | { kind: 'error'; error: Error }
    | { kind: 'loading' }

function handleResult<T>(result: Result<T>) {
    switch (result.kind) {
        case 'success':
            return result.data
        case 'error':
            throw result.error
        case 'loading':
            return null
    }
}
```

## Readonly and Immutability

Use `readonly` for properties that should not change after creation. Use `Readonly<T>` and `ReadonlyArray<T>` for stricter immutability guarantees.

```typescript
interface UserSettings {
    readonly id: string
    theme: 'light' | 'dark'
    notifications: boolean
}

function processItems(items: ReadonlyArray<Task>): Task[] {
    // items.push() would be a compile error
    return items.filter((item) => !item.isCompleted)
}
```

## Nullish Handling

Use `??` over `||` for defaults (avoids falsy traps with `0`, `''`, `false`). Use optional chaining for nested access.

```typescript
// Good: nullish coalescing
const pageSize = config.pageSize ?? 25

// Bad: logical OR treats 0 as falsy
const pageSize = config.pageSize || 25

// Good: optional chaining
const city = user?.address?.city
```

## Rules

- **No `any`** - Use `unknown` and narrow with type guards
- **No `@ts-ignore`** - Use `@ts-expect-error` with a comment explaining why, only when unavoidable
- **Use `satisfies`** - Validate object literals against types without widening: `const config = { ... } satisfies Config`
- **Prefer inference** - Don't annotate return types when the compiler can infer them and the result is obvious
- **Use `as const`** - For literal types and readonly arrays: `const PRIORITIES = [1, 2, 3, 4] as const`
- **Use `unknown` in catch** - Always `catch (error: unknown)`, then narrow with `instanceof`
