# Async Patterns

## Promise Handling

Always handle rejections. Use `async`/`await` over `.then()` chains. Never fire-and-forget a promise.

```typescript
// Good: async/await with error handling
async function loadProject(id: string): Promise<Project> {
    try {
        const response = await api.getProject(id)
        return response.data
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            logger.error('Failed to load project', { id, error })
        }
        throw error
    }
}

// Bad: unhandled promise
function loadProject(id: string) {
    api.getProject(id) // no await, no .catch()
}

// Bad: void promise without handling
void fetchData() // fire-and-forget
```

## Rules

- **No fire-and-forget promises** - Every promise must be awaited, returned, or have its rejection handled
- **Handle all three states** - Loading, error, and success for every async operation
