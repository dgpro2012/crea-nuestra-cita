// Componentes visuales reutilizables.
import { esc } from './dom.js';

export function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/);
  return (parts[0]?.[0] || '?').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
}

export function avatar(player, { size = 'md', ring = false, cls = '' } = {}) {
  const name = player?.name || '';
  const inner = player?.photo
    ? `<img src="${esc(player.photo)}" alt="" draggable="false">`
    : `<span class="avatar-initials" aria-hidden="true">${esc(initials(name))}</span>`;
  return `<span class="avatar avatar-${size} ${ring ? 'avatar-ring' : ''} ${cls}" role="img" aria-label="Foto de ${esc(name)}">${inner}</span>`;
}

export function scoreboard(state, players, highlight = null) {
  return `
    <div class="scoreboard" aria-label="Marcador">
      ${[0, 1]
        .map(
          (i) => `
        <div class="score-chip ${highlight === i ? 'is-active' : ''}" data-testid="score-${i}">
          ${avatar(players[i], { size: 'sm', ring: highlight === i })}
          <span class="score-name">${esc(players[i].name)}</span>
          <span class="score-value" aria-label="${state.scores[i]} puntos"><b data-score="${i}">${state.scores[i]}</b> pts</span>
        </div>`
        )
        .join('')}
    </div>`;
}

export function heartsDecor() {
  return `<div class="hearts-decor" aria-hidden="true">${'<span>❤</span>'.repeat(9)}</div>`;
}
