// Pantalla final, desempate y catálogo de premios.
import { esc } from './dom.js';
import { avatar, heartsDecor } from './components.js';
import { PRIZES, PRIZE_RULES, TIEBREAK_QUESTIONS } from '../content.js';
import { other } from '../engine/index.js';

function finalScores(state, players) {
  return `
    <div class="final-scores">
      ${[0, 1]
        .map(
          (i) => `
        <div class="final-player ${state.winner === i ? 'is-winner' : ''}" data-testid="final-${i}">
          ${state.winner === i ? '<span class="crown" aria-hidden="true">👑</span>' : ''}
          ${avatar(players[i], { size: 'lg', ring: state.winner === i })}
          <span class="final-name">${esc(players[i].name)}</span>
          <span class="final-points"><b>${state.scores[i]}</b> pts</span>
        </div>`
        )
        .join('<span class="final-vs" aria-hidden="true">❤</span>')}
    </div>`;
}

export function renderFinal({ state, players }) {
  const tie = state.winner === null;
  const w = state.winner;
  let verdict;
  if (tie) {
    verdict = `<p class="verdict" data-testid="verdict">¡Empate con ${state.scores[0]} puntos cada uno! Toca una pregunta de desempate.</p>`;
  } else if (state.winnerBy === 'tiebreak') {
    verdict = `<p class="verdict" data-testid="verdict"><b>${esc(players[w].name)}</b> gana en el desempate. El marcador sigue empatado, pero el corazón ya decidió.</p>`;
  } else {
    verdict = `<p class="verdict" data-testid="verdict">¡Gana <b>${esc(players[w].name)}</b>!</p>`;
  }
  return `
    <section class="screen screen-final" aria-labelledby="final-title">
      ${heartsDecor()}
      <h1 id="final-title" class="title-xl center">¡Llegaron al final! ❤️</h1>
      <p class="lead center">Cinco niveles, muchas confesiones y una cita para recordar.</p>
      ${finalScores(state, players)}
      ${verdict}
      <div class="final-actions">
        ${
          tie
            ? '<button type="button" class="btn btn-primary btn-block btn-lg" data-action="start-tiebreak">Ir al desempate</button>'
            : `<button type="button" class="btn btn-primary btn-block btn-lg" data-action="open-prizes">${esc(players[w].name)}, elige tu premio 🎁</button>`
        }
        <button type="button" class="btn btn-ghost btn-block" data-action="new-game">Empezar una nueva cita</button>
        <button type="button" class="link-btn" data-action="go-cover">Volver a la portada</button>
      </div>
    </section>`;
}

export function renderTiebreak({ state, players }) {
  const tb = state.tiebreak;
  const g = tb.guesser;
  const s = other(g);
  const q = TIEBREAK_QUESTIONS[tb.qIndex];
  return `
    <section class="screen screen-tiebreak" aria-labelledby="tb-title">
      <p class="eyebrow center">Desempate · ronda ${tb.round}</p>
      <h1 id="tb-title" class="title-lg center">Una pregunta para decidirlo</h1>
      <p class="lead center">El marcador no cambia: ${state.scores[0]} – ${state.scores[1]}.</p>
      <article class="q-card" data-testid="tiebreak-card">
        <div class="q-turn">
          ${avatar(players[g], { size: 'md', ring: true })}
          <div><span class="q-turn-label">Adivina</span><span class="q-turn-name">${esc(players[g].name)}</span></div>
        </div>
        <ul class="roles"><li><span class="role-ico" aria-hidden="true">📖</span> Lee y evalúa: <b>${esc(players[s].name)}</b> (la pregunta es sobre ti)</li></ul>
        <h2 class="q-text" data-testid="tiebreak-q">${esc(q)}</h2>
        <p class="q-instruction">${tb.attempt === 1 ? `${esc(players[s].name)} falló su intento; ahora es el turno de ${esc(players[g].name)}.` : 'Si acierta, gana la cita.'}</p>
      </article>
      <div class="q-actions">
        <p class="judge-label">${esc(players[s].name)}, ¿${esc(players[g].name)} acertó?</p>
        <div class="judge-actions">
          <button type="button" class="btn btn-fail" data-action="tb-result" data-outcome="failed" data-step="${tb.step}">Falló</button>
          <button type="button" class="btn btn-primary" data-action="tb-result" data-outcome="correct" data-step="${tb.step}">Acertó</button>
        </div>
        <button type="button" class="link-btn" data-action="tb-result" data-outcome="unclear" data-step="${tb.step}">No hay una respuesta clara · otra pregunta</button>
      </div>
    </section>`;
}

export function renderPrizes({ state, players, selected }) {
  const w = state.winner;
  const partner = other(w);
  const chosen = state.prize ? PRIZES.find((p) => p.id === state.prize) : null;
  if (chosen) {
    return `
      <section class="screen screen-prize" aria-labelledby="prize-title">
        ${heartsDecor()}
        <p class="eyebrow center">Premio elegido</p>
        <div class="prize-hero">
          <span class="prize-emoji" aria-hidden="true">${chosen.emoji}</span>
          <span class="prize-tag">${esc(chosen.tag)}</span>
          <h1 id="prize-title" class="title-lg center">${esc(chosen.title)}</h1>
          <p class="prize-text">${esc(chosen.text)}</p>
          <p class="prize-who">${esc(players[partner].name)} se lo regala a ${esc(players[w].name)} ❤️</p>
        </div>
        <ul class="prize-rules">${PRIZE_RULES.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
        <div class="final-actions">
          <button type="button" class="btn btn-ghost btn-block" data-action="change-prize">Elegir otro premio</button>
          <button type="button" class="btn btn-primary btn-block" data-action="new-game">Empezar una nueva cita</button>
          <button type="button" class="link-btn" data-action="go-cover">Volver a la portada</button>
        </div>
      </section>`;
  }
  return `
    <section class="screen screen-prizes" aria-labelledby="prizes-title">
      <button type="button" class="back-btn" data-action="back-final" aria-label="Volver al marcador">←</button>
      <p class="eyebrow center">Premio para quien ganó</p>
      <h1 id="prizes-title" class="title-lg center">${esc(players[w].name)}, ¿qué te regala ${esc(players[partner].name)}?</h1>
      <div class="prize-grid" role="radiogroup" aria-label="Premios">
        ${PRIZES.map(
          (p) => `
          <button type="button" class="prize-card ${selected === p.id ? 'is-selected' : ''}" role="radio" aria-checked="${selected === p.id}"
            data-action="select-prize" data-prize="${p.id}" data-testid="prize-${p.id}">
            <span class="prize-emoji" aria-hidden="true">${p.emoji}</span>
            <span class="prize-tag">${esc(p.tag)}</span>
            <span class="prize-title">${esc(p.title)}</span>
            <span class="prize-text">${esc(p.text)}</span>
          </button>`
        ).join('')}
      </div>
      <ul class="prize-rules">${PRIZE_RULES.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      <div class="sticky-actions">
        <button type="button" class="btn btn-primary btn-block btn-lg" data-action="confirm-prize" ${selected ? '' : 'disabled'}>
          ${selected ? 'Elegir este premio 🎁' : 'Toca un premio'}
        </button>
      </div>
    </section>`;
}
