import { useCallback, useSyncExternalStore } from 'react'

import { Box, IconButton } from '@doist/reactist'

import {
    RiArrowGoBackLine,
    RiArrowGoForwardLine,
    RiBold,
    RiCodeBoxLine,
    RiCodeSSlashLine,
    RiDeleteBin2Line,
    RiDoubleQuotesL,
    RiFormatClear,
    RiH1,
    RiH2,
    RiH3,
    RiH4,
    RiH5,
    RiH6,
    RiImageLine,
    RiItalic,
    RiLink,
    RiLinkUnlink,
    RiListOrdered,
    RiListUnordered,
    RiParagraph,
    RiSeparator,
    RiStrikethrough,
    RiTextWrap,
} from 'react-icons/ri'

import { isActive, type CoreEditor } from '../../../../src'

import styles from './typist-editor-toolbar.module.css'

type TypistEditorToolbarProps = {
    editor: CoreEditor
}

type ToolbarButtonProps = {
    'aria-label': string
    'aria-pressed'?: boolean
    disabled: boolean
    icon: React.ReactElement
    onClick: () => void
}

type ToolbarButtonConfig = ToolbarButtonProps & {
    withDividerBefore?: boolean
}

function ToolbarButton(props: ToolbarButtonProps) {
    return <IconButton variant="quaternary" {...props} />
}

