import { marked } from 'marked'

/**
 * Initialize a new instance of the original renderer to be used by the extension.
 */
const markedRenderer = new marked.Renderer()

/**
 * A Marked extension which tweaks the `checkbox`, `list`, and `listitem` renderers to add support
 * for task lists (i.e., `* [ ] Task`), while preserving the original renderers for standard bullet
 * and ordered lists.
 */
const taskList: marked.MarkedExtension = {
    renderer: {
        checkbox(checked) {
            return `[${checked ? 'x' : ' '}] `
        },
        list(body, ordered, start) {
            if (body.includes('data-type="taskItem"')) {
                return `<ul data-type="taskList">\n${body}</ul>\n`
            }

            return markedRenderer.list.apply(this, [body, ordered, start])
        },
        listitem(text) {
            const taskItem = /^(\[[ x]\])( [\s\S]*)?/i.exec(text)

            if (taskItem) {
                return `<li data-type="taskItem" data-checked="${String(taskItem[1] !== '[ ]')}">${
                    taskItem[2].trim() || ''
                }</li>\n`
            }

            return markedRenderer.listitem.apply(this, [text, false, false])
        },
    },
}

export { taskList }
