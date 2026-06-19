# Reactive Editor State

## Transactions and Re-renders

The `TypistEditor` component does **not** re-render on every [ProseMirror transaction](https://prosemirror.net/docs/guide/#transform). Transactions fire on every keystroke, cursor movement, selection change, and plugin update, and re-rendering the editor on each one would be wasteful, since `TypistEditor` doesn't read any reactive editor state during render.

Instead, changes are reported through event callbacks like `onUpdate`, `onSelectionUpdate`, and `onTransaction`, which fire whether or not the component re-renders.

## Subscribing to Editor State

To build UI **outside** the editor that stays in sync with it, like a formatting toolbar, subscribe to the editor yourself with React's [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore). Only the subscribing component re-renders, not the editor or its siblings. Subscribe to the fewest events your UI actually needs.

### Example: Formatting Toolbar

A formatting toolbar that appears when the user selects text. Its buttons only change with the selection or the content, so it subscribes to `selectionUpdate` and `update`:

```tsx
import { useSyncExternalStore } from 'react'

import { isActive } from '@doist/typist'

function FormattingToolbar({ editor }) {
    const editorState = useSyncExternalStore(
        function subscribe(callback) {
            editor.on('selectionUpdate', callback)
            editor.on('update', callback)

            return function unsubscribe() {
                editor.off('selectionUpdate', callback)
                editor.off('update', callback)
            }
        },
        function getSnapshot() {
            return editor.state
        },
    )

    return (
        <div>
            <button aria-pressed={isActive(editorState, 'bold')}>Bold</button>
            <button aria-pressed={isActive(editorState, 'italic')}>Italic</button>
        </div>
    )
}
```

### Example: Fixed Formatting Toolbar

A formatting toolbar that's always visible, for example above a comment field, has one extra case to handle: a format toggled with nothing selected. Pressing Bold with the cursor in an empty spot, before typing, sets a stored mark without changing the content or moving the cursor, and only `transaction` fires for that. Subscribe to `transaction`, but gate it so it re-renders only when the content, selection, or stored marks actually change:

```tsx
import { useSyncExternalStore } from 'react'

import { isActive } from '@doist/typist'

function FixedFormattingToolbar({ editor }) {
    const editorState = useSyncExternalStore(
        function subscribe(callback) {
            let previousState = editor.state

            function handleTransaction() {
                const { state } = editor

                if (
                    state.doc !== previousState.doc ||
                    state.selection !== previousState.selection ||
                    state.storedMarks !== previousState.storedMarks
                ) {
                    previousState = state
                    callback()
                }
            }

            editor.on('transaction', handleTransaction)

            return function unsubscribe() {
                editor.off('transaction', handleTransaction)
            }
        },
        function getSnapshot() {
            return editor.state
        },
    )

    return (
        <div>
            <button aria-pressed={isActive(editorState, 'bold')}>Bold</button>
            <button aria-pressed={isActive(editorState, 'italic')}>Italic</button>
        </div>
    )
}
```

Typing still re-renders this toolbar, since every keystroke changes the content, and that's expected. The gate only skips transactions that change none of the content, selection, or stored marks.

### Keeping `subscribe` Stable

In the examples above, `subscribe` is defined inline for readability. In real code, wrap it in [`useCallback`](https://react.dev/reference/react/useCallback), or define it outside the component, so React doesn't tear down and re-attach the listener on every render (see React's [note on this](https://react.dev/reference/react/useSyncExternalStore#my-subscribe-function-gets-called-after-every-re-render)). If your app uses [React Compiler](https://react.dev/learn/react-compiler), it memoizes the inline function for you and no manual wrapping is needed.

## Avoiding `shouldRerenderOnTransaction`

Tiptap's `useEditor` hook supports a `shouldRerenderOnTransaction` option that re-renders the component on every transaction. It might look like a simpler alternative, but it's a legacy behavior with real drawbacks:

- **Performance:** Every transaction (including cursor blinks, plugin updates, and selection changes) re-renders the editor and its entire subtree.
- **Coarse-grained:** You can't choose which changes to react to, or skip the ones that don't matter.
- **Wrong component:** The UI that needs the state (a toolbar) is usually a sibling or parent, not a child of the editor, so re-rendering the editor doesn't help it update.

The `useSyncExternalStore` approach gives you precise control over what triggers re-renders and where they happen.
