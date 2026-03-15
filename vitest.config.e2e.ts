import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'
import tsConfigPaths from 'vite-tsconfig-paths'

process.env.NODE_ENV = 'test'

export default defineConfig({
  test: {
    include: ['src/**/*.e2e-spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/projeto-exemplo/**'],
    globals: true,
    root: './',
    globalSetup: ['./test/global-setup-e2e.ts'],
    setupFiles: ['./test/setup-e2e.ts'],
    hookTimeout: 30000,
    // Um único worker: arquivos rodam em sequência, sem concorrência no mesmo banco.
    maxWorkers: 1,
    poolOptions: {
      threads: { minThreads: 1, maxThreads: 1 },
    },
    server: {
      deps: {
        external: ['@prisma/client', /^generated\/prisma/],
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
