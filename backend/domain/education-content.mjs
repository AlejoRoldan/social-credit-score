export const educationModule = Object.freeze({
  id: 'capital-e-intereses',
  version: 2,
  rubricVersion: 1,
  policyVersion: 1,
  bonus: 2,
  source: 'Entrevecinos V3 · Evaluación y bono (OQ-32)',
  practice: Object.freeze({ principal: 1_000_000, payment: 200_000, interest: 200_000 }),
  cases: Object.freeze([
    Object.freeze({ id: 'a', principal: 300_000, payment: 60_000, interest: 45_000, available: 35_000, other: 25_000, newPayment: 40_000 }),
    Object.freeze({ id: 'b', principal: 420_000, payment: 80_000, interest: 50_000, available: 55_000, other: 35_000, newPayment: 45_000 }),
  ]),
});

export function educationCaseForAttempt(number) {
  const { cases } = educationModule;
  if (number <= cases.length) return cases[number - 1];

  const template = cases.at(-1);
  const retry = number - cases.length;
  return {
    ...template,
    id: `retry-${number}`,
    principal: template.principal + retry * 10_000,
    newPayment: template.newPayment + retry * 5_000,
  };
}
