import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/** Bundled MV3 service worker (`type: "module"` in manifest). */
export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'src/background/index.ts'),
      output: {
        format: 'es',
        entryFileNames: 'background.js',
        dir: resolve(__dirname, 'dist'),
        inlineDynamicImports: true,
      },
    },
    target: 'es2022',
    minify: false,
  },
});
