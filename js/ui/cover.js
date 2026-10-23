// Portada romántica con la foto de la pareja.
import { esc } from './dom.js';
import { avatar } from './components.js';

export function renderCover({ coverURL, players, savedGame, coverCustom }) {
  const hasProgress = !!savedGame;
  const actions = hasProgress
    ? `<button type="button" class="btn btn-primary btn-block btn-lg" data-action="continue-game">Continuar nuestra cita ❤️</button>
       <button type="button" class="btn btn-ghost btn-block" data-action="new-game">Empezar una nueva cita</button>`
    : `<button type="button" class="btn btn-primary btn-block btn-lg" data-action="new-game">Comenzar nuestra cita ❤️</button>`;
  return `
    <section class="screen screen-cover" aria-labelledby="cover-title">
      <div class="cover-photo">
        <img src="${esc(coverURL)}" alt="Nuestra foto de pareja" id="cover-img" fetchpriority="high">
        <div class="cover-fade" aria-hidden="true"></div>
      </div>
      <div class="cover-content">
        <div class="cover-couple" aria-label="${esc(players[0].name)} y ${esc(players[1].name)}">
          ${avatar(players[0], { size: 'sm' })}<span class="cover-amp">&amp;</span>${avatar(players[1], { size: 'sm' })}
        </div>
        <h1 id="cover-title" class="cover-title">Entre todas las personas del mundo, hoy volvemos a elegirnos.</h1>
        <p class="cover-sub">Cinco niveles para descubrir cuánto nos conocemos, atrevernos a hablar y acercarnos aún más.</p>
        ${hasProgress ? `<p class="cover-progress">Tienen una cita guardada · ${esc(savedGame.label)}</p>` : ''}
        ${coverCustom ? '' : '<button type="button" class="link-btn" data-action="edit-profiles">📷 Agregar nuestra foto de portada</button>'}
        <div class="cover-actions">${actions}</div>
        <nav class="cover-links" aria-label="Opciones">
          <button type="button" class="link-btn" data-action="edit-profiles">Editar perfiles y portada</button>
          <span aria-hidden="true">·</span>
          <button type="button" class="link-btn link-quiet" data-action="wipe-data">Borrar datos guardados</button>
        </nav>
      </div>
    </section>`;
}
