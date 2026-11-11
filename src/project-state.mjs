import { applicant } from './demo-state.mjs';
import { getOperationVoteStatus, getProjectFund } from './finance-state.mjs';

export const projectElectorate = Object.freeze(['ana', 'camilo', 'elena', 'jose', 'luz']);
const initialCase = { proposals: [], movements: [] };

function getCase(state) {
  return state.projectCase ?? initialCase;
}

export function canViewProject(profileId) {
  return profileId === applicant.id || projectElectorate.includes(profileId);
}

function describeProposal(proposal, movements) {
  const vote = getOperationVoteStatus(proposal.electorate, proposal.votes);
  const movement = movements.find(({ proposalId }) => proposalId === proposal.id);
  return {
    ...proposal,
    electorate: [...proposal.electorate],
    votes: { ...proposal.votes },
    ...vote,
    movement: movement ? { ...movement } : null,
    status: movement ? 'recorded' : vote.status,
  };
}

export function getProjectCase(state, profileId) {
  if (!canViewProject(profileId)) return null;
  const { proposals, movements } = getCase(state);
  const history = proposals.map((proposal) => describeProposal(proposal, movements));
  const current = history.at(-1) ?? null;
  const fund = getProjectFund(state);
  const isMember = projectElectorate.includes(profileId);
  const canPropose = isMember && (!current || ['rejected', 'recorded'].includes(current.status));
  const canVote = current?.status === 'waiting' && current.electorate.includes(profileId) &&
    !Object.hasOwn(current.votes, profileId);
  const canConfirm = current?.status === 'approved' && current.electorate.includes(profileId) &&
    current.amountCop <= fund.availableCop;
  return { fund, current, history: history.slice(0, -1), canPropose, canVote, canConfirm };
}

export function validateProjectProposal(state, purpose, amountCop) {
  if (!Number.isSafeInteger(amountCop) || amountCop <= 0) return { status: 'invalid-amount' };
  const excessCop = amountCop - getProjectFund(state).availableCop;
  if (excessCop > 0) return { status: 'exceeds-available', excessCop };
  if (typeof purpose !== 'string' || !purpose.trim()) return { status: 'missing-purpose' };
  return { status: 'valid' };
}

export function submitProjectProposal(state, profileId, purpose, amountCop) {
  if (!getProjectCase(state, profileId)?.canPropose) return { status: 'blocked' };
  const validation = validateProjectProposal(state, purpose, amountCop);
  if (validation.status !== 'valid') return validation;

  const example = getCase(state);
  const proposal = {
    id: (example.proposals.at(-1)?.id ?? 0) + 1,
    purpose: purpose.trim(),
    amountCop,
    electorate: [...projectElectorate],
    votes: {},
  };
  state.projectCase = { ...example, proposals: [...example.proposals, proposal] };
  return { status: 'submitted' };
}

export function voteOnProject(state, profileId, proposalId, decision) {
  const view = getProjectCase(state, profileId);
  if (!view?.canVote || view.current.id !== proposalId || !['approve', 'reject'].includes(decision)) return false;
  const example = getCase(state);
  const proposal = example.proposals.at(-1);
  const updated = { ...proposal, votes: { ...proposal.votes, [profileId]: decision } };
  state.projectCase = { ...example, proposals: [...example.proposals.slice(0, -1), updated] };
  return true;
}

export function confirmProjectTransfer(state, profileId, proposalId) {
  if (!projectElectorate.includes(profileId)) return { status: 'blocked' };
  const example = getCase(state);
  const existing = example.movements.find((movement) => movement.proposalId === proposalId);
  if (existing) return { status: 'recorded', movement: existing };

  const view = getProjectCase(state, profileId);
  if (view.current?.status !== 'approved' || view.current.id !== proposalId ||
      !view.current.electorate.includes(profileId)) return { status: 'blocked' };
  if (!view.canConfirm) return { status: 'insufficient-funds' };

  const movement = { proposalId, amountCop: view.current.amountCop };
  state.projectCase = { ...example, movements: [...example.movements, movement] };
  return { status: 'recorded', movement, created: true };
}
