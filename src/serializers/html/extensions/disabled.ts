import { marked } from 'marked'

import { buildSuggestionSchemaPartialRegex } from '../../../helpers/serializer'
import { INITIAL_MARKED_OPTIONS } from '../html'

import type { Schema } from 'prosemirror-model'

/**
 * A version of `marked.TokenizerObject` that allows to return an `undefined` tokenizer.
 */
type MarkedTokenizerObjectAsUndefined = Partial<
    Omit<marked.Tokenizer<undefined>, 'constructor' | 'options'>
>

/**
 * A Marked extension which disables multiple parsing rules by disabling the rules respective
 * tokenizers based on the availability of marks and/or nodes in the editor schema.
 *
 * @param schema The editor schema to be used for nodes and marks detection.
 */
function disabled(schema: Schema) {
    const markedTokenizer = new marked.Tokenizer(INITIAL_MARKED_OPTIONS)

    const tokenizer: marked.TokenizerObject = {}

    if (!schema.nodes.blockquote) {
        Object.assign(tokenizer, {
            blockquote() {
                return undefined
            },
        })
    }

    if (!schema.marks.bold || !schema.marks.italic) {
        Object.assign(tokenizer, {
            emStrong() {
                return undefined
            },
        })
    }

    // Given that there isn't a one to one mapping between the bullet/ordered list nodes and Marked
    // tokenizers, we need to conditionally disable the `list` tokenizer based on the input
    if (!schema.nodes.bulletList || !schema.nodes.orderedList) {
        Object.assign<marked.TokenizerObject, MarkedTokenizerObjectAsUndefined>(tokenizer, {
            list(src) {
                const isOrdered = /^\d+/.test(src)

                if (
                    (isOrdered && schema.nodes.orderedList) ||
                    (!isOrdered && schema.nodes.bulletList)
                ) {
                    return markedTokenizer.list.apply(this, [src])
                }

                return undefined
            },
        })
    }

    if (!schema.marks.code) {
        Object.assign(tokenizer, {
            codespan() {
                return undefined
            },
        })
    }

    if (!schema.nodes.codeBlock) {
        Object.assign(tokenizer, {
            code() {
                return undefined
            },
            fences() {
                return undefined
            },
        })
    }

    if (!schema.nodes.hardBreak) {
        Object.assign(tokenizer, {
            br() {
                return undefined
            },
        })
    }

    if (!schema.nodes.heading) {
        Object.assign(tokenizer, {
            heading() {
                return undefined
            },
        })
    }

    if (!schema.nodes.horizontalRule) {
        Object.assign(tokenizer, {
            hr() {
                return undefined
            },
        })
    }

    if (!schema.marks.link) {
        Object.assign(tokenizer, {
            url() {
                return undefined
            },
        })
    }

    // Given that there isn't a one to one mapping between the link/image mark/node and Marked
    // tokenizers, nor Marked supports our custom Markdown syntax for suggestions, we need to
    // conditionally disable the `link` tokenizer based on the input
    if (!schema.marks.link || !schema.nodes.image) {
        const suggestionSchemaPartialRegex = buildSuggestionSchemaPartialRegex(schema)
        const suggestionSchemaRegex = suggestionSchemaPartialRegex
            ? new RegExp(`^\\[[^\\]]*\\]\\(${suggestionSchemaPartialRegex}`)
            : null

        Object.assign<marked.TokenizerObject, MarkedTokenizerObjectAsUndefined>(tokenizer, {
            link(src) {
                const isImage = /^!\[[^\]]*\]\([^)]+\)/.test(src)
                const isSuggestion = suggestionSchemaRegex?.test(src)

                if (
                    (isImage && schema.nodes.image) ||
                    (!isImage && schema.marks.link) ||
                    isSuggestion
                ) {
                    return markedTokenizer.link.apply(this, [src])
                }

                return undefined
            },
        })
    }

    if (!schema.marks.strike) {
        Object.assign(tokenizer, {
            del() {
                return undefined
            },
        })
    }

    if (!schema.nodes.table) {
        Object.assign(tokenizer, {
            table() {
                return undefined
            },
        })
    }

    return {
        tokenizer,
    }
}

export { disabled }
