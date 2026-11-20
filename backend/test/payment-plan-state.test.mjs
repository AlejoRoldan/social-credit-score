import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDemoState } from '../domain/demo-state.mjs';
import { getPaymentPlan, updatePaymentPlan } from '../domain/payment-plan-state.mjs';

test('reserva lo esencial y separa su faltante del faltante de la cuota', () => {
  const state = createDemoState();
  const plan = getPaymentPlan(state, 'diana');
  assert.equal(plan.essentialsCop, 45_000);
  assert.equal(plan.availableCop, 15_000);
  assert.equal(plan.installmentShortfallCop, 35_000);

  assert.equal(updatePaymentPlan(state, 'diana', { ...plan.values, cashCop: 25_000 }), true);
  const reduced = getPaymentPlan(state, 'diana');
  assert.equal(reduced.availableCop, 0);
  assert.equal(reduced.essentialShortfallCop, 20_000);
  assert.equal(reduced.installmentShortfallCop, 50_000);
});

test('usa el ingreso confirmado solo cuando llega a más tardar en la fecha de la cuota', () => {
  const state = createDemoState();
  const { values } = getPaymentPlan(state, 'diana');
  const read = (patch) => {
    assert.equal(updatePaymentPlan(state, 'diana', { ...values, ...patch }), true);
    return getPaymentPlan(state, 'diana');
  };
  assert.equal(read({ incomeConfirmed: true }).incomeStatus, 'after-due');
  assert.equal(read({ incomeConfirmed: true }).availableCop, 15_000);
  assert.equal(read({ incomeDate: values.installmentDate }).availableCop, 15_000);

  const included = read({ incomeConfirmed: true, incomeDate: values.installmentDate });
  assert.equal(included.incomeStatus, 'included');
  assert.equal(included.availableCop, 95_000);
  assert.equal(included.installmentShortfallCop, 0);
});

test('un ingreso posterior a los gastos esenciales no cubre su faltante anticipadamente', () => {
  const state = createDemoState();
  const { values } = getPaymentPlan(state, 'diana');
  assert.equal(updatePaymentPlan(state, 'diana', {
    ...values, cashCop: 25_000, incomeConfirmed: true, installmentDate: '2026-11-21',
  }), true);

  const plan = getPaymentPlan(state, 'diana');
  assert.equal(plan.incomeStatus, 'included');
  assert.equal(plan.essentialShortfallCop, 20_000);
  assert.equal(plan.availableCop, 60_000);
  assert.equal(plan.installmentShortfallCop, 0);
});

test('conserva el plan confirmado ante entradas inválidas y protege su acceso por perfil', () => {
  const state = createDemoState();
  const { values } = getPaymentPlan(state, 'diana');
  const confirmed = { ...values, cashCop: 40_000 };
  assert.equal(updatePaymentPlan(state, 'diana', confirmed), true);
  assert.equal(getPaymentPlan(state, 'luz'), null);
  assert.equal(updatePaymentPlan(state, 'luz', values), false);
  for (const invalid of [{ incomeDate: '2026-11-31' }, { cashCop: -1 }, { installmentCop: 0 }, { foodCop: 2.5 }]) {
    assert.equal(updatePaymentPlan(state, 'diana', { ...confirmed, ...invalid }), false);
  }
  const restored = JSON.parse(JSON.stringify(state));
  assert.deepEqual(getPaymentPlan(restored, 'diana').values, confirmed);
  restored.paymentPlan.values.incomeDate = '2026-11-17';
  assert.deepEqual(getPaymentPlan(restored, 'diana').values, values);
  assert.deepEqual(restored.draft, state.draft);
});
