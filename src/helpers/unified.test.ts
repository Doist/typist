import { isHastElementNode, isHastTextNode, isMdastNode } from './unified'

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

    describe('#isMdastNode', () => {
        test('returns `false` when the given mdast node is NOT a node with the specified type name', () => {
            expect(isMdastNode({ type: 'unknown' }, 'link')).toBe(false)
            expect(isMdastNode({ type: 'unknown' }, 'paragraph')).toBe(false)
        })

        test('returns `true` when the given mdast node is a node of type `link`', () => {
            expect(isMdastNode({ type: 'link' }, 'link')).toBe(true)
        })

        test('returns `true` when the given mdast node is a node of type `paragraph`', () => {
            expect(isMdastNode({ type: 'paragraph' }, 'paragraph')).toBe(true)
        })
    })
})
