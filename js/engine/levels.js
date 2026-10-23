// Avance entre niveles, inicio de partida y cierre.
import { LEVEL_COUNT } from '../data.js';
import { clone, PHASES } from './state.js';

export function chooseStarter(state, player) {
  if (state.phase !== PHASES.CHOOSE_STARTER) return { ok: false, state, error: 'wrong_phase' };
  if (player !== 0 && player !== 1) return { ok: false, state, error: 'invalid_player' };
  const next = clone(state);
  next.starter = player;
  next.turn = player;
  next.level = 1;
  next.phase = PHASES.LEVEL_INTRO;
  return { ok: true, state: next, error: null };
}

/** Desde la introducción del nivel, empieza a mostrar preguntas. */
export function startLevel(state) {
  if (state.phase !== PHASES.LEVEL_INTRO) return { ok: false, state, error: 'wrong_phase' };
  const next = clone(state);
  next.phase = PHASES.QUESTION;
  return { ok: true, state: next, error: null };
}

/** Si el nivel actual llegó a 20 preguntas resueltas, pasa al siguiente (muta la copia). */
export function finishLevelIfComplete(state) {
  const ls = state.levels[state.level];
  if (ls.pos >= ls.order.length) {
    ls.finished = true;
    goToNextLevel(state);
  }
  return state;
}

/**
 * Avance anticipado. Las preguntas pendientes quedan sin puntuación (estado 'pending'),
 * no se inventan respuestas y no se tocan los puntos obtenidos.
 */
export function advanceLevelEarly(state) {
  if (state.phase !== PHASES.QUESTION && state.phase !== PHASES.LEVEL_INTRO) {
    return { ok: false, state, error: 'wrong_phase' };
  }
  const next = clone(state);
  const ls = next.levels[next.level];
  for (const qid of ls.order.slice(ls.pos)) {
    if (!next.results[qid]) next.results[qid] = { status: 'pending', level: next.level, turn: null, scorer: null, points: 0 };
  }
  ls.endedEarly = ls.pos < ls.order.length;
  ls.finished = true;
  goToNextLevel(next);
  return { ok: true, state: next, error: null };
}

function goToNextLevel(state) {
  if (state.level >= LEVEL_COUNT) {
    state.phase = PHASES.FINAL;
    state.status = 'finished';
    const [a, b] = state.scores;
    state.winner = a === b ? null : a > b ? 0 : 1;
    state.winnerBy = state.winner === null ? null : 'points';
  } else {
    state.level += 1;
    state.phase = PHASES.LEVEL_INTRO;
  }
}

export function choosePrize(state, prizeId, validIds) {
  if (state.phase !== PHASES.FINAL && state.phase !== PHASES.PRIZE) return { ok: false, state, error: 'wrong_phase' };
  if (state.winner === null) return { ok: false, state, error: 'no_winner' };
  if (!validIds.includes(prizeId)) return { ok: false, state, error: 'invalid_prize' };
  const next = clone(state);
  next.prize = prizeId;
  next.phase = PHASES.PRIZE;
  return { ok: true, state: next, error: null };
}

export function backToFinal(state) {
  if (state.phase !== PHASES.PRIZE) return { ok: false, state, error: 'wrong_phase' };
  const next = clone(state);
  next.phase = PHASES.FINAL;
  return { ok: true, state: next, error: null };
}
