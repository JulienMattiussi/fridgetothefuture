import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  // Relative base: the built app runs from any path (domain root OR a subpath
  // like a GitHub Pages project site) without host-specific config.
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  // 1885: the year Doc builds his refrigerator.
  server: {
    port: 1885,
    strictPort: true,
  },
  preview: {
    port: 1885,
    strictPort: true,
  },
})
