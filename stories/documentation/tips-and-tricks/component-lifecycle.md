# Component Lifecycle

## Re-rendering

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

Here `extensions` is memoized so the `React.memo` shallow prop check passes and the component can skip the re-render. It's not needed to protect the editor: `extensions` is captured once at mount (see below), so a new array reference never recreates or reconfigures it.

## Properties

The `TypistEditor` component is designed to be initialized once and never recreated. The `content`, `extensions`, and `placeholder` props are captured at mount and later changes are ignored. The `editable` prop is the exception: it can change at runtime.

### `content`

Captured at mount. To change the content afterwards, call `setContent()` on the editor instance, accessed through the component ref:

```tsx
const editorRef = useRef<TypistEditorRef>(null)

editorRef.current?.getEditor().commands.setContent(newContent)
```

### `extensions`

Captured at mount. An extension that depends on changing data can't be updated by recomputing the array, the new array is ignored. Keep the extension instance stable and have it read the dynamic data when it runs, through a ref or store. For example, an extension (your own) that needs an up-to-date collaborators list:

```tsx
// Don't: recomputing the array when `collaborators` changes has no effect, because the editor
// captured the original array at mount and never sees the update.
const extensions = useMemo(
    function configureExtensions() {
        return [MentionExtension.configure({ collaborators })]
    },
    [collaborators],
)
```

```tsx
// Do: keep the extensions stable and let the extension read the latest value through a ref.
const collaboratorsRef = useRef(collaborators)

collaboratorsRef.current = collaborators

const extensions = useMemo(function configureExtensions() {
    return [MentionExtension.configure({ getCollaborators: () => collaboratorsRef.current })]
}, [])
```

### `editable`

Can change at runtime. Toggling it applies via `editor.setEditable()` internally, without recreating the editor, so undo history, selection, and DOM state are preserved:

```tsx
<TypistEditor editable={isEditable} extensions={extensions} />
```

### Event handler callbacks

Event handler callbacks (`onUpdate`, `onFocus`, `onBlur`, etc.) are always resolved to their latest version internally, so there is no need to wrap them with `useCallback` for performance reasons.
