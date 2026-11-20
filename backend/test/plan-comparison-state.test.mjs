import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDemoState } from '../domain/demo-state.mjs';
import { getPaymentPlan, updatePaymentPlan } from '../domain/payment-plan-state.mjs';
import { getPlanComparison, selectPlanComparisonScenario } from '../domain/plan-comparison-state.mjs';
import { getPlanHelp, helpReasons, requestPlanHelp } from '../domain/loan-account-state.mjs';
import { getCircleScore } from '../domain/score-state.mjs';

test('la comparación distingue el vencimiento vigente, el costo y el faltante acumulado', () => {
  const state = createDemoState();
  const { original, alternative, active } = getPlanComparison(state, 'diana');
  assert.equal(active, 'original');
  assert.equal(original.interestCop, 5_000);
  assert.equal(original.shortfallCop, 35_000);
  assert.deepEqual(alternative.payments, [{ amountCop: 30_000, date: '2026-11-20' }, { amountCop: 30_000, date: '2026-11-27' }]);
  assert.equal(alternative.interestCop, 15_000);
  assert.equal(alternative.shortfallCop, 45_000);
  assert.equal(alternative.payments.reduce((total, payment) => total + payment.amountCop, 0), alternative.totalCop);

  const { values } = getPaymentPlan(state, 'diana');
  assert.equal(updatePaymentPlan(state, 'diana', { ...values, incomeConfirmed: true }), true);
  const confirmed = getPlanComparison(state, 'diana');
  assert.equal(confirmed.original.shortfallCop, 35_000);
  assert.equal(confirmed.alternative.shortfallCop, 0);
});

test('solo el caso de prórroga acordada activa el calendario nuevo', () => {
  const state = createDemoState();
  const initial = structuredClone(state);
  for (const [scenario, active] of [['offer', null], ['agreed', 'alternative'], ['unavailable', 'original'], ['same-total', 'original']]) {
    assert.equal(selectPlanComparisonScenario(state, 'diana', scenario), true);
    const comparison = getPlanComparison(JSON.parse(JSON.stringify(state)), 'diana');
    assert.equal(comparison.active, active);
    if (scenario === 'unavailable') assert.equal(comparison.alternative, null);
    if (scenario === 'same-total') assert.equal(comparison.alternative.totalCop, comparison.original.totalCop);
    assert.deepEqual(state.draft, initial.draft);
    assert.equal(state.sent, initial.sent);
  }
  assert.equal(getPlanComparison(state, 'luz'), null);
  assert.equal(selectPlanComparisonScenario(state, 'luz', 'agreed'), false);
});

test('la confirmación de ayuda del plan es privada y conserva el puntaje colectivo', () => {
  const state = createDemoState();
  const before = getCircleScore(state, 'diana');
  const plan = getPaymentPlan(state, 'diana');
  assert.equal(getPlanHelp(state, 'diana'), null);
  assert.equal(requestPlanHelp(state, 'luz', helpReasons[0]), false);
  assert.equal(requestPlanHelp(state, 'diana', 'texto libre'), false);
  assert.equal(requestPlanHelp(state, 'diana', helpReasons[0]), true);
  assert.equal(requestPlanHelp(state, 'diana', helpReasons[1]), false);
  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(getPlanHelp(restored, 'diana'), helpReasons[0]);
  assert.equal(getPlanHelp(restored, 'luz'), null);
  assert.deepEqual(getPaymentPlan(restored, 'diana'), plan);
  assert.deepEqual(getCircleScore(restored, 'diana'), before);
});
