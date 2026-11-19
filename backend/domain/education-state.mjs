import { applicant, supporters } from './demo-state.mjs';
import { educationModule } from './education-content.mjs';

function progressFor(state, profileId) {
  if (profileId !== applicant.id && !supporters.some(({ id }) => id === profileId)) return null;
  const stored = state.education;
  const progress = stored?.schemaVersion === 1 ? stored.profiles?.[profileId]?.[educationModule.id] : null;
  const attempts = Array.isArray(progress?.attempts) ? progress.attempts : [];
  const last = attempts.at(-1);
  const valid = attempts.length === 0 || (
    typeof last?.id === 'string' && last.number === attempts.length &&
    typeof last.capitalCorrect === 'boolean' && typeof last.cashCorrect === 'boolean'
  );
  if (!valid) return { attempts: [], award: null };
  const award = progress?.award;
  return {
    attempts,
    award: last?.capitalCorrect && last.cashCorrect && award?.attemptId === last.id && award.points === educationModule.bonus
      ? award : null,
  };
}

export function getEducationProgress(state, profileId) {
  const progress = progressFor(state, profileId);
  if (!progress) return null;
  const number = progress.attempts.length + 1;
  const example = educationModule.cases[(number - 1) % educationModule.cases.length];
  return {
    number,
    attemptId: `${educationModule.version}-${number}`,
    example,
    last: progress.attempts.at(-1) ?? null,
    bonus: progress.award?.points ?? 0,
  };
}

export function submitEducationAttempt(state, profileId, attemptId, answers) {
  const progress = progressFor(state, profileId);
  if (!progress) return null;
  const latest = progress.attempts.at(-1);
  if (latest && latest.id === attemptId) return latest;
  const current = getEducationProgress(state, profileId);
  if (progress.award || current.attemptId !== attemptId || !answers) return null;

  const { principal, payment, interest, available, other, newPayment } = current.example;
  const capitalCorrect = answers.capital === principal - (payment - interest) && answers.capitalReason === 'principal';
  const cashCorrect = answers.shortfall === Math.max(0, other + newPayment - available) && answers.cashReason === 'new-payment';
  const result = {
    id: attemptId,
    number: current.number,
    caseId: current.example.id,
    contentVersion: educationModule.version,
    rubricVersion: educationModule.rubricVersion,
    capitalCorrect,
    cashCorrect,
  };
  const award = capitalCorrect && cashCorrect
    ? { points: educationModule.bonus, attemptId, policyVersion: educationModule.policyVersion }
    : null;
  const profiles = state.education?.schemaVersion === 1 ? state.education.profiles : {};
  state.education = {
    schemaVersion: 1,
    profiles: {
      ...profiles,
      [profileId]: { ...profiles?.[profileId], [educationModule.id]: { attempts: [...progress.attempts, result], award } },
    },
  };
  return result;
}
