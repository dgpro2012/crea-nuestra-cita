// Motor de puntuación y registro de resultados. Todas las funciones devuelven
// { ok, state, error }. Nunca mutan el estado de entrada.
import { clone, currentQuestionId, getLevel, PHASES } from './state.js';
import { alternateTurn, rolesFor } from './turns.js';
import { finishLevelIfComplete } from './levels.js';

const GUESS_OUTCOMES = ['correct', 'failed', 'skipped'];
const SELF_OUTCOMES = ['answered', 'skipped'];

export function pointsFor(levelId, outcome) {
  if (outcome === 'correct' || outcome === 'answered') return getLevel(levelId).points;
  return 0;
}

/**
 * Registra el resultado de la pregunta en curso.
 * - Requiere el id de la pregunta mostrada: si no coincide (doble toque, pantalla vieja)
 *   se rechaza sin cambios.
 * - Una pregunta ya resuelta (respondida, fallada, pasada o cambiada) no puede volver a puntuar.
 */
export function recordResult(state, qid, outcome) {
  if (state.phase !== PHASES.QUESTION) return { ok: false, state, error: 'not_in_question' };
  const current = currentQuestionId(state);
  if (!current || qid !== current) return { ok: false, state, error: 'stale_question' };
  if (state.results[qid]) return { ok: false, state, error: 'already_resolved' };

  const level = getLevel(state.level);
  const allowed = level.mode === 'guess' ? GUESS_OUTCOMES : SELF_OUTCOMES;
  if (!allowed.includes(outcome)) return { ok: false, state, error: 'invalid_outcome' };

  const next = clone(state);
  const roles = rolesFor(next);
  const points = pointsFor(next.level, outcome);
  const scorer = points > 0 ? roles.scorer : null;
  if (scorer !== null) next.scores[scorer] += points;

  next.results[qid] = { status: outcome, level: next.level, turn: next.turn, scorer, points, at: Date.now() };
  markShown(next, qid);
  next.levels[next.level].pos += 1;
  alternateTurn(next);
  finishLevelIfComplete(next);
  return { ok: true, state: next, error: null, points, scorer };
}

/** Pasar pregunta: no resta puntos, no consume comodín, no otorga puntos. */
export function skipQuestion(state, qid) {
  return recordResult(state, qid, 'skipped');
}

export function markShown(state, qid) {
  if (!state.shown.includes(qid)) state.shown.push(qid);
  return state;
}

/** Recalcula el marcador desde los resultados (para verificación en pruebas). */
export function scoresFromResults(state) {
  const s = [0, 0];
  for (const r of Object.values(state.results)) if (r.scorer !== null && r.points > 0) s[r.scorer] += r.points;
  return s;
}
