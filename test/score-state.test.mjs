import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createDemoState, getInbox, loanDetails, reasons, respondToInvitation, submitApplication, updateDraft,
} from '../src/demo-state.mjs';
import { getFinanceDashboard } from '../src/finance-state.mjs';
import { confirmProjectTransfer, projectElectorate, submitProjectProposal, voteOnProject } from '../src/project-state.mjs';
import { getCircleScore, getOwnScore, scoreComparisonExamples } from '../src/score-state.mjs';

test('solo Ana tiene un resultado individual precargado y consultar otros perfiles no devuelve su historial', () => {
  const ana = getOwnScore('ana');
  assert.equal(ana.value, 82);
  assert.equal(ana.history.compliance, '9 de 10 pagos a tiempo');
  for (const profileId of ['diana', 'camilo', 'elena', 'jose', 'luz', 'mateo', 'rosa', 'unknown']) {
    assert.equal(getOwnScore(profileId), null);
  }
  assert.deepEqual(getOwnScore('ana'), ana);
});

test('los ejemplos anónimos comparan las mismas señales y registran el compromiso incumplido', () => {
  const [first, second] = scoreComparisonExamples;
  assert.equal(scoreComparisonExamples.length, 2);
  assert.deepEqual(Object.keys(first), Object.keys(second));
  assert.deepEqual(scoreComparisonExamples.map(({ label, value }) => [label, value]), [['Caso A', 82], ['Caso B', 58]]);
  for (const example of scoreComparisonExamples) {
    assert.match(example.history, /10 semanas/);
    assert.ok(example.requestedCop >= example.committedCop);
  }
  assert.equal(first.paidCop, first.committedCop);
  assert.ok(second.paidCop < second.committedCop);
  assert.match(second.compliance, /sin pagar la cuota de la semana 10/);
  assert.notEqual(first, getOwnScore('ana'));
  assert.equal(getOwnScore('diana'), null);
});

test('la finalidad elegida llega a la ficha y los puntajes conservan sus valores', () => {
  const state = createDemoState();
  const comparisonBefore = scoreComparisonExamples.map(({ value }) => value);
  const circleBefore = getCircleScore(state, 'ana').value;
  const reason = reasons.find((option) => option !== state.draft.reason);

  assert.equal(updateDraft(state, { ...state.draft, reason }), true);
  assert.equal(loanDetails(state.draft).reason, reason);
  assert.equal(respondToInvitation(state, 'luz', 'confirmed'), true);
  assert.equal(submitApplication(state), true);
  assert.equal(getInbox(state, 'ana')[0].application.reason, reason);
  assert.deepEqual(scoreComparisonExamples.map(({ value }) => value), comparisonBefore);
  assert.equal(getCircleScore(state, 'ana').value, circleBefore);
  assert.equal(getOwnScore('ana').value, 82);
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
