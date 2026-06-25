import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { VIEW_EVENT_HANDLERS_PRIORITY } from '../../constants/extension-priorities'

import type { EditorView } from '@tiptap/pm/view'

/**
 * The set of view event handlers that can be provided to the editor.
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

type ViewEventHandlersStorage = ViewEventHandlersOptions

/**
 * Augment the official `@tiptap/core` module with extra commands, relevant for this extension, so
 * that the compiler knows about them.
 */
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        viewEventHandlers: {
            /**
             * Updates the handlers the plugin invokes. The editor component calls this as its
             * handler props change, since the editor and its plugins are created only once.
             */
            setViewEventHandlers: (handlers: ViewEventHandlersOptions) => ReturnType
        }
    }
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
const ViewEventHandlers = Extension.create<ViewEventHandlersOptions, ViewEventHandlersStorage>({
    name: 'viewEventHandlers',
    priority: VIEW_EVENT_HANDLERS_PRIORITY,
    addStorage() {
        return {
            onClick: this.options.onClick,
            onKeyDown: this.options.onKeyDown,
        }
    },
    addCommands() {
        return {
            setViewEventHandlers: (handlers) => () => {
                this.storage.onClick = handlers.onClick
                this.storage.onKeyDown = handlers.onKeyDown

                return true
            },
        }
    },
    addProseMirrorPlugins() {
        const { editor } = this

        return [
            new Plugin({
                key: new PluginKey('viewEventHandlers'),
                props: {
                    handleClick(view, pos, event) {
                        return editor.storage.viewEventHandlers.onClick?.(event, view, pos) || false
                    },
                    handleKeyDown(view, event) {
                        return editor.storage.viewEventHandlers.onKeyDown?.(event, view) || false
                    },
                },
            }),
        ]
    },
})

export { ViewEventHandlers }

export type { ViewEventHandlersOptions }
