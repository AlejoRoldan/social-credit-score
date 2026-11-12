import {
  amounts, applicant, contributionLimit, countConfirmed, createDemoState, getInbox,
  getSupportStatus, inviteSupporter, loanDetails, minimumSupporters, reasons,
  respondToInvitation, submitApplication, supporters, terms, updateDraft,
} from './demo-state.mjs';

const storageKey = 'credito-comunitario-hu-1-1';
const currency = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const money = (amount) => `$${currency.format(amount)} COP`;
const statusText = {
  confirmed: 'Confirmado',
  pending: 'Invitación pendiente',
  declined: 'Respaldo rechazado',
  uninvited: 'Sin invitación',
};

const byId = (id) => document.getElementById(id);
const profile = byId('profile');
const draftForm = byId('draft-form');
const inviteForm = byId('invite-form');
const invitee = byId('invitee');
const responseForm = byId('response-form');
const navigation = byId('support-navigation');
const sections = document.querySelectorAll('main section');
const applicantViews = ['needs', 'circle', 'review', 'success'];
const state = loadState();
let applicantView = 'needs';

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

function show(requestedView, moveFocus = true) {
  const isApplicant = profile.value === applicant.id;
  let view = requestedView;

  if (isApplicant) {
    if (state.sent) view = 'success';
    else if (!applicantViews.includes(view) || view === 'success') view = 'needs';
    else if (view === 'review' && countConfirmed(state) < minimumSupporters) view = 'circle';

    applicantView = view;
    if (view === 'circle') renderCircle();
    if (view === 'review') {
      fillDetails('review', loanDetails(state.draft));
      byId('review-recipients').textContent = `Recibirán la ficha las ${countConfirmed(state)} personas que confirmaron.`;
    }
  } else {
    const [notice] = getInbox(state, profile.value);
    if (applicantViews.includes(view) || (view === 'sheet' && !notice)) view = 'inbox';
    renderSupport(getSupportStatus(state, profile.value));
    byId('inbox-empty').hidden = Boolean(notice);
    byId('notice').hidden = !notice;
    byId('notice-title').textContent = notice?.title ?? '';

    if (view === 'sheet') {
      const { application, limit } = notice;
      byId('applicant-name').textContent = application.applicant.name;
      byId('applicant-summary').textContent = application.applicant.summary;
      byId('applicant-history').textContent = application.applicant.history ?? 'Diana aún no tiene historial de pagos en la app.';
      byId('sheet').querySelector('[data-limit]').textContent = money(limit);
      fillDetails('sheet', application);
    }
  }

  navigation.hidden = isApplicant;
  for (const button of navigation.querySelectorAll('[data-go]')) {
    const current = button.dataset.go === (view === 'sheet' ? 'inbox' : view);
    if (current) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  for (const section of sections) section.hidden = section.id !== view;
  if (moveFocus) byId(`${view}-title`).focus();
}

function saveDraft() {
  const form = new FormData(draftForm);
  const updated = updateDraft(state, {
    amount: Number(form.get('amount')),
    reason: form.get('reason'),
    weeks: Number(form.get('weeks')),
  });
  if (updated) saveState();
  return updated;
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

draftForm.addEventListener('change', saveDraft);
draftForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (saveDraft()) show('circle');
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
