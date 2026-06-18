import { transformPastedHTML } from './paste-html-table-as-string'

describe('Extension: PasteHTMLTableAsString', () => {
    describe('#transformPastedHTML', () => {
        test('returns original HTML when no tables present', () => {
            const html = '<p>Hello world</p>'
            expect(transformPastedHTML(html)).toBe(html)
        })

        test('converts simple table to paragraphs', () => {
            const html = '<table><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>'
            const result = transformPastedHTML(html)

            expect(result).toBe('<p>A B</p><p>C D</p>')
        })

        test('preserves content before table', () => {
            const html = '<p>Before</p><table><tr><td>A</td><td>B</td></tr></table>'
            const result = transformPastedHTML(html)

            expect(result).toBe('<p>Before</p><p>A B</p>')
        })

        test('preserves content after table', () => {
            const html = '<table><tr><td>A</td><td>B</td></tr></table><p>After</p>'
            const result = transformPastedHTML(html)

            expect(result).toBe('<p>A B</p><p>After</p>')
        })

        test('preserves content before and after table', () => {
            const html = '<p>Before</p><table><tr><td>A</td><td>B</td></tr></table><p>After</p>'
            const result = transformPastedHTML(html)

            expect(result).toBe('<p>Before</p><p>A B</p><p>After</p>')
        })

        test('handles multiple tables with text between them', () => {
            const html =
                '<p>Start</p><table><tr><td>T1</td></tr></table><p>Middle</p><table><tr><td>T2</td></tr></table><p>End</p>'
            const result = transformPastedHTML(html)

            expect(result).toBe('<p>Start</p><p>T1</p><p>Middle</p><p>T2</p><p>End</p>')
        })

        test('filters out empty rows', () => {
            const html = '<table><tr><td>A</td></tr><tr><td>  </td></tr><tr><td>B</td></tr></table>'
            const result = transformPastedHTML(html)

            expect(result).toBe('<p>A</p><p>B</p>')
        })

        test('preserves HTML formatting within cells', () => {
            const html =
                '<table><tr><td><strong>Bold</strong></td><td><em>Italic</em></td></tr></table>'
            const result = transformPastedHTML(html)

            expect(result).toBe('<p><strong>Bold</strong> <em>Italic</em></p>')
        })

        test('handles table with tbody', () => {
            const html = '<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>'
            const result = transformPastedHTML(html)

            expect(result).toBe('<p>A B</p>')
        })

        test('handles table with thead and tbody', () => {
            const html =
                '<table><thead><tr><th>H1</th><th>H2</th></tr></thead><tbody><tr><td>A</td><td>B</td></tr></tbody></table>'
            const result = transformPastedHTML(html)

            expect(result).toBe('<p>H1 H2</p><p>A B</p>')
        })

        test('unwraps paragraphs inside cells while preserving inline formatting', () => {
            const html =
                '<table><tr><td><p><span>A</span></p></td><td><p><strong>B</strong></p></td></tr></table>'
            const result = transformPastedHTML(html)

            expect(result).toBe('<p><span>A</span> <strong>B</strong></p>')
        })

        describe('cheap table guard (skips DOMParser for non-table HTML)', () => {
            test('returns non-table HTML verbatim instead of re-serializing it', () => {
                // Unclosed/non-normalized markup that the DOMParser path would rewrite; the guard
                // short-circuits before parsing, so it must come back byte-for-byte unchanged.
                const html = '<p>Hello<br>world<p>unclosed'
                expect(transformPastedHTML(html)).toBe(html)
            })

            test('does not treat the literal word "table" in text as a table', () => {
                const html = '<p>Reserve a table for dinner</p>'
                expect(transformPastedHTML(html)).toBe(html)
            })

            test('matches a table element with attributes', () => {
                const html = '<table class="data"><tr><td>A</td><td>B</td></tr></table>'
                expect(transformPastedHTML(html)).toBe('<p>A B</p>')
            })

            test('matches a table element regardless of tag casing', () => {
                const html = '<TABLE><TR><TD>A</TD><TD>B</TD></TR></TABLE>'
                expect(transformPastedHTML(html)).toBe('<p>A B</p>')
            })
        })
    })
})
