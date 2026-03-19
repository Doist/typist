# React Async Patterns

## Race Conditions

Use `AbortController` and `useEffect` cleanup to cancel stale operations.

```typescript
useEffect(
    function fetchProjectData() {
        const controller = new AbortController()

        api.getProject(projectId, { signal: controller.signal })
            .then((data) => {
                setProject(data)
            })
            .catch((error) => {
                if (isAbortError(error?.cause ?? error)) {
                    return // expected: request was cancelled
                }
                setError(error)
            })

        return function abortFetchProjectData() {
            controller.abort()
        }
    },
    [projectId],
)
```

When a dependency changes before the previous request completes, the cleanup function aborts the stale request, preventing updates from out-of-order responses.

## Data Fetching

- Fetch at the feature/page level, not deep in the component tree
- Transform data at the API boundary, not in components
- Handle all three states: loading, error, and success

```typescript
function ProjectPage({ projectId }: { projectId: string }) {
    const { data, error, isLoading } = useProjectData(projectId)

    if (isLoading) {
        return <Skeleton />
    }

    if (error) {
        return <ErrorState error={error} />
    }

    return <ProjectView project={data} />
}
```

## Debouncing and Throttling

Debounce user input that triggers expensive operations.

```typescript
function useSearchTasks() {
    const dispatch = useAppDispatch()
    const [query, setQuery] = useState('')

    const debouncedSearch = debounce((value: string) => dispatch(searchTasks(value)), 300)

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value
        setQuery(value)
        debouncedSearch(value)
    }

    // Clean up on unmount
    useEffect(
        function cleanupDebouncedSearch() {
            return function cancelPendingSearch() {
                debouncedSearch.cancel()
            }
        },
        [debouncedSearch],
    )

    return { query, handleChange }
}
```

## Rules

- **Always cancel stale operations** - Use `AbortController` in effects that fetch data
- **Debounce user input** - Prevent excessive API calls from rapid typing or interaction
- **Clean up on unmount** - Cancel timers, abort requests, unsubscribe from listeners
