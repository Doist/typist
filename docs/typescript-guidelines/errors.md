# Error Handling

Fix errors at the source. Never suppress warnings without a clear technical reason.

## Rules

- **Always `catch (error: unknown)`** - Never assume the type of a caught error
- **Narrow before using** - Use `instanceof` or type guards to identify error types
- **Early returns over nesting** - Guard clauses reduce cognitive load
- **Log once at the boundary** - Don't log the same error at multiple layers
- **Fix, don't suppress** - Structural fixes (proper types, refactoring) over `eslint-disable` or `@ts-ignore`

## Validating Error Types

Always type catch parameters as `unknown` and narrow before accessing properties.

```typescript
try {
    await saveProject(project)
} catch (error: unknown) {
    if (error instanceof ApiError) {
        logger.error('Failed to save project', { code: error.code, message: error.message })
        showErrorToast(error.userMessage)
        return
    }

    if (error instanceof TypeError) {
        logger.error('Type error saving project', { error })
        return
    }

    logger.error('Unexpected error saving project', { error })
}
```

## Custom Error Types

Use discriminated unions with a `kind` field for domain-specific error handling.

```typescript
type ApiResult<T> =
    | { kind: 'success'; data: T }
    | { kind: 'validation_error'; fields: Record<string, string> }
    | { kind: 'not_found' }
    | { kind: 'network_error'; retryable: boolean }

function handleApiResult<T>(result: ApiResult<T>) {
    switch (result.kind) {
        case 'success':
            return result.data
        case 'validation_error':
            showFieldErrors(result.fields)
            return
        case 'not_found':
            navigateTo404()
            return
        case 'network_error':
            if (result.retryable) {
                scheduleRetry()
            }
            return
    }
}
```

## Early Returns

Flatten nested conditionals into guard clauses.

```typescript
// Good: early returns
function processTask(task: Task | null, user: User | null): void {
    if (!task) {
        return
    }

    if (!user) {
        redirectToLogin()
        return
    }

    if (!user.canEdit(task)) {
        showPermissionError()
        return
    }

    openEditor(task)
}

// Bad: deeply nested
function processTask(task: Task | null, user: User | null): void {
    if (task) {
        if (user) {
            if (user.canEdit(task)) {
                openEditor(task)
            } else {
                showPermissionError()
            }
        } else {
            redirectToLogin()
        }
    }
}
```

## Error Tracking (Sentry)

Never import from `@sentry/*` directly. Use the project's `logger` module which wraps Sentry with consistent fingerprinting and context.

```typescript
// Good: use project logger
import { logger, captureInfo } from 'src/logger/logger'

logger.error('Sync failed', { error, projectId })
captureInfo('Feature flag fallback used', { flagName })

// Bad: direct Sentry import
import * as Sentry from '@sentry/react'
Sentry.captureException(error)
```

When adding error context, include structured data that aids debugging:

```typescript
logger.error('Task update failed', {
    error,
    taskId: task.id,
    projectId: task.projectId,
    action: 'complete',
})
```
