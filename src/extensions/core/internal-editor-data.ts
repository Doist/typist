import { Extension } from '@tiptap/core'

/**
 * [[DESCRIPTION]]
 */
type InternalEditorDataOptions = {
    id: NonEmptyString
}

/**
 * [[DESCRIPTION]]
 */
type InternalEditorDataStorage = {
    id: NonEmptyString
}

/**
 * [[DESCRIPTION]]
 */
const InternalEditorData = Extension.create<InternalEditorDataOptions, InternalEditorDataStorage>({
    name: 'internalEditorData',
    addOptions() {
        return {
            id: 'default',
        }
    },
    addStorage() {
        return {
            id: this.options.id,
        }
    },
})

export { InternalEditorData }

export type { InternalEditorDataOptions, InternalEditorDataStorage }
