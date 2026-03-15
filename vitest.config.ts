import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/projeto-exemplo/**'],
    globals: true,
    root: './',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/domain/delivery/application/use-cases/**/*.ts'],
      exclude: ['src/domain/delivery/application/use-cases/**/*.spec.ts'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
