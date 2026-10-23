// Navegación, orquestación de acciones y arranque de la aplicación.
import * as E from './engine/index.js';
import * as S from './storage.js';
import { resizeImage } from './images.js';
import { PRIZES } from './content.js';
import { LEVEL_TITLES } from './content.js';
import { $, confirmDialog, toast, banner } from './ui/dom.js';
import { renderProfiles } from './ui/profiles.js';
import { renderCover } from './ui/cover.js';
import { renderChooseStarter, renderLevelIntro, renderQuestion } from './ui/game.js';
import { renderFinal, renderTiebreak, renderPrizes } from './ui/final.js';

const DEFAULT_COVER = 'img/portada.jpg';

const app = {
  route: 'loading', // setup | cover | game
  editing: false,
  names: ['', ''],
  photos: [null, null],
  coverURL: DEFAULT_COVER,
  coverCustom: false,
  game: null,
  draft: null,
  ui: { starter: null, prize: null },
  busy: false,
};

const root = () => document.getElementById('app');
const players = () => [
  { name: app.names[0], photo: app.photos[0] },
  { name: app.names[1], photo: app.photos[1] },
];

// ---------------- Render ----------------

let lastScreenKey = '';
function render() {
  let html = '';
  let key = app.route;
  if (app.route === 'setup') {
    html = renderProfiles(app.draft, { editing: app.editing });
  } else if (app.route === 'cover') {
    html = renderCover({ coverURL: app.coverURL, players: players(), savedGame: savedGameSummary(), coverCustom: app.coverCustom });
  } else if (app.route === 'game' && app.game) {
    const g = app.game;
    const ctx = { state: g, players: players() };
    key = `game-${g.phase}-${g.level}-${E.currentQuestionId(g) || ''}-${g.tiebreak?.step ?? ''}-${g.prize || ''}`;
    switch (g.phase) {
      case E.PHASES.CHOOSE_STARTER:
        html = renderChooseStarter({ players: players(), selected: app.ui.starter });
        key = 'starter';
        break;
      case E.PHASES.LEVEL_INTRO:
        html = renderLevelIntro(ctx);
        break;
      case E.PHASES.QUESTION:
        html = renderQuestion(ctx);
        break;
      case E.PHASES.FINAL:
        html = renderFinal(ctx);
        break;
      case E.PHASES.TIEBREAK:
        html = renderTiebreak(ctx);
        break;
      case E.PHASES.PRIZE:
        html = renderPrizes({ ...ctx, selected: app.ui.prize });
        if (!g.prize) key = 'prizes';
        break;
    }
  }
  const el = root();
  const changedScreen = key !== lastScreenKey;
  el.innerHTML = html;
  el.dataset.route = app.route;
  if (changedScreen) {
    const screen = el.firstElementChild;
    if (screen) {
      screen.classList.add('enter');
      window.scrollTo({ top: 0 });
      const h = screen.querySelector('h1, h2');
      if (h && app.route !== 'setup') {
        h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
      }
    }
  }
  lastScreenKey = key;
  const img = $('#cover-img');
  if (img) {
    img.addEventListener('error', () => {
      if (img.src.indexOf(DEFAULT_COVER) === -1) img.src = DEFAULT_COVER;
      else {
        img.closest('.cover-photo').classList.add('missing');
        banner('No se pudo cargar la foto de portada. Ábrela una vez con internet o elige otra en «Editar perfiles».');
      }
    });
  }
}

function savedGameSummary() {
  const g = app.game;
  if (!g) return null;
  let label;
  if (g.phase === E.PHASES.CHOOSE_STARTER) label = 'por empezar';
  else if (g.status === 'finished') label = 'terminada';
  else label = `Nivel ${g.level} · ${LEVEL_TITLES[g.level]}`;
  return { label: `${label} · ${g.scores[0]}–${g.scores[1]}` };
}

// ---------------- Estado de partida ----------------

