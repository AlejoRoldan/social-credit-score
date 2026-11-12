import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  amounts, applicant, contributionLimit, countConfirmed, createDemoState, getInbox,
  getApplicationStatus, getSupportStatus, inviteSupporter, loanDetails, pauseForMeeting,
  reasons, recordVote, respondToInvitation, resumeAfterMeeting, submitApplication,
  submitRevision, terms, updateDraft,
} from '../src/demo-state.mjs';

test('cuatro confirmados y una invitación pendiente no bastan para enviar', () => {
  const state = createDemoState();
  assert.equal(getSupportStatus(state, 'luz'), 'pending');
  assert.equal(countConfirmed(state), 4);
  assert.equal(submitApplication(state), false);
  assert.equal(state.sent, null);
  assert.deepEqual(getInbox(state, 'ana'), []);
});

test('cada perfil de respaldo cuenta una vez y la persona solicitante queda fuera', () => {
  const state = createDemoState();
  assert.equal(inviteSupporter(state, applicant.id), false);
  assert.equal(inviteSupporter(state, 'perfil-inexistente'), false);
  assert.equal(inviteSupporter(state, 'ana'), false);
  assert.equal(inviteSupporter(state, 'luz'), false);
  assert.equal(respondToInvitation(state, 'mateo', 'confirmed'), false);
  assert.equal(respondToInvitation(state, 'luz', 'confirmed'), true);
  assert.equal(respondToInvitation(state, 'luz', 'confirmed'), false);
  assert.equal(countConfirmed(state), 5);
});

test('un respaldo rechazado no cuenta y otra persona puede completar el grupo', () => {
  const state = createDemoState();
  assert.equal(respondToInvitation(state, 'luz', 'declined'), true);
  assert.equal(getSupportStatus(state, 'luz'), 'declined');
  assert.equal(countConfirmed(state), 4);
  assert.equal(submitApplication(state), false);

  assert.equal(inviteSupporter(state, 'mateo'), true);
  assert.equal(countConfirmed(state), 4);
  assert.equal(respondToInvitation(state, 'mateo', 'confirmed'), true);
  assert.equal(submitApplication(state), true);
  assert.deepEqual(getInbox(state, 'luz'), []);
});

test('todos los confirmados al enviar reciben la misma ficha y su propio tope', () => {
  const state = createDemoState();
  assert.equal(respondToInvitation(state, 'luz', 'confirmed'), true);
  assert.equal(inviteSupporter(state, 'mateo'), true);
  assert.equal(respondToInvitation(state, 'mateo', 'confirmed'), true);
  assert.equal(inviteSupporter(state, 'rosa'), true);
  assert.equal(submitApplication(state), true);

  for (const id of ['ana', 'camilo', 'elena', 'jose', 'luz', 'mateo']) {
    const inbox = getInbox(state, id);
    assert.equal(inbox.length, 1);
    assert.deepEqual(inbox[0].application, { applicant, ...loanDetails(state.draft) });
    assert.equal(inbox[0].limit, contributionLimit);
  }
  for (const id of ['diana', 'rosa', 'perfil-inexistente', 'toString']) {
    assert.deepEqual(getInbox(state, id), []);
  }
  assert.equal(getSupportStatus(state, 'rosa'), 'pending');
});

test('el reintento conserva la ficha y un aviso por perfil, incluso tras restaurar la sesión', () => {
  const state = createDemoState();
  assert.equal(respondToInvitation(state, 'luz', 'confirmed'), true);
  assert.equal(inviteSupporter(state, 'mateo'), true);
  assert.equal(submitApplication(state), true);

  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(submitApplication(restored), true);
  assert.deepEqual(restored.sent, state.sent);
  assert.equal(getInbox(restored, 'ana').length, 1);
  assert.equal(respondToInvitation(restored, 'mateo', 'confirmed'), false);
  assert.deepEqual(getInbox(restored, 'mateo'), []);
  assert.deepEqual(getInbox(restored, 'rosa'), []);
});

test('las cuotas de todos los montos y plazos ofrecidos son enteras y suman el total', () => {
  for (const amount of amounts) {
    for (const weeks of terms) {
      const { installment, total } = loanDetails({ amount, weeks, reason: reasons[0] });
      const option = `${amount} COP en ${weeks} semanas`;
      assert.ok(Number.isInteger(installment), option);
      assert.equal(installment * weeks, total, option);
    }
  }
});

