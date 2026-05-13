import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core'
import { Plugin, PluginKey, Selection } from '@tiptap/pm/state'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { REGEX_WEB_URL } from '../../constants/regular-expressions'

import type { NodeView } from '@tiptap/pm/view'
import type { NodeViewProps } from '@tiptap/react'

/**
 * The properties that describe `RichTextVideo` node attributes.
 */
type RichTextVideoAttributes = {
    /**
     * Additional metadata about a video attachment upload.
     */
    metadata?: {
        /**
         * A unique ID for the video attachment.
         */
        attachmentId: string

        /**
         * Specifies if the video attachment failed to upload.
         */
        isUploadFailed: boolean

        /**
         * The upload progress for the video attachment.
         */
        uploadProgress: number
    }
} & Pick<HTMLVideoElement, 'src'>

/**
 * Augment the official `@tiptap/core` module with extra commands, relevant for this extension, so
 * that the compiler knows about them.
 */
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        richTextVideo: {
            /**
             * Inserts an video into the editor with the given attributes.
             */
            insertVideo: (attributes: RichTextVideoAttributes) => ReturnType

            /**
             * Updates the attributes for an existing image in the editor.
             */
            updateVideo: (
                attributes: Partial<RichTextVideoAttributes> &
                    Required<Pick<RichTextVideoAttributes, 'metadata'>>,
            ) => ReturnType
        }
    }
}

/**
 * The options available to customize the `RichTextVideo` extension.
 */
type RichTextVideoOptions = {
    /**
     * A list of accepted MIME types for videos pasting.
     */
    acceptedVideoMimeTypes: string[]

    /**
     * Whether to automatically start playback of the video as soon as the player is loaded. Its
     * default value is `false`, meaning that the video will not start playing automatically.
     */
    autoplay: boolean

    /**
     * Whether to browser will offer controls to allow the user to control video playback, including
     * volume, seeking, and pause/resume playback. Its default value is `true`, meaning that the
     * browser will offer playback controls.
     */
    controls: boolean

    /**
     * A list of options the browser should consider when determining which controls to show for the video element.
     * The value is a space-separated list of tokens, which are case-insensitive.
     *
     * @example 'nofullscreen nodownload noremoteplayback'
     * @see https://wicg.github.io/controls-list/explainer.html
     *
     * Unfortunatelly, both Firefox and Safari do not support this attribute.
     *
     * @see https://caniuse.com/mdn-html_elements_video_controlslist
     */
    controlsList: string

    /**
     * Custom HTML attributes that should be added to the rendered HTML tag.
     */
    HTMLAttributes: Record<string, string>

    /**
     * Renders the video node inline (e.g., <p><video src="doist.mp4"></p>). Its default value is
     * `false`, meaning that videos are on the same level as paragraphs.
     */
    inline: boolean

    /**
     * Whether to automatically seek back to the start upon reaching the end of the video. Its
     * default value is `false`, meaning that the video will stop playing when it reaches the end.
     */
    loop: boolean

    /**
     * Whether the audio will be initially silenced. Its default value is `false`, meaning that the
     * audio will be played when the video is played.
     */
    muted: boolean

    /**
     * A React component to render inside the interactive node view.
     */
    NodeViewComponent?: React.ComponentType<NodeViewProps>

    /**
     * The event handler that is fired when a video file is pasted.
     */
    onVideoFilePaste?: (file: File) => void
}

/**
 * The input regex for Markdown video links (i.e. that end with a supported video file extension).
 */
const inputRegex = new RegExp(
    `(?:^|\\s)${REGEX_WEB_URL.source}\\.(?:mov|mp4|webm)$`,
    REGEX_WEB_URL.flags,
)

/**
 * The `RichTextVideo` extension adds support to render `<video>` HTML tags with video pasting
 * capabilities, and also adds the ability to pass additional metadata about a video attachment
 * upload. By default, videos are blocks; if you want to render videos inline with text, set the
 * `inline` option to `true`.
 */
