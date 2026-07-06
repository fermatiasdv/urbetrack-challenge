import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { coverageConfigDefaults } from 'vitest/config'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/urbetrack-challenge/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [...coverageConfigDefaults.exclude, 'src/main.tsx'],
      thresholds: {
        statements: 80,
        functions: 80,
        branches: 80,
        lines: 80
      }
    }
  }
})
