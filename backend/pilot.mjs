import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { domainToASCII } from 'node:url';

const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const invitation = /^[a-f0-9]{48}$/;
const sessionToken = /^[a-f0-9]{64}$/;
const digest = (value) => createHash('sha256').update(value).digest('hex');

class PilotError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function reject(status, message) {
  throw new PilotError(status, message);
}

function emailAddress(value) {
  if (typeof value !== 'string' || value.length > 254) return '';
  const parts = value.trim().toLowerCase().split('@');
  if (parts.length !== 2 || !/^[a-z0-9.!#$%&'*+/=?^_\x60{|}~-]{1,64}$/.test(parts[0])) return '';
  const domain = domainToASCII(parts[1]);
  return /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(domain) ? `${parts[0]}@${domain}` : '';
}

function shortText(value, minimum, maximum) {
  const cleaned = typeof value === 'string' ? value.trim() : '';
  if ([...cleaned].length < minimum || [...cleaned].length > maximum || /\0/.test(cleaned)) {
    reject(400, `Escribe entre ${minimum} y ${maximum} caracteres.`);
  }
  return cleaned;
}

async function jsonBody(request) {
  if (!/^application\/json(?:;|$)/i.test(request.headers['content-type'] ?? '')) reject(415, 'Solo se acepta JSON.');
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 4096) reject(413, 'El contenido es demasiado largo.');
    chunks.push(chunk);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  } catch {}
  reject(400, 'No se pudo leer el formulario.');
}

async function first(db, sql, parameters = []) {
  return (await db.query(sql, parameters)).rows[0];
}

