import matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'

// Extends Vitest's `expect` method with methods from Testing Library
expect.extend(matchers)

// Runs a cleanup function after each test case
// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => {
    cleanup()
})
