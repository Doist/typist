import { DependencyList, useCallback, useEffect, useState } from 'react'

import { Editor } from '@tiptap/react'

import type { EditorOptions } from '@tiptap/core'

function stateChanger(state: number) {
    return (state + 1) % Number.MAX_SAFE_INTEGER
}

/**
 * This is a copy of the `useRerender` hook from `@react-hookz/web`, which is a utility hook that
 * returns a function that can be called to force a re-render of the component.
 *
 * Turns out we don't have the need to use any of the other hooks from `@react-hookz/web`, which is
 * a peer dependency that often introduces breaking changes, causing upgrade issues across our
 * projects.
 */
function useRerender(): () => void {
    const [, setState] = useState(0)

    return useCallback(() => {
        setState(stateChanger)
    }, [])
}

/**
 * This is a fork of the official `useEditor` hook with one key difference, which is to prevent a
 * `null` Editor object instance from being returned on the first render.
 *
 * This change was once fixed in the `@tiptap/react` package, but was reverted because it didn't
 * have support for server-side rendering ([ref](https://github.com/ueberdosis/tiptap/pull/2282)),
 * which is a problem we don't currently have.
 *
 * @param options The options to configure the editor component with.
 * @param dependencies If present, re-create the editor instance if the values in the list change.
 *
 * @returns A new editor instance with the given options.
 */
function useEditor(
    options: Partial<EditorOptions> = {},
    dependencies: DependencyList = [],
): Editor {
    const [editor, setEditor] = useState<Editor>(() => new Editor(options))

    const forceRerender = useRerender()

    useEffect(
        function initializeEditorInstance() {
            let instance: Editor

            if (editor.isDestroyed) {
                instance = new Editor(options)
                setEditor(instance)
            } else {
                instance = editor
            }

            instance.on('transaction', () => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (!instance.isDestroyed) {
                            forceRerender()
                        }
                    })
                })
            })

            return function destroyEditorInstance() {
                instance.destroy()
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        dependencies,
    )

    return editor
}

export { useEditor }