test('la revisión y la ficha usan las condiciones corregidas de la solicitud ficticia', () => {
  const state = createDemoState();
  const correction = { amount: 400_000, reason: reasons[1], weeks: 8 };
  assert.equal(updateDraft(state, correction), true);
  assert.equal(updateDraft(state, { ...correction, amount: 1 }), false);
  assert.deepEqual(loanDetails(state.draft), {
    ...correction,
    frequency: 'Cada semana',
    installment: 55_000,
    interest: 40_000,
    total: 440_000,
  });

  assert.equal(respondToInvitation(state, 'luz', 'confirmed'), true);
  assert.equal(submitApplication(state), true);
  assert.equal(updateDraft(state, { ...correction, amount: 200_000 }), false);
  assert.deepEqual(getInbox(state, 'ana')[0].application, { applicant, ...loanDetails(correction) });
});

const electorate = ['ana', 'camilo', 'elena', 'jose', 'luz', 'mateo'];

function sentToSix() {
  const state = createDemoState();
  assert.ok(respondToInvitation(state, 'luz', 'confirmed'));
  assert.ok(inviteSupporter(state, 'mateo'));
  assert.ok(respondToInvitation(state, 'mateo', 'confirmed'));
  assert.ok(inviteSupporter(state, 'rosa'));
  assert.ok(submitApplication(state));
  return state;
}

test('cinco de seis mantienen la versión en revisión y el último voto favorable completa la unanimidad', () => {
  const state = sentToSix();
  for (const voter of electorate.slice(0, -1)) assert.ok(recordVote(state, voter, 1, 1, 'approve'));
  assert.deepEqual(getApplicationStatus(state, applicant.id).round, {
    number: 1, status: 'review', electorateSize: 6, approvals: 5, rejections: 0,
  });

  assert.equal(recordVote(state, 'ana', 1, 1, 'reject'), false);
  assert.ok(recordVote(state, 'mateo', 1, 1, 'approve'));
  assert.equal(getApplicationStatus(state, applicant.id).round.status, 'approved');
  assert.equal(pauseForMeeting(state, 'ana', 1, 1), false);
  assert.equal(recordVote(state, 'mateo', 1, 1, 'reject'), false);
});

test('un voto en contra mantiene la revisión hasta que responda todo el grupo', () => {
  const state = sentToSix();
  assert.ok(recordVote(state, 'ana', 1, 1, 'reject'));
  assert.equal(getApplicationStatus(state, applicant.id).round.status, 'review');

  for (const voter of electorate.slice(1)) assert.ok(recordVote(state, voter, 1, 1, 'approve'));
  assert.deepEqual(getApplicationStatus(state, applicant.id).round, {
    number: 1, status: 'rejected', electorateSize: 6, approvals: 5, rejections: 1,
  });
  assert.equal(pauseForMeeting(state, 'ana', 1, 1), false);
});

test('la pausa se conserva al recargar y retomar abre una ronda vacía en la misma ficha', () => {
  const state = sentToSix();
  assert.ok(recordVote(state, 'ana', 1, 1, 'approve'));
  assert.ok(pauseForMeeting(state, 'camilo', 1, 1));
  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(getApplicationStatus(restored, applicant.id).round.status, 'meeting');
  assert.equal(recordVote(restored, 'elena', 1, 1, 'approve'), false);
  assert.equal(pauseForMeeting(restored, 'ana', 1, 1), false);

  assert.ok(resumeAfterMeeting(restored, 'elena', 1, 1));
  const [notice] = getInbox(restored, 'ana');
  assert.equal(notice.version, 1);
  assert.deepEqual(notice.application, state.sent.application);
  assert.deepEqual(notice.rounds, [
    { number: 1, status: 'meeting', electorateSize: 6, approvals: 1, rejections: 0, decision: 'approve' },
    { number: 2, status: 'review', electorateSize: 6, approvals: 0, rejections: 0, decision: null },
  ]);
  assert.equal(resumeAfterMeeting(restored, 'elena', 1, 1), false);
  assert.equal(recordVote(restored, 'ana', 1, 1, 'reject'), false);
  assert.ok(recordVote(restored, 'ana', 1, 2, 'reject'));
  assert.equal(getApplicationStatus(restored, applicant.id).round.rejections, 1);
});

test('el padrón de cada versión controla el acceso, los votos y las acciones de reunión', () => {
  const state = sentToSix();
  const original = JSON.stringify(state);
  for (const outsider of [applicant.id, 'rosa', 'perfil-ajeno', 'toString']) {
    assert.deepEqual(getInbox(state, outsider), []);
    assert.equal(recordVote(state, outsider, 1, 1, 'approve'), false);
    assert.equal(pauseForMeeting(state, outsider, 1, 1), false);
  }
  assert.equal(getApplicationStatus(state, 'ana'), null);
  assert.equal(recordVote(state, 'ana', 1, 1, 'invalid'), false);
  assert.equal(resumeAfterMeeting(state, 'ana', 1, 1), false);
  assert.equal(JSON.stringify(state), original);
  assert.ok(pauseForMeeting(state, 'ana', 1, 1));
  for (const outsider of [applicant.id, 'rosa', 'perfil-ajeno']) {
    assert.equal(resumeAfterMeeting(state, outsider, 1, 1), false);
  }
});

