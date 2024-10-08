import { useCallback, useEffect, useReducer } from 'react'
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

import { Box, IconButton } from '@doist/reactist'

import styles from './typist-editor-toolbar.module.css'

import type { CoreEditor } from '../../../../src'

type TypistEditorToolbarProps = {
    editor: CoreEditor
}

function TypistEditorToolbar({ editor }: TypistEditorToolbarProps) {
    const isCursorOverLink = Boolean(editor.getAttributes('link').href)

    const [, forceRerender] = useReducer((x: number) => x + 1, 0)

    useEffect(
        function initializeEventListeners() {
            function handleTransactionUpdate() {
                // Force a rerender for every transaction in the editor - an event that ocurrs
                // outside of the React lifecycle - to update the toolbar buttons `pressed` state
                forceRerender()
            }

            editor.on('transaction', handleTransactionUpdate)

            return function cleanupEventListeners() {
                editor.off('transaction', handleTransactionUpdate)
            }
        },
        [editor, forceRerender],
    )

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

    return (
        <Box
            className={styles.toolbarContainer}
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            marginX="large"
            padding="xsmall"
        >
            <IconButton
                aria-label="Bold"
                aria-pressed={editor.isActive('bold')}
                disabled={false}
                icon={<RiBold />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <IconButton
                aria-label="Italic"
                aria-pressed={editor.isActive('italic')}
                disabled={false}
                icon={<RiItalic />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <IconButton
                aria-label="Strikethrough"
                aria-pressed={editor.isActive('strike')}
                disabled={false}
                icon={<RiStrikethrough />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleStrike().run()}
            />
            <IconButton
                aria-label="Code"
                aria-pressed={editor.isActive('code')}
                disabled={false}
                icon={<RiCodeSSlashLine />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleCode().run()}
            />
            <IconButton
                aria-label="Heading 1"
                aria-pressed={editor.isActive('heading', { level: 1 })}
                disabled={false}
                exceptionallySetClassName={styles.withLeftDivider}
                icon={<RiH1 />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            />
            <IconButton
                aria-label="Heading 2"
                aria-pressed={editor.isActive('heading', { level: 2 })}
                disabled={false}
                icon={<RiH2 />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            />
            <IconButton
                aria-label="Heading 3"
                aria-pressed={editor.isActive('heading', { level: 3 })}
                disabled={false}
                icon={<RiH3 />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            />
            <IconButton
                aria-label="Heading 4"
                aria-pressed={editor.isActive('heading', { level: 4 })}
                disabled={false}
                icon={<RiH4 />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            />
            <IconButton
                aria-label="Heading 5"
                aria-pressed={editor.isActive('heading', { level: 5 })}
                disabled={false}
                icon={<RiH5 />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
            />
            <IconButton
                aria-label="Heading 6"
                aria-pressed={editor.isActive('heading', { level: 6 })}
                disabled={false}
                icon={<RiH6 />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
            />
            <IconButton
                aria-label="Paragraph"
                aria-pressed={editor.isActive('paragraph')}
                disabled={false}
                icon={<RiParagraph />}
                variant="quaternary"
                onClick={() => editor.chain().focus().setParagraph().run()}
            />
            <IconButton
                aria-label="Bullet List"
                aria-pressed={editor.isActive('bulletList')}
                disabled={false}
                icon={<RiListUnordered />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <IconButton
                aria-label="Ordered List"
                aria-pressed={editor.isActive('orderedList')}
                disabled={false}
                icon={<RiListOrdered />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
            <IconButton
                aria-label="Code Block"
                aria-pressed={editor.isActive('codeBlock')}
                disabled={false}
                icon={<RiCodeBoxLine />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            />
            <IconButton
                aria-label="Insert/Edit Link"
                aria-pressed={editor.isActive('link')}
                disabled={!isCursorOverLink && editor.state.selection.empty}
                exceptionallySetClassName={styles.withLeftDivider}
                icon={<RiLink />}
                variant="quaternary"
                onClick={handleLinkButtonClick}
            />
            <IconButton
                aria-label="Remove Link"
                disabled={!isCursorOverLink}
                icon={<RiLinkUnlink />}
                variant="quaternary"
                onClick={() => editor.chain().focus().unsetLink().run()}
            />
            <IconButton
                aria-label="Insert Image"
                disabled={false}
                exceptionallySetClassName={styles.withLeftDivider}
                icon={<RiImageLine />}
                variant="quaternary"
                onClick={handleImageButtonClick}
            />
            <IconButton
                aria-label="Blockquote"
                aria-pressed={editor.isActive('blockquote')}
                disabled={false}
                icon={<RiDoubleQuotesL />}
                variant="quaternary"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
            <IconButton
                aria-label="Horizontal Rule"
                aria-pressed={editor.isActive('horizontalRule')}
                disabled={false}
                icon={<RiSeparator />}
                variant="quaternary"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            />
            <IconButton
                aria-label="Hard Break"
                disabled={false}
                exceptionallySetClassName={styles.withLeftDivider}
                icon={<RiTextWrap />}
                variant="quaternary"
                onClick={() => editor.chain().focus().setHardBreak().run()}
            />
            <IconButton
                aria-label="Clear Format"
                disabled={false}
                icon={<RiFormatClear />}
                variant="quaternary"
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            />
            <IconButton
                aria-label="Undo"
                disabled={false}
                exceptionallySetClassName={styles.withLeftDivider}
                icon={<RiArrowGoBackLine />}
                variant="quaternary"
                onClick={() => editor.chain().focus().undo().run()}
            />
            <IconButton
                aria-label="Redo"
                disabled={false}
                icon={<RiArrowGoForwardLine />}
                variant="quaternary"
                onClick={() => editor.chain().focus().redo().run()}
            />
            <IconButton
                aria-label="Clear Document"
                disabled={false}
                exceptionallySetClassName={styles.withLeftDivider}
                icon={<RiDeleteBin2Line />}
                variant="quaternary"
                onClick={() => editor.chain().focus().clearContent(true).run()}
            />
        </Box>
    )
}

export { TypistEditorToolbar }
