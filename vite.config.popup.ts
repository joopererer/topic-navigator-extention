import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/** Toolbar popup */
export default defineConfig({
  base: './',
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'popup.html'),
      output: {
        entryFileNames: 'popup.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
    target: 'es2022',
    minify: false,
  },
});