test('una nueva versión congela los cambios y conserva el historial solo para su padrón', () => {
  const state = sentToSix();
  const details = { amount: 400_000, reason: reasons[1], weeks: 8 };
  const reducedElectorate = electorate.slice(0, -1);
  assert.ok(recordVote(state, 'mateo', 1, 1, 'reject'));
  assert.equal(submitRevision(state, 'ana', 1, details, electorate), false);
  assert.equal(submitRevision(state, applicant.id, 1, state.draft, [...electorate].reverse()), false);
  assert.equal(submitRevision(state, applicant.id, 1, details, [...reducedElectorate, 'rosa']), false);
  assert.equal(submitRevision(state, applicant.id, 1, details, [...reducedElectorate, 'ana']), false);
  assert.equal(submitRevision(state, applicant.id, 1, details, reducedElectorate.slice(1)), false);
  assert.ok(submitRevision(state, applicant.id, 1, details, reducedElectorate));

  const [current, previous] = getInbox(state, 'ana');
  assert.deepEqual(current.application, { applicant, ...loanDetails(details) });
  assert.equal(current.version, 2);
  assert.equal(current.isCurrent, true);
  assert.deepEqual(current.rounds, [
    { number: 1, status: 'review', electorateSize: 5, approvals: 0, rejections: 0, decision: null },
  ]);
  assert.deepEqual(previous.application, { applicant, ...loanDetails(state.draft) });
  assert.equal(previous.isCurrent, false);
  const [archived] = getInbox(state, 'mateo');
  assert.equal(getInbox(state, 'mateo').length, 1);
  assert.equal(archived.version, 1);
  assert.equal(archived.rounds[0].decision, 'reject');
  assert.deepEqual(getInbox(state, 'rosa'), []);

  const revised = JSON.stringify(state);
  assert.equal(recordVote(state, 'ana', 1, 1, 'approve'), false);
  assert.equal(recordVote(state, 'mateo', 2, 1, 'approve'), false);
  assert.equal(pauseForMeeting(state, 'ana', 1, 1), false);
  assert.equal(resumeAfterMeeting(state, 'ana', 1, 1), false);
  assert.equal(submitRevision(state, applicant.id, 1, details, electorate), false);
  assert.equal(JSON.stringify(state), revised);
  assert.ok(recordVote(state, 'ana', 2, 1, 'approve'));
  const restored = JSON.parse(JSON.stringify(state));
  assert.deepEqual(getInbox(restored, 'ana'), getInbox(state, 'ana'));
  assert.ok(submitRevision(restored, applicant.id, 2, { ...details, weeks: 4 }, reducedElectorate));
  assert.deepEqual(getInbox(restored, 'ana').map(({ version }) => version), [3, 2, 1]);
  assert.deepEqual(restored.previousVersions.map(({ version }) => version), [1, 2]);
});

test('cada cambio individual de condiciones o electores crea otra versión', () => {
  for (const [details, recipients] of [
    [{ amount: 400_000 }, electorate],
    [{ reason: reasons[1] }, electorate],
    [{ weeks: 8 }, electorate],
    [{}, electorate.slice(1)],
  ]) {
    const state = sentToSix();
    assert.ok(submitRevision(state, applicant.id, 1, { ...state.draft, ...details }, recipients));
    assert.equal(getApplicationStatus(state, applicant.id).version, 2);
  }
});

test('una sesión HU 1.1 conserva su ficha y destinatarios como versión 1 sin votos', () => {
  const state = sentToSix();
  const { application, recipients } = state.sent;
  const restored = JSON.parse(JSON.stringify({ ...state, sent: { application, recipients } }));
  assert.deepEqual(getApplicationStatus(restored, applicant.id).round, {
    number: 1, status: 'review', electorateSize: 6, approvals: 0, rejections: 0,
  });
  for (const voter of electorate) {
    const [notice] = getInbox(restored, voter);
    assert.equal(notice.version, 1);
    assert.deepEqual(notice.application, application);
    assert.equal(notice.limit, recipients[voter]);
  }
  assert.deepEqual(getInbox(restored, 'rosa'), []);
  assert.ok(recordVote(restored, 'ana', 1, 1, 'approve'));
  assert.equal(getApplicationStatus(restored, applicant.id).round.approvals, 1);
});
