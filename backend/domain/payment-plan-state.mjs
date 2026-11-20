import { applicant } from './demo-state.mjs';

export const paymentPlanStartDate = '2026-11-18';
export const maxPlanAmountCop = 999_999_999;

const samplePlan = Object.freeze({
  cashCop: 60_000,
  foodCop: 30_000,
  transportCop: 15_000,
  installmentCop: 50_000,
  installmentDate: '2026-11-19',
  incomeCop: 80_000,
  incomeDate: '2026-11-20',
  incomeConfirmed: false,
});

function isPlanDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < paymentPlanStartDate) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isAmount(amount, minimum = 0) {
  return Number.isInteger(amount) && amount >= minimum && amount <= maxPlanAmountCop;
}

function validPlan(values) {
  return Boolean(values && isAmount(values.cashCop) && isAmount(values.foodCop) && isAmount(values.transportCop) &&
    isAmount(values.installmentCop, 1) && isAmount(values.incomeCop) && isPlanDate(values.installmentDate) &&
    isPlanDate(values.incomeDate) && typeof values.incomeConfirmed === 'boolean');
}

export function availableForPlanDate(values, date) {
  const confirmedIncome = values.incomeConfirmed && values.incomeDate <= date ? values.incomeCop : 0;
  return Math.max(0, values.cashCop + confirmedIncome - values.foodCop - values.transportCop);
}

export function getPaymentPlan(state, profileId) {
  if (profileId !== applicant.id) return null;
  const stored = state.paymentPlan;
  const values = stored?.schemaVersion === 1 && validPlan(stored.values) ? stored.values : samplePlan;
  const { cashCop, foodCop, transportCop, installmentCop, installmentDate, incomeDate, incomeConfirmed } = values;
  const incomeStatus = !incomeConfirmed ? 'uncertain' : incomeDate > installmentDate ? 'after-due' : 'included';
  const essentialsCop = foodCop + transportCop;
  const availableCop = availableForPlanDate(values, installmentDate);
  return {
    values,
    incomeStatus,
    essentialsCop,
    availableCop,
    essentialShortfallCop: Math.max(0, essentialsCop - cashCop),
    installmentShortfallCop: Math.max(0, installmentCop - availableCop),
  };
}

export function updatePaymentPlan(state, profileId, values) {
  if (profileId !== applicant.id || !validPlan(values)) return false;
  state.paymentPlan = {
    schemaVersion: 1,
    values: Object.fromEntries(Object.keys(samplePlan).map((key) => [key, values[key]])),
  };
  return true;
}
