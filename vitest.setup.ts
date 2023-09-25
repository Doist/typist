import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

import type { Mock } from 'vitest'

// Runs a cleanup function after each test case
// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => {
    cleanup()
})

// Mocks the `ClipboardEvent` interface for jsdom
// ref: https://github.com/ueberdosis/tiptap/releases/tag/v2.1.11
Object.defineProperty(globalThis.window, 'ClipboardEvent', {
    writable: true,
    value: class ClipboardEventMock extends Event {
        clipboardData: {
            getData: Mock<never, [string]>
            setData: Mock<never, [string, string]>
        }

        constructor(type: string, eventInitDict?: EventInit) {
            super(type, eventInitDict)

            this.clipboardData = {
                getData: vi.fn(),
                setData: vi.fn(),
            }
        }
    },
})

// Mocks the `DragEvent` interface for jsdom
Object.defineProperty(globalThis.window, 'DragEvent', {
    writable: true,
    value: class DragEventMock extends Event {
        dataTransfer: {
            getData: Mock<never, [string]>
            setData: Mock<never, [string, string]>
        }

        constructor(type: string, eventInitDict?: EventInit) {
            super(type, eventInitDict)

            this.dataTransfer = {
                getData: vi.fn(),
                setData: vi.fn(),
            }
        }
    },
})
