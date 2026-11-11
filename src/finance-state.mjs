import {
  applicant, getApplicationStatus, getDisbursementAuthorization, getSupportStatus, migrateLegacyRequest,
} from './demo-state.mjs';

const circleFund = Object.freeze({
  interestCollectedCop: 150_000,
  balanceCop: 120_000,
  reserveCop: 40_000,
  commitmentsCop: 20_000,
});

const initialBudget = Object.freeze({
  creditCop: 1_000_000,
  platformCop: 300_000,
  staffCop: 200_000,
});

export function canViewFinance(state, profileId) {
  if (profileId === applicant.id) return true;
  if (getSupportStatus(state, profileId) !== 'confirmed') return false;
  const current = getApplicationStatus(state, applicant.id);
  return !current || current.electorate.includes(profileId);
}

function creditBalance(state) {
  return (state.disbursements ?? []).reduce(
    (balance, { principalCop }) => balance - principalCop,
    initialBudget.creditCop,
  );
}

export function projectCircleFund({ opening = circleFund, reserveOutflowCop = 0 } = {}) {
  const balanceCop = opening.balanceCop - reserveOutflowCop;
  const reserveCop = opening.reserveCop - reserveOutflowCop;
  const availableCop = balanceCop - reserveCop - opening.commitmentsCop;
  return { ...opening, balanceCop, reserveCop, availableCop };
}

export function getFinanceDashboard(state, profileId) {
  if (!canViewFinance(state, profileId)) return null;
  return {
    fund: projectCircleFund(),
    budget: { ...initialBudget, creditCop: creditBalance(state) },
  };
}

export function getOperationVoteStatus(electorate, votes) {
  const approvals = electorate.filter((id) => votes[id] === 'approve').length;
  const rejected = electorate.some((id) => votes[id] === 'reject');
  const unanimous = approvals > 0 && approvals === electorate.length;
  const status = rejected ? 'rejected' : unanimous ? 'approved' : 'waiting';
  return { approvals, status };
}

export function getDisbursementStatus(state, authorization) {
  const current = getDisbursementAuthorization(state);
  if (authorization != null && (!current || current.id !== authorization.id || current.version !== authorization.version ||
      current.principalCop !== authorization.principalCop)) return { status: 'stale-authorization' };

  if (!current) {
    const cost = getApplicationStatus(state, applicant.id)?.cost;
    return { status: cost?.withinLimit === false ? 'cost-limit' : 'not-authorized' };
  }
  if (authorization === null) return { status: 'not-authorized' };

  const existing = (state.disbursements ?? []).find(({ authorizationId }) => authorizationId === current.id);
  if (existing) return { status: 'recorded', movement: existing };
  if (current.principalCop > creditBalance(state)) return { status: 'insufficient-credit' };
  return { status: 'authorized', authorization: current };
}

export function registerDisbursement(state, authorization) {
  const result = getDisbursementStatus(state, authorization);
  if (result.status !== 'authorized') return result;
  const current = result.authorization;
  const movement = {
    authorizationId: current.id,
    requestId: state.requestId,
    version: current.version,
    principalCop: current.principalCop,
  };
  state.disbursements = [...(state.disbursements ?? []), movement];
  return { status: 'recorded', movement, created: true };
}

export function restoreFinance(state) {
  const migrated = migrateLegacyRequest(state);
  const result = registerDisbursement(state);
  return migrated || result.created === true;
}
