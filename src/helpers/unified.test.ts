import { isHastElementNode, isHastTextNode } from './unified'

describe('Helper: Unified', () => {
    describe('#isHastElementNode', () => {
        test('returns `false` when the given hast node is NOT an element node', () => {
            expect(isHastElementNode({ type: 'text' }, 'div')).toBe(false)
        })

        test('returns `false` when the given hast node is NOT an element node with the specified tag name', () => {
            expect(
                // @ts-expect-error Simplified node for testing purposes
                isHastElementNode({ type: 'element', tagName: 'span' }, 'div'),
            ).toBe(false)
        })

        test('returns `true` when the given hast node is an element node with the specified tag name', () => {
            expect(
                // @ts-expect-error Simplified node for testing purposes
                isHastElementNode({ type: 'element', tagName: 'div' }, 'div'),
            ).toBe(true)
        })
    })

    describe('#isHastTextNode', () => {
        test('returns `false` when the given hast node is NOT text node', () => {
            expect(isHastTextNode({ type: 'element' })).toBe(false)
        })

        test('returns `true` when the given hast node is a text node', () => {
            expect(isHastTextNode({ type: 'text' })).toBe(true)
        })
    })
})
