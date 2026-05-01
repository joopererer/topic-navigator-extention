import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/** Options tab: ES modules OK in chrome-extension:// pages */
export default defineConfig({
  base: './',
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'options.html'),
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
    target: 'es2022',
    minify: false,
  },
});
