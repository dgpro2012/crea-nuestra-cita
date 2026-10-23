// Pantalla de configuración de los dos perfiles (nombre + foto) y foto de portada.
import { esc } from './dom.js';
import { avatar } from './components.js';

export function renderProfiles(draft, { editing }) {
  const card = (i) => `
    <fieldset class="profile-card">
      <legend class="sr-only">Persona ${i + 1}</legend>
      <label class="photo-picker" for="photo-${i}">
        ${avatar({ name: draft.names[i] || `Persona ${i + 1}`, photo: draft.photos[i] }, { size: 'xl' })}
        <span class="photo-picker-badge" aria-hidden="true">${draft.photos[i] ? '✎' : '+'}</span>
        <span class="sr-only">${draft.photos[i] ? 'Cambiar' : 'Subir'} foto de la persona ${i + 1}</span>
      </label>
      <input class="sr-only" type="file" id="photo-${i}" accept="image/*" data-photo="${i}">
      <span class="photo-hint">${draft.photos[i] ? 'Toca la foto para cambiarla' : 'Toca para subir una foto'}</span>
      <label class="field">
        <span class="field-label">Nombre o apodo</span>
        <input type="text" inputmode="text" autocomplete="off" autocapitalize="words" maxlength="24"
          id="name-${i}" data-name="${i}" value="${esc(draft.names[i])}" placeholder="${i === 0 ? 'Ej.: Ana' : 'Ej.: Leo'}" required>
      </label>
      ${draft.photos[i] ? `<button type="button" class="link-btn" data-action="remove-photo" data-i="${i}">Quitar foto</button>` : ''}
    </fieldset>`;

  return `
    <section class="screen screen-setup" aria-labelledby="setup-title">
      <header class="setup-head">
        <p class="eyebrow">Crea nuestra cita ❤️</p>
        <h1 id="setup-title" class="title-lg">${editing ? 'Editar perfiles' : 'Antes de empezar'}</h1>
        <p class="lead">Cada uno escribe su nombre y elige una foto. Todo se guarda solo en este teléfono.</p>
      </header>
      <div class="profiles-grid">${card(0)}<div class="profiles-amp" aria-hidden="true">&amp;</div>${card(1)}</div>

      <details class="cover-settings" ${draft.coverCustom ? '' : 'open'}>
        <summary>Foto de portada ${draft.coverCustom ? '' : '· elijan su foto de pareja'}</summary>
        <div class="cover-settings-body">
          <img class="cover-thumb" src="${esc(draft.cover || 'img/portada.jpg')}" alt="Foto de portada actual">
          <div class="cover-settings-actions">
            <label class="btn btn-ghost btn-sm" for="cover-input">Cambiar portada</label>
            <input class="sr-only" type="file" id="cover-input" accept="image/*" data-cover>
            ${draft.coverCustom ? '<button type="button" class="link-btn" data-action="reset-cover">Quitar foto de portada</button>' : ''}
          </div>
        </div>
      </details>

      <p class="form-error" id="setup-error" role="alert" hidden></p>
      <div class="sticky-actions">
        ${editing ? '<button type="button" class="btn btn-ghost" data-action="cancel-profiles">Cancelar</button>' : ''}
        <button type="button" class="btn btn-primary btn-block" data-action="save-profiles">${editing ? 'Guardar cambios' : 'Guardar y continuar'}</button>
      </div>
    </section>`;
}
