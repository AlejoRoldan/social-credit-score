import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createDemoState, getInbox, getInstallmentReminder, recordInstallmentIntention, recordVote,
  respondToInvitation, submitApplication, submitRevision, supporters,
} from '../src/demo-state.mjs';
import { registerDisbursement } from '../src/finance-state.mjs';
import { getInstallmentCase } from '../src/installment-state.mjs';

const voters = ['ana', 'camilo', 'elena', 'jose', 'luz'];

function sentRequest() {
  const state = createDemoState();
  assert.ok(respondToInvitation(state, 'luz', 'confirmed'));
  assert.ok(submitApplication(state));
  return state;
}

function approve(state) {
  for (const voter of voters) assert.ok(recordVote(state, voter, state.sent.version, 1, 'approve'));
}

test('el recordatorio requiere un desembolso y usa la cuota de la versión registrada', () => {
  const state = sentRequest();
  assert.equal(getInstallmentReminder(state, 'diana'), null);
  assert.equal(recordInstallmentIntention(state, 'diana', 'plan-to-pay'), false);
  assert.ok(submitRevision(state, 'diana', 1, { ...state.draft, weeks: 8 }, voters));
  approve(state);
  assert.equal(getInstallmentReminder(state, 'diana'), null);

  assert.equal(registerDisbursement(state).status, 'recorded');
  const reminder = getInstallmentReminder(state, 'diana');
  assert.deepEqual(reminder, {
    requestId: state.requestId, dueDate: '2026-11-23', amountCop: 41_250, intention: null,
  });
  assert.deepEqual(getInstallmentReminder(JSON.parse(JSON.stringify(state)), 'diana'), reminder);
});

test('solo Diana puede consultar, conservar y cambiar una única elección privada', () => {
  let state = sentRequest();
  approve(state);
  assert.equal(registerDisbursement(state).status, 'recorded');
  const independentCase = getInstallmentCase(state, 'reserve', 'diana');
  const supporterInbox = getInbox(state, 'ana');

  assert.equal(recordInstallmentIntention(state, 'diana', 'unknown'), false);
  assert.ok(recordInstallmentIntention(state, 'diana', 'plan-to-pay'));
  const saved = JSON.stringify(state);
  assert.ok(recordInstallmentIntention(state, 'diana', 'plan-to-pay'));
  assert.equal(JSON.stringify(state), saved);
  state = JSON.parse(saved);
  for (const { id } of supporters) {
    assert.equal(getInstallmentReminder(state, id), null);
    assert.equal(recordInstallmentIntention(state, id, 'need-to-talk'), false);
  }
  assert.equal(getInstallmentReminder(state, 'diana').intention, 'plan-to-pay');
  assert.ok(recordInstallmentIntention(state, 'diana', 'need-to-talk'));
  assert.deepEqual(state.installmentIntention, { requestId: state.requestId, value: 'need-to-talk' });
  assert.equal(getInstallmentReminder(state, 'diana').intention, 'need-to-talk');
  assert.deepEqual(getInbox(state, 'ana'), supporterInbox);
  assert.deepEqual(getInstallmentCase(state, 'reserve', 'diana'), independentCase);

  const otherRequest = sentRequest();
  approve(otherRequest);
  assert.equal(registerDisbursement(otherRequest).status, 'recorded');
  assert.equal(getInstallmentReminder(otherRequest, 'diana').intention, null);
  otherRequest.installmentIntention = state.installmentIntention;
  assert.equal(getInstallmentReminder(otherRequest, 'diana').intention, null);
});
