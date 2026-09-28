import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';
const svg = await readFile(new URL('../public/favicon.svg', import.meta.url));
const directory = new URL('../public/icons/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const size of [192, 512, 180]) {
  await sharp(svg).resize(size, size).flatten({ background: '#061009' }).png().toFile(new URL(size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`, directory).pathname);
}
const mark = await sharp(svg).resize(320, 320).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#061009' } }).composite([{ input: mark, gravity: 'centre' }]).png().toFile(new URL('maskable-512.png', directory).pathname);
