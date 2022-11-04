import { parseHtmlToElement } from './dom'

describe('Helper: DOM', () => {
    describe('#parseHtmlToElement', () => {
        test('parses an HTML string and returns the body element', () => {
            const element = parseHtmlToElement('<strong>Doist</strong>')

            expect(element.outerHTML).toBe('<body><strong>Doist</strong></body>')
            expect(element.innerHTML).toBe('<strong>Doist</strong>')
            expect(element.textContent).toBe('Doist')
        })
    })
})
