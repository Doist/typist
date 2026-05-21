import { getSchema } from '@tiptap/core'

import { RichTextKit } from '../extensions/rich-text/rich-text-kit'
import { createSuggestionExtension } from '../factories/create-suggestion-extension'

import { buildSuggestionSchemaInfo, extractTagsFromParseRules } from './serializer'

describe('Helper: Serializer', () => {
    describe('#buildSuggestionSchemaInfo', () => {
        test('returns `null` when there are no suggestion nodes in the schema', () => {
            expect(buildSuggestionSchemaInfo(getSchema([RichTextKit]))).toBeNull()
        })

        test('returns the URL scheme regex and trigger character map for available suggestions', () => {
            const info = buildSuggestionSchemaInfo(
                getSchema([
                    RichTextKit,
                    createSuggestionExtension('mention'),
                    createSuggestionExtension('channel').configure({ triggerChar: '#' }),
                ]),
            )

            expect(info?.urlSchemeRegex).toBe('(?:mention|channel)://')
            expect(info?.triggerCharByScheme.get('mention')).toBe('@')
            expect(info?.triggerCharByScheme.get('channel')).toBe('#')
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
