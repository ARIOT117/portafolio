import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/** Precarga la fuente Geist (latin) con su nombre hashed: es la del texto de la home. */
function preloadGeist(): Plugin {
  return {
    name: 'preload-geist-latin',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const file = Object.keys(ctx.bundle ?? {}).find((f) => /geist-latin-wght-normal-.*\.woff2$/.test(f))
        if (!file) return []
        return [
          { tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: `/${file}` }, injectTo: 'head' },
        ]
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), preloadGeist()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