const RichTextVideo = Node.create<RichTextVideoOptions>({
    name: 'video',
    addOptions() {
        return {
            acceptedVideoMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
            autoplay: false,
            controls: true,
            controlsList: '',
            HTMLAttributes: {},
            inline: false,
            loop: false,
            muted: false,
        }
    },
    inline() {
        return this.options.inline
    },
    group() {
        return this.options.inline ? 'inline' : 'block'
    },
    addAttributes() {
        return {
            src: {
                default: null,
            },
            metadata: {
                default: null,
                rendered: false,
            },
        }
    },
    parseHTML() {
        return [
            {
                tag: 'video[src]',
            },
        ]
    },
    renderHTML({ HTMLAttributes }) {
        const { options } = this

        return [
            'video',
            mergeAttributes(
                options.HTMLAttributes,
                HTMLAttributes,
                // For most attributes, we use `undefined` instead of `false` to not render the
                // attribute at all, otherwise they will be interpreted as `true` by the browser
                // ref: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
                {
                    autoplay: options.autoplay ? true : undefined,
                    controls: options.controls ? true : undefined,
                    controlslist: options.controlsList.length ? options.controlsList : undefined,
                    loop: options.loop ? true : undefined,
                    muted: options.muted ? true : undefined,
                    playsinline: true,
                },
            ),
        ]
    },
    addCommands() {
        const { name: nodeTypeName } = this

        return {
            ...this.parent?.(),
            insertVideo(attributes) {
                return ({ editor, commands }) => {
                    const selectionAtEnd = Selection.atEnd(editor.state.doc)

                    return commands.insertContent([
                        {
                            type: nodeTypeName,
                            attrs: attributes,
                        },
                        // Insert a blank paragraph after the video when at the end of the document
                        ...(editor.state.selection.to === selectionAtEnd.to
                            ? [{ type: 'paragraph' }]
                            : []),
                    ])
                }
            },
            updateVideo(attributes) {
                return ({ commands }) => {
                    return commands.command(({ tr }) => {
                        tr.doc.descendants((node, position) => {
                            const { metadata } = node.attrs as {
                                metadata: RichTextVideoAttributes['metadata']
                            }

                            // Update the video attributes to the corresponding node
                            if (
                                node.type.name === nodeTypeName &&
                                metadata?.attachmentId === attributes.metadata?.attachmentId
                            ) {
                                tr.setNodeMarkup(position, node.type, {
                                    ...node.attrs,
                                    ...attributes,
                                })
                            }
                        })

                        return true
                    })
                }
            },
        }
    },
    addNodeView() {
        const { NodeViewComponent } = this.options

        // Do not add a node view if component was not specified
        if (!NodeViewComponent) {
            return () => ({}) as NodeView
        }

        // Render the node view with the provided React component
        return ReactNodeViewRenderer(NodeViewComponent, {
            as: 'div',
            className: `Typist-${this.type.name}`,
        })
    },
    addProseMirrorPlugins() {
        const { acceptedVideoMimeTypes, onVideoFilePaste } = this.options

        return [
            new Plugin({
                key: new PluginKey(this.name),
                props: {
                    handleDOMEvents: {
                        paste: (_, event) => {
                            // Do not handle the event if we don't have a callback
                            if (!onVideoFilePaste) {
                                return false
                            }

                            const pastedFiles = Array.from(event.clipboardData?.files || [])

                            // Do not handle the event if no files were pasted
                            if (pastedFiles.length === 0) {
                                return false
                            }

                            let wasPasteHandled = false

                            // Invoke the callback for every pasted file that is an accepted video type
                            pastedFiles.forEach((pastedFile) => {
                                if (acceptedVideoMimeTypes.includes(pastedFile.type)) {
                                    onVideoFilePaste(pastedFile)
                                    wasPasteHandled = true
                                }
                            })

                            // Suppress the default handling behaviour if at least one video was handled
                            return wasPasteHandled
                        },
                    },
                },
            }),
        ]
    },
    addInputRules() {
        return [
            nodeInputRule({
                find: inputRegex,
                type: this.type,
                getAttributes(match) {
                    return {
                        src: match[0],
                    }
                },
            }),
        ]
    },
})

export { RichTextVideo }

export type { RichTextVideoAttributes, RichTextVideoOptions }
