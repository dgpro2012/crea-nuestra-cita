// Pruebas del motor (Node 18+):  node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LEVELS } from '../js/data.js';
import { PRIZES } from '../js/content.js';
import * as E from '../js/engine/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const SPEC = process.env.SPEC_PATH || join(here, 'spec-questions.txt');

function play(state, outcomeFn) {
  let s = state;
  let guard = 0;
  while (s.phase === E.PHASES.QUESTION && guard++ < 500) {
    const qid = E.currentQuestionId(s);
    const r = E.recordResult(s, qid, outcomeFn(s));
    assert.ok(r.ok, r.error);
    s = r.state;
  }
  return s;
}
function started(starter = 0) {
  let s = E.createGame(1);
  s = E.chooseStarter(s, starter).state;
  return E.startLevel(s).state;
}

test('1-2. cinco niveles con exactamente 20 preguntas idénticas al documento', () => {
  assert.equal(LEVELS.length, 5);
  for (const l of LEVELS) assert.equal(l.questions.length, 20, `nivel ${l.id}`);
  let spec;
  try {
    spec = readFileSync(SPEC, 'utf8');
  } catch {
    return; // sin documento de referencia: se omite la comparación textual
  }
  const sec = spec.split('# 10. LOS CINCO NIVELES Y SUS PREGUNTAS')[1].split('# 11.')[0];
  const blocks = sec.split(/^## NIVEL \d — .+$/m).slice(1);
  assert.equal(blocks.length, 5);
  blocks.forEach((b, i) => {
    const qs = [...b.matchAll(/^\d+\. (.+)$/gm)].map((m) => m[1]);
    assert.deepEqual(LEVELS[i].questions.map((q) => q.text), qs, `texto del nivel ${i + 1}`);
  });
  assert.ok(LEVELS[2].intro.startsWith('Aquí no existen respuestas correctas.'));
  assert.ok(LEVELS[3].intro.startsWith('Míranos con honestidad.'));
  assert.ok(LEVELS[4].intro.startsWith('Atrévete a decir lo que deseas.'));
});

test('3. niveles 1 y 2 sin respuestas precargadas', () => {
  for (const l of LEVELS.slice(0, 2)) {
    assert.equal(l.mode, 'guess');
    for (const q of l.questions) assert.deepEqual(Object.keys(q).sort(), ['id', 'text']);
  }
});

test('adivinanza: los puntos van a quien adivina y solo con «Acertó»', () => {
  let s = started(0); // turno de 0 → adivina 1
  let r = E.recordResult(s, E.currentQuestionId(s), 'correct');
  assert.deepEqual(r.state.scores, [0, 1]);
  assert.equal(r.state.turn, 1);
  r = E.recordResult(r.state, E.currentQuestionId(r.state), 'failed');
  assert.deepEqual(r.state.scores, [0, 1]);
  assert.equal(r.state.turn, 0);
  r = E.recordResult(r.state, E.currentQuestionId(r.state), 'answered');
  assert.equal(r.ok, false, 'en niveles 1-2 no existe «He respondido»');
});

test('4. niveles 3-5 otorgan puntos del nivel al pulsar «He respondido»', () => {
  let s = started(0);
  for (let lvl = 1; lvl <= 2; lvl++) s = E.startLevel(E.advanceLevelEarly(s).state).state;
  assert.equal(s.level, 3);
  const turn = s.turn;
  const r = E.recordResult(s, E.currentQuestionId(s), 'answered');
  assert.equal(r.state.scores[turn], 3);
  const r2 = E.recordResult(r.state, E.currentQuestionId(r.state), 'correct');
  assert.equal(r2.ok, false, 'en niveles 3-5 no existe «Acertó»');
});

test('5. pasar no da puntos, no resta y no consume comodines', () => {
  let s = started(0);
  s = E.recordResult(s, E.currentQuestionId(s), 'correct').state;
  const before = { scores: [...s.scores], w: s.wildcards };
  const r = E.skipQuestion(s, E.currentQuestionId(s));
  assert.ok(r.ok);
  assert.deepEqual(r.state.scores, before.scores);
  assert.equal(r.state.wildcards, before.w);
});

test('una pregunta pasada no puede marcarse luego como respondida', () => {
  let s = started(0);
  const qid = E.currentQuestionId(s);
  s = E.skipQuestion(s, qid).state;
  const r = E.recordResult(s, qid, 'correct');
  assert.equal(r.ok, false);
  assert.deepEqual(r.state.scores, [0, 0]);
});

test('6-7. comodines: mismo nivel, máximo tres, turno intacto', () => {
  let s = started(1);
  const levelIds = new Set(LEVELS[0].questions.map((q) => q.id));
  for (let i = 0; i < 3; i++) {
    const turn = s.turn;
    const qid = E.currentQuestionId(s);
    const r = E.useWildcard(s, qid);
    assert.ok(r.ok);
    assert.ok(levelIds.has(r.replacement));
    assert.equal(r.state.level, 1);
    assert.equal(r.state.turn, turn);
    assert.equal(E.currentQuestionId(r.state), r.replacement);
    assert.equal(r.state.results[qid].status, 'replaced');
    s = r.state;
  }
  assert.equal(s.wildcards, 0);
  const r4 = E.useWildcard(s, E.currentQuestionId(s));
  assert.equal(r4.ok, false);
  assert.equal(r4.error, 'no_wildcards');
});

test('comodín sin alternativas no se consume', () => {
  let s = started(0);
  while (s.levels[1].pos < 19) s = E.recordResult(s, E.currentQuestionId(s), 'failed').state;
  const r = E.useWildcard(s, E.currentQuestionId(s));
  assert.equal(r.ok, false);
  assert.equal(r.error, 'no_alternatives');
  assert.equal(r.state.wildcards, 3);
});

test('8. turnos alternados en toda la partida', () => {
  let s = started(1);
  let expected = 1;
  let guard = 0;
  while (s.phase !== E.PHASES.FINAL && guard++ < 200) {
    if (s.phase === E.PHASES.LEVEL_INTRO) s = E.startLevel(s).state;
    assert.equal(s.turn, expected);
    const lvl = E.getLevel(s.level);
    s = E.recordResult(s, E.currentQuestionId(s), lvl.mode === 'guess' ? 'failed' : 'skipped').state;
    expected = expected === 0 ? 1 : 0;
  }
  assert.equal(s.phase, E.PHASES.FINAL);
});

test('9. doble toque no duplica puntos', () => {
  const s = started(0);
  const qid = E.currentQuestionId(s);
  const a = E.recordResult(s, qid, 'correct');
  const b = E.recordResult(a.state, qid, 'correct');
  assert.equal(b.ok, false);
  assert.deepEqual(b.state.scores, [0, 1]);
  assert.deepEqual(E.scoresFromResults(b.state), [0, 1]);
});

test('10. avance anticipado: pendientes sin puntos y marcador intacto', () => {
  let s = started(0);
  for (let i = 0; i < 5; i++) s = E.recordResult(s, E.currentQuestionId(s), 'correct').state;
  const scores = [...s.scores];
  const r = E.advanceLevelEarly(s);
  assert.ok(r.ok);
  assert.deepEqual(r.state.scores, scores);
  assert.equal(r.state.level, 2);
  assert.equal(r.state.phase, E.PHASES.LEVEL_INTRO);
  const pend = Object.values(r.state.results).filter((x) => x.level === 1 && x.status === 'pending');
  assert.equal(pend.length, 15);
  assert.ok(pend.every((p) => p.points === 0 && p.scorer === null));
});

test('11. avance automático al completar 20 preguntas', () => {
  let s = started(0);
  for (let i = 0; i < 19; i++) s = E.recordResult(s, E.currentQuestionId(s), 'failed').state;
  assert.equal(s.level, 1);
  s = E.recordResult(s, E.currentQuestionId(s), 'failed').state;
  assert.equal(s.level, 2);
  assert.equal(s.phase, E.PHASES.LEVEL_INTRO);
});

test('el nivel termina tras 20 resoluciones aunque se usen comodines', () => {
  let s = started(0);
  s = E.useWildcard(s, E.currentQuestionId(s)).state;
  let n = 0;
  while (s.level === 1) {
    s = E.recordResult(s, E.currentQuestionId(s), 'correct').state;
    n++;
  }
  assert.equal(n, 19);
  assert.equal(new Set(Object.keys(s.results).filter((k) => k.startsWith('n1-'))).size, 20);
});

test('partida completa: puntuación máxima y ganador', () => {
  let s = started(0);
  let guard = 0;
  while (s.phase !== E.PHASES.FINAL && guard++ < 10) {
    if (s.phase === E.PHASES.LEVEL_INTRO) s = E.startLevel(s).state;
    s = play(s, (st) => (E.getLevel(st.level).mode === 'guess' ? 'correct' : 'answered'));
  }
  // 100 preguntas alternadas: cada jugador suma 10 de cada nivel × puntos
  assert.deepEqual(s.scores, [150, 150]);
  assert.equal(s.winner, null);
  assert.deepEqual(E.scoresFromResults(s), s.scores);
});

test('15. desempate no modifica la puntuación principal', () => {
  let s = started(0);
  while (s.phase !== E.PHASES.FINAL) s = E.advanceLevelEarly(s).state;
  assert.equal(s.winner, null);
  let r = E.startTiebreak(s);
  s = r.state;
  assert.equal(s.phase, E.PHASES.TIEBREAK);
  const g0 = s.tiebreak.guesser;
  s = E.resolveTiebreak(s, 'failed', s.tiebreak.step).state; // falla el primero → intenta el otro
  assert.equal(s.tiebreak.guesser, g0 === 0 ? 1 : 0);
  s = E.resolveTiebreak(s, 'failed', s.tiebreak.step).state; // ambos fallan → nueva ronda
  assert.equal(s.tiebreak.round, 2);
  s = E.resolveTiebreak(s, 'unclear', s.tiebreak.step).state; // sin respuesta clara → otra pregunta
  const stale = s.tiebreak.step - 1;
  assert.equal(E.resolveTiebreak(s, 'correct', stale).ok, false, 'doble toque ignorado');
  const g = s.tiebreak.guesser;
  s = E.resolveTiebreak(s, 'correct', s.tiebreak.step).state;
  assert.equal(s.winner, g);
  assert.equal(s.winnerBy, 'tiebreak');
  assert.deepEqual(s.scores, [0, 0]);
  assert.equal(s.phase, E.PHASES.FINAL);
});

test('16. exactamente cuatro premios y el ganador elige', () => {
  assert.equal(PRIZES.length, 4);
  let s = started(0);
  s = E.recordResult(s, E.currentQuestionId(s), 'correct').state; // gana 1
  while (s.phase !== E.PHASES.FINAL) s = E.advanceLevelEarly(s).state;
  assert.equal(s.winner, 1);
  assert.equal(E.choosePrize(s, 'inventado', PRIZES.map((p) => p.id)).ok, false);
  const r = E.choosePrize(s, 'romantico', PRIZES.map((p) => p.id));
  assert.ok(r.ok);
  assert.equal(r.state.prize, 'romantico');
});

test('estado restaurado se valida', () => {
  const s = E.createGame(5);
  assert.ok(E.isValidState(JSON.parse(JSON.stringify(s))));
  assert.equal(E.isValidState({ version: 99 }), false);
});
