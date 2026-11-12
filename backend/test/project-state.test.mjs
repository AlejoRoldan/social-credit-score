import assert from 'node:assert/strict';
import test from 'node:test';
import { applicant, createDemoState } from '../domain/demo-state.mjs';
import { getFinanceDashboard } from '../domain/finance-state.mjs';
import { getInstallmentCase, installmentSupporters, voteOnInstallmentReserve } from '../domain/installment-state.mjs';
import {
  confirmProjectTransfer, getProjectCase, projectElectorate, submitProjectProposal, validateProjectProposal, voteOnProject,
} from '../domain/project-state.mjs';

const purpose = 'Materiales para un taller';
const read = (state) => getProjectCase(state, applicant.id);
const approve = (state, id, voters = projectElectorate) => {
  for (const voter of voters) assert.equal(voteOnProject(state, voter, id, 'approve'), true);
};

test('la bolsa inicia con $60.000 libres y un importe de $65.000 excede en $5.000 sin registrar una ficha', () => {
  const state = createDemoState();
  assert.deepEqual(read(state).fund, {
    interestCollectedCop: 150_000, balanceCop: 120_000, reserveCop: 40_000, commitmentsCop: 20_000,
    availableCop: 60_000,
  });
  const opening = structuredClone(state);
  const excess = { status: 'exceeds-available', excessCop: 5_000 };
  assert.deepEqual(validateProjectProposal(state, purpose, 65_000), excess);
  assert.deepEqual(validateProjectProposal(state, '', 65_000), excess);
  assert.deepEqual(submitProjectProposal(state, 'ana', purpose, 65_000), excess);
  assert.deepEqual(submitProjectProposal(state, 'ana', '', 65_000), excess);
  for (const amount of [0, -1, 1.5, NaN, Infinity, '50000', Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(submitProjectProposal(state, 'ana', purpose, amount).status, 'invalid-amount');
  }
  assert.equal(submitProjectProposal(state, 'ana', '   ', 50_000).status, 'missing-purpose');
  assert.deepEqual(state, opening);
});

test('la ficha congela las condiciones y exige un voto separado de quien propone', () => {
  const state = createDemoState();
  assert.equal(submitProjectProposal(state, 'luz', purpose, 50_000).status, 'submitted');
  assert.deepEqual(read(state).current.electorate, ['ana', 'camilo', 'elena', 'jose', 'luz']);
  assert.deepEqual(read(state).current.votes, {});
  assert.equal(submitProjectProposal(state, 'ana', 'Otra finalidad', 5_000).status, 'blocked');
  approve(state, 1, projectElectorate.slice(0, 4));
  assert.equal(voteOnProject(state, 'ana', 1, 'approve'), false);
  assert.equal(read(state).current.approvals, 4);
  assert.equal(read(state).current.purpose, purpose);
  assert.equal(read(state).current.amountCop, 50_000);
  assert.equal(confirmProjectTransfer(state, 'luz', 1).status, 'blocked');
  assert.equal(read(state).fund.balanceCop, 120_000);
});

test('un rechazo bloquea el giro y otra propuesta empieza con votos nuevos', () => {
  const state = createDemoState();
  submitProjectProposal(state, 'ana', purpose, 50_000);
  assert.equal(voteOnProject(state, 'camilo', 1, 'reject'), true);
  assert.equal(read(state).current.status, 'rejected');
  assert.equal(confirmProjectTransfer(state, 'ana', 1).status, 'blocked');
  assert.equal(read(state).fund.availableCop, 60_000);
  assert.equal(submitProjectProposal(state, 'elena', 'Otros materiales', 60_000).status, 'submitted');
  assert.equal(voteOnProject(state, 'luz', 1, 'approve'), false);
  assert.deepEqual(read(state).current.votes, {});
  assert.equal(read(state).history[0].purpose, purpose);
  assert.deepEqual(read(state).history[0].votes, { camilo: 'reject' });
  approve(state, 2);
  assert.equal(confirmProjectTransfer(state, 'elena', 2).created, true);
  assert.equal(read(state).fund.availableCop, 0);
});

test('la unanimidad requiere confirmación explícita y el giro se conserva una sola vez al restaurar', () => {
  const state = createDemoState();
  const opening = getFinanceDashboard(state, applicant.id);
  submitProjectProposal(state, 'ana', purpose, 50_000);
  approve(state, 1);
  assert.equal(read(state).current.status, 'approved');
  assert.equal(read(state).current.movement, null);
  assert.deepEqual(getFinanceDashboard(state, applicant.id), opening);

  const result = confirmProjectTransfer(state, 'luz', 1);
  assert.deepEqual(result, { status: 'recorded', movement: { proposalId: 1, amountCop: 50_000 }, created: true });
  const { current } = read(state);
  current.electorate.pop();
  current.votes.luz = 'reject';
  current.movement.amountCop = 1;
  const stored = read(state).current;
  assert.deepEqual(stored.electorate, projectElectorate);
  assert.equal(stored.votes.luz, 'approve');
  assert.equal(stored.movement.amountCop, 50_000);
  const restored = JSON.parse(JSON.stringify(state));
  assert.deepEqual(confirmProjectTransfer(restored, 'ana', 1), { status: 'recorded', movement: result.movement });
  assert.equal(confirmProjectTransfer(restored, 'mateo', 1).status, 'blocked');
  assert.deepEqual(restored.projectCase.movements, [result.movement]);
  assert.deepEqual(getFinanceDashboard(restored, applicant.id), {
    ...opening, fund: { ...opening.fund, balanceCop: 70_000, availableCop: 10_000 },
  });
});

test('Diana consulta y los perfiles ajenos carecen de acceso a la ficha y las acciones', () => {
  const state = createDemoState();
  assert.equal(confirmProjectTransfer(state, 'ana').status, 'blocked');
  for (const id of [applicant.id, 'mateo', 'rosa']) {
    assert.equal(submitProjectProposal(state, id, purpose, 50_000).status, 'blocked');
  }
  submitProjectProposal(state, 'ana', purpose, 50_000);
  assert.equal(read(state).current.purpose, purpose);
  assert.equal(read(state).canPropose, false);
  assert.equal(read(state).canVote, false);
  for (const id of [applicant.id, 'mateo', 'rosa']) assert.equal(voteOnProject(state, id, 1, 'approve'), false);
  assert.equal(getProjectCase(state, 'mateo'), null);
  assert.equal(getProjectCase(state, 'rosa'), null);
  approve(state, 1);
  assert.equal(read(state).canConfirm, false);
  for (const id of [applicant.id, 'mateo', 'rosa']) assert.equal(confirmProjectTransfer(state, id, 1).status, 'blocked');
});

test('la confirmación revalida el disponible y el proyecto es independiente del impago', () => {
  const state = createDemoState();
  for (const id of installmentSupporters) voteOnInstallmentReserve(state, 'reserve', id, 'approve');
  const installment = getInstallmentCase(state, 'reserve', applicant.id);
  assert.equal(read(state).fund.reserveCop, 40_000);
  submitProjectProposal(state, 'ana', purpose, 50_000);
  approve(state, 1);

  const restored = JSON.parse(JSON.stringify(state));
  restored.projectCase.movements.push({ proposalId: 0, amountCop: 11_000 });
  assert.equal(confirmProjectTransfer(restored, 'ana', 1).status, 'insufficient-funds');
  assert.equal(restored.projectCase.movements.length, 1);

  assert.equal(confirmProjectTransfer(state, 'ana', 1).created, true);
  assert.deepEqual(getInstallmentCase(state, 'reserve', applicant.id), installment);
});
