import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const types = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
};

const entryPoints = new Map([
  ['/', 'frontend/index.html'],
  ['/index.html', 'frontend/index.html'],
  ['/styles.css', 'frontend/styles.css'],
  ['/src/app.mjs', 'frontend/src/app.mjs'],
]);

export async function serve(port = 8000) {
  const server = createServer(async (request, response) => {
    const [path] = request.url.split('?');
    const file = entryPoints.get(path) ?? path.slice(1);
    if (!/^(?:frontend\/(?:index\.html|styles\.css|src\/app\.mjs)|design-system\/tokens\.css|backend\/domain\/[a-z-]+-state\.mjs)$/.test(file)) {
      response.writeHead(404).end();
      return;
    }

    try {
      const content = await readFile(new URL('../' + file, import.meta.url));
      const type = types[file.split('.').at(-1)];
      response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }).end(content);
    } catch (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return server;
}
