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

// AMO: data_collection_permissions required for new listings (Nov 2025+).
// optional_host_permissions needs Firefox 128+; raise floor so addons-linter matches manifest.
manifest.browser_specific_settings = {
  gecko: {
    id: 'topic-navigator@extension.local',
    strict_min_version: '128.0',
    data_collection_permissions: {
      required: ['none'],
    },
  },
  // Android WebExtension schema does not recognize data_collection_permissions here
  // (manifest warning: unexpected property under gecko_android). Desktop gecko above
  // keeps AMO-required data_collection_permissions.
  gecko_android: {
    strict_min_version: '128.0',
  },
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log('dist-firefox/ ready — load dist-firefox/manifest.json in about:debugging → Temporary extensions.');
