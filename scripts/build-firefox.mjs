/**
 * After `npm run build`, copies `dist/` → `dist-firefox/` and rewrites manifest for Firefox:
 * MV3 background must use `background.scripts` (not `service_worker`) on many Firefox builds.
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcDir = join(root, 'dist');
const outDir = join(root, 'dist-firefox');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(srcDir, outDir, { recursive: true });

const manifestPath = join(outDir, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

delete manifest.background?.service_worker;
manifest.background = {
  scripts: ['background.js'],
};

manifest.browser_specific_settings = {
  gecko: {
    id: 'topic-navigator@extension.local',
    strict_min_version: '115.0',
  },
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log('dist-firefox/ ready — load dist-firefox/manifest.json in about:debugging → Temporary extensions.');
