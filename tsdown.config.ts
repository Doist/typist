import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: 'esm',
    unbundle: true,
    platform: 'neutral',
    dts: true,
    deps: {
        neverBundle: ['type-fest'],
    },
})
