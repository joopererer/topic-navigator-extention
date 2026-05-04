/**
 * Build square PNGs for the extension manifest from icons/source.png.
 */
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'icons', 'source.png');

if (!existsSync(src)) {
  console.warn('[icons] icons/source.png missing — skip (place a master PNG there).');
  process.exit(0);
}

const sizes = [16, 32, 48, 128];
for (const size of sizes) {
  const out = join(root, 'icons', `icon${size}.png`);
  await sharp(src)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(out);
  console.log('[icons] wrote', `icons/icon${size}.png`);
}