async function commit(result, { silentError = false } = {}) {
  if (!result.ok) {
    if (!silentError) handleEngineError(result.error);
    return false;
  }
  const next = result.state;
  next.rev = (app.game?.rev || 0) + 1;
  next.updatedAt = Date.now();
  app.game = next;
  render();
  const saved = await S.saveGame(next);
  if (!saved) banner('No se pudo guardar el progreso en este dispositivo. Pueden seguir jugando, pero si cierran la app podría perderse.', 'error');
  return true;
}

function handleEngineError(err) {
  const msg = {
    no_alternatives: 'No quedan otras preguntas en este nivel. El comodín no se gastó.',
    no_wildcards: 'Ya usaron los tres comodines de la cita.',
    stale_question: null,
    already_resolved: null,
    stale_step: null,
  }[err];
  if (msg) toast(msg);
}

/**
 * Evita dobles toques: no se ejecuta una acción mientras otra está en curso, ni se repite
 * la misma acción en menos de 350 ms. (El motor además rechaza resultados duplicados.)
 */
let lastAction = { key: '', at: 0 };
async function guarded(key, fn) {
  const now = Date.now();
  if (app.busy || (key === lastAction.key && now - lastAction.at < 350)) return;
  lastAction = { key, at: now };
  app.busy = true;
  try {
    await fn();
  } finally {
    app.busy = false;
    lastAction.at = Date.now();
  }
}

// ---------------- Acciones ----------------

