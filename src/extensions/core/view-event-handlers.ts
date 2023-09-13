import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { VIEW_EVENT_HANDLERS_PRIORITY } from '../../constants/extension-priorities'

import type { EditorView } from '@tiptap/pm/view'

/**
 * The options available to customize the `ViewEventHandlers` extension.
 *
 * If more view handlers are needed, please look into the available event handlers in
 * [`prosemirror-view`](https://prosemirror.net/docs/ref/#view.Props), and add them below.
 */
type ViewEventHandlersOptions = {
    /**
     * Called when the editor is clicked, after `handleClickOn` handlers have been called.
     */
    onClick?: (event: MouseEvent, view: EditorView, pos: number) => boolean | void

    /**
     * Called when the editor receives a `keydown` event.
     */
    onKeyDown?: (event: KeyboardEvent, view: EditorView) => boolean | void
}

/**
 * The `ViewEventHandlers` extension allows handling of various ProseMirror view events.
 *
 * The various event-handling functions may all return `true` to indicate that they handled the
 * given event. The view will then take care to call `preventDefault` on the event, except with
 * `handleDOMEvents`, where the handler itself is responsible for that. Return `false` or
 * `undefined` for the default event handler to be called.
 *
 * These event handlers should be used sparingly, please consider if a reusable extension would be
 * more appropriate for your use case.
 */
const ViewEventHandlers = Extension.create<ViewEventHandlersOptions>({
    name: 'viewEventHandlers',
    priority: VIEW_EVENT_HANDLERS_PRIORITY,
    addProseMirrorPlugins() {
        const { options } = this

        return [
            new Plugin({
                key: new PluginKey('viewEventHandlers'),
                props: {
                    handleClick(view, pos, event) {
                        return options.onClick?.(event, view, pos) || false
                    },
                    handleKeyDown(view, event) {
                        return options.onKeyDown?.(event, view) || false
                    },
                },
            }),
        ]
    },
})

export { ViewEventHandlers }

export type { ViewEventHandlersOptions }
