// Gestión de comodines: cambiar la pregunta actual por otra pendiente del MISMO nivel.
import { clone, currentQuestionId, PHASES } from './state.js';
import { markShown } from './scoring.js';

/** Preguntas del nivel actual que aún no se han mostrado ni resuelto. */
export function alternativesFor(state) {
  const ls = state.levels[state.level];
  return ls.order.slice(ls.pos + 1).filter((qid) => !state.results[qid]);
}

/**
 * Usa un comodín. La pregunta actual queda marcada como 'replaced' (sin puntos) y una
 * pregunta pendiente del mismo nivel pasa a ser la actual. El turno no cambia.
 * Si no hay alternativas, no se consume el comodín.
 */
export function useWildcard(state, qid, random = Math.random) {
  if (state.phase !== PHASES.QUESTION) return { ok: false, state, error: 'not_in_question' };
  if (state.wildcards <= 0) return { ok: false, state, error: 'no_wildcards' };
  const current = currentQuestionId(state);
  if (!current || qid !== current || state.results[qid]) return { ok: false, state, error: 'stale_question' };
  const alts = alternativesFor(state);
  if (alts.length === 0) return { ok: false, state, error: 'no_alternatives' };

  const next = clone(state);
  const ls = next.levels[next.level];
  const pick = alts[Math.floor(random() * alts.length)];
  const from = ls.order.indexOf(pick);
  ls.order.splice(from, 1);
  ls.order.splice(ls.pos + 1, 0, pick);

  next.results[qid] = { status: 'replaced', level: next.level, turn: next.turn, scorer: null, points: 0, at: Date.now() };
  markShown(next, qid);
  ls.pos += 1;
  next.wildcards -= 1;
  return { ok: true, state: next, error: null, replacement: pick };
}
