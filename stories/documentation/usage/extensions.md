# Extensions

Typist comes with a multitude of built-in extensions in both the `RichTextKit` and `PlainTextKit` collections, and each provide the minimal experience required by a rich-text or a plain-text editor, respectively. Nonetheless, more advanced extensions are also available to be used if required.

## Suggestions

We don't provide suggestion extensions out of the box, instead we have a `createSuggestionExtension` factory function that allows you to build flexible suggestion extensions.

The extensions created by the factory function do not render a dropdown component, it's up to the consumer to provide a dropdown component with the component library of their choice, and it needs to be bound to the internal suggestion utility render function and the `ReactRenderer` utility as well. Please refer to the [official demo](https://github.com/ueberdosis/tiptap/tree/main/demos/src/Nodes/Mention/React) for a basic example on how to customize the render function events (see [`suggestion.js`](https://github.com/ueberdosis/tiptap/blob/main/demos/src/Nodes/Mention/React/suggestion.js)) shown in the example below.

To help typing a TypeScript code base, you may find the `SuggestionRendererProps` and `SuggestionRendererRef` types useful to define the types of both the dropdown component and `ReactRenderer` (i.e. `let reactRenderer: ReactRenderer<SuggestionRendererRef>`).

```tsx
import { createSuggestionExtension, TypistEditor, RichTextKit } from '@doist/typist'

import type { SuggestionExtensionResult } from '@doist/typist'

type MentionUser = {
    id: string
    name: string
}

function TypistEditorContainer({ content }) {
    const MENTION_USERS: MentionUser[] = [
        { id: '7582311426', name: 'Amy Adams' },
        { id: '4759170383', name: 'Brad Pitt' },
        { id: '2860927956', name: 'Christian Bale' },
        { id: '6191245793', name: 'Emily Blunt' },
        { id: '1244620246', name: 'Heath Ledger' },
        { id: '6912657435', name: 'Kate Winslet' },
        { id: '6023459994', name: 'Robert Downey Jr.' },
        { id: '2500654397', name: 'Sandra Bullock' },
        { id: '9072641833', name: 'Viola Davis' },
        { id: '6606640946', name: 'Willem Dafoe' },
    ]

    const MentionExtension: SuggestionExtensionResult<MentionUser> =
        createSuggestionExtension<MentionUser>('mention', MENTION_USERS, {
            label: 'name',
        }).configure({
            triggerChar: '@',
            renderAriaLabel({ label }) {
                return `Name: ${label}`
            },
            dropdownRenderFn() {
                return {
                    onStart(props) {},
                    onUpdate(props) {},
                    onKeyDown(props) {},
                    onExit(props) {},
                }
            },
            onSearchChange(query, storage) {
                return storage.items.filter((item) => {
                    return item.name.toLowerCase().includes(query.toLowerCase())
                })
            },
            onItemSelect(item) {
                console.log(item)
            },
        })

    return <TypistEditor content={content} extensions={[RichTextKit, MentionExtension]} />
}
```

A few observations about the example above:

- The example takes advantage of the built-in storage to store the suggestion items internally, and use them to render the suggestions based on always up-to-date data. However, the storage is not mandatory, you can use the extension without it.
- You may have noticed that the `createSuggestionExtension` function is called within a functional component, which means it will be re-created with every render. You may need to optimize this with `useMemo` to avoid re-creating the extension on every render.
