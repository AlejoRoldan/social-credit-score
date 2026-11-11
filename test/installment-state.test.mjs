import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDemoState } from '../src/demo-state.mjs';
import { getFinanceDashboard } from '../src/finance-state.mjs';
import {
  getInstallmentCase, installmentSupporters, simulateInstallmentContribution, voteOnInstallmentReserve,
} from '../src/installment-state.mjs';

const restored = (state) => JSON.parse(JSON.stringify(state));
const diana = (state, variant = 'reserve') => getInstallmentCase(state, variant, 'diana');
const approve = (state, id) => voteOnInstallmentReserve(state, 'reserve', id, 'approve');

test('la reserva y los aportes se bloquean hasta el quinto voto favorable', () => {
  let state = createDemoState();
  const originalFinance = getFinanceDashboard(state, 'diana');
  for (const id of installmentSupporters.slice(0, -1)) assert.equal(approve(state, id), true);
  state = restored(state);
  const waiting = diana(state);
  assert.equal(waiting.approvals, 4);
  assert.equal(waiting.pendingCop, 60_000);
  assert.equal(waiting.fundAfter.balanceCop, 120_000);
  assert.equal(waiting.fundAfter.reserveCop, 40_000);
  assert.deepEqual(waiting.contributions, []);
  assert.equal(simulateInstallmentContribution(state, 'reserve', 'ana', 'paid'), false);

  const last = installmentSupporters.at(-1);
  assert.equal(approve(state, last), true);
  state = restored(state);
  const active = diana(state);
  assert.equal(active.voteStatus, 'approved');
  assert.equal(active.reservePaidCop, 25_000);
  assert.equal(active.pendingCop, 35_000);
  assert.equal(active.fundAfter.balanceCop, 95_000);
  assert.equal(active.fundAfter.reserveCop, 15_000);
  assert.equal(active.fundAfter.availableCop, 60_000);
  assert.equal(active.fundBefore.balanceCop, 120_000);
  assert.equal(active.fundBefore.reserveCop, 40_000);
  assert.deepEqual(active.contributions.map(({ assignedCop }) => assignedCop), Array(5).fill(7_000));
  assert.equal(approve(state, last), false);
  assert.deepEqual(diana(state), active);
  assert.deepEqual(getFinanceDashboard(state, 'diana'), originalFinance);
});

test('un rechazo deja el caso pendiente de resolución y conserva la bolsa', () => {
  let state = createDemoState();
  assert.equal(approve(state, 'ana'), true);
  assert.equal(voteOnInstallmentReserve(state, 'reserve', 'ana', 'reject'), false);
  assert.equal(voteOnInstallmentReserve(state, 'reserve', 'camilo', 'reject'), true);
  state = restored(state);
  assert.equal(diana(state).voteStatus, 'rejected');
  assert.equal(diana(state).pendingCop, 60_000);
  assert.deepEqual(diana(state).fundAfter, diana(state).fundBefore);
  assert.equal(approve(state, 'camilo'), false);
  assert.equal(approve(state, 'elena'), false);
  assert.equal(simulateInstallmentContribution(state, 'reserve', 'ana', 'paid'), false);
});

test('cuatro aportes realizados y uno fallido dejan siete mil pendientes sin reasignar', () => {
  let state = createDemoState();
  for (const id of installmentSupporters) assert.equal(approve(state, id), true);
  for (const id of installmentSupporters.slice(0, -1)) {
    assert.equal(simulateInstallmentContribution(state, 'reserve', id, 'paid'), true);
  }
  const last = installmentSupporters.at(-1);
  assert.equal(simulateInstallmentContribution(state, 'reserve', last, 'failed'), true);
  state = restored(state);
  assert.equal(simulateInstallmentContribution(state, 'reserve', last, 'paid'), false);
  assert.equal(simulateInstallmentContribution(state, 'reserve', 'ana', 'paid'), false);
  const example = diana(state);
  assert.equal(example.paidBySupportersCop, 28_000);
  assert.equal(example.pendingCop, 7_000);
  assert.deepEqual(example.contributions.map(({ assignedCop }) => assignedCop), Array(5).fill(7_000));
  assert.deepEqual(example.contributions.at(-1), { id: last, assignedCop: 7_000, paidCop: 0, status: 'failed' });
  const supporterView = getInstallmentCase(state, 'reserve', last);
  assert.deepEqual(supporterView.contribution, example.contributions.at(-1));
  assert.equal(Object.hasOwn(supporterView, 'contributions'), false);
  assert.equal(Object.hasOwn(supporterView, 'pendingCop'), false);
});

test('la bolsa vacía asigna los topes directamente y conserva diez mil pendientes', () => {
  let state = createDemoState();
  const before = diana(state);
  assert.equal(diana(state, 'empty').voteStatus, 'unneeded');
  assert.equal(diana(state, 'empty').fundAfter.balanceCop, 0);
  assert.equal(voteOnInstallmentReserve(state, 'empty', 'ana', 'approve'), false);
  assert.deepEqual(diana(state, 'empty').contributions.map(({ assignedCop }) => assignedCop), Array(5).fill(10_000));
  for (const id of installmentSupporters) assert.equal(simulateInstallmentContribution(state, 'empty', id, 'paid'), true);
  state = restored(state);
  assert.equal(diana(state, 'empty').pendingCop, 10_000);
  assert.equal(diana(state, 'empty').paidBySupportersCop, 50_000);
  assert.equal(diana(state, 'empty').reservePaidCop, 0);
  assert.deepEqual(diana(state), before);
});

test('solo el padrón del ejemplo puede votar o simular su propio aporte', () => {
  const state = createDemoState();
  for (const variant of ['empty', 'reserve']) {
    for (const outsider of ['rosa', 'mateo', 'toString']) {
      assert.equal(getInstallmentCase(state, variant, outsider), null);
      assert.equal(voteOnInstallmentReserve(state, variant, outsider, 'approve'), false);
      assert.equal(simulateInstallmentContribution(state, variant, outsider, 'paid'), false);
    }
    assert.equal(voteOnInstallmentReserve(state, variant, 'diana', 'approve'), false);
    assert.equal(simulateInstallmentContribution(state, variant, 'diana', 'paid'), false);
  }
  assert.equal(getInstallmentCase(state, 'toString', 'diana'), null);
  assert.equal(voteOnInstallmentReserve(state, 'reserve', 'ana', 'unknown'), false);
  assert.equal(simulateInstallmentContribution(state, 'empty', 'ana', 'unknown'), false);
  assert.equal(Object.hasOwn(state, 'installmentCases'), false);
});
