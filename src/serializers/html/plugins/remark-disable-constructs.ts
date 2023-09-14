import type { Schema } from '@tiptap/pm/model'
import type { Processor } from 'unified'

/**
 * A remark plugin to disable multiple language constructs based on the availability of marks and/or
 * nodes in the given editor schema.
 *
 * @param schema The editor schema to be used for nodes and marks detection.
 */
function remarkDisableConstructs(this: Processor, schema: Schema) {
    const data = this.data()

    function add(field: string, value: unknown) {
        const list = (data[field] ? data[field] : (data[field] = [])) as unknown[]

        list.push(value)
    }

    const disabledConstructs: string[] = []

    if (!schema.nodes.blockquote) {
        disabledConstructs.push('blockQuote')
    }

    if (!schema.marks.bold || !schema.marks.italic) {
        disabledConstructs.push('attention')
    }

    if (!schema.nodes.bulletList || !schema.nodes.orderedList) {
        disabledConstructs.push('list')
    }

    if (!schema.marks.code) {
        disabledConstructs.push('codeText')
    }

    if (!schema.nodes.codeBlock) {
        disabledConstructs.push('codeFenced', 'codeIndented')
    }

    if (!schema.nodes.heading) {
        disabledConstructs.push('headingAtx')
    }

    if (!schema.nodes.horizontalRule) {
        disabledConstructs.push('thematicBreak')
    }

    if (!schema.nodes.image) {
        disabledConstructs.push('labelStartImage')
    }

    if (!schema.marks.link) {
        disabledConstructs.push('labelStartLink')
    }

    // https://github.com/micromark/micromark#case-turn-off-constructs
    add('micromarkExtensions', {
        disable: {
            null: disabledConstructs,
        },
    })
}

export { remarkDisableConstructs }
