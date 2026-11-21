const el = (id) => document.getElementById(id);
const links = new URLSearchParams(location.hash.slice(1));
const registrationCode = links.get('inscripcion');
const circleInvitation = links.get('circulo');
const authForm = el('sign-in');
const scenarios = { inventario: 'Compra de inventario', herramientas: 'Reposición de herramientas', transporte: 'Gastos de transporte' };
const money = new Intl.NumberFormat('es-CO').format;
let codeRequested = false;

async function api(route, body) {
  const response = await fetch(`/api/pilot/${route}`, body === undefined ? undefined : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const value = await response.json();
  if (!response.ok) throw Object.assign(new Error(value.error), { status: response.status });
  return value;
}

function notify(message) { el('message').textContent = message; }

function renderItems(id, items) {
  el(id).replaceChildren(...items.map((text) => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
}

function render(state) {
  el('entry').hidden = true;
  el('workspace').hidden = false;
  el('member-name').textContent = state.name;
  el('circle-form').hidden = Boolean(state.circle);
  el('owned-circle').hidden = !state.circle;
  if (state.circle) {
    el('circle-name').textContent = state.circle.name;
    el('circle-link').value = `${location.origin}/piloto#circulo=${state.circle.invitation}`;
    renderItems('circle-responses', state.circle.responses.map(({ display_name, accepted }) => `${display_name} ${accepted ? 'aceptó' : 'declinó'} la invitación.`));
  }
  renderItems('memberships', state.memberships.map(({ name, accepted }) => `${name} · Invitación ${accepted ? 'aceptada' : 'declinada'}`));
  el('application-form').hidden = Boolean(state.application);
  el('application-result').hidden = !state.application;
  if (state.application) {
    const { scenario, amount_cop, weeks } = state.application;
    el('application-result').textContent = `Solicitud de prueba registrada. ${scenarios[scenario]} · $${money(amount_cop)} COP · ${weeks} semanas.`;
  }
  if (state.feedback) {
    el('feedback-form').elements.ease.value = state.feedback.ease;
    el('feedback-form').elements.comment.value = state.feedback.comment;
  }
  el('feedback-saved').hidden = !state.feedback;
}

async function refresh() {
  render(await api('state'));
  if (circleInvitation) {
    try {
      const invitation = await api('circle-preview', { invitation: circleInvitation });
      el('invitation-card').hidden = false;
      el('circle-decisions').hidden = invitation.accepted !== null;
      const answer = invitation.accepted === null ? '' : ` Ya ${invitation.accepted ? 'aceptaste' : 'declinaste'} la invitación.`;
      el('circle-invitation').textContent = `${invitation.owner} te invitó a «${invitation.name}».${answer}`;
    } catch (error) {
      el('invitation-card').hidden = true;
      notify(error.message);
    }
  }
}

function showEntry() {
  el('workspace').hidden = true;
  el('entry').hidden = false;
  el('registration').hidden = !registrationCode;
  authForm.elements.name.required = Boolean(registrationCode);
  authForm.elements.consent.required = Boolean(registrationCode);
}

function run(button, callback) {
  return async (event) => {
    event.preventDefault();
    if (button.disabled) return;
    button.disabled = true;
    notify('');
    try { await callback(event); }
    catch (error) { notify(error.message || 'Intenta de nuevo.'); }
    finally { button.disabled = false; }
  };
}

function authData() {
  return { email: authForm.elements.email.value, code: authForm.elements.code.value,
    name: authForm.elements.name.value, consent: authForm.elements.consent.checked, invitation: registrationCode };
}

async function requestCode() {
  await api('auth-start', authData());
  codeRequested = true;
  el('code-field').hidden = false;
  authForm.elements.code.required = true;
  el('resend').hidden = false;
  el('auth-button').textContent = 'Entrar al piloto';
  notify('Te enviamos un código al correo. Escríbelo para continuar.');
  authForm.elements.code.focus();
}

authForm.addEventListener('submit', run(el('auth-button'), async () => {
  if (!codeRequested) return requestCode();
  await api('auth-finish', authData());
  if (registrationCode) history.replaceState(null, '', `/piloto${circleInvitation ? `#circulo=${encodeURIComponent(circleInvitation)}` : ''}`);
  authForm.reset();
  await refresh();
}));
el('resend').addEventListener('click', run(el('resend'), async () => {
  if (authForm.elements.email.reportValidity()) await requestCode();
}));
el('logout').addEventListener('click', run(el('logout'), async () => {
  await api('logout', {});
  location.replace('/piloto');
}));

for (const [id, route, success] of [
  ['circle-form', 'circle', 'Círculo creado.'],
  ['application-form', 'application', 'Solicitud de prueba registrada.'],
  ['feedback-form', 'feedback', 'Gracias. Guardamos tu feedback.'],
]) {
  const form = el(id);
  form.addEventListener('submit', run(form.querySelector('button'), async () => {
    const data = Object.fromEntries(new FormData(form));
    for (const key of ['amount', 'weeks', 'ease']) if (key in data) data[key] = Number(data[key]);
    await api(route, data);
    await refresh();
    notify(success);
  }));
}

for (const [id, accepted] of [['accept', true], ['decline', false]]) {
  el(id).addEventListener('click', run(el(id), async () => {
    await api('circle-response', { invitation: circleInvitation, accepted });
    await refresh();
  }));
}

try {
  const { privacyUrl } = await api('config');
  el('privacy').href = privacyUrl;
  await refresh();
} catch (error) {
  if (error.status === 401) showEntry();
  else notify('El piloto no está disponible en este momento.');
}
