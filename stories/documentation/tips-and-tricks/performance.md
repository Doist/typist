# Performance

## Component

The `<TypistEditor>` component tries to keep its internal state as stable as possible without triggering unnecessary re-renders, however, it's still not immune to re-renders from the parent component. If you measured performance and found this to be a problem, you may consider wrapping the `<TypistEditor>` component with `React.memo`:

```tsx
import { TypistEditor, PlainTextKit } from '@doist/typist'

const MemoizedTypistEditor = React.memo(TypistEditor)

function PlainTextEditorContainer({ content }) {
    const extensions = useMemo(function configureExtensions() {
        return [PlainTextKit]
    }, [])

    return <MemoizedTypistEditor content={content} extensions={extensions} />
}
```

## Component Properties

It's important to know that most `<TypistEditor>` properties will recreate the internal `Editor` instance when they are changed (please refer to each property JSDoc for more information), thus re-rendering the Typist component. For instance, because the `extensions` property takes an array, every re-render of the parent component will create a new array and in turn trigger the recreation of the internal `Editor` instance. In this case, you may consider wrapping the `extensions` array with `useMemo`.

```tsx
import { useMemo } from 'react'

import { TypistEditor, PlainTextKit } from '@doist/typist'

function PlainTextEditorContainer({ content }) {
    const extensions = useMemo(function configureExtensions() {
        return [PlainTextKit]
    }, [])

    return <TypistEditor content={content} extensions={extensions} />
}
```
