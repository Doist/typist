# State Management

## When to Use What

| Tool              | Use For                              | Examples                                                  |
| ----------------- | ------------------------------------ | --------------------------------------------------------- |
| **Redux Toolkit** | Global app state synced with backend | Tasks, projects, user settings, sync engine               |
| **Zustand**       | Feature-scoped client-side UI state  | Filters, sidebar expansion, modal state, view preferences |
| **React state**   | Component-local ephemeral state      | Form inputs, hover/focus, animation toggles               |
| **React Router**  | URL-derived state                    | Current route, search params, path params                 |

## Redux Toolkit

### Typed Hooks

Always use typed hooks instead of the base `useDispatch`, `useSelector`, or `useStore` from `react-redux`. If your project doesn't have these yet, create them following the [Redux Toolkit TypeScript guide](https://redux-toolkit.js.org/usage/usage-with-typescript#define-typed-hooks):

```typescript
// Good: typed hooks
import { useAppDispatch, useAppSelector } from 'src/reducers/typed-redux-hooks'

function TaskList() {
    const tasks = useAppSelector((state) => state.tasks)
    const dispatch = useAppDispatch()
}

// Bad: untyped hooks
import { useDispatch, useSelector } from 'react-redux'
```

### Slices

Use `createSlice` for all new Redux code. Each slice manages one domain of state.

```typescript
import { createSlice } from '@reduxjs/toolkit'

type TasksState = {
    [id: string]: Task
}

const initialState: TasksState = {}

const tasksSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        taskAdd: (state, action: PayloadAction<Task>) => {
            state[action.payload.id] = action.payload
        },
        taskRemove: (state, action: PayloadAction<string>) => {
            delete state[action.payload]
        },
    },
    extraReducers: (builder) => {
        // Handle actions from other slices or thunks
    },
})
```

### Thunks