const actions = {
  // Perfiles
  async 'save-profiles'() {
    const d = app.draft;
    const names = d.names.map((n) => n.trim());
    const err = $('#setup-error');
    if (!names[0] || !names[1]) {
      err.textContent = 'Escriban el nombre o apodo de las dos personas.';
      err.hidden = false;
      $(`#name-${names[0] ? 1 : 0}`).focus();
      return;
    }
    for (const i of [0, 1]) {
      if (d.blobs[i] !== undefined) await S.saveImage(`photo${i}`, d.blobs[i]);
    }
    if (d.coverBlob !== undefined) {
      if (d.coverBlob === null) await storeDefaultCover(true);
      else {
        await S.saveImage('cover', d.coverBlob);
        await S.idbSet('coverCustom', true).catch(() => {});
      }
    }
    await S.saveProfiles({ names });
    app.names = names;
    app.photos = d.photos.slice();
    app.coverURL = d.cover || DEFAULT_COVER;
    app.coverCustom = d.coverCustom;
    app.draft = null;
    app.editing = false;
    app.route = 'cover';
    render();
  },
  'cancel-profiles'() {
    app.draft = null;
    app.editing = false;
    app.route = 'cover';
    render();
  },
  'remove-photo'(el) {
    const i = Number(el.dataset.i);
    app.draft.photos[i] = null;
    app.draft.blobs[i] = null;
    render();
  },
  'reset-cover'() {
    app.draft.cover = DEFAULT_COVER;
    app.draft.coverBlob = null;
    app.draft.coverCustom = false;
    render();
  },
  'edit-profiles'() {
    openSetup(true);
  },

  // Portada
  async 'new-game'() {
    if (app.game) {
      const ok = await confirmDialog({
        title: '¿Empezar una nueva cita?',
        body: 'Se borrará la partida guardada (puntos, nivel y preguntas). Sus perfiles y fotos se conservan.',
        confirm: 'Sí, empezar de nuevo',
        cancel: 'Mejor no',
        danger: true,
      });
      if (!ok) return;
      await S.clearGame();
    }
    app.ui = { starter: null, prize: null };
    app.game = null;
    await commit({ ok: true, state: E.createGame() });
    app.route = 'game';
    render();
  },
  'continue-game'() {
    app.route = 'game';
    render();
  },
  'go-cover'() {
    app.route = 'cover';
    render();
  },
  async 'wipe-data'() {
    const ok = await confirmDialog({
      title: '¿Borrar todos los datos?',
      body: 'Se eliminarán de este teléfono los nombres, las fotos de perfil, la portada personalizada y la partida guardada. No se puede deshacer.',
      confirm: 'Borrar todo',
      cancel: 'Cancelar',
      danger: true,
    });
    if (!ok) return;
    await S.wipeAll();
    app.names = ['', ''];
    app.photos = [null, null];
    app.coverURL = DEFAULT_COVER;
    app.coverCustom = false;
    app.game = null;
    await storeDefaultCover();
    toast('Datos borrados de este teléfono.');
    openSetup(false);
  },

  // Quién empieza
  'select-starter'(el) {
    app.ui.starter = Number(el.dataset.i);
    render();
  },
  async 'confirm-starter'() {
    if (app.ui.starter === null) return;
    await commit(E.chooseStarter(app.game, app.ui.starter));
  },

  // Juego
  async 'start-level'() {
    await commit(E.startLevel(app.game));
  },
  async result(el) {
    const prev = app.game;
    const ok = await commit(E.recordResult(prev, el.dataset.q, el.dataset.outcome), { silentError: true });
    if (ok && app.game.level !== prev.level && app.game.phase === E.PHASES.LEVEL_INTRO) toast('¡Nivel completado! ✨');
  },
  async skip(el) {
    await commit(E.skipQuestion(app.game, el.dataset.q), { silentError: true });
  },
  async wildcard(el) {
    const g = app.game;
    if (g.wildcards <= 0) return toast('Ya usaron los tres comodines de la cita.');
    if (E.alternativesFor(g).length === 0) return toast('No quedan otras preguntas en este nivel. El comodín no se gastó.');
    const ok = await confirmDialog({
      title: '¿Usar un comodín?',
      body: `Cambiarán esta pregunta por otra del mismo nivel. Les quedarán ${g.wildcards - 1} de 3.`,
      confirm: 'Usar comodín 🃏',
      cancel: 'Cancelar',
    });
    if (!ok) return;
    if (await commit(E.useWildcard(app.game, el.dataset.q))) toast('Pregunta cambiada 🃏');
  },
  async 'advance-level'() {
    const g = app.game;
    const last = g.level >= 5;
    const pending = 20 - g.levels[g.level].pos;
    const ok = await confirmDialog({
      title: last ? '¿Terminar la cita ahora?' : '¿Avanzar al siguiente nivel?',
      body: `Quedan ${pending} ${pending === 1 ? 'pregunta' : 'preguntas'} en este nivel. Quedarán sin puntos y no se pueden recuperar. Los puntos que ya tienen no cambian.`,
      confirm: last ? 'Terminar' : 'Avanzar',
      cancel: 'Seguir aquí',
    });
    if (!ok) return;
    await commit(E.advanceLevelEarly(app.game));
  },

  // Final
  async 'start-tiebreak'() {
    await commit(E.startTiebreak(app.game));
  },
  async 'tb-result'(el) {
    const prev = app.game;
    const ok = await commit(E.resolveTiebreak(prev, el.dataset.outcome, Number(el.dataset.step)), { silentError: true });
    if (ok && el.dataset.outcome === 'failed' && app.game.phase === E.PHASES.TIEBREAK) {
      toast(app.game.tiebreak.attempt === 0 ? 'Ninguno acertó. ¡Otra pregunta!' : 'Ahora le toca a la otra persona.');
    }
  },
  'open-prizes'() {
    app.ui.prize = null;
    const g = E.clone(app.game);
    g.phase = E.PHASES.PRIZE;
    g.prize = null;
    commit({ ok: true, state: g });
  },
  'select-prize'(el) {
    app.ui.prize = el.dataset.prize;
    render();
  },
  async 'confirm-prize'() {
    if (!app.ui.prize) return;
    await commit(E.choosePrize(app.game, app.ui.prize, PRIZES.map((p) => p.id)));
  },
  'change-prize'() {
    app.ui.prize = app.game.prize;
    const g = E.clone(app.game);
    g.prize = null;
    commit({ ok: true, state: g });
  },
  async 'back-final'() {
    await commit(E.backToFinal(app.game));
  },
};

function openSetup(editing) {
  app.editing = editing;
  app.draft = {
    names: app.names.slice(),
    photos: app.photos.slice(),
    blobs: [undefined, undefined],
    cover: app.coverURL,
    coverBlob: undefined,
    coverCustom: app.coverCustom,
  };
  app.route = 'setup';
  render();
}

