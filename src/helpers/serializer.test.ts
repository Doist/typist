import { getSchema } from '@tiptap/core'

import { RichTextKit } from '../extensions/rich-text/rich-text-kit'
import { createSuggestionExtension } from '../factories/create-suggestion-extension'

import { buildSuggestionSchemaPartialRegex, extractTagsFromParseRules } from './serializer'

describe('Helper: Serializer', () => {
    describe('#buildSuggestionSchemaPartialRegex', () => {
        test('returns `null` when there are no suggestion nodes in the schema', () => {
            expect(buildSuggestionSchemaPartialRegex(getSchema([RichTextKit]))).toBeNull()
        })

        test('returns a partial regular expression including valid URL schemas', () => {
            expect(
                buildSuggestionSchemaPartialRegex(
                    getSchema([
                        RichTextKit,
                        createSuggestionExtension('mention'),
                        createSuggestionExtension('channel'),
                    ]),
                ),
            ).toBe('(?:mention|channel)://')
        })
    })

    describe('#extractTagsFromParseRules', () => {
        test('returns an array of all tags from the given parse rules', () => {
            expect(
                extractTagsFromParseRules(getSchema([RichTextKit]).marks.strike.spec.parseDOM),
            ).toStrictEqual(['s', 'del', 'strike'])
        })
    })
})
