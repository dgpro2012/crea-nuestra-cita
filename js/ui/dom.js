// Utilidades de interfaz: escape de texto, diálogo de confirmación accesible y avisos.

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function $(sel, root = document) {
  return root.querySelector(sel);
}

let lastFocus = null;

/**
 * Diálogo de confirmación. Devuelve una promesa con true/false.
 * opts: { title, body, confirm, cancel, danger }
 */
export function confirmDialog({ title, body = '', confirm = 'Confirmar', cancel = 'Cancelar', danger = false }) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal-root');
    lastFocus = document.activeElement;
    root.innerHTML = `
      <div class="modal-backdrop" data-modal-close></div>
      <div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-body">
        <h2 id="modal-title" class="modal-title">${esc(title)}</h2>
        ${body ? `<p id="modal-body" class="modal-body">${esc(body)}</p>` : ''}
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" data-modal-cancel>${esc(cancel)}</button>
          <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-modal-ok>${esc(confirm)}</button>
        </div>
      </div>`;
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add('open'));
    const close = (val) => {
      root.classList.remove('open');
      root.hidden = true;
      root.innerHTML = '';
      document.removeEventListener('keydown', onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      resolve(val);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
    };
    document.addEventListener('keydown', onKey);
    root.querySelector('[data-modal-ok]').addEventListener('click', () => close(true), { once: true });
    root.querySelector('[data-modal-cancel]').addEventListener('click', () => close(false), { once: true });
    root.querySelector('[data-modal-close]').addEventListener('click', () => close(false), { once: true });
    root.querySelector('[data-modal-cancel]').focus();
  });
}

let toastTimer = null;
export function toast(message, ms = 2600) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => (el.hidden = true), 300);
  }, ms);
}

export function banner(message, kind = 'warn') {
  const el = document.getElementById('banner');
  if (!el) return;
  if (!message) {
    el.hidden = true;
    el.textContent = '';
    return;
  }
  el.className = `banner banner-${kind}`;
  el.textContent = message;
  el.hidden = false;
}
