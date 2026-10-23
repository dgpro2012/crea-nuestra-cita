// Desempate: no modifica el marcador principal.
// Ronda: A adivina un dato concreto sobre B (B evalúa). Si acierta, gana A.
// Si falla, B intenta adivinar un dato sobre A. Si ambos fallan, o la respuesta no es clara,
// se presenta otra pregunta.
import { TIEBREAK_QUESTIONS } from '../content.js';
import { clone, other, PHASES } from './state.js';

function pickQuestion(used, random) {
  let pool = TIEBREAK_QUESTIONS.map((_, i) => i).filter((i) => !used.includes(i));
  if (pool.length === 0) {
    used.length = 0;
    pool = TIEBREAK_QUESTIONS.map((_, i) => i);
  }
  const idx = pool[Math.floor(random() * pool.length)];
  used.push(idx);
  return idx;
}

export function startTiebreak(state, random = Math.random) {
  if (state.phase !== PHASES.FINAL || state.winner !== null) return { ok: false, state, error: 'no_tie' };
  const next = clone(state);
  const first = next.starter ?? 0;
  const used = [];
  next.tiebreak = { round: 1, attempt: 0, firstGuesser: first, guesser: first, qIndex: pickQuestion(used, random), used, step: 0 };
  next.phase = PHASES.TIEBREAK;
  return { ok: true, state: next, error: null };
}

/** outcome: 'correct' | 'failed' | 'unclear'. step evita dobles toques. */
export function resolveTiebreak(state, outcome, step, random = Math.random) {
  if (state.phase !== PHASES.TIEBREAK || !state.tiebreak) return { ok: false, state, error: 'wrong_phase' };
  if (step !== state.tiebreak.step) return { ok: false, state, error: 'stale_step' };
  if (!['correct', 'failed', 'unclear'].includes(outcome)) return { ok: false, state, error: 'invalid_outcome' };
  const next = clone(state);
  const tb = next.tiebreak;
  tb.step += 1;
  if (outcome === 'correct') {
    next.winner = tb.guesser;
    next.winnerBy = 'tiebreak';
    tb.decidedBy = tb.guesser;
    next.phase = PHASES.FINAL;
  } else if (outcome === 'failed') {
    if (tb.attempt === 0) {
      tb.attempt = 1;
      tb.guesser = other(tb.guesser);
    } else {
      tb.round += 1;
      tb.attempt = 0;
      tb.guesser = tb.firstGuesser;
    }
    tb.qIndex = pickQuestion(tb.used, random);
  } else {
    tb.qIndex = pickQuestion(tb.used, random);
  }
  return { ok: true, state: next, error: null };
}
