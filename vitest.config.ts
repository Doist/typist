import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Vitest Configuration: https://vitest.dev/config/
export default defineConfig({
    plugins: [react()],
    test: {
        // Provide global APIs for explicitness (like Jest)
        globals: true,

        // The test environment that will be used for testing
        environment: 'jsdom',

        // A list of setup files that will run before reach test file
        setupFiles: ['./vitest.setup.ts'],
    },
})
