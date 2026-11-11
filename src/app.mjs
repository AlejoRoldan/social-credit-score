import {
  amounts, applicant, checkCost, contributionLimit, countConfirmed, createDemoState, getApplicationStatus, getInbox,
  getRecordedDisbursement, getSupportStatus, inviteSupporter, loanDetails, minimumSupporters, reasons,
  pauseForMeeting, recordVote, respondToInvitation, resumeAfterMeeting, submitApplication,
  submitRevision, supporters, terms, updateDraft,
} from './demo-state.mjs';
import {
  canViewFinance, getDisbursementStatus, getFinanceDashboard, registerDisbursement, restoreFinance,
} from './finance-state.mjs';
import {
  getInstallmentCase, installmentSupporters, simulateInstallmentContribution, voteOnInstallmentReserve,
} from './installment-state.mjs';
import {
  canViewProject, confirmProjectTransfer, getProjectCase, submitProjectProposal, validateProjectProposal, voteOnProject,
} from './project-state.mjs';

const storageKey = 'credito-comunitario-hu-1-1';
const presentationKey = 'credito-comunitario-hu-2-2';
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
const projectForm = byId('project-form');
const inviteForm = byId('invite-form');
const invitee = byId('invitee');
const responseForm = byId('response-form');
const navigation = byId('navigation');
const sections = document.querySelectorAll('main section');
const applicantViews = ['needs', 'circle', 'review', 'success'];
const guidedVoter = installmentSupporters.at(-1);
const normalState = loadSession(storageKey, createDemoState());
const presentation = loadSession(presentationKey, {});
let guided = Boolean(presentation.active && presentation.guided);
let state = guided ? presentation.guided : normalState;
let applicantView = 'needs';
let editingVersion = null;
let selectedVersion = null;
let installmentVariant = 'reserve';
let currentView;

