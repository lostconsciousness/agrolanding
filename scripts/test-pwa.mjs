import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
const manifest = JSON.parse(await readFile('public/manifest.webmanifest', 'utf8'));
assert.equal(manifest.start_url, '/chat');
assert.equal(manifest.display, 'standalone');
for (const icon of manifest.icons) {
  const image = await sharp(`public${icon.src}`).metadata();
  assert.equal(`${image.width}x${image.height}`, icon.sizes);
  assert.equal(image.format, 'png');
}
const worker = await readFile('public/sw.js', 'utf8');
assert.match(worker, /url.pathname.startsWith\('\/api\/'\)/);
assert.doesNotMatch(worker, /cache\.put/);
assert.match(worker, /offline.html/);
assert.ok(manifest.icons.some(icon => icon.purpose === 'maskable'));
console.log('PASS: chat start URL, standalone manifest, icon sizes and public-only offline cache');
