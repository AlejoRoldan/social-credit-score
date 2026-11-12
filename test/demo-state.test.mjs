import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  amounts, applicant, contributionLimit, countConfirmed, createDemoState, getInbox,
  getSupportStatus, inviteSupporter, loanDetails, reasons, respondToInvitation,
  submitApplication, terms, updateDraft,
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
