import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applicant, createDemoState, recordVote, respondToInvitation, submitApplication, supporters } from '../domain/demo-state.mjs';
import { registerDisbursement } from '../domain/finance-state.mjs';
import { getLoanAccount, helpReasons, payNextInstallment, requestLoanHelp } from '../domain/loan-account-state.mjs';

test('la cuenta registra cada cuota una vez y conserva el total de la solicitud aprobada', () => {
  const state = createDemoState();
  assert.equal(getLoanAccount(state, applicant.id), null);
  respondToInvitation(state, 'luz', 'confirmed');
  submitApplication(state);
  for (const { id } of supporters.slice(0, 5)) recordVote(state, id, 1, 1, 'approve');
  assert.equal(registerDisbursement(state).status, 'recorded');
  const initial = getLoanAccount(state, applicant.id);
  assert.equal(initial.outstandingCop, 330_000);
  const first = { requestId: initial.requestId, version: initial.version, number: 1 };
  assert.equal(payNextInstallment(state, 'ana', first), false);
  assert.equal(payNextInstallment(state, applicant.id, first), true);
  assert.equal(payNextInstallment(state, applicant.id, first), false);
  assert.equal(requestLoanHelp(state, 'ana', helpReasons[0]), false);
  assert.equal(requestLoanHelp(state, applicant.id, helpReasons[0]), true);
  for (let number = 2; number <= 5; number++) {
    assert.equal(payNextInstallment(state, applicant.id, { ...first, number }), true);
  }
  const restored = getLoanAccount(JSON.parse(JSON.stringify(state)), applicant.id);
  assert.equal(restored.outstandingCop, 0);
  assert.equal(restored.paidCop, 330_000);
  assert.equal(restored.next, null);
  assert.equal(restored.helpReason, helpReasons[0]);
  assert.equal(getLoanAccount(state, 'ana'), null);
});