// ---------------- Eventos ----------------

function bindEvents() {
  root().addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = actions[el.dataset.action];
    if (!fn) return;
    e.preventDefault();
    const key = `${el.dataset.action}:${el.dataset.q || ''}:${el.dataset.step || ''}:${el.dataset.i || ''}`;
    guarded(key, () => fn(el));
  });

  root().addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.name !== undefined && app.draft) {
      app.draft.names[Number(t.dataset.name)] = t.value;
      const err = $('#setup-error');
      if (err) err.hidden = true;
    }
  });

  root().addEventListener('change', async (e) => {
    const t = e.target;
    if (!app.draft || !t.files || !t.files[0]) return;
    const file = t.files[0];
    try {
      if (t.dataset.photo !== undefined) {
        const i = Number(t.dataset.photo);
        const blob = await resizeImage(file, { max: 480, square: true });
        app.draft.blobs[i] = blob;
        app.draft.photos[i] = URL.createObjectURL(blob);
      } else if (t.dataset.cover !== undefined) {
        const blob = await resizeImage(file, { max: 1400, quality: 0.86 });
        app.draft.coverBlob = blob;
        app.draft.cover = URL.createObjectURL(blob);
        app.draft.coverCustom = true;
      }
      render();
    } catch (err) {
      toast('No se pudo usar esa imagen. Prueben con otra foto.');
      console.warn(err);
    }
  });

  window.addEventListener('online', updateOnline);
  window.addEventListener('offline', updateOnline);
}

function updateOnline() {
  const el = document.getElementById('net-pill');
  if (el) el.hidden = navigator.onLine;
}

// ---------------- Portada guardada en el dispositivo ----------------

async function storeDefaultCover(force = false) {
  try {
    if (!force && (await S.hasImage('cover'))) return;
    const res = await fetch(DEFAULT_COVER);
    if (!res.ok) throw new Error('portada no disponible');
    const blob = await res.blob();
    await S.saveImage('cover', blob);
    await S.idbSet('coverCustom', false).catch(() => {});
  } catch (e) {
    console.warn('No se pudo copiar la portada al almacenamiento local', e);
  }
}

// ---------------- Arranque ----------------

async function boot() {
  S.onStorageError(() =>
    banner('Este navegador no permite guardar datos (¿modo privado?). Pueden jugar, pero el progreso podría perderse al cerrar.', 'error')
  );
  bindEvents();
  updateOnline();

  await storeDefaultCover();
  const [profiles, p0, p1, cover, coverCustom, game] = await Promise.all([
    S.loadProfiles(),
    S.loadImageURL('photo0'),
    S.loadImageURL('photo1'),
    S.loadImageURL('cover'),
    S.idbGet('coverCustom').catch(() => false),
    S.loadGame(),
  ]);
  app.coverURL = cover || DEFAULT_COVER;
  app.coverCustom = !!coverCustom;
  if (game && E.isValidState(game)) app.game = game;
  else if (game) {
    banner('La partida guardada estaba dañada y no se pudo recuperar.', 'error');
    await S.clearGame();
  }

  if (profiles && profiles.names && profiles.names[0] && profiles.names[1]) {
    app.names = profiles.names;
    app.photos = [p0, p1];
    app.route = 'cover';
    render();
  } else {
    openSetup(false);
  }
  S.requestPersistence();
  window.__citaReady = true;
  document.documentElement.classList.add('ready');
}

// Service worker (offline). Solo en contextos seguros (https o localhost).
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('sw.js')
      .then((reg) => {
        window.__swRegistration = reg;
      })
      .catch((e) => console.warn('Service worker no registrado', e));
  });
}

boot().catch((e) => {
  console.error(e);
  window.__citaBootError = String(e);
  banner('Algo falló al abrir la cita. Recarguen la página; su progreso guardado no se ha borrado.', 'error');
});

// Exponer para pruebas automáticas (no contiene datos externos).
window.__cita = { app, E };
