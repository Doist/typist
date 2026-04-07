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

## Render Purity and Local State

### Don't read external state during render

React components [must be idempotent](https://react.dev/reference/rules/components-and-hooks-must-be-pure) - they should always return the same output with respect to their inputs. Reading from external sources like `localStorage`, `sessionStorage`, or browser APIs during render violates this because they are mutable sources outside React's control (same category as `Date.now()` or `Math.random()`). Beyond purity, these reads also create new references on every call, which causes render loops and stale-value bugs.

```typescript
// Bad: reads localStorage on every render, creates new arrays each time
function useActivityFilters(urlParams: URLSearchParams) {
    const presets = getLocalStorageValue<string[]>('filterPresets') ?? []
    const types = urlParams.get('types')?.split(',') ?? presets
    return { types } // New object + new array every render
}

// Good: read external state once via useState initializer
function useActivityFilters(urlParams: URLSearchParams) {
    const [initialPresets] = useState(() => getLocalStorageValue<string[]>('filterPresets') ?? [])
    // Use the stable string as the dependency, derive the array inside useMemo
    const typesParam = urlParams.get('types')
    return useMemo(
        () => ({ types: typesParam?.split(',') ?? initialPresets }),
        [typesParam, initialPresets],
    )
}
```

### `useState` initializer vs `useMemo` for one-time computations

When you need to compute something once on mount and never recompute it, `useState(() => ...)` is the right tool - the [initializer function runs only on the first render](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state). `useMemo` recalculates when dependencies get new references, which can trigger the very re-renders you're trying to avoid. The lazy initializer runs once, freezes the result, and is immune to reference instability.

```typescript
// Good: computed once, stable forever
const [initialFilters] = useState(() => deriveFiltersFromURL(searchParams))

// Risky: recalculates if searchParams reference changes
const initialFilters = useMemo(() => deriveFiltersFromURL(searchParams), [searchParams])
```

Use `useState(() => ...)` when the value should be pinned to mount time. For reactive derived values, the [React Compiler](react-compiler.md) handles memoization automatically in compiler-enabled code; only reach for manual `useMemo` when the compiler is not active.

See also: [useState lazy initialization](react-compiler.md#alternative-usestate-lazy-initialization) in the React Compiler guide for the compiler-specific motivation.

### Stable reducer sentinel values

React [skips re-rendering when the new state is identical to the current state](https://react.dev/reference/react/useReducer#dispatch) via `Object.is` comparison. If a reducer returns a new object with the same shape on every dispatch, that check fails and React re-renders. Hoisting fixed sentinel states to module scope ensures the same reference is returned, letting React bail out.

This is only worth investigating if profiling shows unnecessary re-renders from a reducer - React's render batching already handles most cases. Only use sentinels for truly fixed values; states that carry variable data (like errors with messages) need a new object each time.

```typescript
const loadingState = { status: 'loading' as const, data: null, error: null }

function fetchReducer(state: FetchState, action: FetchAction): FetchState {
    switch (action.type) {
        case 'FETCH_START':
            return loadingState // Same reference — React bails out of re-render
        case 'FETCH_ERROR':
            // New object is correct here — error carries variable data
            return { status: 'error', data: null, error: action.error }
        case 'FETCH_SUCCESS':
            return { status: 'success', data: action.payload, error: null }
    }
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
- **Don't read external state during render** - `localStorage`, `sessionStorage`, and browser APIs produce unstable references; read once via `useState(() => ...)` or in effects
- **Use `useState` initializer for mount-time values** - `useState(() => ...)` runs once and is immune to reference instability. For reactive derived values, the [React Compiler](react-compiler.md) handles memoization automatically in compiler-enabled code; only reach for `useMemo` when the compiler is not active
- **Consider stable reducer sentinels when profiling shows wasted renders** - Hoisting fixed states (loading) to module scope lets `useReducer` return the same reference so React can bail out; only worth doing when the sub-tree is expensive
