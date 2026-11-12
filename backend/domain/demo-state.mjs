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
const weeklyCostLimitPercent = 2;
const firstInstallmentDueDate = '2026-11-23';
const installmentIntentions = ['plan-to-pay', 'need-to-talk'];

export function createDemoState() {
  return {
    draft: { amount: 300_000, reason: reasons[0], weeks: 5 },
    circle: { ana: 'confirmed', camilo: 'confirmed', elena: 'confirmed', jose: 'confirmed', luz: 'pending' },
    sent: null,
  };
}

export function updateDraft(state, { amount, reason, weeks }) {
  if (state.sent || !validDetails({ amount, reason, weeks })) return false;

  state.draft = { amount, reason, weeks };
  return true;
}

function validDetails({ amount, reason, weeks }) {
  return amounts.includes(amount) && reasons.includes(reason) && terms.includes(weeks);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isStoredVersion(version, allowLegacy = false) {
  if (!isRecord(version) || !isRecord(version.application) || !validDetails(version.application) ||
      typeof version.application.applicant?.name !== 'string' || !isRecord(version.recipients)) return false;

  if (allowLegacy && version.rounds === undefined) return true;
  return Number.isInteger(version.version) && Array.isArray(version.rounds) && version.rounds.length > 0 &&
    version.rounds.every((round) => isRecord(round) && isRecord(round.votes));
}

export function isStoredDemoState(state) {
  return isRecord(state) && isRecord(state.draft) && validDetails(state.draft) &&
    isRecord(state.circle) && Object.values(state.circle).every((status) => ['confirmed', 'pending', 'declined'].includes(status)) &&
    (state.sent == null || isStoredVersion(state.sent, true)) &&
    (state.previousVersions === undefined ||
      (Array.isArray(state.previousVersions) && state.previousVersions.every((version) => isStoredVersion(version))));
}

export function loanDetails({ amount, reason, weeks }) {
  const interest = amount / 10;
  const total = amount + interest;
  return { amount, reason, weeks, frequency: 'Cada semana', installment: total / weeks, interest, total };
}

export function checkCost({ amount, weeks, interest }) {
  const principalWeeks = amount * weeks;
  return {
    weeklyRate: interest / principalWeeks,
    limit: weeklyCostLimitPercent / 100,
    withinLimit: principalWeeks > 0 && interest * 100 <= principalWeeks * weeklyCostLimitPercent,
  };
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

function newRequestId() {
  const random = globalThis.crypto?.getRandomValues?.(new Uint32Array(4));
  return random?.join('-') ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function migrateLegacyRequest(state) {
  if (!state.sent || state.requestId) return false;

  state.requestId = newRequestId();
  return true;
}

export function submitApplication(state) {
  if (state.sent) return true;

  const confirmed = confirmedSupporters(state);
  if (confirmed.length < minimumSupporters) return false;

  state.requestId = newRequestId();
  state.sent = makeVersion(1, state.draft, confirmed.map(({ id }) => id));
  return true;
}

function newRound() {
  return { paused: false, votes: {} };
}

function makeVersion(version, details, electorate) {
  return {
    application: { applicant: { ...applicant }, ...loanDetails(details) },
    recipients: Object.fromEntries(electorate.map((id) => [id, contributionLimit])),
    version,
    rounds: [newRound()],
  };
}

function currentVersion(state) {
  const { sent } = state;
  // HU 1.1 stored the original application and recipients without voting data.
  if (sent && !sent.rounds) return { ...sent, version: 1, rounds: [newRound()] };
  return sent;
}

function describeRound(round, electorateSize, number) {
  const votes = Object.values(round.votes);
  const approvals = votes.filter((vote) => vote === 'approve').length;
  let status = 'review';
  if (round.paused) status = 'meeting';
  else if (votes.length === electorateSize) {
    status = approvals === electorateSize ? 'approved' : 'rejected';
  }

  return { number, status, electorateSize, approvals, rejections: votes.length - approvals };
}

export function getApplicationStatus(state, profileId) {
  const current = currentVersion(state);
  if (!current || profileId !== applicant.id) return null;

  const electorate = Object.keys(current.recipients);
  const round = describeRound(current.rounds.at(-1), electorate.length, current.rounds.length);
  const cost = checkCost(current.application);
  const { requestId } = state;
  const authorization = requestId && round.status === 'approved' && cost.withinLimit
    ? { id: `${requestId}:${current.version}`, version: current.version, principalCop: current.application.amount }
    : null;
  return {
    version: current.version,
    application: current.application,
    electorate,
    round,
    cost,
    authorization,
  };
}

export function getDisbursementAuthorization(state) {
  return getApplicationStatus(state, applicant.id)?.authorization ?? null;
}

export function getRecordedDisbursement(state) {
  return state.disbursements?.find(({ requestId }) => requestId === state.requestId) ?? null;
}

export function getInstallmentReminder(state, profileId) {
  const current = getApplicationStatus(state, profileId);
  const movement = current && getRecordedDisbursement(state);
  if (!movement || movement.version !== current.version) return null;

  const { requestId } = movement;
  const intention = state.installmentIntention;
  return {
    requestId,
    dueDate: firstInstallmentDueDate,
    amountCop: current.application.installment,
    intention: intention?.requestId === requestId ? intention.value : null,
  };
}

export function recordInstallmentIntention(state, profileId, value) {
  if (!installmentIntentions.includes(value)) return false;
  const reminder = getInstallmentReminder(state, profileId);
  if (!reminder) return false;

  if (reminder.intention !== value) state.installmentIntention = { requestId: reminder.requestId, value };
  return true;
}

export function getInbox(state, profileId) {
  const current = currentVersion(state);
  if (!current) return [];

  return [...(state.previousVersions ?? []), current].reverse()
    .filter(({ recipients }) => Object.hasOwn(recipients, profileId))
    .map(({ application, recipients, version, rounds }) => ({
      title: `${application.applicant.name} envió su solicitud`,
      application: structuredClone(application),
      limit: recipients[profileId],
      version,
      isCurrent: version === current.version,
      rounds: rounds.map((round, index) => ({
        ...describeRound(round, Object.keys(recipients).length, index + 1),
        decision: round.votes[profileId] ?? null,
      })),
    }));
}

export function submitRevision(state, profileId, version, details, electorate) {
  const current = currentVersion(state);
  if (!current || profileId !== applicant.id || current.version !== version || getRecordedDisbursement(state) ||
      !details || !validDetails(details) || !Array.isArray(electorate)) return false;

  const recipients = new Set(electorate);
  if (recipients.size !== electorate.length || recipients.size < minimumSupporters ||
      electorate.some((id) => getSupportStatus(state, id) !== 'confirmed')) return false;

  const { amount, reason, weeks } = current.application;
  const previousElectorate = Object.keys(current.recipients);
  const sameElectorate = previousElectorate.length === recipients.size && previousElectorate.every((id) => recipients.has(id));
  if (amount === details.amount && reason === details.reason && weeks === details.weeks && sameElectorate) return false;

  state.previousVersions = [...(state.previousVersions ?? []), current];
  state.sent = makeVersion(current.version + 1, details, electorate);
  return true;
}

function eligibleVersion(state, profileId, version, round, requiredStatus) {
  const current = currentVersion(state);
  if (!current || current.version !== version || current.rounds.length !== round ||
      !Object.hasOwn(current.recipients, profileId)) return null;

  const { status } = describeRound(current.rounds.at(-1), Object.keys(current.recipients).length, round);
  return status === requiredStatus ? current : null;
}

export function recordVote(state, profileId, version, round, vote) {
  if (vote !== 'approve' && vote !== 'reject') return false;

  const current = eligibleVersion(state, profileId, version, round, 'review');
  if (!current) return false;

  const activeRound = current.rounds.at(-1);
  if (Object.hasOwn(activeRound.votes, profileId)) return false;

  const updatedRound = { ...activeRound, votes: { ...activeRound.votes, [profileId]: vote } };
  state.sent = { ...current, rounds: [...current.rounds.slice(0, -1), updatedRound] };
  return true;
}

export function pauseForMeeting(state, profileId, version, round) {
  const current = eligibleVersion(state, profileId, version, round, 'review');
  if (!current) return false;

  state.sent = {
    ...current,
    rounds: [...current.rounds.slice(0, -1), { ...current.rounds.at(-1), paused: true }],
  };
  return true;
}

export function resumeAfterMeeting(state, profileId, version, round) {
  const current = eligibleVersion(state, profileId, version, round, 'meeting');
  if (!current) return false;

  state.sent = { ...current, rounds: [...current.rounds, newRound()] };
  return true;
}
