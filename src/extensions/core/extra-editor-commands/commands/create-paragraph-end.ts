import { RawCommands } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'

/**
 * Augment the official `@tiptap/core` module with extra commands so that the compiler knows about
 * them. For this to work externally, a wildcard export needs to be added to the root `index.ts`.
 */
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        createParagraphEnd: {
            /**
             * Creates an empty paragraph at the end of the document.
             */
            createParagraphEnd: () => ReturnType
        }
    }
}

/**
 * Creates an empty paragraph at the end of the document.
 *
 * last node before creating the paragraph, using the build int fn
 */
function createParagraphEnd(): ReturnType<RawCommands['createParagraphEnd']> {
    return ({ state, tr, chain, dispatch }) => {
        // Check if the transaction should be dispatched
        // ref: https://tiptap.dev/api/commands#dry-run-for-commands
        if (dispatch) {
            return chain()
                .command(() => {
                    tr.setSelection(
                        TextSelection.create(
                            tr.doc,
                            state.doc.content.size,
                            state.doc.content.size,
                        ),
                    )

                    return true
                })
                .createParagraphNear()
                .run()
        }

        return true
    }
}

export { createParagraphEnd }
