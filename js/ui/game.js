// Pantallas del juego: quién empieza, introducción de nivel y pregunta.
import { esc } from './dom.js';
import { avatar, scoreboard } from './components.js';
import { LEVEL_TITLES, LEVEL_EMOJI } from '../content.js';
import { LEVEL_COUNT, QUESTIONS_PER_LEVEL } from '../data.js';
import { currentQuestion, getLevel, levelProgress, questionNumber, rolesFor, alternativesFor } from '../engine/index.js';

export function renderChooseStarter({ players, selected }) {
  const card = (i) => `
    <button type="button" class="starter-card ${selected === i ? 'is-selected' : ''}" data-action="select-starter" data-i="${i}"
      aria-pressed="${selected === i}" data-testid="starter-${i}">
      ${avatar(players[i], { size: 'xl', ring: selected === i })}
      <span class="starter-name">${esc(players[i].name)}</span>
      <span class="starter-check" aria-hidden="true">${selected === i ? '¡Yo me atrevo!' : 'Toca para elegir'}</span>
    </button>`;
  return `
    <section class="screen screen-starter" aria-labelledby="starter-title">
      <button type="button" class="back-btn" data-action="go-cover" aria-label="Volver a la portada">←</button>
      <h1 id="starter-title" class="title-lg center">¿Quién se atreve a empezar?</h1>
      <div class="starter-grid">${card(0)}${card(1)}</div>
      <div class="sticky-actions">
        <button type="button" class="btn btn-primary btn-block btn-lg" data-action="confirm-starter" ${selected === null ? 'disabled' : ''}>
          ${selected === null ? 'Elijan quién empieza' : `Empieza ${esc(players[selected].name)} ❤️`}
        </button>
      </div>
    </section>`;
}

export function renderLevelIntro({ state, players }) {
  const level = getLevel(state.level);
  const turnName = players[state.turn].name;
  return `
    <section class="screen screen-intro level-${level.id}" aria-labelledby="intro-title">
      <button type="button" class="back-btn" data-action="go-cover" aria-label="Pausar y volver a la portada">←</button>
      <div class="level-dots" aria-label="Nivel ${level.id} de ${LEVEL_COUNT}">
        ${Array.from({ length: LEVEL_COUNT }, (_, i) => `<span class="${i + 1 < level.id ? 'done' : i + 1 === level.id ? 'current' : ''}"></span>`).join('')}
      </div>
      <div class="intro-emblem" aria-hidden="true">${LEVEL_EMOJI[level.id]}</div>
      <p class="eyebrow">Nivel ${level.id} de ${LEVEL_COUNT}</p>
      <h1 id="intro-title" class="title-xl">${esc(LEVEL_TITLES[level.id])}</h1>
      <p class="intro-points">${level.points} ${level.points === 1 ? 'punto' : 'puntos'} por ${level.mode === 'guess' ? 'acierto' : 'respuesta completada'}</p>
      <blockquote class="intro-text" data-testid="level-intro">${esc(level.intro)}</blockquote>
      ${scoreboard(state, players, null)}
      <div class="sticky-actions">
        <button type="button" class="btn btn-primary btn-block btn-lg" data-action="start-level">Empezar · turno de ${esc(turnName)}</button>
      </div>
    </section>`;
}