export function createPilot({ pool, supabaseUrl, supabaseKey, origin, privacyUrl, noticeVersion, privacyContact }) {
  const cookieName = origin.startsWith('https://') ? '__Host-entrevecinos_pilot' : 'entrevecinos_pilot';
  const cookie = (value, maxAge) => `${cookieName}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict${origin.startsWith('https://') ? '; Secure' : ''}`;
  const loginRequests = new Map();

  async function auth(path, body) {
    let response;
    try {
      response = await fetch(new URL(`/auth/v1/${path}`, supabaseUrl), {
        method: 'POST',
        headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(7000),
      });
    } catch {
      reject(503, 'El servicio de correo no está disponible. Intenta más tarde.');
    }
    if (response.status === 429) reject(429, 'Espera un momento antes de volver a pedir un código.');
    if (!response.ok) reject(path === 'verify' && response.status < 500 ? 400 : 503,
      path === 'verify' && response.status < 500 ? 'El código es incorrecto o venció.' : 'No se pudo enviar el código. Intenta más tarde.');
    return path === 'verify' ? response.json() : undefined;
  }

  async function memberFor(email) {
    return first(pool, 'SELECT id, display_name FROM pilot_staging.participants WHERE email = $1', [email]);
  }

  async function validateInvitation(db, code, { lock = false } = {}) {
    if (typeof code !== 'string' || !invitation.test(code)) reject(403, 'Se requiere una invitación vigente para registrarte.');
    const cohort = await first(db, `SELECT capacity FROM pilot_staging.cohort WHERE id = 1 AND invitation_hash = $1
      AND closed_at IS NULL AND expires_at > now()${lock ? ' FOR UPDATE' : ''}`, [digest(code)]);
    if (!cohort) reject(403, 'La invitación ya no está disponible.');
    const { total } = await first(db, 'SELECT count(*)::int AS total FROM pilot_staging.participants');
    if (total >= cohort.capacity) reject(409, 'El piloto ya completó sus cupos.');
  }

  async function start(body) {
    const email = emailAddress(body.email);
    if (!email) reject(400, 'Escribe un correo válido.');
    const now = Date.now();
    for (const [key, expiry] of loginRequests) if (expiry <= now) loginRequests.delete(key);
    if (loginRequests.size >= 150 || loginRequests.has(email)) reject(429, 'Espera un minuto antes de volver a pedir un código.');
    const member = await memberFor(email);
    if (!member) {
      if (body.consent !== true) reject(400, 'Lee y acepta el aviso para registrarte.');
      shortText(body.name, 2, 60);
      await validateInvitation(pool, body.invitation);
    }
    loginRequests.set(email, now + 60_000);
    await auth('otp', { email, create_user: !member });
    return { sent: true };
  }

  async function finish(body, response) {
    const email = emailAddress(body.email);
    if (!email || typeof body.code !== 'string' || !/^\d{6,10}$/.test(body.code)) reject(400, 'Escribe el correo y el código del mensaje.');
    let member = await memberFor(email);
    let name;
    if (!member) {
      if (body.consent !== true) reject(400, 'Lee y acepta el aviso para registrarte.');
      name = shortText(body.name, 2, 60);
      await validateInvitation(pool, body.invitation);
    }
    const { user } = await auth('verify', { email, token: body.code, type: 'email' });
    if (!uuid.test(user?.id ?? '') || emailAddress(user.email) !== email || !user.email_confirmed_at) reject(401, 'El correo no pudo verificarse.');
    if (!member) {
      const transaction = await pool.connect();
      try {
        await transaction.query('BEGIN');
        member = await first(transaction, 'SELECT id, display_name FROM pilot_staging.participants WHERE email = $1', [email]);
        if (!member) {
          await validateInvitation(transaction, body.invitation, { lock: true });
          member = await first(transaction, `INSERT INTO pilot_staging.participants (id,email,display_name,notice_version)
            VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING RETURNING id, display_name`, [user.id, email, name, noticeVersion]);
          member ??= await first(transaction, 'SELECT id, display_name FROM pilot_staging.participants WHERE email = $1', [email]);
        }
        if (member?.id !== user.id) reject(401, 'La cuenta no coincide con el correo verificado.');
        await transaction.query('COMMIT');
      } catch (error) {
        await transaction.query('ROLLBACK');
        throw error;
      } finally {
        transaction.release();
      }
    }
    if (member.id !== user.id) reject(401, 'La cuenta no coincide con el correo verificado.');
    const token = randomBytes(32).toString('hex');
    await pool.query(`INSERT INTO pilot_staging.sessions (token_hash,participant_id,expires_at)
      VALUES ($1,$2,now() + interval '7 days')`, [digest(token), member.id]);
    response.setHeader('Set-Cookie', cookie(token, 604800));
    return { signedIn: true };
  }

  async function session(request) {
    const token = (request.headers.cookie ?? '').split(';').map((part) => part.trim())
      .find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
    if (!sessionToken.test(token ?? '')) reject(401, 'Entra con tu correo para continuar.');
    const hash = digest(token);
    const participant = await first(pool, `SELECT p.id, p.display_name FROM pilot_staging.participants p
      JOIN pilot_staging.sessions s ON s.participant_id = p.id WHERE s.token_hash = $1 AND s.expires_at > now()`, [hash]);
    if (!participant) reject(401, 'Tu sesión venció. Vuelve a entrar.');
    return { ...participant, hash };
  }

  async function state(member) {
    const [application, circle, memberships, feedback] = await Promise.all([
      first(pool, 'SELECT scenario, amount_cop, weeks FROM pilot_staging.applications WHERE participant_id = $1', [member.id]),
      first(pool, 'SELECT id, name, invitation FROM pilot_staging.circles WHERE owner_id = $1', [member.id]),
      pool.query(`SELECT c.name, r.accepted FROM pilot_staging.circle_responses r JOIN pilot_staging.circles c ON c.id = r.circle_id
        WHERE r.participant_id = $1 ORDER BY r.answered_at`, [member.id]),
      first(pool, 'SELECT ease, comment FROM pilot_staging.feedback WHERE participant_id = $1', [member.id]),
    ]);
    if (circle) {
      const responses = await pool.query(`SELECT p.display_name, r.accepted FROM pilot_staging.circle_responses r
        JOIN pilot_staging.participants p ON p.id = r.participant_id WHERE r.circle_id = $1 ORDER BY r.answered_at`, [circle.id]);
      circle.responses = responses.rows;
    }
    return { name: member.display_name, application, circle, memberships: memberships.rows, feedback };
  }

  async function invitedCircle(token, member) {
    if (typeof token !== 'string' || !uuid.test(token)) reject(404, 'La invitación al círculo no está disponible.');
    const circle = await first(pool, `SELECT c.id, c.owner_id, c.name, p.display_name AS owner_name, r.accepted
      FROM pilot_staging.circles c JOIN pilot_staging.participants p ON p.id = c.owner_id
      LEFT JOIN pilot_staging.circle_responses r ON r.circle_id = c.id AND r.participant_id = $2 WHERE c.invitation = $1`, [token, member.id]);
    if (!circle || circle.owner_id === member.id) reject(404, 'La invitación al círculo no está disponible para tu cuenta.');
    return circle;
  }

  const actions = {
    async application(member, body) {
      if (!['inventario', 'herramientas', 'transporte'].includes(body.scenario)
        || ![200000, 300000, 400000].includes(body.amount) || ![4, 8].includes(body.weeks)) reject(400, 'Elige un escenario, un monto y un plazo de prueba.');
      await pool.query(`INSERT INTO pilot_staging.applications (participant_id,scenario,amount_cop,weeks)
        VALUES ($1,$2,$3,$4) ON CONFLICT (participant_id) DO NOTHING`, [member.id, body.scenario, body.amount, body.weeks]);
    },
    async circle(member, body) {
      await pool.query(`INSERT INTO pilot_staging.circles (id,invitation,owner_id,name) VALUES ($1,$2,$3,$4)
        ON CONFLICT (owner_id) DO NOTHING`, [randomUUID(), randomUUID(), member.id, shortText(body.name, 2, 60)]);
    },
    async 'circle-preview'(member, body) {
      const circle = await invitedCircle(body.invitation, member);
      return { name: circle.name, owner: circle.owner_name, accepted: circle.accepted };
    },
    async 'circle-response'(member, body) {
      if (typeof body.accepted !== 'boolean') reject(400, 'Elige aceptar o declinar.');
      const circle = await invitedCircle(body.invitation, member);
      await pool.query(`INSERT INTO pilot_staging.circle_responses (circle_id,participant_id,accepted) VALUES ($1,$2,$3)
        ON CONFLICT (circle_id,participant_id) DO NOTHING`, [circle.id, member.id, body.accepted]);
    },
    async feedback(member, body) {
      if (![1, 2, 3, 4, 5].includes(body.ease)) reject(400, 'Selecciona una calificación.');
      await pool.query(`INSERT INTO pilot_staging.feedback (participant_id,ease,comment) VALUES ($1,$2,$3)
        ON CONFLICT (participant_id) DO UPDATE SET ease = EXCLUDED.ease, comment = EXCLUDED.comment, submitted_at = now()`,
      [member.id, body.ease, shortText(body.comment, 0, 500)]);
    },
  };

  async function handle(request, response, route) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    try {
      let result;
      if (request.method === 'GET' && route === 'config') result = { privacyUrl, privacyContact };
      else if (request.method === 'GET' && route === 'state') result = await state(await session(request));
      else if (request.method === 'POST') {
        if (request.headers.origin !== origin) reject(403, 'Abre el formulario desde la dirección del piloto.');
        const body = await jsonBody(request);
        if (route === 'auth-start') result = await start(body);
        else if (route === 'auth-finish') result = await finish(body, response);
        else {
          const member = await session(request);
          if (route === 'logout') {
            await pool.query('DELETE FROM pilot_staging.sessions WHERE token_hash = $1', [member.hash]);
            response.setHeader('Set-Cookie', cookie('', 0));
          } else if (Object.hasOwn(actions, route)) {
            result = await actions[route](member, body);
          } else reject(404, 'Acción desconocida.');
        }
      } else reject(404, 'Acción desconocida.');
      response.end(JSON.stringify(result ?? { ok: true }));
    } catch (error) {
      response.statusCode = error instanceof PilotError ? error.status : 500;
      if (response.statusCode === 500) console.error('Error interno en una operación del piloto.');
      response.end(JSON.stringify({ error: error instanceof PilotError ? error.message : 'No pudimos completar la acción. Intenta más tarde.' }));
    }
  }

  return { handle };
}
