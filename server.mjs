import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const publicFiles = new Set(['index.html', 'services.html', 'about.html', 'contact.html', 'styles.css', 'app.js']);

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const routes = { '/':'index.html', '/services':'services.html', '/about':'about.html', '/contact':'contact.html' };
      const relative = routes[pathname] || pathname.slice(1);
      const target = path.resolve(root, relative);
      const allowedAsset = relative.startsWith('assets/') && target.startsWith(path.join(root, 'assets') + path.sep);
      if ((!publicFiles.has(relative) && !allowedAsset) || !target.startsWith(root + path.sep)) { res.writeHead(404); res.end('Not found'); return; }
      const info = await stat(target);
      if (!info.isFile()) throw new Error('Not a file');
      const content = await readFile(target);
      res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Content-Length': content.length, 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  createServer().listen(port, '127.0.0.1', () => console.log(`Dental is ready at http://localhost:${port}`));
}
