# TypeScript Readability

These guidelines apply to TypeScript and TSX.

## Use Visual Paragraphs

Whitespace is part of code structure. Write each function as a sequence of small visual paragraphs. A paragraph contains statements that serve one immediate purpose. Add a blank line when the code moves to a different purpose.

Common purposes include:

- Getting dependencies or input
- Deriving or normalizing a value
- Validating a value or branching
- Transforming or consuming a value
- Causing a side effect or updating state
- Returning a result

Keep statements together only when they form one atomic thought. For example, closely related declarations can stay together. Do not add blank lines mechanically between every statement.

## Keep Control Flow Multiline

Always use a multiline body for control flow, even when it contains one statement. Do not put a condition and its `return`, `throw`, `continue`, or `break` on the same line.

Keep a condition and its body together. Add blank lines before and after the block when the surrounding code performs a different step.

```typescript
// Avoid
function getConnectionTraceId(sessionId: string): string | undefined {
    const spanContext = getConnectionSpan(sessionId)?.spanContext()
    if (!spanContext || !isValidSpanContext(spanContext)) return undefined
    return spanContext.traceId
}

// Prefer
function getConnectionTraceId(sessionId: string): string | undefined {
    const spanContext = getConnectionSpan(sessionId)?.spanContext()

    if (!spanContext || !isValidSpanContext(spanContext)) {
        return undefined
    }

    return spanContext.traceId
}
```

## Separate Setup From Use

Keep obtaining a value separate from checking, transforming, consuming, or changing it. This includes values returned by function calls and, in frameworks that use them, hooks.

```typescript
function getVisibleTasks(tasks: Task[], query: string): Task[] {
    const normalizedQuery = normalizeQuery(query)

    if (!normalizedQuery) {
        return tasks
    }

    return tasks.filter(function isTaskVisible(task) {
        return task.content.includes(normalizedQuery)
    })
}
```

Use the same structure in callbacks and loops: derive a value, validate it, then update state or perform an effect. Separate those phases with blank lines when they are distinct steps.

```typescript
for (const task of tasks) {
    const isVisible = visibleTaskIds.has(task.id)

    if (!isVisible) {
        continue
    }

    visibleTasks.push(task)
}
```