Use `createAppAsyncThunk` (typed alias of RTK's `createAsyncThunk`) for async operations. If your project doesn't have this defined, create it alongside the typed hooks. Reducers can only access their own slice — when an action affects multiple slices, compute updates in the thunk.

```typescript
import { createAppAsyncThunk } from 'src/reducers/typed-redux-hooks'

export const projectFetch = createAppAsyncThunk(
    'projects/fetch',
    async ({ id }: { id: string }, { getState, rejectWithValue }) => {
        try {
            return await api.getProject(id)
        } catch (error: unknown) {
            return rejectWithValue(error)
        }
    },
)
```

### Selectors

Use `createAppSelector` (typed alias of Reselect's `createSelector`) for memoized derived state. If your project doesn't have this defined, create it following the [Reselect TypeScript guide](https://reselect.js.org/usage/best-practices#define-a-pre-typed-createselector). Never create new arrays or objects directly in `useAppSelector`.

**Important:** Always wrap input selectors in an array — this is required for the output selector's types to be inferred correctly. Input selectors should only extract raw state; do not transform data there.

```typescript
// Good: memoized selector with input selectors in an array
const selectActiveProjects = createAppSelector([(state) => state.projects], (projects) =>
    Object.values(projects).filter((p) => !p.isArchived),
)

const activeProjects = useAppSelector(selectActiveProjects)

// Bad: creates new array on every render
const activeProjects = useAppSelector((state) =>
    Object.values(state.projects).filter((p) => !p.isArchived),
)

// Bad: input selectors not in an array (types won't be inferred)
const selectActiveProjects = createAppSelector(
    (state) => state.projects,
    (projects) => Object.values(projects).filter((p) => !p.isArchived),
)
```

Reselect and React-Redux both run development-mode stability checks that catch common selector mistakes:

| Check                                     | What it detects                                                      | Docs                                                                                        |
| ----------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Reselect `inputStabilityCheck`            | Input selectors that return new references on identical arguments    | [Reselect stability checks](https://reselect.js.org/api/development-only-stability-checks)  |
| React-Redux `useSelector` check (v8.1.0+) | Selectors whose results change when called twice with the same state | [React-Redux dev-mode checks](https://react-redux.js.org/api/hooks#development-mode-checks) |

Both are enabled by default (`'once'`) and fire warnings in dev mode. Don't suppress them; fix the root cause instead.

## Zustand

### Store Pattern

Never export the store directly. Only export custom hooks. Consider using the `devtools` middleware for Redux DevTools integration and `immer` for Immer-powered immutable updates in complex stores.

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Store is private
const useFilterStore = create((set) => ({
    query: '',
    priority: null as TaskPriority | null,

    actions: {
        search: (query: string) => set({ query }),
        filterByPriority: (priority: TaskPriority | null) => set({ priority }),
        clearFilters: () => set({ query: '', priority: null }),
    },
}))

// Only export atomic selectors and actions
export const useFilterQuery = () => useFilterStore((state) => state.query)
export const useFilterPriority = () => useFilterStore((state) => state.priority)
export const useFilterActions = () => useFilterStore((state) => state.actions)
```

### Atomic Selectors

Export one hook per state piece. Never return objects or arrays from selectors — new references cause unnecessary re-renders.

```typescript
// Good: atomic selectors with stable primitives
export const useSidebarOpen = () => useLayoutStore((state) => state.sidebarOpen)
export const useTheme = () => useLayoutStore((state) => state.theme)

// Bad: returns new object on every call
export const useLayout = () =>
    useLayoutStore((state) => ({ sidebarOpen: state.sidebarOpen, theme: state.theme }))
```

If a component needs multiple values, call multiple hooks.

### Selector Stability

Zustand v5 uses `Object.is` equality by default. If a selector returns a new reference on every call, the component re-renders, which triggers the selector again, producing another new reference; this infinite loop crashes the app. This isn't just a performance issue: unstable selectors are a correctness bug.

**Inline fallbacks** are a common source of instability. Default values created inside the selector are new references every time:

```typescript
// Bad: new function reference on every call, will crash
export const useOnDismiss = () => useModalStore((state) => state.onDismiss ?? () => {})

// Good: hoist the fallback to module scope
const noop = () => {}
export const useOnDismiss = () => useModalStore((state) => state.onDismiss ?? noop)
```

When a component genuinely needs multiple values from one store, use `useShallow` from `zustand/shallow`. It compares each property with `Object.is`, avoiding the reference instability shown in the [Atomic Selectors](#atomic-selectors) "Bad" example above:

```typescript
import { useShallow } from 'zustand/shallow'

export const useFilterCriteria = () =>
    useFilterStore(useShallow((state) => ({ query: state.query, priority: state.priority })))
```

Prefer atomic selectors (one hook per value) as the default. Reach for `useShallow` only when multiple values are always consumed together and splitting would add noise.

### Actions

Group actions in an `actions` namespace. Model actions as events describing what happened, not as setters. The `actions` object is created once during store initialization and is never replaced by `set`, so `useFilterStore((state) => state.actions)` is a stable selector that won't cause re-renders.

```typescript
// Good: event-style actions
actions: {
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    selectProject: (id: string) => set({ selectedProjectId: id }),
    clearSelection: () => set({ selectedProjectId: null }),
}

// Bad: setter-style actions
actions: {
    setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
    setSelectedProjectId: (id: string | null) => set({ selectedProjectId: id }),
}
```

### Combining with Other State Sources

```typescript
// Zustand + Redux
export function useFilteredTasks() {
    const query = useFilterQuery() // Zustand
    const tasks = useAppSelector(selectAllTasks) // Redux
    return tasks.filter((t) => t.content.includes(query))
}

// Zustand + Router
export function useCurrentViewConfig() {
    const { projectId } = useParams() // Router
    const config = useViewConfig() // Zustand
    return config[projectId]
}
```

## Rules

- **Never import `useDispatch` / `useSelector` from `react-redux`** - Use `useAppDispatch` / `useAppSelector`
- **Never export Zustand stores** - Only export custom hooks
- **Keep slices focused** - One domain per slice; cross-slice logic goes in thunks
- **Derived state in selectors** - Use `createAppSelector` for memoized computations, never derive in components
- **Actions are events** - Name them after what happened (`taskCompleted`), not what to set (`setCompleted`)
- **Selectors must return stable references** - Unstable selectors cause infinite loops in Zustand v5 and wasted renders in Redux; hoist fallback values to module scope
- **Use `useShallow` for multi-value Zustand selectors** - Prefer atomic selectors, but when multiple values are always consumed together, `useShallow` prevents reference instability
- **Don't suppress dev-mode stability checks** - Reselect and React-Redux stability warnings catch real bugs; fix the root cause instead
