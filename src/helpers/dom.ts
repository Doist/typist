/**
 * Parse a given HTML string and returns the `HTMLElement` for the document body.
 *
 * @param html The HTML string to parse.
 */
function parseHtmlToElement(html: string) {
    return new DOMParser().parseFromString(html, 'text/html').body
}

export { parseHtmlToElement }
