/**
 * Cross-platform zip of dist/ and dist-firefox/ after a full Firefox build.
 * Usage: npm run package:release
 *
 * Outputs to repo root:
 *   topic-navigator-chromium-<version>.zip
 *   topic-navigator-firefox-<version>.zip
 *
 * <version> = v + manifest.version from dist/manifest.json
 */
import { createWriteStream } from 'node:fs';
import { readFileSync, existsSync } from 'node:fs';
import archiver from 'archiver';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function zipDir(srcDir, outFile) {
  await new Promise((resolve, reject) => {
    const output = createWriteStream(outFile);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);
    archive.on('warning', (err) => {
      if (err.code !== 'ENOENT') reject(err);
    });
    archive.pipe(output);
    archive.directory(srcDir, false);
    void archive.finalize();
  });
}

const distManifest = join(root, 'dist', 'manifest.json');
if (!existsSync(distManifest)) {
  console.error('Run `npm run build:firefox` first (dist/manifest.json missing).');
  process.exit(1);
}
const firefoxDir = join(root, 'dist-firefox');
if (!existsSync(join(firefoxDir, 'manifest.json'))) {
  console.error('Run `npm run build:firefox` first (dist-firefox/manifest.json missing).');
  process.exit(1);
}

const version = JSON.parse(readFileSync(distManifest, 'utf8')).version;
const slug = `v${version}`;
const chromiumZip = join(root, `topic-navigator-chromium-${slug}.zip`);
const firefoxZip = join(root, `topic-navigator-firefox-${slug}.zip`);

await zipDir(join(root, 'dist'), chromiumZip);
await zipDir(firefoxDir, firefoxZip);
console.log(`Wrote:\n  ${chromiumZip}\n  ${firefoxZip}`);
