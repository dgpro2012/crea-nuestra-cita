// Estado de la partida: creación, consultas y utilidades puras (sin DOM ni almacenamiento).
import { LEVELS, LEVEL_COUNT, QUESTIONS_PER_LEVEL } from '../data.js';

export const STATE_VERSION = 1;
export const MAX_WILDCARDS = 3;

export const PHASES = Object.freeze({
  CHOOSE_STARTER: 'chooseStarter',
  LEVEL_INTRO: 'levelIntro',
  QUESTION: 'question',
  FINAL: 'final',
  TIEBREAK: 'tiebreak',
  PRIZE: 'prize',
});

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function getLevel(levelId) {
  return LEVELS.find((l) => l.id === levelId) || null;
}

export function findQuestion(qid) {
  for (const l of LEVELS) {
    const q = l.questions.find((x) => x.id === qid);
    if (q) return { level: l, question: q };
  }
  return null;
}

export function createGame(now = Date.now()) {
  const levels = {};
  for (const l of LEVELS) {
    levels[l.id] = { order: l.questions.map((q) => q.id), pos: 0, finished: false, endedEarly: false };
  }
  return {
    version: STATE_VERSION,
    id: `cita-${now}-${Math.random().toString(36).slice(2, 8)}`,
    rev: 0,
    createdAt: now,
    updatedAt: now,
    status: 'playing',
    phase: PHASES.CHOOSE_STARTER,
    starter: null,
    turn: null,
    level: 1,
    scores: [0, 0],
    wildcards: MAX_WILDCARDS,
    levels,
    results: {},
    shown: [],
    tiebreak: null,
    winner: null,
    winnerBy: null, // 'points' | 'tiebreak'
    prize: null,
  };
}

export function currentQuestionId(state) {
  const ls = state.levels[state.level];
  if (!ls || ls.pos >= ls.order.length) return null;
  return ls.order[ls.pos];
}

export function currentQuestion(state) {
  const qid = currentQuestionId(state);
  return qid ? findQuestion(qid).question : null;
}

/** Número (1..20) de la pregunta en curso dentro del nivel. */
export function questionNumber(state) {
  const ls = state.levels[state.level];
  return Math.min(ls.pos + 1, QUESTIONS_PER_LEVEL);
}

export function levelProgress(state, levelId = state.level) {
  const ls = state.levels[levelId];
  return { done: ls.pos, total: ls.order.length };
}

export function other(player) {
  return player === 0 ? 1 : 0;
}

/** Valida que un estado restaurado tenga una forma utilizable. */
export function isValidState(s) {
  try {
    if (!s || s.version !== STATE_VERSION) return false;
    if (!Array.isArray(s.scores) || s.scores.length !== 2) return false;
    if (typeof s.wildcards !== 'number' || s.wildcards < 0 || s.wildcards > MAX_WILDCARDS) return false;
    if (!Object.values(PHASES).includes(s.phase)) return false;
    if (s.level < 1 || s.level > LEVEL_COUNT) return false;
    for (const l of LEVELS) {
      const ls = s.levels[l.id];
      if (!ls || !Array.isArray(ls.order) || ls.order.length !== QUESTIONS_PER_LEVEL) return false;
    }
    return true;
  } catch {
    return false;
  }
}
