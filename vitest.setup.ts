import { afterEach } from 'vitest'

import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'

// Runs a cleanup function after each test case
// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => {
    cleanup()
})
