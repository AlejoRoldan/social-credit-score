import assert from 'node:assert/strict';
import test from 'node:test';
import { createDemoState, respondToInvitation, submitApplication } from '../src/demo-state.mjs';
import { getFinanceDashboard } from '../src/finance-state.mjs';
import { confirmProjectTransfer, projectElectorate, submitProjectProposal, voteOnProject } from '../src/project-state.mjs';
import { getCircleScore, getOwnScore } from '../src/score-state.mjs';

test('solo Ana tiene un resultado individual precargado y consultar otros perfiles no devuelve su historial', () => {
  const ana = getOwnScore('ana');
  assert.equal(ana.value, 82);
  assert.equal(ana.history.compliance, '9 de 10 pagos a tiempo');
  for (const profileId of ['diana', 'camilo', 'elena', 'jose', 'luz', 'mateo', 'rosa', 'unknown']) {
    assert.equal(getOwnScore(profileId), null);
  }
  assert.deepEqual(getOwnScore('ana'), ana);
});

test('el puntaje colectivo comparte solo señales agregadas e importes con los perfiles autorizados', () => {
  const state = createDemoState();
  const { fund } = getFinanceDashboard(state, 'diana');
  const expected = {
    value: 78,
    signals: {
      compliance: '18 de 20 pagos a tiempo',
      commitments: '4 compromisos completados',
      membership: '10 meses de vínculo en promedio',
    },
    interestCollectedCop: fund.interestCollectedCop,
    availableCop: fund.availableCop,
  };
  assert.deepEqual(getCircleScore(state, 'diana'), expected);
  assert.deepEqual(getCircleScore(state, 'ana'), expected);
  assert.equal(getCircleScore(state, 'luz'), null);
  assert.equal(getCircleScore(state, 'rosa'), null);

  assert.equal(respondToInvitation(state, 'luz', 'confirmed'), true);
  assert.equal(submitApplication(state), true);
  state.circle.mateo = 'confirmed';
  assert.equal(getCircleScore(state, 'mateo'), null);
  assert.deepEqual(getCircleScore(state, 'luz'), expected);
});

test('un giro registrado actualiza el disponible colectivo sin cambiar el resultado ficticio', () => {
  const state = createDemoState();
  const before = getCircleScore(state, 'diana');
  assert.equal(before.availableCop, 60_000);
  assert.equal(submitProjectProposal(state, 'ana', 'Materiales para un taller', 50_000).status, 'submitted');
  for (const voter of projectElectorate) assert.equal(voteOnProject(state, voter, 1, 'approve'), true);
  assert.deepEqual(getCircleScore(state, 'diana'), before);

  assert.equal(confirmProjectTransfer(state, 'ana', 1).created, true);
  assert.deepEqual(getCircleScore(state, 'diana'), { ...before, availableCop: 10_000 });
  assert.equal(getCircleScore(state, 'ana').availableCop, getFinanceDashboard(state, 'ana').fund.availableCop);
});
