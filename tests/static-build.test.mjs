import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Vercel output contains static pages and their assets, without a server function or private files', async () => {
  await promisify(execFile)(process.execPath, ['scripts/build-site.mjs'], { cwd: root });
  const files = (await readdir(path.join(root, 'dist'))).sort();
  assert.deepEqual(files, ['about.html', 'app.js', 'assets', 'contact.html', 'index.html', 'services.html', 'styles.css']);
  const pages = ['index.html', 'services.html', 'about.html', 'contact.html'];
  for (const page of pages) {
    const html = await readFile(path.join(root, 'dist', page), 'utf8');
    assert.match(html, /<title>/);
    for (const match of html.matchAll(/(?:src|href)="(assets\/[^"?#]+)/g)) {
      assert.ok((await readFile(path.join(root, 'dist', match[1]))).length, `${page}: ${match[1]}`);
    }
  }
  const config = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(config.framework, null);
  assert.equal(config.outputDirectory, 'dist');
  assert.deepEqual(config.rewrites.map(route => route.destination).sort(), ['/about.html', '/contact.html', '/services.html']);
});
