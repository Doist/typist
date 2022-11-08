# Basic

Typist editor supports two modes, rich-text (WYSIWYG) and plain-text, both with full support for Markdown input and output.

## Rich-text Editor

```tsx
import { TypistEditor, RichTextKit } from '@doist/typist'

function TypistEditorContainer({ content }) {
    return (
        <TypistEditor
            placeholder="A full rich-text editor, be creative…"
            content={content}
            extensions={[RichTextKit]}
        />
    )
}
```

## Plain-text Editor

```tsx
import { TypistEditor, PlainTextKit } from '@doist/typist'

function PlainTextEditorContainer({ content }) {
    return (
        <TypistEditor
            placeholder="A plain-text editor, with smart markdown typing…"
            content={content}
            extensions={[PlainTextKit]}
        />
    )
}
```
