import {
  amounts, applicant, checkCost, contributionLimit, countConfirmed, createDemoState, getApplicationStatus, getInbox,
  getRecordedDisbursement, getSupportStatus, inviteSupporter, loanDetails, minimumSupporters, reasons,
  pauseForMeeting, recordVote, respondToInvitation, resumeAfterMeeting, submitApplication,
  submitRevision, supporters, terms, updateDraft,
} from './demo-state.mjs';
import {
  canViewFinance, getDisbursementStatus, getFinanceDashboard, registerDisbursement, restoreFinance,
} from './finance-state.mjs';

const storageKey = 'credito-comunitario-hu-1-1';
const currency = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat('es-CO', { style: 'percent', maximumFractionDigits: 2 });
const percentagePoints = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });
const money = (amount) => `$${currency.format(amount)} COP`;
const statusText = {
  confirmed: 'Confirmado',
  excluded: 'Fuera de la versión vigente',
  pending: 'Invitación pendiente',
  declined: 'Respaldo rechazado',
  uninvited: 'Sin invitación',
};
const votingStatus = {
  review: 'En revisión',
  meeting: 'Pendiente de reunión',
  approved: 'Aprobada por el grupo',
  rejected: 'Rechazada',
};

const byId = (id) => document.getElementById(id);
const profile = byId('profile');
const draftForm = byId('draft-form');
const inviteForm = byId('invite-form');
const invitee = byId('invitee');
const responseForm = byId('response-form');
const navigation = byId('navigation');
const sections = document.querySelectorAll('main section');
const applicantViews = ['needs', 'circle', 'review', 'success'];
const state = loadState();
if (restoreFinance(state)) saveState();
let applicantView = 'needs';
let editingVersion = null;
let selectedVersion = null;

function loadState() {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey)) ?? createDemoState();
  } catch {
    return createDemoState();
  }
}

function saveState() {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // The demo still works in memory when storage is unavailable.
  }
}

function announce(message) {
  byId('announcement').textContent = message;
}

function fillDetails(section, details) {
  const fields = {
    ...details,
    amount: money(details.amount),
    weeks: `${details.weeks} semanas`,
    installment: money(details.installment),
    interest: money(details.interest),
    total: money(details.total),
    weeklyRate: percent.format(checkCost(details).weeklyRate),
  };

  for (const field of byId(section).querySelectorAll('[data-field]')) {
    field.textContent = fields[field.dataset.field];
  }
}

function renderCircle() {
  const confirmed = countConfirmed(state);
  const missing = minimumSupporters - confirmed;
  byId('progress').textContent = missing > 0
    ? `${confirmed} de ${minimumSupporters} personas confirmaron. ${missing === 1 ? 'Te falta 1.' : `Te faltan ${missing}.`}`
    : `${confirmed} personas confirmaron. Ya puedes revisar la solicitud.`;
  byId('review-button').disabled = missing > 0;
  byId('pending-hint').hidden = !supporters.some(({ id }) => getSupportStatus(state, id) === 'pending');

  const members = [];
  const available = [];
  for (const { id, name } of supporters) {
    const status = getSupportStatus(state, id);
    if (status === 'uninvited') {
      available.push(new Option(name, id));
    } else {
      const member = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = statusText[status];
      member.append(name, label);
      members.push(member);
    }
  }

  byId('circle-members').replaceChildren(...members);
  invitee.replaceChildren(...available);
  inviteForm.hidden = available.length === 0;
}

function renderSupport(status) {
  const explanation = {
    confirmed: 'Aceptaste respaldar esta solicitud.',
    excluded: 'Puedes consultar en la bandeja las fichas que recibiste en versiones anteriores.',
    pending: 'Puedes decidir si aceptas ese compromiso.',
    declined: 'Decidiste no respaldar esta solicitud.',
    uninvited: 'Diana aún no te ha invitado a respaldar esta solicitud.',
  };

  for (const label of document.querySelectorAll('[data-support-status]')) {
    label.textContent = statusText[status];
  }
  const canRespond = status === 'pending' && !state.sent;
  byId('commitment').hidden = status !== 'confirmed' && !canRespond;
  byId('commitment').querySelector('[data-limit]').textContent = money(contributionLimit);
  byId('support-explanation').textContent = explanation[status];
  responseForm.hidden = !canRespond;
  if (status === 'pending' && state.sent) {
    byId('support-explanation').textContent = 'La solicitud ya se envió a quienes habían confirmado.';
  }
}

