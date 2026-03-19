# React Compiler

[React Compiler](https://react.dev/learn/react-compiler) is an official compiler from the React team that automatically optimizes components and hooks. It analyzes your code and inserts `useMemo`, `useCallback`, and `React.memo` equivalents where beneficial, eliminating the need for manual optimization.

We are incrementally adopting the compiler across all of our React codebases, where it is enabled but not all code may be compliant yet. As there are real performance risks if compiler violations are re-introduced, especially in cases where manual optimizations have been removed, we've put safeguards in place to prevent them from happening.

## Manual memoization

When React Compiler is enabled, **do not** use `useMemo`, `useCallback`, or `React.memo` — the compiler handles memoization automatically, and adding manual memoization on top of the compiler is redundant.

**How to check if React Compiler is enabled:** Look for `babel-plugin-react-compiler` (or its equivalent) in the project's build config (Babel, Vite, or webpack). The presence of `@doist/react-compiler-tracker` or a `.react-compiler.rec.json` file alone does **not** mean the compiler is active — these only track violations.

If you find existing `useMemo` or `useCallback` calls in compiler-enabled code, they can be safely removed. See the [Mismatched useMemo dependencies](#mismatched-usememo-dependencies) fix pattern for guidance on handling existing manual memoization that the compiler flags.

> **Warning:** Do **not** remove manual memoization if:
>
> - The component still has compiler violations (check `.react-compiler.rec.json`)
> - The compiler is not enabled in the project
> - The memoized value is defined before other hook calls that separate it from its hook consumer (e.g., `useState`, `useEffect`). The compiler silently skips memoization in this case, even though the file compiles without errors. See [Memoization gap with intervening hooks](#memoization-gap-with-intervening-hooks).

## Workflow: Identifying and fixing violations

When working on React components or hooks in this codebase, follow this workflow:

> **Important:** Do NOT use ESLint to check for compiler violations. The `eslint-plugin-react-hooks` rules must still pass, but they are not an indicator of whether compiler violations exist. The project uses `@doist/react-compiler-tracker` which tracks violations at the file level via `.react-compiler.rec.json`. Always use the CLI commands shown below.

### 1. Check if the file needs attention

Look up the file in `.react-compiler.rec.json`:

- **Not listed** → Compiler is optimizing it. Do NOT add `useMemo`, `useCallback`, or `React.memo`.
- **Listed with errors** → Continue to step 2.

### 2. Identify violations

Run the tracker with `--show-errors` to see exact errors:

```bash
npx @doist/react-compiler-tracker --check-files --show-errors src/path/to/file.tsx
```

Example output:

```
🔍 Checking 1 file for React Compiler errors…
⚠️ Found 4 React Compiler issues across 1 file

Detailed errors:
 - src/path/to/file.tsx: Line 15: Cannot access refs during render (x2)
 - src/path/to/file.tsx: Line 28: Existing memoization could not be preserved (x2)
```

Parse the output to extract error reasons and line numbers to plan the fix.

### 3. Fix violations

Use the patterns in [Fix patterns](#fix-patterns) to fix each violation. Focus on making the code compiler-compatible rather than adding more manual memoization.

### 4. Verify the fix

```bash
npx @doist/react-compiler-tracker --check-files src/path/to/file.tsx
```

The tool compares current errors against `.react-compiler.rec.json`:

- **Errors increased** (exit code 1):

    ```
    React Compiler errors have increased in:
     • src/path/to/file.tsx: +2
    Please fix the errors and run the command again.
    ```

- **Errors decreased** (exit code 0):

    ```
    🎉 React Compiler errors have decreased in:
     • src/path/to/file.tsx: -2
    ```

- **No changes** (exit code 0): No output about changes, just the check summary.

A quick way to identify violations visually is to install the [React Compiler Marker VSCode extension](https://marketplace.visualstudio.com/items?itemName=blazejkustra.react-compiler-marker), which highlights your components and hooks with ✨ or 🚫 emojis in real time.

## Violation tracking

We use [`@doist/react-compiler-tracker`](https://github.com/Doist/react-compiler-tracker) to track modules that the compiler cannot optimize.

Violations are recorded in a [`.react-compiler.rec.json`](https://github.com/Doist/todoist-web/blob/main/.react-compiler.rec.json), where each entry tracks the number of violations in that file:

```json
{
    "recordVersion": 1,
    "react-compiler-version": "1.0.0",
    "files": {
        "src/path/to/file.tsx": {
            "CompileError": 3
        }
    }
}
```

We leverage [lint-staged](https://github.com/lint-staged/lint-staged) to automatically update the records file on commit. If the numbers of errors are increased, the commit is blocked until the errors either go back to their previous levels, or if the records file is explicitly re-created. The same check is also run on CI.

Once all violations in a file are fixed, the file's entry will be removed from `.react-compiler.rec.json`.

## Error reference

| Compiler error message                                                              | Pattern                       | Section                                          |
| ----------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------ |
| Cannot access refs during render                                                    | Ref access during render      | [Link](#ref-access-during-render)                |
| Existing memoization could not be preserved                                         | Mismatched useMemo deps       | [Link](#mismatched-usememo-dependencies)         |
| Support destructuring of context variables                                          | Mutating props                | [Link](#mutating-props)                          |
| Expression type `X` cannot be safely reordered                                      | Default parameters for props  | [Link](#default-parameters-for-props)            |
| Expression type `BinaryExpression` / `LogicalExpression` cannot be safely reordered | switch(true) pattern          | [Link](#switchtrue-pattern)                      |
| Expected Identifier, got `X` key in ObjectExpression                                | Computed property keys        | [Link](#computed-property-keys)                  |
| Destructure should never be Reassign                                                | Loop variable reassignment    | [Link](#loop-variable-reassignment)              |
| Hooks must always be called in a consistent order                                   | Conditional hook calls        | [Link](#conditional-hook-calls)                  |
| Hooks must be the same function on every render                                     | Hooks passed as props         | [Link](#hooks-passed-as-props)                   |
| Hooks must be called at the top level … not within function expressions             | Hooks in function expressions | [Link](#hooks-in-function-expressions)           |
| Cannot access variable before it is declared                                        | Function declaration order    | [Link](#function-declaration-order)              |
| Handle TryStatement with a finalizer / without a catch clause                       | Try/catch blocks              | [Link](#trycatch-blocks)                         |
| ThrowStatement inside try/catch not yet supported                                   | Try/catch blocks              | [Link](#trycatch-blocks)                         |
| Support value blocks … within a try/catch statement                                 | Try/catch blocks              | [Link](#trycatch-blocks)                         |
| This value cannot be modified (hook argument)                                       | Mutable objects with useMemo  | [Link](#mutable-objects-created-with-usememo)    |
| This value cannot be modified (function return)                                     | Mutating return values        | [Link](#mutating-function-or-hook-return-values) |
| This value cannot be modified (DOM)                                                 | DOM mutations                 | [Link](#dom-mutations)                           |
| This value cannot be modified (test code)                                           | Render-time test mutations    | [Link](#render-time-mutations-in-test-code)      |

## Fix patterns

### Ref access during render

> Reason: Cannot access refs during render
>
> React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the current property) during render can cause your component not to update as expected (<https://react.dev/reference/react/useRef>)

Assigning to refs during render is a violation as it's a side effect. The fix depends on how the ref was being used, but an example is that if we were using it to prevent a state value from being used to re-create callbacks, consider using `useEvent` instead.

**Before:**

```typescript
const tasksBySectionIdRef = useRef(tasksBySectionId)
const splitGroupsRef = useRef(splitGroups)

// Assigning during render - violation
tasksBySectionIdRef.current = tasksBySectionId
splitGroupsRef.current = splitGroups

const handleTaskEditClick = useCallback(
    (task: Task) => {
        const group = splitGroupsRef.current
            ? Object.entries(tasksBySectionIdRef.current).find(...)
            : null
        onEditItem(group?.[0] ?? task.section_id, task.id)
    },
    [onEditItem],
)
```

**After:**

```typescript
import { useEvent } from 'react-use-event-hook'

const handleTaskEditClick = useEvent((task: Task) => {
    const group = splitGroups
        ? Object.entries(tasksBySectionId).find(...)
        : null
    onEditItem(group?.[0] ?? task.section_id, task.id)
})
```

#### Alternative: useState lazy initialization

For values that need to be computed once (like store instances or initial values), use `useState` with a lazy initializer instead of the ref pattern.

**Before (store creation):**

```typescript
const storeRef = useRef<TaskHierarchyStore>()
if (!storeRef.current) {
    storeRef.current = store ?? createTaskHierarchyStore()
}
```

**After (store creation):**

```typescript
const [storeInstance] = useState<TaskHierarchyStore>(() => store ?? createTaskHierarchyStore())
```

**Before (one-time value computation):**

```typescript
const placeholder = useMemo(
    () => getPlaceholder(completedTaskCount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
)
```

**After (one-time value computation):**

```typescript
const [placeholder] = useState(() => getPlaceholder(completedTaskCount))
```

#### Storing refs in state

Storing refs in state and comparing `.current` values during render is also a violation of this rule. Instead, use a string or enum identifier to track which element is selected.

**Before:**

```typescript
const [selectedInputRef, setSelectedInputRef] = useState(() =>
    initialFocus === 'description' ? richTextDescriptionRef : richTextContentInputRef,
)

// During render:
const isTitleInputFocused = selectedInputRef.current === richTextContentInputRef.current
```

**After:**

```typescript
type SelectedInputType = 'content' | 'description'

const [selectedInput, setSelectedInput] = useState<SelectedInputType>(() =>
    initialFocus === 'description' ? 'description' : 'content',
)

// During render:
const isTitleInputFocused = selectedInput === 'content'
```

### Mismatched `useMemo` dependencies

> Reason: Existing memoization could not be preserved
>
> React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was \[...\], but the source dependencies were \[...\]. Inferred less specific property than source

Typically, this is caused by the use of the optional chaining operator, as the compiler infers the parent object as the actual dependency. Our options here are to either extract the optional-chained property into a variable, or use the parent object as a dependency. We can also consider removing the manual memoization.

**Before:**

```typescript
const splitGroups = useProjectGrouping({ projectId })

const tasksBySectionId = useMemo(() => {
    if (splitGroups?.uncompleted) {
        return splitGroups.uncompleted.reduce(...)
    }
    // ...
}, [sortFn, splitGroups?.uncompleted]) // Optional chaining in deps
```

**After:**

```typescript
const splitGroups = useProjectGrouping({ projectId })
const uncompletedGroups = splitGroups?.uncompleted

const tasksBySectionId = useMemo(() => {
    if (uncompletedGroups) {
        return uncompletedGroups.reduce(...)
    }
    // ...
}, [sortFn, uncompletedGroups]) // Extracted variable in deps
```

### Mutating props

> Reason: Support destructuring of context variables

React Compiler requires props to be treated as immutable, so they can't be reassigned or mutated.

**Before:**

```typescript
function ProjectBoardView({ showCompleted }) {
    const isViewOnly = useSelectIsViewOnlyPublicProject(projectId)
    if (isViewOnly) {
        showCompleted = true // Violation: reassigning prop
    }
}
```

**After:**

```typescript
function ProjectBoardView({ showCompleted: showCompletedProp }) {
    const isViewOnly = useSelectIsViewOnlyPublicProject(projectId)
    const showCompleted = isViewOnly || showCompletedProp
}
```

### Default parameters for props

> Reason: (BuildHIR::node.lowerReorderableExpression) Expression type `MemberExpression` cannot be safely reordered
>
> Reason: (BuildHIR::node.lowerReorderableExpression) Expression type `OptionalMemberExpression` cannot be safely reordered

The compiler can't safely reorder default parameter values that contain expressions. The general fix is to remove the default parameter and use `??` (nullish coalescing) in the function body instead.

**Before:**

```typescript
function DndTaskWrapper({
    task,
    stableTaskId = task.id, // Violation: references sibling parameter
}: Props) {
    // ...
}
```

**After:**

```typescript
function DndTaskWrapper({ task, stableTaskId: stableTaskIdProp }: Props) {
    const stableTaskId = stableTaskIdProp ?? task?.id
    // ...
}
```

The same violation applies to other expression types in default parameters. The fix follows the same principle — move the default out of the parameter list:

- **`ArrowFunctionExpression`** — extract to a module-level function declaration:

    ```typescript
    // Before
    function useField<T>(
        deserialize: (val: unknown) => T = (val) => val as T, // Violation
    )

    // After
    function defaultDeserialize<T>(val: unknown): T {
        return val as T
    }
    function useField<T>(deserialize: (val: unknown) => T = defaultDeserialize)
    ```

- **`JSXElement`** — move the default to the function body with `??`:

    ```typescript
    // Before
    function Layout({ illustration = <DefaultIllustration /> }: Props) // Violation

    // After
    function Layout({ illustration: illustrationProp }: Props) {
        const illustration = illustrationProp ?? <DefaultIllustration />
    }
    ```

- **`CallExpression`** — move the default to the function body with `??`, or extract to a module-level constant for static values:

    ```typescript
    // Before
    function TimeInput({ referenceDate = startOfDay(new Date()) }: Props) // Violation

    // After
    function TimeInput({ referenceDate: referenceDateProp }: Props) {
        const referenceDate = referenceDateProp ?? startOfDay(new Date())
    }

    // Alternative for static values: extract to module-level constant
    const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone
    function Popover({ timezone = DEFAULT_TIMEZONE }: Props)
    ```

### `switch(true)` pattern

> Reason: (BuildHIR::node.lowerReorderableExpression) Expression type `BinaryExpression` cannot be safely reordered
>
> Reason: (BuildHIR::node.lowerReorderableExpression) Expression type `LogicalExpression` cannot be safely reordered

The compiler cannot safely optimize `switch(true)` statements with complex case conditions. Convert to a switch on the variable directly:

**Before:**

```typescript
switch (true) {
    case status === 'pending':
        return { content: <Loader /> }
    case status === 'resolved' && data !== undefined:
        return { content: <Result data={data} /> }
}
```

**After:**

```typescript
switch (status) {
    case 'pending':
        return { content: <Loader /> }
    case 'resolved':
        if (data !== undefined) {
            return { content: <Result data={data} /> }
        }
        break
    case 'idle':
        return { content: <Idle /> }
}
return { content: <Default /> }
```

### Computed property keys

> Reason: (BuildHIR::lowerExpression) Expected Identifier, got `LogicalExpression` key in ObjectExpression
>
> Reason: (BuildHIR::lowerExpression) Expected Identifier, got `BinaryExpression` key in ObjectExpression

The compiler expects simple identifiers as property keys. If computation is required, first extract them into a variable.

**Before:**

```typescript
return {
    ...all,
    [key ?? DEFAULT_SECTION_ID]: tasks,
}
```

**After:**

```typescript
const groupKey = key ?? DEFAULT_SECTION_ID
return {
    ...all,
    [groupKey]: tasks,
}
```

### Loop variable reassignment

> Reason: Destructure should never be Reassign as it would be an Object/ArrayPattern

Declaring a variable before a loop and reassigning it inside is a violation, as the compiler cannot safely track mutable variables.

**Before:**

```typescript
const hasCompletedTasks = useMemo(() => {
    let ancestorType: AncestorType
    for (ancestorType in transformedState) {
        const ancestors = transformedState[ancestorType]
        // ...
    }
}, [transformedState])
```

**After:**

```typescript
const hasCompletedTasks = useMemo(() => {
    for (const ancestorType in transformedState) {
        const ancestors = transformedState[ancestorType as AncestorType]
        // ...
    }
}, [transformedState])
```

### Conditional hook calls

> Reason: Hooks must always be called in a consistent order, and may not be called conditionally. See the Rules of Hooks (https://react.dev/warnings/invalid-hook-call-warning)

The `store?.useState()` pattern conditionally calls a hook, violating the Rules of Hooks.

**Before:**

```typescript
const renderedItems = store?.useState('renderedItems')
```

**After:**

```typescript
import { useStoreState } from '@ariakit/react'

const renderedItems = useStoreState(store, 'renderedItems')
```

The `store.useState()` pattern is from older versions of AriaKit. Since [version 0.4.9](https://ariakit.org/changelog#new-usestorestate-hook), AriaKit provides [`useStoreState`](https://ariakit.org/reference/use-store-state) which accepts stores that are null or undefined, returning undefined in those cases. The same principle applies to any conditional hook call - use an API that handles the conditional case internally.

#### Selector callbacks on store hooks

When migrating from `store.useState(selectorFn)`, fetch the raw state value with `useStoreState` and derive the result in a separate expression.

**Before:**

```typescript
const hovercardPlacement = hovercardStore.useState((state) => state.currentPlacement.split('-')[0])
```

**After:**

```typescript
const currentPlacement = useStoreState(hovercardStore, 'currentPlacement')
const hovercardPlacement = currentPlacement?.split('-')[0]
```

#### Hooks passed as props

> Reason: Hooks must be the same function on every render, but this value may change over time to a different function. See https://react.dev/reference/rules/react-calls-components-and-hooks#dont-dynamically-use-hooks

Passing a hook as a prop and calling it inside a child component is a violation — the hook identity can change between renders. Call the hook at the parent level and pass the result instead.

**Before:**

```typescript
function Parent() {
    const useValidator = useCallback(
        function useValidator() {
            return useFormValidator(formId)
        },
        [formId],
    )
    return <FormField useValidator={useValidator} />
}

function FormField({ useValidator }: Props) {
    const [state, validate] = useValidator() // Violation
    // ...
}
```

**After:**

```typescript
function Parent() {
    const validator = useFormValidator(formId)
    return <FormField validator={validator} />
}

function FormField({ validator }: Props) {
    const [state, validate] = validator
    // ...
}
```

#### Hooks in function expressions

> Reason: Hooks must be called at the top level in the body of a function component or custom hook, and may not be called within function expressions. See the Rules of Hooks (https://react.dev/warnings/invalid-hook-call-warning)

Defining a component inside `useMemo` and calling hooks within it is a violation — the compiler sees hooks called inside a non-component function expression. Extract the component to the top level and use Context to pass dynamic values from the parent scope.

**Before:**

```typescript
function useCustomTrigger({ variant }: { variant: 'compact' | 'full' }) {
    return useMemo(
        () =>
            function CustomTrigger(props: TriggerProps) {
                const { items } = useListContext() // Violation
                return (
                    <button {...props}>
                        {variant === 'compact' ? items.length : items.join(', ')}
                    </button>
                )
            },
        [variant],
    )
}

function MySelect({ variant }: Props) {
    const CustomTrigger = useCustomTrigger({ variant })
    return <Select Trigger={CustomTrigger} />
}
```

**After:**

```typescript
const VariantContext = createContext<'compact' | 'full'>('full')

function CustomTrigger(props: TriggerProps) {
    const variant = useContext(VariantContext)
    const { items } = useListContext()
    return (
        <button {...props}>
            {variant === 'compact' ? items.length : items.join(', ')}
        </button>
    )
}

function MySelect({ variant }: Props) {
    return (
        <VariantContext.Provider value={variant}>
            <Select Trigger={CustomTrigger} />
        </VariantContext.Provider>
    )
}
```

### Function declaration order

> Reason: Cannot access variable before it is declared
>
> handleFormInputEnter is accessed before it is declared, which prevents the earlier access from updating when this value changes over time

or

> Reason: [PruneHoistedContexts] Rewrite hoisted function references

The compiler analyzes function dependencies statically. Functions must be declared before they're referenced by other functions.

**Before:**

```typescript
function handleFormInputEnter(event: KeyboardEvent) {
    onChange?.(getCurrentEditorValue())
    handleFormSubmit(event) // Error: accessed before declaration
}

function handleFormSubmit(event: KeyboardEvent | React.MouseEvent) {
    // ...
}
```

**After:**

```typescript
function handleFormSubmit(event: KeyboardEvent | React.MouseEvent) {
    // ...
}

function handleFormInputEnter(event: KeyboardEvent) {
    onChange?.(getCurrentEditorValue())
    handleFormSubmit(event) // Now valid
}
```

#### Self-referential callbacks

When a callback references itself (for retry logic with `setTimeout` or animation loops with `requestAnimationFrame`), reordering won't help. Instead, use an **inner function declaration** for the self-referencing logic.

**Before:**

```typescript
const _logout = useEvent(() => {
    if (syncStatus === 'ready') {
        logout()
        return
    }
    setTimeout(_logout, 500) // Error: _logout accessed before declared
})
```

**After:**

```typescript
const _logout = useEvent(() => {
    function handleLogout() {
        if (syncStatus === 'ready') {
            logout()
            return
        }
        setTimeout(handleLogout, 500)
    }
    handleLogout()
})
```

The inner function declaration is hoisted within its scope, allowing self-reference without depending on the outer variable. This pattern works for both `useEvent` and `useCallback`.

**Warning:** The inner function captures state values at invocation time. For values read across async callbacks (like retry counters), use `useRef` instead.

#### Avoiding self-reference entirely

If the self-reference is for "run once" behavior (like detaching a listener after first call), consider refactoring to avoid self-reference entirely:

```typescript
// Instead of detaching inside the handler via self-reference:
const onEvent = useEvent(function handler() {
    subject.detach(handler) // Self-reference violation
    // ...
})

// Use a ref to track state and detach in useEffect cleanup:
const hasRunRef = useRef(false)

const onEvent = useEvent(() => {
    if (hasRunRef.current) return
    hasRunRef.current = true
    // ...
})

useEffect(
    function attachEvent() {
        subject.attach(onEvent)
        return () => subject.detach(onEvent)
    },
    [onEvent],
)
```

### Try/catch blocks

React Compiler has limited support for try/catch statements. Several patterns cause violations:

> **Note:** A fix for some of these limitations has been merged and may be available in a future compiler release. See [facebook/react#35606](https://github.com/facebook/react/pull/35606).

#### Structural violations

These violations occur when the compiler can't parse the shape of the try/catch statement itself.

**Try-catch-finally**

> Reason: (BuildHIR::lowerStatement) Handle TryStatement with a finalizer ('finally') clause

The `finally` clause causes compiler violations. Remove `finally` and explicitly handle cleanup in all code paths.

**Before:**

```typescript
async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
        const response = await fetch('/api/endpoint', { method: 'POST' })
        if (!response.ok) {
            setError('Request failed')
            return
        }
        setSuccess(true)
    } catch {
        setError('Unknown error')
    } finally {
        setIsSubmitting(false)
    }
}
```

**After:**

```typescript
async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
        const response = await fetch('/api/endpoint', { method: 'POST' })
        if (!response.ok) {
            setError('Request failed')
            setIsSubmitting(false)
            return
        }
        setSuccess(true)
        setIsSubmitting(false)
    } catch {
        setError('Unknown error')
        setIsSubmitting(false)
    }
}
```

**Try without catch**

> Reason: (BuildHIR::lowerStatement) Handle TryStatement without a catch clause

Try statements must have a `catch` clause. A `try { } finally { }` without `catch` is not supported. Additionally, since `finally` itself can cause violations (see above), consider removing it entirely.

**Before:**

```typescript
useEffect(function loadData() {
    ;(async () => {
        try {
            const data = await fetchData()
            setState(data)
        } finally {
            setIsLoading(false)
        }
    })().catch(() => setError('Failed'))
}, [])
```

**After:**

```typescript
useEffect(function loadData() {
    ;(async () => {
        try {
            const data = await fetchData()
            setState(data)
            setIsLoading(false)
        } catch {
            setError('Failed')
            setIsLoading(false)
        }
    })()
}, [])
```

#### Content violations

These violations occur because of what's inside the try/catch block.

**ThrowStatement inside try/catch**

> Reason: ThrowStatement inside try/catch not yet supported

Throwing errors inside try blocks causes violations. Handle errors directly instead of using throw.

**Before:**

```typescript
try {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
} catch (error) {
    console.error(error)
    setLoadState('error')
}
```

**After:**

```typescript
try {
    const response = await fetch(url)
    if (!response.ok) {
        // Handle error directly instead of throwing
        console.error(`HTTP Error: ${response.status} ${response.statusText}`)
        setLoadState('error')
        return
    }
    return await response.json()
} catch (error) {
    console.error(error)
    setLoadState('error')
}
```

**Value blocks in try/catch**

> Reason: Support value blocks (conditional, logical, optional chaining, etc) within a try/catch statement

Conditional expressions (`? :`), logical operators (`&&`, `||`), nullish coalescing (`??`), and optional chaining (`?.()`) inside try/catch cause violations. The general fix is to extract the try/catch logic into a helper function, or replace optional chaining with explicit `if` checks.

_Extract to helper function:_

**Before:**

```typescript
const value = useMemo(() => {
    try {
        return riskyOperation() ?? fallback
    } catch {
        return fallback
    }
}, [deps])
```

**After:**

```typescript
function safeRiskyOperation(deps: Deps) {
    try {
        return riskyOperation(deps) ?? fallback
    } catch {
        return fallback
    }
}

const value = useMemo(() => safeRiskyOperation(deps), [deps])
```

_Replace optional chaining with explicit checks:_

**Before:**

```typescript
try {
    await doSomething()
    onSuccessCallback?.()
} catch (error) {
    onFailureCallback?.(error)
}
```

**After:**

```typescript
try {
    await doSomething()
    if (onSuccessCallback) {
        onSuccessCallback()
    }
} catch (error) {
    if (onFailureCallback) {
        onFailureCallback(error)
    }
}
```

**Redundant try/catch**

When calling a function that already handles errors internally and returns a safe fallback, wrapping it in another try/catch is redundant and may cause violations.

**Before:**

```typescript
// getLocalStorageValue already has internal try/catch, returns undefined on error
function getLocalStorageValue<T>(key: string): T | undefined {
    try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : undefined
    } catch {
        return undefined
    }
}

const [value, setValue] = useState<T>(() => {
    try {
        return getLocalStorageValue(key) ?? defaultValue
    } catch {
        return defaultValue
    }
})
```

**After:**

```typescript
// getLocalStorageValue already handles errors, no outer try/catch needed
const [value, setValue] = useState<T>(() => getLocalStorageValue(key) ?? defaultValue)
```

### Mutable objects created with useMemo

> Reason: This value cannot be modified. Modifying a value previously passed as an argument to a hook is not allowed.

Creating mutable objects (Web Workers, stores, etc.) with `useMemo` and then mutating them in `useEffect` triggers a compiler error because the compiler tracks values through hooks.

**Before:**

```typescript
const worker = useMemo(() => createWebWorker(), [])

useEffect(
    function assignMessageHandler() {
        worker.onmessage = handleMessage // Error: mutating hook return value
    },
    [worker],
)
```

**After:**

```typescript
const workerRef = useRef<Worker | null>(null)

function getWorker(): Worker {
    if (!workerRef.current) {
        workerRef.current = createWebWorker()
    }
    return workerRef.current
}

useEffect(function assignMessageHandler() {
    const worker = getWorker()
    worker.onmessage = handleMessage
    return () => {
        worker.onmessage = null
    }
    // getWorker only accesses a stable ref
}, [])
```

### Mutating function or hook return values

> Reason: This value cannot be modified. Modifying a value returned by a function is not allowed.

Objects returned from functions or hooks should be treated as immutable. Create new objects instead of mutating properties directly.

**Before:**

```typescript
function FilterSection({ onSetViewOptions }) {
    const parsedQuery = parseFilterQueryOrDefault(filterBy)

    function handleAssignedChange(assigneeFilter: string) {
        // Violation: mutating returned object
        parsedQuery.assignees = assigneeFilter === '!assigned' ? 'NOT_ASSIGNED' : 'ANY'
        onSetViewOptions({ filterBy: buildFilterQuery(parsedQuery) })
    }
}
```

**After:**

```typescript
function FilterSection({ onSetViewOptions }) {
    const parsedQuery = parseFilterQueryOrDefault(filterBy)

    function handleAssignedChange(assigneeFilter: string) {
        const newAssignees = assigneeFilter === '!assigned' ? 'NOT_ASSIGNED' : 'ANY'
        // Create new object with spread operator
        onSetViewOptions({
            filterBy: buildFilterQuery({ ...parsedQuery, assignees: newAssignees }),
        })
    }
}
```

### DOM mutations

> Reason: This value cannot be modified.

The compiler treats DOM property assignments as mutations that cannot be tracked.

#### Redirects during render

Assigning to `window.location.href` during render is a side effect. Move these to `useEffect`.

**Before:**

```typescript
function PublicRouteWrapper({ children }: { children: React.ReactNode }) {
    const authenticatedUser = localStorage.getItem('User')

    if (authenticatedUser) {
        window.location.href = '/app'
        return null
    }

    return <>{children}</>
}
```

**After:**

```typescript
function PublicRouteWrapper({ children }: { children: React.ReactNode }) {
    const authenticatedUser = localStorage.getItem('User')

    function shouldRedirectToApp() {
        return Boolean(authenticatedUser)
    }

    useEffect(function redirectToApp() {
        if (shouldRedirectToApp()) {
            window.location.href = '/app'
        }
    }, [authenticatedUser])

    if (shouldRedirectToApp()) {
        return null
    }

    return <>{children}</>
}
```

#### Element property assignments

Assigning to element properties like `scrollTop` also triggers this error. Use the equivalent method call instead.

**Before:**

```typescript
useLayoutEffect(
    function scrollToElement() {
        if (resultList && resultList.scrollHeight > resultList.clientHeight) {
            // Violation: direct property assignment
            resultList.scrollTop = elementBottom - resultList.clientHeight
        }
    },
    [currentId, resultList],
)
```

**After:**

```typescript
useLayoutEffect(
    function scrollToElement() {
        if (resultList && resultList.scrollHeight > resultList.clientHeight) {
            // Use scroll() method instead of scrollTop assignment
            resultList.scroll({ top: elementBottom - resultList.clientHeight })
        }
    },
    [currentId, resultList],
)
```

### Render-time mutations in test code

> Reason: This value cannot be modified

Test files are compiled too, so patterns like mutating an external `let` variable or object property from inside a rendered component trigger this violation.

#### Render counting with `React.Profiler`

**Before:**

```typescript
let renderCount = 0
function TestComponent() {
    renderCount += 1 // Violation: mutation during render
    return <div />
}
render(<TestComponent />)
expect(renderCount).toBe(1)
```

**After:**

```typescript
const onRender = jest.fn() // or vi.fn() in Vitest
function TestComponent() {
    return <div />
}
render(
    <React.Profiler id="test" onRender={onRender}>
        <TestComponent />
    </React.Profiler>,
)
expect(onRender).toHaveBeenCalledTimes(1)
```

#### Hook testing with `renderHook`

**Before:**

```typescript
let state: ReturnType<typeof useMyHook>
function TestComponent(options: Options) {
    state = useMyHook(options) // Violation: mutation during render
    return <div />
}
render(<TestComponent {...options} />)
expect(state.someValue).toBe(expected)
```

**After:**

```typescript
const { result } = renderHook(() => useMyHook(options))
expect(result.current.someValue).toBe(expected)
```

### Memoization gap with intervening hooks

> This is not a compiler error — the file compiles cleanly and passes
> `react-compiler-tracker --check-files`. The compiler silently produces
> correct but unmemoized output.

**Broken — `sorted` is NOT memoized (intervening hook between definition and consumer)** [(playground)](https://playground.react.dev/#N4Igzg9grgTgxgUxALhAMygOzgFwJYSYAEACjBAFYK4BCEAhjACYAUwRY1+hYANEU3o56RAL7JS5AA5gAlEWAAdYkTg8cHCDBwImRALwcuBTGAB0OCAGUtO1moC2UxggBimWcqKr1RANpqmDjkADYhugC6BkRQnADyOAAWCDAAEhAQANYsgsLy3gXeAPRFRIAJhEQARjAI9JlgREkIHGpSCF4+php+eEx8RjgAkn1RhrEIVsI6LJDaumYO9FIzxoQGAHxGuCZmvbKeKjU4sMQAPADCiXghepzbPPrAs3aiREXryqIgvCCBaHgAcxQIDwTlsjQAnm0FKQQlAAXhMHEpNxTGIiGhyA4iABySr0SoIEIAWikcIRmGJNXouGJjik1xSRSYeDAOBxAG5lMo2B0SvTrkITABZCBMBASRQgehhKWfDhCsD-BANEjkxHI1FyDnfcCJCAAd0GQRSmBlYBQaHNCFEQA)**:**

```tsx
function ProjectBoard({ sections, data }: Props) {
    const sorted = sections.toSorted(compareFn)
    const [controlled] = useOtherHook(data) // ← breaks the scope
    const [ids, setIds] = useState(sorted.map((section) => section.id))
    return <Child sections={sorted} />
}
```

**Why:** The compiler identifies a memoization scope for `sorted` but prunes it because the intervening `useOtherHook` call cannot be placed inside a conditional cache block (Rules of Hooks). No warning is emitted. To confirm, [inspect the compiled output](#compiled-output-inspection) or [detect pruned memo blocks via the logger](#detecting-pruned-memoization-via-logger). See [facebook/react#34369](https://github.com/facebook/react/issues/34369) for the upstream issue.

**Fix: extract a cohesive hook that groups the value with its consumer** [(playground)](https://playground.react.dev/#N4Igzg9grgTgxgUxALhAMygOzgFwJYSYAEUYCAyhDDggCbkK4GZgAUZThYyRDnmAbQC6ASiLAAOsSJwuOIpGp0iAXgWN8XAHQ4IlJbVayAtgAcAhjAQAxTCKlEZcogLy0wAGnU4Aku6GqJGTkOOY07FQ0tFrG5qbsGsyqAHzq-FpuIvbSVjiwxMAKkXRebp7efmBEAL5StZhSGNiaxAAKMBAAVhoAQhCWhoUcLeW0YeY1PO0QpmBiktKyLPJDxbSl7l5kvu41gaQUa3wjCfxzDk7LLks4HQA2d3QBagcA8jgAFggwABIQEABrVhjULZRy5fJEAA8AGEPng7rQ0iMVMBFFFqkQAPTJOogDwgJZoPAAcxQIDwZkiRBwAE9TAhxERWncoCS8JhXqYRns0B1jEQAOQAI3MwoQdwAtKZWezMJKrOZcJKTKYEd8sbQ8GAcIKANxSKSsBaOLFY1UIsLMACyEFoCB4EhA5geTrqCitYGJCCqLLZHK5IxEevx4A+EAA7j5MDQYJgXWAUGgEwhqkA)**:**

```tsx
function useSortedSections(sections: Section[]) {
    const sorted = sections.toSorted(compareFn)
    const [ids, setIds] = useState(sorted.map((section) => section.id))
    return { sorted, ids, setIds }
}

function ProjectBoard({ sections, data }: Props) {
    const { sorted, ids, setIds } = useSortedSections(sections)
    const [controlled] = useOtherHook(data)
    return <Child sections={sorted} />
}
```

The extracted hook must contain at least one real hook call (here, `useState`) — otherwise the compiler treats it as a plain function and does not instrument it.

## Appendix: Alternative verification methods

These methods are alternatives to the CLI tool for deeper debugging. The CLI tool (shown in [Verify the fix](#4-verify-the-fix)) is the recommended approach for day-to-day use.

**Babel with Inline Logger**

Run a Node script that uses Babel's API with a custom logger to see exact errors:

```bash
node -e "
require('@babel/core').transformFileSync('src/path/to/file.tsx', {
  presets: ['@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]],
  plugins: [['babel-plugin-react-compiler', {
    logger: {
      logEvent(filename, event) {
        if (event.kind === 'CompileError') {
          console.error('[CompileError]', filename);
          console.error('Reason:', event.detail?.reason);
          const loc = event.detail?.primaryLocation?.();
          if (loc?.start) console.error('Location: Line', loc.start.line);
        }
      }
    }
  }]]
});
"
```

**Compiled output inspection**

To check whether the compiler memoizes a specific value, compile the file with `babel-plugin-react-compiler` and inspect the output:

```bash
node -e "
const babel = require('@babel/core');
const fs = require('fs');
const code = fs.readFileSync('src/path/to/file.tsx', 'utf8');
const result = babel.transformSync(code, {
  filename: 'file.tsx',
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [['babel-plugin-react-compiler', { target: '18' }]],
});
console.log(result.code);
"
```

**Reading the output:**

Successfully optimized code includes these patterns:

- `import { c as _c } from "react-compiler-runtime"` at the top
- `const $ = _c(N)` where N is the number of memo slots
- Conditional blocks checking `$[n] !== value` for cache invalidation

If the transpiled output lacks these patterns, the component was not optimized.

**Verifying a specific value is memoized:**

Search the compiled output for the variable name. A memoized value appears inside a cache guard block with a corresponding cache assignment:

```js
// Memoized: value is cached at $[1], recomputed only when `sections` changes
if ($[0] !== sections) {
    sortedSections = [...sections].sort(_temp)
    $[0] = sections
    $[1] = sortedSections
} else {
    sortedSections = $[1]
}
```

An unmemoized value appears as a bare `const` outside any cache block:

```js
// NOT memoized: recomputed every render, new reference each time
const sortedSections = [...sections].sort(_temp)
```

This is the only reliable way to verify memoization for values affected by the [memoization gap with intervening hooks](#memoization-gap-with-intervening-hooks), since the compiler reports no errors for those cases.

**Detecting pruned memoization via logger**

The compiler's `CompileSuccess` event includes metrics that reveal when memoization scopes were identified but then pruned. Attach a logger that checks for `prunedMemoBlocks > 0`:

```bash
node -e "
const babel = require('@babel/core');
const fs = require('fs');
const code = fs.readFileSync('src/path/to/file.tsx', 'utf8');
babel.transformSync(code, {
  filename: 'file.tsx',
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [['babel-plugin-react-compiler', {
    target: '18',
    logger: {
      logEvent(filename, event) {
        if (event.kind === 'CompileSuccess') {
          const name = event.fnName || '(anonymous)';
          const pruned = event.prunedMemoBlocks || 0;
          if (pruned > 0) {
            console.warn('[PRUNED]', name, '—', pruned, 'memo block(s) pruned');
          }
        }
      }
    }
  }]]
});
"
```

A pruned memo block means the compiler identified a value worth memoizing but could not create a conditional cache block for it (typically due to intervening hook calls). This is not a correctness issue, but it produces unstable references that can break patterns depending on referential stability.