function loadSession(key, fallback) {
  try {
    return JSON.parse(sessionStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveSession(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The demo still works in memory when storage is unavailable.
  }
}

function saveState() {
  if (guided) saveSession(presentationKey, presentation);
  else saveSession(storageKey, normalState);
}

function saveNavigation() {
  const slot = guided ? 'guidedNavigation' : 'normalNavigation';
  presentation[slot] = { view: currentView, profileId: profile.value, selectedVersion, applicantView, installmentVariant };
  presentation.active = guided;
  saveSession(presentationKey, presentation);
}

function createGuidedLoan() {
  const loan = createDemoState();
  respondToInvitation(loan, guidedVoter, 'confirmed');
  submitApplication(loan);
  for (const id of installmentSupporters.slice(0, -1)) recordVote(loan, id, 1, 1, 'approve');
  return loan;
}

function openJourney(useGuide, reset = false, moveFocus = true) {
  if (useGuide && !guided && editingVersion) {
    const form = new FormData(draftForm);
    presentation.normalRevision = { version: editingVersion, details: readDetails(form), electorate: form.getAll('electorate') };
  }
  guided = useGuide;
  if (guided && (reset || !presentation.guided)) {
    presentation.guided = createGuidedLoan();
    presentation.guidedNavigation = { view: 'sheet', profileId: guidedVoter, selectedVersion: 1 };
  }
  state = guided ? presentation.guided : normalState;
  if (restoreFinance(state)) saveState();
  const saved = guided ? presentation.guidedNavigation : presentation.normalNavigation;
  profile.value = saved?.profileId ?? applicant.id;
  if (!profile.value) profile.value = applicant.id;
  applicantView = saved?.applicantView ?? 'needs';
  selectedVersion = saved?.selectedVersion ?? null;
  installmentVariant = saved?.installmentVariant === 'empty' ? 'empty' : 'reserve';
  editingVersion = null;
  draftForm.elements.amount.value = state.draft.amount;
  draftForm.elements.weeks.value = state.draft.weeks;
  draftForm.elements.reason.value = state.draft.reason;
  resetDraftForm();
  if (!guided && presentation.normalRevision) {
    const { version, details, electorate } = presentation.normalRevision;
    const current = getApplicationStatus(state, applicant.id);
    if (current?.version === version && !getRecordedDisbursement(state)) renderRevisionForm(version, details, electorate);
    delete presentation.normalRevision;
  }
  byId('start-demo').hidden = guided;
  byId('start-demo').textContent = presentation.guided ? 'Continuar demo' : 'Iniciar demo';
  byId('reset-demo').hidden = !presentation.guided;
  byId('exit-demo').hidden = !guided;
  show(saved?.view ?? applicantView, moveFocus);
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
  byId('simulate-installment').hidden = !guided || !disbursement.movement;
  byId('application-profile-hint').hidden = guided && Boolean(disbursement.movement);

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
  byId('open-project').hidden = !canViewProject(profile.value);
}

function renderFacts(id, entries) {
  byId(id).replaceChildren(...entries.map(([label, amount]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const value = document.createElement('dd');
    term.textContent = label;
    value.textContent = money(amount);
    row.append(term, value);
    return row;
  }));
}

function readProjectDraft() {
  return [projectForm.elements.purpose.value, projectForm.elements.amount.valueAsNumber];
}

function renderProjectValidation(result) {
  const error = byId('project-error');
  error.textContent = {
    'missing-purpose': 'Escribe la finalidad de la propuesta.',
    'invalid-amount': 'Ingresa un importe positivo en pesos enteros.',
    'exceeds-available': result.excessCop ? `El importe excede el disponible en ${money(result.excessCop)}.` : '',
    blocked: 'Este perfil no puede enviar una propuesta ahora.',
  }[result.status] ?? '';
  error.hidden = !error.textContent;
  projectForm.elements.purpose.setAttribute('aria-invalid', String(result.status === 'missing-purpose'));
  projectForm.elements.amount.setAttribute('aria-invalid', String(['invalid-amount', 'exceeds-available'].includes(result.status)));
}

function renderProjectProposal(proposal) {
  const heading = document.createElement('h2');
  heading.textContent = `Propuesta ${proposal.id}`;
  const purpose = document.createElement('p');
  purpose.textContent = proposal.purpose;
  const amount = document.createElement('strong');
  amount.textContent = money(proposal.amountCop);
  const roster = document.createElement('ul');
  roster.className = 'member-list';
  roster.setAttribute('aria-label', 'Padrón y votos de la propuesta');
  for (const id of proposal.electorate) {
    const item = document.createElement('li');
    const vote = document.createElement('span');
    vote.textContent = { approve: 'A favor', reject: 'En contra' }[proposal.votes[id]] ?? 'Sin votar';
    item.append(supporters.find(({ id: supporterId }) => supporterId === id).name, vote);
    roster.append(item);
  }
  return [heading, purpose, amount, roster];
}

function renderProject() {
  const example = getProjectCase(state, profile.value);
  byId('project-content').hidden = !example;
  byId('project-denied').hidden = Boolean(example);
  if (!example) return;

  const { fund, current, history, canPropose, canVote, canConfirm } = example;
  renderFacts('project-balances', [
    ['Saldo', fund.balanceCop], ['Reserva', fund.reserveCop],
    ['Compromisos', fund.commitmentsCop], ['Disponible para proyectos', fund.availableCop],
  ]);
  byId('project-status').textContent = current ? {
    waiting: `${current.approvals} de ${current.electorate.length} votos a favor. El giro requiere unanimidad.`,
    rejected: 'Hubo un voto en contra. El giro quedó bloqueado y el grupo puede enviar otra propuesta.',
    approved: current.amountCop <= fund.availableCop
      ? 'El grupo aprobó la propuesta por unanimidad. Falta confirmar el giro.'
      : 'El grupo aprobó la propuesta por unanimidad. El giro quedó bloqueado por saldo insuficiente.',
    recorded: `Giro de ${money(current.movement?.amountCop ?? current.amountCop)} registrado para la propuesta ${current.id}.`,
  }[current.status] : 'El grupo artístico puede proponer un gasto con el saldo disponible.';
  const sheet = byId('project-current');
  sheet.hidden = !current;
  sheet.replaceChildren(...(current ? renderProjectProposal(current) : []));

  const voteActions = byId('project-vote-actions');
  voteActions.hidden = !canVote;
  voteActions.dataset.proposalId = current?.id ?? '';
  const confirm = byId('project-confirm');
  confirm.hidden = !canConfirm;
  confirm.dataset.proposalId = current?.id ?? '';
  confirm.textContent = canConfirm ? `Confirmar giro de ${money(current.amountCop)}` : '';
  projectForm.hidden = !canPropose;
  if (canPropose) renderProjectValidation(validateProjectProposal(state, ...readProjectDraft()));

  byId('project-history').hidden = history.length === 0;
  byId('project-history-list').replaceChildren(...history.map((proposal) => {
    const entry = document.createElement('article');
    const outcome = document.createElement('p');
    outcome.textContent = proposal.movement ? 'Giro registrado' : 'Propuesta rechazada';
    entry.append(...renderProjectProposal(proposal), outcome);
    return entry;
  }));
}

function renderInstallmentApplicant(example) {
  const { installmentCop, ownPaymentCop, reservePaidCop, paidBySupportersCop, pendingCop, contributions,
    fundBefore, fundAfter } = example;
  renderFacts('installment-breakdown', [
    ['Valor de la cuota vencida', installmentCop], ['Pago propio de Diana', ownPaymentCop],
    ['Pago realizado con la reserva', reservePaidCop], ['Aportes realizados', paidBySupportersCop],
    ['Total pendiente', pendingCop],
  ]);
  byId('installment-contributions').hidden = contributions.length === 0;
  byId('installment-contributions').replaceChildren(...contributions.map((contribution) => {
    const { id, assignedCop, paidCop, status } = contribution;
    const item = document.createElement('li');
    const name = document.createElement('strong');
    const detail = document.createElement('span');
    name.textContent = supporters.find((person) => person.id === id).name;
    const result = { paid: 'Pagado', pending: 'Pendiente', failed: 'Fallido · sigue pendiente' }[status];
    detail.textContent = `${result} · Asignado ${money(assignedCop)} · Realizado ${money(paidCop)}`;
    item.append(name, detail);
    return item;
  }));
  renderFacts('installment-balances', [
    ['Saldo antes', fundBefore.balanceCop], ['Saldo después', fundAfter.balanceCop],
    ['Reserva antes', fundBefore.reserveCop], ['Reserva después', fundAfter.reserveCop],
    ['Disponible antes', fundBefore.availableCop], ['Disponible después', fundAfter.availableCop],
  ]);
}

function renderInstallment() {
  const reserve = getInstallmentCase(state, 'reserve', applicant.id);
  const variantsAvailable = !guided || reserve.voteStatus === 'rejected' ||
    (reserve.active && reserve.contributions.every(({ status }) => status !== 'pending'));
  byId('installment-variants').hidden = !variantsAvailable;
  if (!variantsAvailable) installmentVariant = 'reserve';
  const example = getInstallmentCase(state, installmentVariant, profile.value);
  byId('installment-denied').hidden = Boolean(example);
  byId('installment-content').hidden = !example;
  byId('installment-profile').hidden = Boolean(example);
  const isApplicant = profile.value === applicant.id;
  if (!isApplicant) {
    for (const id of ['installment-breakdown', 'installment-contributions', 'installment-balances']) byId(id).replaceChildren();
  }
  if (!example) {
    byId('installment-own').replaceChildren();
    return;
  }

  for (const button of document.querySelectorAll('[data-variant]')) {
    button.setAttribute('aria-pressed', String(button.dataset.variant === installmentVariant));
  }
  const { active, approvals, voteStatus, reserveCop, ownVote, contribution, contributions, nextVoter } = example;
  const reserveAmount = money(reserveCop);
  byId('installment-status').textContent = {
    waiting: `${approvals} de ${installmentSupporters.length} votos a favor. Se necesita unanimidad para usar ${reserveAmount} de la reserva y activar los aportes.`,
    rejected: 'Hubo un voto en contra. La cuota queda pendiente de resolución y los aportes siguen bloqueados.',
    approved: `Se registró una salida de ${reserveAmount} de la reserva. Los aportes ya están asignados.`,
    unneeded: 'La bolsa está vacía. Los aportes se asignaron directamente.',
  }[voteStatus];

  byId('installment-applicant').hidden = !isApplicant;
  if (isApplicant) renderInstallmentApplicant(example);
  byId('installment-vote').hidden = !ownVote;
  byId('installment-vote').textContent = ownVote ? ownDecision({ decision: ownVote }) : '';
  byId('reserve-actions').hidden = isApplicant || voteStatus !== 'waiting' || Boolean(ownVote);
  byId('contribution-actions').hidden = contribution?.status !== 'pending';
  byId('installment-own').hidden = !contribution;
  renderFacts('installment-own', contribution ? [
    ['Tu aporte asignado', contribution.assignedCop], ['Tu aporte realizado', contribution.paidCop],
  ] : []);

  const nextContributor = contributions?.find(({ status }) => status === 'pending')?.id;
  const nextId = isApplicant ? (active ? nextContributor : voteStatus === 'waiting' ? nextVoter : null) : applicant.id;
  const nextName = supporters.find(({ id }) => id === nextId)?.name;
  const next = byId('installment-next');
  next.hidden = !nextId;
  next.dataset.profile = nextId ?? '';
  next.textContent = isApplicant ? `Cambiar al perfil de ${nextName}` : 'Volver al perfil de Diana';
  const hint = byId('installment-next-hint');
  hint.textContent = {
    paid: 'Tu aporte quedó pagado.',
    failed: 'Tu aporte falló y sigue pendiente.',
    pending: guided && installmentVariant === 'reserve' && profile.value === guidedVoter
      ? 'Para ver el faltante en el resumen de Diana, simula un aporte fallido en este perfil.' : '',
  }[contribution?.status] ?? '';
  if (isApplicant && active && !nextContributor && installmentVariant === 'reserve') {
    hint.textContent = 'Puedes abrir el ejemplo con la bolsa vacía o reiniciar el recorrido guiado desde el encabezado.';
  }
  hint.hidden = !hint.textContent;
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
  byId('guided-after-vote').hidden = !guided || !getRecordedDisbursement(state);
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
  const installmentAllowed = !guided || Boolean(getRecordedDisbursement(state));
  let view = requestedView;

  if (view === 'project') {
    renderProject();
  } else if (view === 'installment' && installmentAllowed) {
    renderInstallment();
  } else if (view === 'finance' && financeAllowed) {
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
  byId('guided-vote').hidden = installmentAllowed || (profile.value === guidedVoter && view === 'sheet');
  const navView = view === 'project' && financeAllowed ? 'finance'
    : ['finance', 'installment', 'project'].includes(view) ? view
      : isApplicant ? 'application' : view === 'sheet' ? 'inbox' : view;
  for (const button of navigation.querySelectorAll('[data-go]')) {
    const destination = button.dataset.go;
    button.hidden = destination === 'finance' ? !financeAllowed : destination === 'installment' ? !installmentAllowed
      : destination === 'project' ? financeAllowed || !canViewProject(profile.value)
        : (destination === 'application') !== isApplicant;
    if (destination === navView) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  for (const section of sections) section.hidden = section.id !== view;
  currentView = view;
  saveNavigation();
  if (moveFocus) byId(`${view}-title`).focus();
}

function resetDraftForm() {
  byId('needs-step').textContent = 'Paso 1 de 3';
  byId('needs-title').textContent = 'Cuéntanos qué necesitas';
  byId('needs-description').textContent = 'Elige las opciones para la solicitud de Diana.';
  byId('draft-submit').textContent = 'Continuar al grupo';
  for (const id of ['revision-electorate', 'revision-preview', 'cancel-revision', 'revision-error']) byId(id).hidden = true;
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

function showProfile(moveFocus, destination) {
  selectedVersion = null;
  const returnToVote = guided && profile.value === guidedVoter && !getRecordedDisbursement(state);
  if (returnToVote) selectedVersion = getInbox(state, guidedVoter).find(({ isCurrent }) => isCurrent)?.version ?? null;
  const view = destination ?? (currentView === 'project' ? currentView : returnToVote ? 'sheet'
    : currentView === 'installment' ? currentView : profile.value === applicant.id ? applicantView : state.sent ? 'inbox' : 'support');
  show(view, moveFocus);
  const name = profile.selectedOptions[0].textContent;
  const title = byId(`${currentView}-title`).textContent;
  announce(`Perfil de prueba: ${name}. ${title}.`);
}

function switchProfile(id, destination) {
  profile.value = id;
  showProfile(true, destination);
}

profile.addEventListener('change', () => showProfile(false));

byId('choose-invited').addEventListener('click', () => profile.focus());
byId('installment-profile').addEventListener('click', () => profile.focus());
byId('project-profile').addEventListener('click', () => profile.focus());
projectForm.addEventListener('input', () => renderProjectValidation(validateProjectProposal(state, ...readProjectDraft())));
projectForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const result = submitProjectProposal(state, profile.value, ...readProjectDraft());
  if (result.status !== 'submitted') {
    renderProjectValidation(result);
    return;
  }
  projectForm.reset();
  saveState();
  show('project');
  announce(byId('project-status').textContent);
});
byId('project-vote-actions').addEventListener('click', (event) => {
  const id = Number(event.currentTarget.dataset.proposalId);
  if (!voteOnProject(state, profile.value, id, event.target.dataset.projectVote)) return;
  saveState();
  show('project');
  announce(byId('project-status').textContent);
});
byId('project-confirm').addEventListener('click', (event) => {
  const result = confirmProjectTransfer(state, profile.value, Number(event.currentTarget.dataset.proposalId));
  if (result.created) saveState();
  show('project');
  announce(byId('project-status').textContent);
});
byId('start-demo').addEventListener('click', () => openJourney(true));
byId('reset-demo').addEventListener('click', () => openJourney(true, true));
byId('exit-demo').addEventListener('click', () => openJourney(false));
byId('guided-vote').addEventListener('click', () => switchProfile(guidedVoter, 'sheet'));
byId('guided-return').addEventListener('click', () => switchProfile(applicant.id));
byId('simulate-installment').addEventListener('click', () => {
  installmentVariant = 'reserve';
  show('installment');
});

for (const button of document.querySelectorAll('[data-variant]')) {
  button.addEventListener('click', () => {
    installmentVariant = button.dataset.variant;
    show('installment', false);
    announce(byId('installment-status').textContent);
  });
}

byId('installment-next').addEventListener('click', (event) => {
  const id = event.currentTarget.dataset.profile;
  if (id) switchProfile(id);
});

byId('reserve-actions').addEventListener('click', (event) => {
  if (!voteOnInstallmentReserve(state, installmentVariant, profile.value, event.target.dataset.reserveVote)) return;
  saveState();
  show('installment');
  announce(byId('installment-status').textContent);
});

byId('contribution-actions').addEventListener('click', (event) => {
  if (!simulateInstallmentContribution(state, installmentVariant, profile.value, event.target.dataset.contribution)) return;
  saveState();
  show('installment');
  announce(byId('installment-next-hint').textContent);
});

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

function renderRevisionForm(version, { amount, reason, weeks }, electorate) {
  editingVersion = version;
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
    input.checked = electorate.includes(id);
    label.append(input, name);
    return label;
  }));
  byId('needs-step').textContent = 'Solicitud de prueba';
  byId('needs-title').textContent = `Prepara la versión ${version + 1}`;
  byId('needs-description').textContent = 'Puedes cambiar las condiciones y quiénes votan. La nueva ficha empieza sin votos.';
  byId('draft-submit').textContent = 'Enviar nueva versión';
  byId('revision-electorate').hidden = false;
  renderCostPreview();
  byId('cancel-revision').hidden = false;
  byId('revision-error').hidden = true;
}

byId('edit-revision').addEventListener('click', () => {
  const current = getApplicationStatus(state, profile.value);
  if (!current || getRecordedDisbursement(state)) return;

  renderRevisionForm(current.version, current.application, current.electorate);
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

if (!guided && !['installment', 'project'].includes(presentation.normalNavigation?.view)) delete presentation.normalNavigation;
openJourney(guided, false, false);
