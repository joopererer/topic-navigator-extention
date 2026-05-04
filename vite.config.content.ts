import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
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
        const dist = resolve(__dirname, 'dist');
        copyFileSync(resolve(__dirname, 'manifest.json'), resolve(dist, 'manifest.json'));
        const iconsDir = resolve(__dirname, 'icons');
        const distIcons = resolve(dist, 'icons');
        const packIcons = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'];
        let iconsDirEnsured = false;
        for (const file of packIcons) {
          const fp = resolve(iconsDir, file);
          if (!existsSync(fp)) continue;
          if (!iconsDirEnsured) {
            mkdirSync(distIcons, { recursive: true });
            iconsDirEnsured = true;
          }
          copyFileSync(fp, resolve(distIcons, file));
        }
      },
    },
  ],
});
