import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import { serve } from '../server.mjs';

test('staging identifica la revisión y su salud depende de la base de pruebas', async (t) => {
  const revision = 'a3eaefcf022a5a2e82f104fa75f252d730dbae0d';
  let available = true;
  const server = await serve(0, {
    staging: {
      revision,
      async check() {
        if (!available) throw new Error('detalle interno de PostgreSQL');
      },
    },
  });
  t.after(() => {
    const closed = once(server, 'close');
    server.close();
    return closed;
  });
  const url = `http://127.0.0.1:${server.address().port}`;

  const version = await fetch(`${url}/version`);
  assert.equal(version.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await version.json(), { environment: 'staging', revision, data: 'synthetic' });
  const healthy = await fetch(`${url}/healthz`);
  assert.equal(healthy.status, 200);
  assert.deepEqual(await healthy.json(), { status: 'ok' });

  available = false;
  const unavailable = await fetch(`${url}/healthz`);
  assert.equal(unavailable.status, 503);
  assert.deepEqual(await unavailable.json(), { status: 'unavailable' });
  assert.equal((await fetch(`${url}/healthz`, { method: 'POST' })).status, 405);
});
