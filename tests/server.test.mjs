import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../server.mjs';

test('serves the homepage and assets without exposing project source', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const home = await fetch(base);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /Strong teeth\./);
    const css = await fetch(base + '/styles.css');
    assert.match(css.headers.get('content-type'), /text\/css/);
    const asset = await fetch(base + '/assets/favicon.svg');
    assert.equal(asset.status, 200);
    for (const route of ['/services','/about','/contact','/services.html','/about.html','/contact.html']) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200, route);
      assert.match(response.headers.get('content-type'), /text\/html/);
    }
    for (const filename of ['server.mjs', 'PRODUCT.md', 'package.json', 'assets/../server.mjs', 'assets/%2e%2e%2fserver.mjs']) {
      assert.equal((await fetch(base + '/' + filename)).status, 404);
    }
    assert.equal((await fetch(base, {method:'POST'})).status, 405);
    const head = await fetch(base, {method:'HEAD'});
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
  } finally { await new Promise(resolve => server.close(resolve)); }
});
