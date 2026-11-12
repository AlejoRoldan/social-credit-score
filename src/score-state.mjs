import { getFinanceDashboard } from './finance-state.mjs';

const anaScore = Object.freeze({
  value: 82,
  history: Object.freeze({
    compliance: '9 de 10 pagos a tiempo',
    commitments: '2 compromisos completados',
    membership: '12 meses de vínculo',
  }),
});

const circleExample = Object.freeze({
  value: 78,
  signals: Object.freeze({
    compliance: '18 de 20 pagos a tiempo',
    commitments: '4 compromisos completados',
    membership: '10 meses de vínculo en promedio',
  }),
});

export const scoreComparisonExamples = Object.freeze([
  Object.freeze({
    label: 'Caso A',
    value: 82,
    history: '10 semanas con el estado de 5 cuotas quincenales',
    compliance: '5 de 5 cuotas pagadas a tiempo',
    requestedCop: 300_000,
    paidCop: 250_000,
    committedCop: 250_000,
    membership: '14 meses',
  }),
  Object.freeze({
    label: 'Caso B',
    value: 58,
    history: '10 semanas con el estado de 5 cuotas quincenales',
    compliance: '4 de 5 cuotas pagadas a tiempo. Quedó sin pagar la cuota de la semana 10.',
    requestedCop: 300_000,
    paidCop: 200_000,
    committedCop: 250_000,
    membership: '8 meses',
  }),
]);

export function getOwnScore(profileId) {
  return profileId === 'ana' ? anaScore : null;
}

export function getCircleScore(state, profileId) {
  const dashboard = getFinanceDashboard(state, profileId);
  if (!dashboard) return null;

  const { interestCollectedCop, availableCop } = dashboard.fund;
  return { ...circleExample, interestCollectedCop, availableCop };
}
