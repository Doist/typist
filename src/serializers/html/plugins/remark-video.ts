import { visit } from 'unist-util-visit'

import { REGEX_WEB_URL } from '../../../constants/regular-expressions'
import { isMdastNode } from '../../../helpers/unified'

import type { Schema } from '@tiptap/pm/model'
import type { Node as MdastNode, Parent as MdastParent } from 'mdast'
import type { Transformer } from 'unified'

/**
 * A URL validation regular expression for video URLs (matches a URL that ends
 * with a video file extension supported by the HTML5 video element).
 */
const REGEX_VIDEO_URL = new RegExp(
    `${REGEX_WEB_URL.source}\\.(?:mov|mp4|webm)$`,
    REGEX_WEB_URL.flags,
)

/**
 * Replaces a link node with a video element if the link URL is a valid video URL.
 *
 * @param parent The parent node of the link node to be replaced.
 * @param index The index of the child link node to be replaced.
 * @param src The URL of the video to be embedded in the video element.
 */
function replaceWithVideoElementIfVideoUrl(parent: MdastParent, index: number, src: string) {
    if (REGEX_VIDEO_URL.test(src)) {
        parent.children.splice(index, 1, {
            type: 'text',
            value: '',
            data: {
                hName: 'video',
                hProperties: {
                    src,
                },
            },
        })
    }
}

/**
 * A remark plugin to add support for video elements in Markdown by replacing link nodes with the
 * HTML5 video element if the link URL is a valid video URL.
 *
 * @param schema The editor schema to be used for nodes and marks detection.
 */
function remarkVideo(schema: Schema): Transformer {
    const allowInlineVideos = schema.nodes.video ? schema.nodes.video.spec.inline : false

    return (...[tree]: Parameters<Transformer>): ReturnType<Transformer> => {
        // If the editor supports inline videos, traverse the tree - testing for link nodes - and
        // replace all link nodes with video elements if the link URL is a valid video URL.
        if (allowInlineVideos) {
            visit(tree, 'link', (node: MdastNode, index: number, parent: MdastParent) => {
                if (isMdastNode(node, 'link')) {
                    replaceWithVideoElementIfVideoUrl(parent, index, node.url)
                }
            })
        }
        // Otherwise, traverse the tree - testing for paragraph nodes - and replace all paragraph
        // nodes with a single link child with video elements if the link URL is a valid video URL.
        else {
            visit(tree, 'paragraph', (node: MdastNode, index: number, parent: MdastParent) => {
                if (
                    isMdastNode(node, 'paragraph') &&
                    node.children.length === 1 &&
                    isMdastNode(node.children[0], 'link')
                ) {
                    replaceWithVideoElementIfVideoUrl(parent, index, node.children[0].url)
                }
            })
        }
    }
}

export { remarkVideo }
