import { availableForPlanDate, getPaymentPlan } from './payment-plan-state.mjs';

export const planComparisonScenarios = Object.freeze({
  pending: 'Solicitud de prórroga pendiente',
  agreed: 'Prórroga acordada',
  offer: 'Oferta de crédito nueva',
  'same-total': 'Solicitud pendiente con el mismo total',
  unavailable: 'Sin plazo alternativo',
});

function followingDate(value, days) {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  const iso = date.toISOString();
  return iso.startsWith('+') ? null : iso.slice(0, 10);
}

function terms(values, totalCop, interestCop, payments) {
  let payableCop = 0;
  let shortfallCop = 0;
  for (const { amountCop, date } of payments) {
    payableCop += amountCop;
    shortfallCop = Math.max(shortfallCop, payableCop - availableForPlanDate(values, date));
  }
  return { totalCop, interestCop, payments, shortfallCop };
}

export function getPlanComparison(state, profileId) {
  const plan = getPaymentPlan(state, profileId);
  if (!plan) return null;
  const scenario = Object.hasOwn(planComparisonScenarios, state.planComparisonScenario) ? state.planComparisonScenario : 'pending';
  const { values } = plan;
  const { installmentCop, installmentDate } = values;
  const originalInterest = Math.floor(installmentCop / 10);
  const original = terms(values, installmentCop, originalInterest, [{ amountCop: installmentCop, date: installmentDate }]);
  const firstDate = followingDate(installmentDate, 1);
  const lastDate = followingDate(installmentDate, 8);
  const total = scenario === 'same-total' ? installmentCop : Math.ceil(installmentCop * 6 / 5);
  const firstPayment = Math.ceil(total / 2);
  const alternative = scenario === 'unavailable' || !firstDate || !lastDate || firstPayment >= installmentCop ? null :
    terms(values, total, originalInterest + total - installmentCop, [
      { amountCop: firstPayment, date: firstDate },
      { amountCop: total - firstPayment, date: lastDate },
    ]);
  const active = scenario === 'offer' ? null : scenario === 'agreed' && alternative ? 'alternative' : 'original';
  return { scenario, original, alternative, active };
}

export function selectPlanComparisonScenario(state, profileId, scenario) {
  if (!getPaymentPlan(state, profileId) || !Object.hasOwn(planComparisonScenarios, scenario)) return false;
  state.planComparisonScenario = scenario;
  return true;
}
