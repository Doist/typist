import { marked } from 'marked'

import { parseHtmlToElement } from '../../../helpers/dom'

import type { NodeType } from 'prosemirror-model'

/**
 * Initialize a new instance of the original renderer to be used by the extension.
 */
const markedRenderer = new marked.Renderer()

/**
 * A Marked extension which tweaks the `paragraph` renderer to remove the surrounding `<p></p>` tag
 * when it's wrapping an image element as a single child, or to remove all inline images if the
 * editor was configured without inline image support (default).
 *
 * @param imageNode The node object for the schema image node.
 */
function paragraph(imageNode?: NodeType): marked.MarkedExtension {
    const isInlineImageSupported = imageNode ? imageNode.spec.inline : false

    return {
        renderer: {
            paragraph(text) {
                const renderedHTML = markedRenderer.paragraph.apply(this, [text])
                const { firstElementChild: renderedElement } = parseHtmlToElement(renderedHTML)

                // Return the rendered HTML as a safeguard in the event that the rendered element
                // does not exist (just in case, but highly unlikely to happen)
                if (!renderedElement) {
                    return renderedHTML
                }

                // Return the rendered element HTML if inline images are supported
                if (isInlineImageSupported) {
                    return renderedElement.outerHTML
                }

                const imageChildNodes = Array.from(renderedElement.childNodes).filter(
                    (childNode) => childNode.nodeName === 'IMG',
                )

                // Return the HTML contained in the rendered element if it only contains images
                // (i.e. removes the surrounding `<p></p>` tag from image child elements)
                if (renderedElement.childNodes.length === imageChildNodes.length) {
                    return renderedElement.innerHTML
                }

                // Remove all image elements contained in the rendered element since at this point
                // we know that the editor does not support inline images
                if (renderedElement.childNodes.length > 1) {
                    renderedElement.childNodes.forEach((childNode) => {
                        if (childNode.nodeName === 'IMG') {
                            renderedElement.removeChild(childNode)
                        }
                    })
                }

                // Return the rendered element HTML (stripped of inline images)
                return renderedElement.outerHTML
            },
        },
    }
}

export { paragraph }
