import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDemoState } from '../domain/demo-state.mjs';
import { getEducationProgress, submitEducationAttempt } from '../domain/education-state.mjs';
import { getOwnScore } from '../domain/score-state.mjs';

const firstAnswers = { capital: 285_000, capitalReason: 'principal', shortfall: 30_000, cashReason: 'new-payment' };
const retryAnswers = { ...firstAnswers, capital: 390_000, shortfall: 25_000 };

test('las dos respuestas correctas otorgan +2 en el primer intento', () => {
  const state = createDemoState();
  const { attemptId } = getEducationProgress(state, 'diana');
  const result = submitEducationAttempt(state, 'diana', attemptId, firstAnswers);
  assert.equal(result.number, 1);
  assert.equal(result.capitalCorrect, true);
  assert.equal(result.cashCorrect, true);
  assert.equal(getEducationProgress(state, 'diana').bonus, 2);
});

test('la evaluación exige los cálculos y las explicaciones de ambas competencias', () => {
  for (const [field, wrong] of Object.entries({ capital: 240_000, capitalReason: 'payment', shortfall: 0, cashReason: 'free-cash' })) {
    const state = createDemoState();
    const first = getEducationProgress(state, 'diana');
    const result = submitEducationAttempt(state, 'diana', first.attemptId, { ...firstAnswers, [field]: wrong });
    assert.equal(result.capitalCorrect && result.cashCorrect, false);
    const next = getEducationProgress(state, 'diana');
    assert.equal(next.bonus, 0);
    assert.equal(next.number, 2);
    assert.notEqual(next.example.id, first.example.id);
  }
});

test('reintentar, repetir y recuperar la sesión conserva un bono privado separado del historial', () => {
  const state = createDemoState();
  const first = getEducationProgress(state, 'diana');
  const failure = submitEducationAttempt(state, 'diana', first.attemptId, { ...firstAnswers, capital: 0 });
  assert.equal(submitEducationAttempt(state, 'diana', first.attemptId, firstAnswers), failure);

  const second = getEducationProgress(state, 'diana');
  const approved = submitEducationAttempt(state, 'diana', second.attemptId, retryAnswers);
  assert.equal(approved.number, 2);
  assert.equal(approved.capitalCorrect && approved.cashCorrect, true);

  const restored = JSON.parse(JSON.stringify(state));
  assert.deepEqual(submitEducationAttempt(restored, 'diana', second.attemptId, retryAnswers), approved);
  assert.equal(submitEducationAttempt(restored, 'diana', getEducationProgress(restored, 'diana').attemptId, firstAnswers), null);
  assert.equal(getEducationProgress(restored, 'diana').bonus, 2);
  assert.equal(getEducationProgress(restored, 'luz').bonus, 0);
  assert.equal(getEducationProgress(restored, 'desconocido'), null);
  assert.equal(getOwnScore('diana'), null);
  assert.deepEqual(restored, state);
});

test('los reintentos que siguen a los casos iniciales usan cifras nuevas y sobreviven a una recarga', () => {
  let state = createDemoState();
  const examples = [];
  for (let index = 0; index < 5; index += 1) {
    const { attemptId, example } = getEducationProgress(state, 'diana');
    examples.push(example);
    state = JSON.parse(JSON.stringify(state));
    assert.deepEqual(getEducationProgress(state, 'diana').example, example);
    submitEducationAttempt(state, 'diana', attemptId, { ...firstAnswers, capital: 0 });
  }
  assert.equal(new Set(examples.map(({ principal }) => principal)).size, examples.length);
  assert.equal(new Set(examples.map(({ newPayment }) => newPayment)).size, examples.length);
});

test('una sesión con un bono de la versión anterior conserva el otorgamiento', () => {
  const state = createDemoState();
  state.education = {
    schemaVersion: 1,
    profiles: {
      diana: {
        'capital-e-intereses': {
          attempts: [{ id: '1-1', number: 1, caseId: 'a', contentVersion: 1, rubricVersion: 1, capitalCorrect: true, cashCorrect: true }],
          award: { points: 2, attemptId: '1-1', policyVersion: 1 },
        },
      },
    },
  };
  const restored = getEducationProgress(state, 'diana');
  assert.equal(restored.bonus, 2);
  assert.equal(restored.last.contentVersion, 1);
  assert.equal(submitEducationAttempt(state, 'diana', restored.attemptId, retryAnswers), null);
});
