import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  applicant, createDemoState, getDisbursementAuthorization, inviteSupporter, recordVote,
  respondToInvitation, submitApplication, submitRevision, updateDraft,
} from '../domain/demo-state.mjs';
import { getDisbursementStatus, getFinanceDashboard, registerDisbursement, restoreFinance } from '../domain/finance-state.mjs';

const voters = ['ana', 'camilo', 'elena', 'jose', 'luz'];

function sentRequest(weeks = 5) {
  const state = createDemoState();
  assert.ok(updateDraft(state, { ...state.draft, weeks }));
  assert.ok(respondToInvitation(state, 'luz', 'confirmed'));
  assert.ok(submitApplication(state));
  return state;
}

function approve(state) {
  for (const voter of Object.keys(state.sent.recipients)) {
    assert.ok(recordVote(state, voter, state.sent.version, 1, 'approve'));
  }
}

const dashboard = (state) => getFinanceDashboard(state, applicant.id);

test('la bolsa y las tres partidas muestran los importes iniciales', () => {
  assert.deepEqual(dashboard(createDemoState()), {
    fund: {
      interestCollectedCop: 150_000, balanceCop: 120_000, reserveCop: 40_000,
      commitmentsCop: 20_000, availableCop: 60_000,
    },
    budget: { creditCop: 1_000_000, platformCop: 300_000, staffCop: 200_000 },
  });
});

test('el tablero solo abre para Diana y respaldantes confirmados del padrón vigente', () => {
  const state = createDemoState();
  assert.ok(getFinanceDashboard(state, 'diana'));
  assert.ok(getFinanceDashboard(state, 'ana'));
  assert.equal(getFinanceDashboard(state, 'luz'), null);
  assert.equal(getFinanceDashboard(state, 'desconocido'), null);

  assert.ok(inviteSupporter(state, 'mateo'));
  assert.ok(respondToInvitation(state, 'mateo', 'confirmed'));
  assert.ok(inviteSupporter(state, 'rosa'));
  assert.ok(respondToInvitation(state, 'rosa', 'declined'));
  assert.ok(respondToInvitation(state, 'luz', 'confirmed'));
  assert.ok(submitApplication(state));
  assert.ok(getFinanceDashboard(state, 'mateo'));
  assert.equal(getFinanceDashboard(state, 'rosa'), null);
  assert.ok(submitRevision(state, 'diana', 1, state.draft, voters));
  assert.ok(getFinanceDashboard(state, 'ana'));
  assert.equal(getFinanceDashboard(state, 'mateo'), null);
});

test('el principal se registra una vez contra créditos y cierra la solicitud', () => {
  const state = sentRequest();
  const initial = dashboard(state);
  approve(state);
  const authorization = getDisbursementAuthorization(state);
  const { status, movement, created } = registerDisbursement(state, authorization);
  assert.equal(status, 'recorded');
  assert.equal(created, true);
  assert.deepEqual(movement, {
    authorizationId: authorization.id, requestId: state.requestId, version: 1, principalCop: 300_000,
  });
  assert.deepEqual(dashboard(state), { ...initial, budget: { ...initial.budget, creditCop: 700_000 } });
  assert.deepEqual(registerDisbursement(state, authorization), { status: 'recorded', movement });
  const reloaded = JSON.parse(JSON.stringify(state));
  assert.equal(restoreFinance(reloaded), false);
  assert.deepEqual(reloaded, state);
  assert.equal(submitRevision(reloaded, 'diana', 1, { ...state.draft, weeks: 8 }, voters), false);
});

test('sin autorización, por costo o con autorización obsoleta no hay mutaciones', () => {
  const state = sentRequest();
  const before = structuredClone(state);
  assert.equal(registerDisbursement(state).status, 'not-authorized');
  assert.deepEqual(state, before);

  const expensive = sentRequest(4);
  approve(expensive);
  const beforeExpensive = structuredClone(expensive);
  assert.equal(registerDisbursement(expensive).status, 'cost-limit');
  assert.deepEqual(expensive, beforeExpensive);

  approve(state);
  const obsolete = getDisbursementAuthorization(state);
  assert.ok(submitRevision(state, 'diana', 1, { ...state.draft, weeks: 8 }, voters));
  approve(state);
  const beforeStale = structuredClone(state);
  assert.equal(registerDisbursement(state, obsolete).status, 'stale-authorization');
  assert.equal(registerDisbursement(state, { ...getDisbursementAuthorization(state), principalCop: 1 }).status, 'stale-authorization');
  assert.deepEqual(state, beforeStale);
});

test('el registro acepta un saldo exacto y rechaza un principal superior al saldo', () => {
  const state = sentRequest();
  approve(state);
  state.disbursements = [
    { authorizationId: 'otra:1', requestId: 'otra', version: 1, principalCop: 400_000 },
    { authorizationId: 'anterior:1', requestId: 'anterior', version: 1, principalCop: 400_000 },
  ];
  const before = structuredClone(state);
  assert.equal(registerDisbursement(state).status, 'insufficient-credit');
  assert.equal(getDisbursementStatus(state).status, 'insufficient-credit');
  assert.deepEqual(state, before);
  assert.equal(dashboard(state).budget.creditCop, 200_000);

  state.disbursements[1].principalCop = 300_000;
  assert.equal(registerDisbursement(state).status, 'recorded');
  assert.equal(dashboard(state).budget.creditCop, 0);
  assert.equal(registerDisbursement(state).status, 'recorded');
  assert.equal(dashboard(state).budget.creditCop, 0);
});

test('restaurar una ficha anterior autorizada conserva la ronda y registra una sola vez', () => {
  const state = sentRequest();
  approve(state);
  delete state.requestId;
  const sheet = structuredClone(state.sent);
  assert.equal(restoreFinance(state), true);
  assert.deepEqual(state.sent, sheet);
  assert.equal(state.disbursements.length, 1);
  assert.equal(state.disbursements[0].authorizationId, getDisbursementAuthorization(state).id);
  assert.equal(dashboard(state).budget.creditCop, 700_000);
  assert.equal(restoreFinance(state), false);
  assert.equal(state.disbursements.length, 1);
});
