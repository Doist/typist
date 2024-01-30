import { isHastElement, isHastTextNode } from './unified'

describe('Helper: Unified', () => {
    describe('#isHastElement', () => {
        test('returns `true` when the given node is an element with the specified tag name', () => {
            expect(
                // @ts-expect-error Simplified node for testing purposes
                isHastElement({ type: 'element', tagName: 'div' }, 'div'),
            ).toBe(true)
        })

        test('returns `false` when the given node is NOT an element with the specified tag name', () => {
            expect(
                // @ts-expect-error Simplified node for testing purposes
                isHastElement({ type: 'element', tagName: 'span' }, 'div'),
            ).toBe(false)
        })

        test('returns `false` when the given node is NOT an element', () => {
            expect(isHastElement({ type: 'text' }, 'div')).toBe(false)
        })
    })

    describe('#isHastTextNode', () => {
        test('returns `true` when the given node is a hast text node', () => {
            expect(isHastTextNode({ type: 'text' })).toBe(true)
        })

        test('returns `false` when the given node is NOT a hast text node', () => {
            expect(isHastTextNode({ type: 'element' })).toBe(false)
        })
    })
})
