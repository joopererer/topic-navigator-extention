import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/** Single-file IIFE for MV3 content script (classic script — no ES imports). */
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'src/content/index.ts'),
      output: {
        format: 'iife',
        name: '__topicNavContent',
        dir: resolve(__dirname, 'dist'),
        entryFileNames: 'content.js',
        inlineDynamicImports: true,
      },
    },
    target: 'es2022',
    minify: false,
  },
  plugins: [
    {
      name: 'copy-manifest',
      closeBundle() {
        copyFileSync(resolve(__dirname, 'manifest.json'), resolve(__dirname, 'dist/manifest.json'));
      },
    },
  ],
});
