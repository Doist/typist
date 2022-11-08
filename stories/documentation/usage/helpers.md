# Helpers

Passing down a `ref` to the `TypistEditor` component gives us access to some helper functions, such as:

-   `getEditor()`: Returns the [`Editor`](https://tiptap.dev/api/editor) instance coupled to the `TypistEditor` component;
-   `getMarkdown()`: Returns the current editor document output as Markdown;
-   `getAllNodesAttributesByType(nodeType)`: Returns the attributes of a given node type for all the nodes in the editor document.

```tsx
import { useRef } from 'react'
import { useEvent } from 'react-use-event-hook'

import { TypistEditor, RichTextKit } from '@doist/typist'

import type { TypistEditorRef } from '@doist/typist'

function TypistEditorContainer({ content }) {
    const typistEditorRef = useRef<TypistEditorRef>(null)

    const handleUpdate = useEvent(function handleUpdate() {
        console.log(typistEditorRef.current?.getMarkdown() || '')
    })

    return (
        <TypistEditor
            content={content}
            extensions={[RichTextKit]}
            onUpdate={handleUpdate}
            ref={typistEditorRef}
        />
    )
}
```

Although the example above uses `onUpdate`, this specific event provides its own `getMarkdown` function for a more convenient access to the current editor Markdown document:

```tsx
const handleUpdate = useEvent(function handleUpdate({ getMarkdown }: UpdateProps) {
    console.log(getMarkdown())
})
```
