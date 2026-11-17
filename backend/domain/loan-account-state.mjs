import { getApplicationStatus, getInstallmentReminder } from './demo-state.mjs';

export const helpReasons = [
  'Bajaron mis ingresos o ventas',
  'Tuve un gasto imprevisto',
  'Quiero hablar sobre mi fecha de pago',
];

export function getLoanAccount(state, profileId) {
  const reminder = getInstallmentReminder(state, profileId);
  if (!reminder) return null;

  const { application, version } = getApplicationStatus(state, profileId);
  const stored = state.loanAccount;
  const activity = stored?.requestId === reminder.requestId && stored.version === version ? stored : null;
  const paidCount = Number.isInteger(activity?.paidCount) && activity.paidCount >= 0 && activity.paidCount <= application.weeks
    ? activity.paidCount : 0;
  const firstDue = new Date(reminder.dueDate);
  const installments = Array.from({ length: application.weeks }, (_, index) => {
    const number = index + 1;
    const date = new Date(firstDue);
    date.setUTCDate(date.getUTCDate() + index * 7);
    const paid = number <= paidCount;
    return {
      number,
      dueDate: date.toISOString().slice(0, 10),
      amountCop: application.installment,
      paid,
      reference: paid ? `SIM-V${version}-C${number}` : null,
    };
  });
  const paidCop = installments.slice(0, paidCount).reduce((sum, item) => sum + item.amountCop, 0);
  return {
    requestId: reminder.requestId,
    version,
    installments,
    paidCount,
    paidCop,
    outstandingCop: application.total - paidCop,
    next: installments[paidCount] ?? null,
    helpReason: helpReasons.includes(activity?.helpReason) ? activity.helpReason : null,
  };
}

export function payNextInstallment(state, profileId, expected) {
  const account = getLoanAccount(state, profileId);
  if (!account?.next || !expected || account.requestId !== expected.requestId ||
      account.version !== expected.version || account.next.number !== expected.number) return false;

  saveActivity(state, account, { paidCount: account.paidCount + 1 });
  return true;
}

export function requestLoanHelp(state, profileId, reason) {
  const account = getLoanAccount(state, profileId);
  if (!account?.next || account.helpReason || !helpReasons.includes(reason)) return false;

  saveActivity(state, account, { helpReason: reason });
  return true;
}

function saveActivity(state, account, change) {
  const { requestId, version, paidCount, helpReason } = account;
  state.loanAccount = { requestId, version, paidCount, helpReason, ...change };
}
