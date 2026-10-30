import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './build-pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const publicFiles = ['index.html', 'services.html', 'about.html', 'contact.html', 'styles.css', 'app.js'];
const assetExtensions = new Set(['.png', '.webp', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2']);

if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Invalid build output path');
await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, 'assets'), { recursive: true });
for (const filename of publicFiles) {
  await copyFile(path.join(root, filename), path.join(output, filename));
}
let assetCount = 0;
for (const entry of await readdir(path.join(root, 'assets'), { withFileTypes: true })) {
  if (!entry.isFile() || !assetExtensions.has(path.extname(entry.name).toLowerCase())) continue;
  await copyFile(path.join(root, 'assets', entry.name), path.join(output, 'assets', entry.name));
  assetCount++;
}
console.log(`Static build ready: ${publicFiles.length} public files and ${assetCount} assets in dist/.`);
