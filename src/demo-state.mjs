export const applicant = Object.freeze({
  id: 'diana',
  name: 'Diana',
  summary: 'Vende desayunos en su barrio en Medellín.',
  history: null,
});

export const supporters = Object.freeze([
  { id: 'ana', name: 'Ana' },
  { id: 'camilo', name: 'Camilo' },
  { id: 'elena', name: 'Elena' },
  { id: 'jose', name: 'José' },
  { id: 'luz', name: 'Luz' },
  { id: 'mateo', name: 'Mateo' },
  { id: 'rosa', name: 'Rosa' },
].map(Object.freeze));

export const amounts = Object.freeze([200_000, 300_000, 400_000]);
export const terms = Object.freeze([4, 5, 8]);
export const reasons = Object.freeze([
  'Comprar insumos para el negocio',
  'Reparar el equipo de trabajo',
  'Comprar herramientas de trabajo',
]);

export const minimumSupporters = 5;
export const contributionLimit = 10_000;

export function createDemoState() {
  return {
    draft: { amount: 300_000, reason: reasons[0], weeks: 5 },
    circle: { ana: 'confirmed', camilo: 'confirmed', elena: 'confirmed', jose: 'confirmed', luz: 'pending' },
    sent: null,
  };
}

export function updateDraft(state, { amount, reason, weeks }) {
  if (state.sent || !amounts.includes(amount) || !reasons.includes(reason) || !terms.includes(weeks)) {
    return false;
  }

  state.draft = { amount, reason, weeks };
  return true;
}

export function loanDetails({ amount, reason, weeks }) {
  const interest = amount / 10;
  const total = amount + interest;
  return { amount, reason, weeks, frequency: 'Cada semana', installment: total / weeks, interest, total };
}

export function getSupportStatus(state, profileId) {
  return supporters.some(({ id }) => id === profileId) && Object.hasOwn(state.circle, profileId)
    ? state.circle[profileId]
    : 'uninvited';
}

export function inviteSupporter(state, profileId) {
  if (state.sent || !supporters.some(({ id }) => id === profileId) || getSupportStatus(state, profileId) !== 'uninvited') {
    return false;
  }

  state.circle[profileId] = 'pending';
  return true;
}

export function respondToInvitation(state, profileId, response) {
  if (state.sent || getSupportStatus(state, profileId) !== 'pending' || !['confirmed', 'declined'].includes(response)) {
    return false;
  }

  state.circle[profileId] = response;
  return true;
}

function confirmedSupporters(state) {
  return supporters.filter(({ id }) => getSupportStatus(state, id) === 'confirmed');
}

export function countConfirmed(state) {
  return confirmedSupporters(state).length;
}

export function submitApplication(state) {
  if (state.sent) return true;

  const confirmed = confirmedSupporters(state);
  if (confirmed.length < minimumSupporters) return false;

  state.sent = {
    application: { applicant: { ...applicant }, ...loanDetails(state.draft) },
    recipients: Object.fromEntries(confirmed.map(({ id }) => [id, contributionLimit])),
  };
  return true;
}

export function getInbox(state, profileId) {
  return state.sent && Object.hasOwn(state.sent.recipients, profileId)
    ? [{ title: 'Diana envió su solicitud', application: state.sent.application, limit: state.sent.recipients[profileId] }]
    : [];
}
