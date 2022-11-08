# Styling

A conscious decision was made to not provide any base stylesheet, and instead give the consumer total flexibility in the look and feel of the rendered output. This might also avoid the need to overwrite built-in styles, making things easier to handle and maintain. Also note that most of the styles outlined below are implemented in this very Storybook, and can be inspected [here](https://github.com/doist/typist/blob/main/stories/typist-editor/decorators/typist-editor-decorator/typist-editor-decorator.module.css).

## Markup Structure

The `<TypistEditor>` component renders the following markup structure by default:

```html
<div>
    <div class="ProseMirror">
        <!-- CONTENT -->
    </div>
</div>
```

If needed, you can use the `className` property on the `<TypistEditor>` component to add a class to the outer `div`.

## Outline

For accessibility reasons, the editor includes an outline by default when the `contenteditable` element is focused, which can be easily removed:

```css
div[data-typist-editor] {
    outline: none;
}
```

## Top & Bottom Margins

You may have notice that the editor may have undesirable top and bottom margins surrounding the content, but these can be easily removed:

```css
div[data-typist-editor] > *:first-child {
    margin-top: 0;
}

div[data-typist-editor] > *:last-child {
    margin-bottom: 0;
}
```

## Placeholder

Unfortunately, the `placeholder` property is not enough to show a placeholder by itself when the editor content is empty, some styling is required:

```css
div[data-typist-editor] > p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    pointer-events: none;
    opacity: 0.3; /* optional */
    float: left;
    height: 0;
}
```

## Plain-text Editor

The `PlainTextKit` works by forcing every content node to be a paragraph, and as you know, browsers usually add a default margin to paragraph elements. To make the editor look and feel more like a true plain-text editor, you may want to reset the paragraph margins:

```css
div[data-typist-editor][data-plain-text] > p {
    margin: 0;
}
```

## Extensions

### Enhanced Code Mark

The `RichTextKit` includes an extension that enhances the Code extension capabilities with additional features, namely a fake cursor that makes it easier to navigate inline code marks. Unfortuantely, some styling is required to properly render the fake cursor:

```css
@keyframes fakeCursorBlink {
    49% {
        border-color: unset;
    }
    50% {
        border-color: transparent;
    }
    99% {
        border-color: transparent;
    }
}

div[data-typist-editor].no-cursor {
    caret-color: transparent;
}

div[data-typist-editor]:focus .fake-cursor {
    border-left-width: 1px;
    border-left-style: solid;
    animation: fakeCursorBlink 1s infinite;
    position: relative;
    margin-left: -1px;
    z-index: 1;
}

div[data-typist-editor]:focus :not(pre) > code + .fake-cursor {
    margin-left: unset;
    margin-right: -1px;
}
```

> **Note**
>
> These styles were adapted from the [original version](https://github.com/curvenote/prosemirror-codemark/blob/main/src/codemark.css), and they should be tweaked to match your application styling.

### Suggestions

Suggestion extensions created by the `createSuggestionExtension` factory function add a specific node to the editor that can be styled to match the application styling. The node will have a `data-*` attribute generated from the suggestion type passed as the first argument to `createSuggestionExtension`. For instance, if we take the example in [Usage → Extensions](/?path=/docs/documentation-usage-extensions--page), we could style the mention node like this:

```css
div[data-typist-editor] span[data-mention] {
    box-decoration-break: clone;
    background: hsl(187, 15%, 90%);
    color: hsl(193, 6%, 35%);
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: bold;
    padding: 2px 4px;
}
```
