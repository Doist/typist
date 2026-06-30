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

Captured at mount. An extension that depends on changing data can't be updated by recomputing the array, the new array is ignored. Keep the extension instance stable and have it read the dynamic data on demand when it runs. Configure the extension with a getter and resolve the current value inside it, instead of passing the value directly. For example, an extension (your own) that needs an up-to-date collaborators list:

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

The cleanest source for a getter is an external store, since you can read the current value synchronously, on demand, at any time. Typist only calls the getter, so where the data lives is up to you. Close over the stable store reference and read it inside the getter.

```tsx
// Do (recommended): read the latest value from a store on demand. `collaboratorsStore` stands in
// for wherever your data lives. Its `getState()` could be Redux's, Zustand's vanilla store, or
// your own. The getter closes over the stable store, so it always returns the current value, and
// it keeps working while the editor is being created.
const extensions = useMemo(function configureExtensions() {
    return [
        MentionExtension.configure({
            getCollaborators: () => collaboratorsStore.getState().collaborators,
        }),
    ]
}, [])
```

If the data is plain React state or props rather than a store, mirror it into a ref and update that ref from an effect. Don't write the ref during render: React discourages it, and it misbehaves under concurrent rendering when a render is started but never committed. Seed the ref with the initial value so reads are correct from the first mount.

```tsx
// Do: mirror plain state/props into a ref from an effect, then read the ref in the getter.
const collaboratorsRef = useRef(collaborators)

useLayoutEffect(
    function syncCollaborators() {
        collaboratorsRef.current = collaborators
    },
    [collaborators],
)

const extensions = useMemo(function configureExtensions() {
    return [MentionExtension.configure({ getCollaborators: () => collaboratorsRef.current })]
}, [])
```

Both the store getter and the seeded ref read fine while the editor is being created (in `onBeforeCreate` or `onCreate`): the store is readable at any time, and the ref already holds its seeded initial value.

To skip maintaining the ref and effect yourself, you can reach for a `useEvent`-style hook (such as the [`react-use-event-hook`](https://npmx.dev/package/react-use-event-hook) package). It folds the same ref-and-effect mechanism into one stable function whose body always sees the latest props and state, and you pass it straight in as the getter.

That convenience has one limit, though. A `useEvent`-style hook fills its internal ref from an effect, so unlike the store getter or the seeded ref it throws if called before mount. Typist sets `immediatelyRender: true`, so the editor is constructed during render, before that effect runs. If an extension reads the getter during editor construction, pass the initial value as a plain config option to cover that read and use the getter afterward. Reads after mount are safe: for example, `onCreate` is emitted from a `setTimeout` after the effect has filled the ref. Otherwise the getter alone is enough:

```tsx
// `initialCollaborators` covers the `onBeforeCreate` read; `getCollaborators` takes over afterwards.
const [initialCollaborators] = useState(() => collaborators)
const getCollaborators = useEvent(() => collaborators)

const extensions = useMemo(
    function configureExtensions() {
        return [MentionExtension.configure({ initialCollaborators, getCollaborators })]
    },
    [initialCollaborators, getCollaborators],
)
```

### `editable`

Can change at runtime. Toggling it applies via `editor.setEditable()` internally, without recreating the editor, so undo history, selection, and DOM state are preserved:

```tsx
<TypistEditor editable={isEditable} extensions={extensions} />
```

### Event handler callbacks

Event handler callbacks (`onUpdate`, `onFocus`, `onBlur`, etc.) are always resolved to their latest version internally, so there is no need to wrap them with `useCallback` for performance reasons.