export function renderQuestion({ state, players }) {
  const level = getLevel(state.level);
  const q = currentQuestion(state);
  const roles = rolesFor(state);
  const n = questionNumber(state);
  const prog = levelProgress(state);
  const pct = Math.round((prog.done / prog.total) * 100);
  const P = (i) => esc(players[i].name);
  const canWild = state.wildcards > 0 && alternativesFor(state).length > 0;

  const roleLine =
    roles.mode === 'guess'
      ? `<ul class="roles" aria-label="Roles de esta pregunta">
          <li><span class="role-ico" aria-hidden="true">📖</span> Lee y evalúa: <b>${P(roles.reader)}</b></li>
          <li><span class="role-ico" aria-hidden="true">🤔</span> Adivina: <b>${P(roles.guesser)}</b></li>
        </ul>`
      : `<ul class="roles" aria-label="Roles de esta pregunta">
          <li><span class="role-ico" aria-hidden="true">💬</span> Responde sobre sí: <b>${P(roles.answerer)}</b></li>
        </ul>`;

  const instruction =
    roles.mode === 'guess'
      ? `${P(roles.reader)}, lee la pregunta en voz alta. ${P(roles.guesser)} intenta adivinar.`
      : `${P(roles.answerer)}, responde con calma. Aquí no hay respuestas correctas.`;

  const mainActions =
    roles.mode === 'guess'
      ? `<p class="judge-label">${P(roles.evaluator)}, ¿${P(roles.guesser)} acertó?</p>
         <div class="judge-actions">
           <button type="button" class="btn btn-fail" data-action="result" data-outcome="failed" data-q="${q.id}">Falló</button>
           <button type="button" class="btn btn-primary" data-action="result" data-outcome="correct" data-q="${q.id}">Acertó <small>+${level.points}</small></button>
         </div>`
      : `<div class="judge-actions single">
           <button type="button" class="btn btn-primary btn-block btn-lg" data-action="result" data-outcome="answered" data-q="${q.id}">He respondido <small>+${level.points}</small></button>
         </div>`;

  return `
    <section class="screen screen-question level-${level.id}" aria-labelledby="q-text">
      <header class="game-top">
        <div class="game-top-row">
          <button type="button" class="back-btn inline" data-action="go-cover" aria-label="Pausar y volver a la portada">←</button>
          <div class="game-level">
            <span class="game-level-name">${LEVEL_EMOJI[level.id]} Nivel ${level.id} · ${esc(LEVEL_TITLES[level.id])}</span>
            <span class="game-count" data-testid="q-count">Pregunta ${n} de ${QUESTIONS_PER_LEVEL}</span>
          </div>
          <span class="wild-pill" title="Comodines restantes" data-testid="wildcards">🃏 <b>${state.wildcards}</b></span>
        </div>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${prog.total}" aria-valuenow="${prog.done}" aria-label="Progreso del nivel">
          <span style="width:${pct}%"></span>
        </div>
        ${scoreboard(state, players, state.turn)}
      </header>

      <article class="q-card" data-testid="question-card" data-qid="${q.id}">
        <div class="q-turn">
          ${avatar(players[state.turn], { size: 'md', ring: true })}
          <div><span class="q-turn-label">Turno de</span><span class="q-turn-name" data-testid="turn-name">${P(state.turn)}</span></div>
        </div>
        ${roleLine}
        <h2 class="q-text" id="q-text">${esc(q.text)}</h2>
        <p class="q-instruction">${instruction}</p>
      </article>

      <div class="q-actions">
        ${mainActions}
        <div class="secondary-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-action="skip" data-q="${q.id}">Pasar pregunta</button>
          <button type="button" class="btn btn-ghost btn-sm" data-action="wildcard" data-q="${q.id}" ${state.wildcards > 0 ? '' : 'disabled'}
            aria-describedby="wild-help">🃏 Cambiar pregunta</button>
        </div>
        <p class="tiny-help" id="wild-help">${
          state.wildcards > 0
            ? canWild
              ? `Quedan ${state.wildcards} ${state.wildcards === 1 ? 'comodín' : 'comodines'} para toda la cita.`
              : 'Ya no quedan otras preguntas en este nivel para cambiar.'
            : 'Ya usaron los tres comodines.'
        } Pasar no gasta comodines.</p>
        <button type="button" class="link-btn advance-btn" data-action="advance-level">${
          state.level < LEVEL_COUNT ? 'Avanzar al siguiente nivel →' : 'Terminar la cita →'
        }</button>
      </div>
    </section>`;
}
