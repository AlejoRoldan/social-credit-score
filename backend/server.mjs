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

const educationContent = 'backend/domain/education-content.mjs';

export async function serve(port = 8000, { host = '127.0.0.1', staging, pilot } = {}) {
  const server = createServer(async (request, response) => {
    const [path] = request.url.split('?');
    if (pilot && path.startsWith('/api/pilot/')) {
      await pilot.handle(request, response, path.slice('/api/pilot/'.length));
      return;
    }
    if (path === '/healthz' || path === '/version') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405, { Allow: 'GET, HEAD' }).end();
        return;
      }

      let status = 200;
      let body = { status: 'ok' };
      if (path === '/version') {
        body = staging ? { environment: 'staging', revision: staging.revision, data: 'synthetic' } : { environment: 'local' };
      } else if (staging) {
        try {
          await staging.check();
        } catch {
          status = 503;
          body = { status: 'unavailable' };
        }
      }

      response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : JSON.stringify(body));
      return;
    }

    const pilotFile = pilot && {
      '/piloto': 'frontend/pilot.html',
      '/piloto/privacidad': 'frontend/pilot-privacy.html',
      '/pilot.css': 'frontend/pilot.css',
      '/pilot.mjs': 'frontend/src/pilot.mjs',
    }[path];
    const file = pilotFile || entryPoints.get(path) || path.slice(1);
    if (!pilotFile && file !== educationContent && !/^(?:frontend\/(?:index\.html|styles\.css|src\/app\.mjs)|design-system\/tokens\.css|backend\/domain\/[a-z-]+-state\.mjs)$/.test(file)) {
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
    server.listen(port, host, resolve);
  });
  return server;
}
