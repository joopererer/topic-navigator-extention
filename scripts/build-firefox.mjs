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

// AMO: data_collection_permissions required on gecko (Nov 2025+); supported since
// Firefox 140+ (desktop) / 142+ (Android) per addons-linter. optional_host_permissions
// and permissions.request are satisfied at these floors.
manifest.browser_specific_settings = {
  gecko: {
    id: 'topic-navigator@extension.local',
    strict_min_version: '140.0',
    data_collection_permissions: {
      required: ['none'],
    },
  },
  // Do not set data_collection_permissions under gecko_android (unexpected property).
  gecko_android: {
    strict_min_version: '142.0',
  },
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log('dist-firefox/ ready — load dist-firefox/manifest.json in about:debugging → Temporary extensions.');