function voteProgress({ approvals, rejections, electorateSize }) {
  return `${approvals + rejections} de ${electorateSize} votos · ${approvals} a favor · ${rejections} en contra`;
}

function ownDecision({ decision }) {
  if (decision === 'approve') return 'Votaste a favor.';
  if (decision === 'reject') return 'Votaste en contra.';
  return 'Sin voto de tu perfil en esta ronda.';
}

function renderApplicantStatus() {
  const { version, round, cost } = getApplicationStatus(state, applicant.id);
  byId('applicant-version').textContent = `Versión ${version} · Ronda ${round.number}`;
  byId('applicant-status').textContent = votingStatus[round.status];
  byId('applicant-votes').textContent = voteProgress(round);
  byId('applicant-decision').textContent = {
    review: 'El grupo necesita todos los votos a favor para aprobar la solicitud.',
    meeting: 'El grupo pausó la votación para deliberar. Cuando la retome, empezará una nueva ronda.',
    approved: 'El grupo aprobó la solicitud por unanimidad.',
    rejected: 'El grupo completó la votación con al menos un voto en contra.',
  }[round.status];

  const { weeklyRate, limit, withinLimit } = cost;
  const disbursement = getDisbursementStatus(state);
  const disbursementStatus = {
    recorded: 'Desembolso simulado registrado',
    authorized: 'Habilitado',
    'cost-limit': 'Bloqueado por costo',
    'insufficient-credit': 'Bloqueado por saldo insuficiente en el presupuesto de créditos',
    'not-authorized': round.status === 'rejected'
      ? 'Bloqueado por la decisión del grupo'
      : 'Pendiente de aprobación del grupo',
  }[disbursement.status];
  byId('applicant-disbursement').textContent = disbursementStatus;
  const amount = byId('applicant-disbursement-amount');
  amount.hidden = !disbursement.movement;
  amount.textContent = disbursement.movement ? money(disbursement.movement.principalCop) : '';
  byId('edit-revision').hidden = Boolean(disbursement.movement);

  const displayedRate = percent.format(weeklyRate);
  const displayedLimit = percent.format(limit);
  const comparison = `La tasa ilustrativa es ${displayedRate} por semana y el límite ficticio es ${displayedLimit}.`;
  const excess = (weeklyRate - limit) * 100;
  if (!withinLimit && excess < 0.01) {
    byId('applicant-cost').textContent = `La tasa semanal supera el límite ficticio de ${displayedLimit} por menos de 0,01 puntos porcentuales. Al redondear, la tasa se muestra como ${displayedRate}.`;
    return;
  }
  byId('applicant-cost').textContent = withinLimit
    ? `${comparison} El costo cumple la regla de la demo.`
    : `${comparison} La tasa supera el límite por ${percentagePoints.format(excess)} puntos porcentuales.`;
}

function renderFinance({ fund, budget }) {
  const figures = {
    'fund-interest': fund.interestCollectedCop,
    'fund-balance': fund.balanceCop,
    'fund-reserve': fund.reserveCop,
    'fund-commitments': fund.commitmentsCop,
    'fund-available': fund.availableCop,
    'budget-credit': budget.creditCop,
    'budget-platform': budget.platformCop,
    'budget-staff': budget.staffCop,
  };
  for (const [id, amount] of Object.entries(figures)) byId(id).textContent = money(amount);
}

function renderInbox(notices) {
  byId('inbox-empty').hidden = notices.length > 0;
  byId('notices').hidden = notices.length === 0;
  byId('notices').replaceChildren(...notices.map(({ title, version, isCurrent, rounds }) => {
    const notice = document.createElement('li');
    notice.className = 'callout';
    const description = document.createElement('p');
    description.textContent = `${title}. Versión ${version}${isCurrent ? '' : ' (historial)'} · ${votingStatus[rounds.at(-1).status]}`;
    const open = document.createElement('button');
    open.type = 'button';
    open.textContent = `Abrir ficha de la versión ${version}`;
    open.addEventListener('click', () => {
      selectedVersion = version;
      show('sheet');
    });
    notice.append(description, open);
    return notice;
  }));
}

