# Single-line

A single-line editor is nothing more than an editor with `aria-multiline={false}`, that explicitly handles the `keydown` event when the user presses the `Enter` key, and prevents the default event action from being called.

Yes, all you have to do is return `true` when the user presses the `Enter` key to indicate that the event is handled. The editor view will then take care of calling `preventDefault()` on the event itself. This is explained in more detail in the ProseMirror documentation for the [`view.EditorProps`](https://prosemirror.net/docs/ref/#view.EditorProps) interface.

## Plain-text Editor

```js
PlainTextKit.configure({
    document: {
        multiline: false,
    },
})
```

## Rich-text Editor

```js
RichTextKit.configure({
    document: {
        multiline: false,
    },
})
```
