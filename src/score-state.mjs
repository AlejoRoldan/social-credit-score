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

export function getOwnScore(profileId) {
  return profileId === 'ana' ? anaScore : null;
}

export function getCircleScore(state, profileId) {
  const dashboard = getFinanceDashboard(state, profileId);
  if (!dashboard) return null;

  const { interestCollectedCop, availableCop } = dashboard.fund;
  return { ...circleExample, interestCollectedCop, availableCop };
}