function TypistEditorToolbar({ editor }: TypistEditorToolbarProps) {
    // The editor state lives outside React, so `useSyncExternalStore` is used to re-render this
    // component on every editor transaction, keeping the toolbar buttons `pressed` state in sync
    // with the current selection, applied marks, and stored marks. The `subscribe` callback is
    // wrapped in `useCallback` so React doesn't tear down and re-attach the tiptap listener on
    // every render (see https://react.dev/reference/react/useSyncExternalStore#my-subscribe-function-gets-called-after-every-re-render)
    const editorState = useSyncExternalStore(
        useCallback(
            function subscribeToEditorState(callback: () => void) {
                editor.on('transaction', callback)

                return function unsubscribeFromEditorState() {
                    editor.off('transaction', callback)
                }
            },
            [editor],
        ),
        function getEditorStateSnapshot() {
            return editor.state
        },
    )

    const isCursorOverLink = Boolean(editor.getAttributes('link').href)

    const handleLinkButtonClick = useCallback(() => {
        const previousUrl = String(editor.getAttributes('link').href || '')
        const newUrl = window.prompt('Link URL', previousUrl)

        if (newUrl === null) {
            editor.commands.focus()
            return
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: newUrl }).run()
    }, [editor])

    const handleImageButtonClick = useCallback(() => {
        const newUrl = window.prompt('Image URL')

        if (newUrl === null) {
            editor.commands.focus()
            return
        }

        editor.chain().focus().insertImage({ src: newUrl }).run()
    }, [editor])

    const buttonConfigs: ToolbarButtonConfig[] = [
        {
            'aria-label': 'Bold',
            'aria-pressed': isActive(editorState, 'bold'),
            disabled: false,
            icon: <RiBold />,
            onClick: () => editor.chain().focus().toggleBold().run(),
        },
        {
            'aria-label': 'Italic',
            'aria-pressed': isActive(editorState, 'italic'),
            disabled: false,
            icon: <RiItalic />,
            onClick: () => editor.chain().focus().toggleItalic().run(),
        },
        {
            'aria-label': 'Strikethrough',
            'aria-pressed': isActive(editorState, 'strike'),
            disabled: false,
            icon: <RiStrikethrough />,
            onClick: () => editor.chain().focus().toggleStrike().run(),
        },
        {
            'aria-label': 'Code',
            'aria-pressed': isActive(editorState, 'code'),
            disabled: false,
            icon: <RiCodeSSlashLine />,
            onClick: () => editor.chain().focus().toggleCode().run(),
        },
        {
            'aria-label': 'Heading 1',
            'aria-pressed': isActive(editorState, 'heading', { level: 1 }),
            disabled: false,
            icon: <RiH1 />,
            withDividerBefore: true,
            onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
            'aria-label': 'Heading 2',
            'aria-pressed': isActive(editorState, 'heading', { level: 2 }),
            disabled: false,
            icon: <RiH2 />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
            'aria-label': 'Heading 3',
            'aria-pressed': isActive(editorState, 'heading', { level: 3 }),
            disabled: false,
            icon: <RiH3 />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
            'aria-label': 'Heading 4',
            'aria-pressed': isActive(editorState, 'heading', { level: 4 }),
            disabled: false,
            icon: <RiH4 />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
        },
        {
            'aria-label': 'Heading 5',
            'aria-pressed': isActive(editorState, 'heading', { level: 5 }),
            disabled: false,
            icon: <RiH5 />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 5 }).run(),
        },
        {
            'aria-label': 'Heading 6',
            'aria-pressed': isActive(editorState, 'heading', { level: 6 }),
            disabled: false,
            icon: <RiH6 />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 6 }).run(),
        },
        {
            'aria-label': 'Paragraph',
            'aria-pressed': isActive(editorState, 'paragraph'),
            disabled: false,
            icon: <RiParagraph />,
            onClick: () => editor.chain().focus().setParagraph().run(),
        },
        {
            'aria-label': 'Bullet List',
            'aria-pressed': isActive(editorState, 'bulletList'),
            disabled: false,
            icon: <RiListUnordered />,
            onClick: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
            'aria-label': 'Ordered List',
            'aria-pressed': isActive(editorState, 'orderedList'),
            disabled: false,
            icon: <RiListOrdered />,
            onClick: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
            'aria-label': 'Code Block',
            'aria-pressed': isActive(editorState, 'codeBlock'),
            disabled: false,
            icon: <RiCodeBoxLine />,
            onClick: () => editor.chain().focus().toggleCodeBlock().run(),
        },
        {
            'aria-label': 'Insert/Edit Link',
            'aria-pressed': isActive(editorState, 'link'),
            disabled: !isCursorOverLink && editorState.selection.empty,
            icon: <RiLink />,
            withDividerBefore: true,
            onClick: handleLinkButtonClick,
        },
        {
            'aria-label': 'Remove Link',
            disabled: !isCursorOverLink,
            icon: <RiLinkUnlink />,
            onClick: () => editor.chain().focus().unsetLink().run(),
        },
        {
            'aria-label': 'Insert Image',
            disabled: false,
            icon: <RiImageLine />,
            withDividerBefore: true,
            onClick: handleImageButtonClick,
        },
        {
            'aria-label': 'Blockquote',
            'aria-pressed': isActive(editorState, 'blockquote'),
            disabled: false,
            icon: <RiDoubleQuotesL />,
            onClick: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
            'aria-label': 'Horizontal Rule',
            'aria-pressed': isActive(editorState, 'horizontalRule'),
            disabled: false,
            icon: <RiSeparator />,
            onClick: () => editor.chain().focus().setHorizontalRule().run(),
        },
        {
            'aria-label': 'Hard Break',
            disabled: false,
            icon: <RiTextWrap />,
            withDividerBefore: true,
            onClick: () => editor.chain().focus().setHardBreak().run(),
        },
        {
            'aria-label': 'Clear Format',
            disabled: false,
            icon: <RiFormatClear />,
            onClick: () => editor.chain().focus().unsetAllMarks().clearNodes().run(),
        },
        {
            'aria-label': 'Undo',
            disabled: false,
            icon: <RiArrowGoBackLine />,
            withDividerBefore: true,
            onClick: () => editor.chain().focus().undo().run(),
        },
        {
            'aria-label': 'Redo',
            disabled: false,
            icon: <RiArrowGoForwardLine />,
            onClick: () => editor.chain().focus().redo().run(),
        },
        {
            'aria-label': 'Clear Document',
            disabled: false,
            icon: <RiDeleteBin2Line />,
            withDividerBefore: true,
            onClick: () => editor.chain().focus().clearContent(true).run(),
        },
    ]

    return (
        <Box
            className={styles.toolbarContainer}
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            marginX="large"
            padding="xsmall"
        >
            {buttonConfigs.map(({ withDividerBefore, ...buttonProps }) =>
                withDividerBefore ? (
                    <Box key={buttonProps['aria-label']} className={styles.withDividerBefore}>
                        <ToolbarButton {...buttonProps} />
                    </Box>
                ) : (
                    <ToolbarButton key={buttonProps['aria-label']} {...buttonProps} />
                ),
            )}
        </Box>
    )
}

export { TypistEditorToolbar }