function renderSheet({ application, limit, version, isCurrent, rounds }) {
  const round = rounds.at(-1);
  byId('applicant-name').textContent = application.applicant.name;
  byId('applicant-summary').textContent = application.applicant.summary;
  byId('applicant-history').textContent = application.applicant.history ?? 'Diana aún no tiene historial de pagos en la app.';
  byId('sheet').querySelector('[data-limit]').textContent = money(limit);
  fillDetails('sheet', application);

  byId('sheet-version').textContent = `Versión ${version}${isCurrent ? '' : ' (historial)'} · Ronda ${round.number}`;
  byId('sheet-status').textContent = votingStatus[round.status];
  byId('sheet-votes').textContent = voteProgress(round);
  byId('sheet-decision').textContent = ownDecision(round);

  const canPause = isCurrent && round.status === 'review';
  const canResume = isCurrent && round.status === 'meeting';
  const votingActions = byId('voting-actions');
  votingActions.hidden = !canPause && !canResume;
  votingActions.dataset.round = round.number;
  votingActions.querySelector('[data-decision="pause"]').hidden = !canPause;
  votingActions.querySelector('[data-decision="resume"]').hidden = !canResume;
  for (const button of votingActions.querySelectorAll('[data-decision="approve"], [data-decision="reject"]')) {
    button.hidden = !canPause || Boolean(round.decision);
  }

  const previousRounds = rounds.slice(0, -1);
  byId('sheet-history').hidden = previousRounds.length === 0;
  byId('round-history').replaceChildren(...previousRounds.map((previous) => {
    const entry = document.createElement('li');
    entry.textContent = `Ronda ${previous.number} · ${votingStatus[previous.status]}. ${voteProgress(previous)}. ${ownDecision(previous)}`;
    return entry;
  }));
}

function show(requestedView, moveFocus = true) {
  const isApplicant = profile.value === applicant.id;
  const financeAllowed = canViewFinance(state, profile.value);
  let view = requestedView;

  if (view === 'finance' && financeAllowed) {
    renderFinance(getFinanceDashboard(state, profile.value));
  } else if (isApplicant) {
    if (view === 'application') view = applicantView;
    const canContinueRevision = view === 'needs' && editingVersion && !getRecordedDisbursement(state);
    if (state.sent && !canContinueRevision) view = 'success';
    else if (!applicantViews.includes(view) || view === 'success') view = 'needs';
    else if (view === 'review' && countConfirmed(state) < minimumSupporters) view = 'circle';

    applicantView = view;
    if (view === 'success') {
      editingVersion = null;
      renderApplicantStatus();
    }
    if (view === 'circle') renderCircle();
    if (view === 'review') {
      fillDetails('review', loanDetails(state.draft));
      byId('review-recipients').textContent = `Recibirán la ficha las ${countConfirmed(state)} personas que confirmaron.`;
    }
  } else {
    const notices = getInbox(state, profile.value);
    const notice = notices.find(({ version }) => version === selectedVersion);
    if (!['support', 'inbox', 'sheet'].includes(view) || (view === 'sheet' && !notice)) view = 'inbox';
    const status = getSupportStatus(state, profile.value);
    const excluded = state.sent && status === 'confirmed' && !notices.some(({ isCurrent }) => isCurrent);
    renderSupport(excluded ? 'excluded' : status);
    if (view === 'inbox') renderInbox(notices);
    if (view === 'sheet') renderSheet(notice);
  }

  navigation.hidden = false;
  const currentView = view === 'finance' ? view : isApplicant ? 'application' : view === 'sheet' ? 'inbox' : view;
  for (const button of navigation.querySelectorAll('[data-go]')) {
    const destination = button.dataset.go;
    button.hidden = destination === 'finance' ? !financeAllowed : (destination === 'application') !== isApplicant;
    if (destination === currentView) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  for (const section of sections) section.hidden = section.id !== view;
  if (moveFocus) byId(`${view}-title`).focus();
}

function readDetails(form) {
  return {
    amount: Number(form.get('amount')),
    reason: form.get('reason'),
    weeks: Number(form.get('weeks')),
  };
}

function saveDraft() {
  if (profile.value !== applicant.id || state.sent) return false;
  const updated = updateDraft(state, readDetails(new FormData(draftForm)));
  if (updated) saveState();
  return updated;
}

function renderCostPreview() {
  fillDetails('revision-preview', loanDetails(readDetails(new FormData(draftForm))));
  byId('revision-preview').hidden = false;
}

profile.append(new Option(applicant.name, applicant.id));
for (const { id, name } of supporters) profile.append(new Option(name, id));
byId('amount').append(...amounts.map((amount) => new Option(`$${currency.format(amount)}`, amount, false, amount === state.draft.amount)));
byId('weeks').append(...terms.map((weeks) => new Option(`${weeks} semanas`, weeks, false, weeks === state.draft.weeks)));
for (const reason of reasons) {
  const label = document.createElement('label');
  label.className = 'choice';
  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'reason';
  input.value = reason;
  input.required = true;
  input.checked = reason === state.draft.reason;
  label.append(input, reason);
  byId('reasons').append(label);
}

profile.addEventListener('change', () => {
  selectedVersion = null;
  const view = profile.value === applicant.id ? applicantView : (state.sent ? 'inbox' : 'support');
  show(view, false);
  const name = profile.selectedOptions[0].textContent;
  const title = document.querySelector('main section:not([hidden]) h1').textContent;
  announce(`Perfil de prueba: ${name}. ${title}.`);
});

byId('choose-invited').addEventListener('click', () => profile.focus());

for (const button of document.querySelectorAll('[data-go]')) {
  button.addEventListener('click', () => show(button.dataset.go));
}

byId('edit-draft').addEventListener('click', renderCostPreview);

draftForm.addEventListener('change', () => {
  byId('revision-error').hidden = true;
  if (!editingVersion) saveDraft();
  if (!byId('revision-preview').hidden) renderCostPreview();
});
draftForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!editingVersion) {
    if (saveDraft()) show('circle');
    return;
  }

  const form = new FormData(draftForm);
  if (!submitRevision(state, profile.value, editingVersion, readDetails(form), form.getAll('electorate'))) {
    const error = byId('revision-error');
    error.hidden = false;
    error.textContent = 'Cambia al menos un dato o el grupo y conserva al menos cinco personas habilitadas.';
    return;
  }

  saveState();
  show('success');
  announce(`${byId('applicant-version').textContent}. ${byId('applicant-status').textContent}.`);
});

