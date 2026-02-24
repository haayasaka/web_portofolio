import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  /* ── Build optimizations ─────────────────────────────────────────── */
  build: {
    /* Target modern browsers — smaller output, native ESM */
    target: 'es2020',

    /* Split chunks for optimal caching & parallel download */
    rollupOptions: {
      output: {
        manualChunks(id) {
          // three.js is ~600 KB minified — isolate so it's cached separately
          if (id.includes('node_modules/three')) {
            return 'three'
          }
          // Vue runtime (~40 KB) — rarely changes, cache long-term
          if (id.includes('node_modules/vue') || id.includes('node_modules/@vue')) {
            return 'vue-vendor'
          }
        },
        /* Content-hash-based filenames → immutable cache forever */
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    /* Inline small assets (< 8 KB) as data-URIs → fewer HTTP requests */
    assetsInlineLimit: 8192,

    /* Enable CSS code-splitting: each async component gets its own CSS */
    cssCodeSplit: true,
  },

  /* ── Asset handling ──────────────────────────────────────────────── */
  /* Ensure large media files are always emitted as separate files */
  assetsInclude: ['**/*.glb'],
})
