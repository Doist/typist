import { getSchema } from '@tiptap/core'

import { RichTextKit } from '../extensions/rich-text/rich-text-kit'

import { extractTagsFromParseRules } from './serializer'

describe('Helper: Serializer', () => {
    describe('#extractTagsFromParseRules', () => {
        test('returns an array of all tags from the given parse rules', () => {
            expect(
                extractTagsFromParseRules(getSchema([RichTextKit]).marks.strike.spec.parseDOM),
            ).toStrictEqual(['s', 'del', 'strike'])
        })
    })
})
