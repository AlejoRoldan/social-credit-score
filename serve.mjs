import { pathToFileURL } from 'node:url';
import { serve } from './backend/server.mjs';
import { createPilot } from './backend/pilot.mjs';

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  let pool;
  let pilotPool;
  try {
    let staging;
    let pilot;
    const onRender = process.env.RENDER === 'true';
    const port = Number(process.argv[2] ?? process.env.PORT ?? 8000);
    if (process.env.RENDER === 'true' || process.env.ENTREVECINOS_ENV === 'staging') {
      const connectionString = process.env.STAGING_DATABASE_URL;
      const revision = process.env.RENDER_GIT_COMMIT ?? process.env.ENTREVECINOS_REVISION;
      if (process.env.ENTREVECINOS_ENV !== 'staging' || !connectionString || !/^[a-f0-9]{40}$/i.test(revision ?? '')) {
        throw new Error('Staging requiere ENTREVECINOS_ENV=staging, STAGING_DATABASE_URL y un SHA de 40 caracteres.');
      }
      if (process.env.RENDER === 'true' && new URL(connectionString).searchParams.get('sslmode') !== 'verify-full') {
        throw new Error('En Render, STAGING_DATABASE_URL requiere sslmode=verify-full.');
      }
      const { Pool } = await import('pg');
      pool = new Pool({ connectionString, max: 3, connectionTimeoutMillis: 2500, query_timeout: 2500 });
      pool.on('error', () => console.error('Se perdió una conexión inactiva de la base de pruebas.'));
      staging = {
        revision,
        async check() {
          const { rowCount } = await pool.query(
            `SELECT 1 FROM demo_staging.fixture
             WHERE id = 'entrevecinos-hu-5-1' AND current_user = 'entrevecinos_staging_reader'
               AND profiles = ARRAY['Diana', 'Luz']`,
          );
          if (rowCount !== 1) throw new Error('Muestra de staging no disponible.');
        },
      };
    }
    if (process.env.PILOT_DATABASE_URL) {
      const { PILOT_DATABASE_URL, SUPABASE_AUTH_URL, SUPABASE_PUBLISHABLE_KEY, PILOT_PRIVACY_URL, PILOT_NOTICE_VERSION } = process.env;
      const privacyContact = { name: process.env.PILOT_PRIVACY_NAME, email: process.env.PILOT_PRIVACY_EMAIL };
      const origin = new URL(process.env.PILOT_URL ?? process.env.RENDER_EXTERNAL_URL ?? `http://127.0.0.1:${port}`).origin;
      const privacyUrl = PILOT_PRIVACY_URL ?? `${origin}/piloto/privacidad`;
      if (!SUPABASE_AUTH_URL?.startsWith('https://') || !SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_')
        || !privacyContact.name || !/^[\w.!+%-]+@[\w.-]+\.[a-z]+$/i.test(privacyContact.email ?? '')
        || (PILOT_PRIVACY_URL && !PILOT_PRIVACY_URL.startsWith('https://'))
        || (onRender && (!origin.startsWith('https://') || new URL(PILOT_DATABASE_URL).searchParams.get('sslmode') !== 'verify-full'))) {
        throw new Error('Configura la URL y clave pública de Supabase Auth, el aviso versionado y la conexión segura del piloto.');
      }
      const { Pool } = await import('pg');
      pilotPool = new Pool({ connectionString: PILOT_DATABASE_URL, max: 4, connectionTimeoutMillis: 2500, query_timeout: 2500 });
      pilotPool.on('error', () => console.error('Se perdió una conexión inactiva de la base del piloto.'));
      const { rows: [{ ready }] } = await pilotPool.query(`SELECT current_user = 'entrevecinos_pilot_app'
        AND to_regclass('pilot_staging.feedback') IS NOT NULL AS ready`);
      if (!ready) throw new Error('La base del piloto debe usar el esquema de pruebas y el rol de la aplicación.');
      pilot = createPilot({ pool: pilotPool, supabaseUrl: SUPABASE_AUTH_URL, supabaseKey: SUPABASE_PUBLISHABLE_KEY,
        origin, privacyUrl, privacyContact, noticeVersion: PILOT_NOTICE_VERSION ?? 'piloto-2026-11-21' });
    }
    const server = await serve(port, { host: onRender ? '0.0.0.0' : '127.0.0.1', staging, pilot });
    server.once('close', () => { void pool?.end(); void pilotPool?.end(); });
    console.log(`Entrevecinos está disponible en http://127.0.0.1:${server.address().port}/`);
  } catch (error) {
    await pool?.end();
    await pilotPool?.end();
    console.error(error.code === 'EADDRINUSE'
      ? 'El puerto está ocupado. Prueba con node serve.mjs 8001.'
      : error.message);
    process.exitCode = 1;
  }
}
