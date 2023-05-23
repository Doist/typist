import { isTextNode } from './unified'

describe('Helper: Unified', () => {
    describe('#isTextNode', () => {
        test('returns `true` when the given node is a hast text node', () => {
            expect(isTextNode({ type: 'text' })).toBe(true)
        })

        test('returns `false` when the given node is NOT a hast text node', () => {
            expect(isTextNode({ type: 'element' })).toBe(false)
        })
    })
})
