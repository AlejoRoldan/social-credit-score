import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import pg from 'pg';
import { createPilot } from '../backend/pilot.mjs';
import { serve } from '../backend/server.mjs';
import { launchBrowser } from './browser.mjs';

const database = new URL(process.env.PILOT_TEST_DATABASE_URL);
assert.equal(database.hostname, '127.0.0.1');
assert.equal(database.pathname, '/entrevecinos_pilot_test');

test('diez cuentas como máximo, solicitud privada, invitaciones y feedback', async (t) => {
  const admin = new pg.Pool({ connectionString: database.href });
  t.after(() => admin.end());
  const schema = await readFile(new URL('../backend/staging/pilot.sql', import.meta.url), 'utf8');
  await admin.query(schema);
  await admin.query("ALTER ROLE entrevecinos_pilot_app PASSWORD 'solo-para-prueba-local'");
  const { rows: [cohort] } = await admin.query(await readFile(new URL('../backend/staging/pilot-cohort.sql', import.meta.url), 'utf8'));
  assert.equal(cohort.capacity, 10);
  database.username = 'entrevecinos_pilot_app';
  database.password = 'solo-para-prueba-local';
  const pool = new pg.Pool({ connectionString: database.href });
  t.after(() => pool.end());

  const authUsers = new Map();
  const provider = createServer(async (request, response) => {
    let data = '';
    for await (const chunk of request) data += chunk;
    const { email, token, create_user } = JSON.parse(data);
    response.setHeader('Content-Type', 'application/json');
    if (request.url === '/auth/v1/otp') {
      if (!authUsers.has(email) && create_user) authUsers.set(email, randomUUID());
      response.end('{}');
    } else if (request.url === '/auth/v1/verify' && authUsers.has(email) && token === '123456') {
      response.end(JSON.stringify({ user: { id: authUsers.get(email), email, email_confirmed_at: new Date().toISOString() } }));
    } else response.writeHead(400).end('{}');
  });
  await new Promise((resolve) => provider.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => provider.close(resolve)));
  let pilot;
  const server = await serve(0, { pilot: { handle: (...args) => pilot.handle(...args) } });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const origin = base;
  pilot = createPilot({ pool, origin, supabaseUrl: `http://127.0.0.1:${provider.address().port}`,
    supabaseKey: 'publica-de-prueba', privacyUrl: `${origin}/piloto/privacidad`, noticeVersion: 'prueba-1',
    privacyContact: { name: 'Equipo de prueba', email: 'privacidad@example.test' } });
  assert.equal((await fetch(`${base}/piloto`)).status, 200);
  assert.equal((await fetch(`${base}/pilot.mjs`)).status, 200);

  const request = (path, body, cookie, requestOrigin = origin) => fetch(`${base}/api/pilot/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', Origin: requestOrigin, ...(cookie && { Cookie: cookie }) },
    body: body && JSON.stringify(body),
  });
  const account = (id) => ({ email: `vecino${id}@example.test`, name: `Vecino ${id}`, consent: true,
    invitation: cohort.codigo_de_inscripcion });
  const register = async (id) => {
    assert.equal((await request('auth-start', account(id))).status, 200);
    return request('auth-finish', { ...account(id), code: '123456' });
  };
  assert.equal((await request('auth-start', { ...account(0), invitation: '' })).status, 403);
  assert.equal((await request('auth-start', account(0), undefined, 'https://otro.example')).status, 403);
  assert.equal((await request('state')).status, 401);
  const alice = await register(1);
  const luz = await register(2);
  assert.equal(alice.status, 200, await alice.clone().text());
  assert.equal(luz.status, 200, await luz.clone().text());
  assert.match(alice.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
  const aliceCookie = alice.headers.get('set-cookie').split(';')[0];
  const luzCookie = luz.headers.get('set-cookie').split(';')[0];
  const state = async (cookie) => (await request('state', undefined, cookie)).json();

  assert.equal((await request('application', { scenario: 'inventario', amount: 200000, weeks: 4 }, aliceCookie)).status, 200);
  assert.equal((await state(aliceCookie)).application.amount_cop, 200000);
  assert.equal((await state(luzCookie)).application, undefined);
  assert.equal((await request('circle', { name: 'Vecinos del piloto' }, aliceCookie)).status, 200);
  const { circle } = await state(aliceCookie);
  assert.equal((await state(luzCookie)).circle, undefined);
  assert.equal((await request('circle-preview', { invitation: circle.id }, luzCookie)).status, 404);
  const invite = { invitation: circle.invitation };
  const preview = await request('circle-preview', invite, luzCookie);
  assert.equal((await preview.json()).name, 'Vecinos del piloto');
  assert.equal((await request('circle-response', { ...invite, accepted: true }, luzCookie)).status, 200);
  assert.equal((await request('circle-response', { ...invite, accepted: false }, luzCookie)).status, 200);
  assert.deepEqual((await state(aliceCookie)).circle.responses, [{ display_name: 'Vecino 2', accepted: true }]);
  assert.deepEqual((await state(luzCookie)).memberships, [{ name: 'Vecinos del piloto', accepted: true }]);
  assert.equal((await request('feedback', { ease: 4, comment: 'La invitación fue clara' }, luzCookie)).status, 200);
  assert.equal((await state(aliceCookie)).feedback, undefined);
  assert.equal((await state(luzCookie)).feedback.ease, 4);
  assert.equal((await request('logout', {}, aliceCookie)).status, 200);
  assert.equal((await request('state', undefined, aliceCookie)).status, 401);

  const browser = await launchBrowser();
  t.after(() => browser.close());
  await t.test('recorrido de registro, círculo, solicitud y feedback en Chrome a 390 px', async (mobileTest) => {
    const mobile = await browser.page(mobileTest, 390);
    await mobile.open(`${base}/piloto#inscripcion=${cohort.codigo_de_inscripcion}`, false, '#entry:not([hidden])');
    const person = account(3);
    await mobile.type('#sign-in [name="email"]', person.email);
    await mobile.type('#sign-in [name="name"]', person.name);
    await mobile.click('#sign-in [name="consent"]');
    await mobile.click('#auth-button');
    await mobile.waitVisible('#code-field');
    await mobile.text('#message', /enviamos un código/);
    await mobile.type('#sign-in [name="code"]', '123456');
    await mobile.click('#auth-button');
    await mobile.waitVisible('#member-name');
    await mobile.text('#member-name', /Vecino 3/);
    await mobile.type('#circle-form [name="name"]', 'Círculo móvil');
    await mobile.click('#circle-form button');
    await mobile.waitVisible('#circle-name');
    await mobile.text('#circle-name', /Círculo móvil/);
    await mobile.click('#application-form button');
    await mobile.waitVisible('#application-result');
    await mobile.text('#application-result', /Solicitud de prueba registrada/);
    await mobile.select('#feedback-form [name="ease"]', '5');
    await mobile.click('#feedback-form button');
    await mobile.waitVisible('#feedback-saved');
    await mobile.text('#feedback-saved', /guardada/);
  });

  const remaining = Array.from({ length: 8 }, (_, i) => account(i + 4));
  for (const body of remaining) assert.equal((await request('auth-start', body)).status, 200);
  const completed = await Promise.all(remaining.map((body) => request('auth-finish', { ...body, code: '123456' })));
  assert.deepEqual(completed.map((response) => response.status).sort(), [200, 200, 200, 200, 200, 200, 200, 409]);
  assert.equal((await admin.query('SELECT count(*)::int AS total FROM pilot_staging.participants')).rows[0].total, 10);
  assert.equal((await request('auth-finish', { email: account(1).email, code: '123456' })).status, 200);
});
