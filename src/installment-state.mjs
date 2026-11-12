import { applicant, contributionLimit } from './demo-state.mjs';
import { getOperationVoteStatus, projectCircleFund } from './finance-state.mjs';

export const installmentSupporters = Object.freeze(['ana', 'camilo', 'elena', 'jose', 'luz']);
const installmentCop = 100_000;
const ownPaymentCop = 40_000;
const emptyFund = Object.freeze({ interestCollectedCop: 0, balanceCop: 0, reserveCop: 0, commitmentsCop: 0 });
const variants = Object.freeze({
  reserve: { reserveCop: 25_000 },
  empty: { reserveCop: 0, opening: emptyFund },
});
const initialCase = { votes: {}, payments: {}, reserveMovement: null };

function getCase(state, variant) {
  return state.installmentCases?.[variant] ?? initialCase;
}

function saveCase(state, variant, example) {
  state.installmentCases = { ...state.installmentCases, [variant]: example };
}

function allocations(reserveCop) {
  const count = installmentSupporters.length;
  const amount = Math.min(installmentCop - ownPaymentCop - reserveCop, count * contributionLimit);
  return installmentSupporters.map((id, index) => ({
    id,
    assignedCop: Math.floor(amount / count) + Number(index < amount % count),
  }));
}

export function getInstallmentCase(state, variant, profileId) {
  const isApplicant = profileId === applicant.id;
  if (!Object.hasOwn(variants, variant) || (!isApplicant && !installmentSupporters.includes(profileId))) return null;

  const { reserveCop, opening } = variants[variant];
  const { votes, payments, reserveMovement } = getCase(state, variant);
  const reservePaidCop = reserveMovement?.amountCop ?? 0;
  const vote = getOperationVoteStatus(installmentSupporters, votes);
  const active = reserveCop === 0 || reservePaidCop > 0;
  const contributions = (active ? allocations(reservePaidCop) : []).map(({ id, assignedCop }) => ({
    id, assignedCop, paidCop: payments[id]?.amountCop ?? 0, status: payments[id]?.status ?? 'pending',
  }));
  const common = { reserveCop, active, approvals: vote.approvals, voteStatus: reserveCop ? vote.status : 'unneeded' };
  if (!isApplicant) return {
    ...common, ownVote: votes[profileId] ?? null,
    contribution: contributions.find(({ id }) => id === profileId) ?? null,
  };

  const paidBySupportersCop = contributions.reduce((total, { paidCop }) => total + paidCop, 0);
  return {
    ...common, installmentCop, ownPaymentCop, reservePaidCop, paidBySupportersCop, contributions,
    pendingCop: installmentCop - ownPaymentCop - reservePaidCop - paidBySupportersCop,
    fundBefore: projectCircleFund({ opening }),
    fundAfter: projectCircleFund({ opening, reserveOutflowCop: reservePaidCop }),
    nextVoter: installmentSupporters.find((id) => !Object.hasOwn(votes, id)) ?? null,
  };
}

export function voteOnInstallmentReserve(state, variant, profileId, decision) {
  const view = getInstallmentCase(state, variant, profileId);
  if (!installmentSupporters.includes(profileId) || view?.voteStatus !== 'waiting' || view.ownVote ||
      !['approve', 'reject'].includes(decision)) return false;

  const example = getCase(state, variant);
  const votes = { ...example.votes, [profileId]: decision };
  const { status } = getOperationVoteStatus(installmentSupporters, votes);
  const reserveMovement = status === 'approved' ? { amountCop: view.reserveCop } : null;
  saveCase(state, variant, { ...example, votes, reserveMovement });
  return true;
}

export function simulateInstallmentContribution(state, variant, profileId, outcome) {
  const contribution = getInstallmentCase(state, variant, profileId)?.contribution;
  if (contribution?.status !== 'pending' || !['paid', 'failed'].includes(outcome)) return false;

  const example = getCase(state, variant);
  const payment = { status: outcome, amountCop: outcome === 'paid' ? contribution.assignedCop : 0 };
  saveCase(state, variant, { ...example, payments: { ...example.payments, [profileId]: payment } });
  return true;
}