byId('edit-revision').addEventListener('click', () => {
  const current = getApplicationStatus(state, profile.value);
  if (!current || getRecordedDisbursement(state)) return;

  editingVersion = current.version;
  const { amount, reason, weeks } = current.application;
  draftForm.elements.amount.value = amount;
  draftForm.elements.reason.value = reason;
  draftForm.elements.weeks.value = weeks;
  const choices = supporters.filter(({ id }) => getSupportStatus(state, id) === 'confirmed');
  byId('revision-choices').replaceChildren(...choices.map(({ id, name }) => {
    const label = document.createElement('label');
    label.className = 'choice';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'electorate';
    input.value = id;
    input.checked = current.electorate.includes(id);
    label.append(input, name);
    return label;
  }));
  byId('needs-step').textContent = 'Solicitud de prueba';
  byId('needs-title').textContent = `Prepara la versión ${current.version + 1}`;
  byId('needs-description').textContent = 'Puedes cambiar las condiciones y quiénes votan. La nueva ficha empieza sin votos.';
  byId('draft-submit').textContent = 'Enviar nueva versión';
  byId('revision-electorate').hidden = false;
  renderCostPreview();
  byId('cancel-revision').hidden = false;
  byId('revision-error').hidden = true;
  show('needs');
});

byId('voting-actions').addEventListener('click', (event) => {
  const decision = event.target.dataset.decision;
  if (!decision) return;

  const round = Number(byId('voting-actions').dataset.round);
  const selection = [state, profile.value, selectedVersion, round];
  const updated = decision === 'pause' ? pauseForMeeting(...selection)
    : decision === 'resume' ? resumeAfterMeeting(...selection)
      : recordVote(...selection, decision);
  if (!updated) return;

  if (decision === 'approve') registerDisbursement(state);
  saveState();
  show('sheet');
  announce(`${byId('sheet-status').textContent}. ${byId('sheet-votes').textContent}. ${byId('sheet-decision').textContent}`);
});

inviteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = invitee.selectedOptions[0]?.textContent;
  if (profile.value !== applicant.id || !inviteSupporter(state, invitee.value)) return;

  saveState();
  renderCircle();
  if (inviteForm.hidden) byId('circle-title').focus();
  announce(`Invitación enviada a ${name}. ${byId('progress').textContent}`);
});

responseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const response = event.submitter?.value;
  if (!respondToInvitation(state, profile.value, response)) return;

  saveState();
  show('support');
  announce(byId('support-explanation').textContent);
});

byId('send-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (profile.value !== applicant.id) return;

  if (submitApplication(state)) {
    saveState();
    show('success');
  } else {
    show('circle');
    announce(byId('progress').textContent);
  }
});

profile.value = applicant.id;
show(applicantView, false);
