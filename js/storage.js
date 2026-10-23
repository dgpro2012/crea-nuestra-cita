// Persistencia local. Todo queda en el dispositivo: nada se envía a servidores.
// IndexedDB guarda fotos (Blob) y el estado de la partida; localStorage guarda una copia
// de respaldo del estado (JSON pequeño) por si IndexedDB falla.
const DB_NAME = 'crea-nuestra-cita';
const DB_VERSION = 1;
const STORE = 'kv';
const LS_GAME = 'cita.game.backup';
const LS_PROFILES = 'cita.profiles.backup';

let dbPromise = null;
let lastError = null;
const listeners = new Set();

export function onStorageError(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function report(err, context) {
  lastError = { err, context };
  console.warn('[almacenamiento]', context, err);
  listeners.forEach((fn) => fn(lastError));
}
export function getLastStorageError() {
  return lastError;
}

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in self)) return reject(new Error('IndexedDB no disponible'));
    let req;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      return reject(e);
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB bloqueado'));
  }).catch((e) => {
    dbPromise = null;
    throw e;
  });
  return dbPromise;
}

async function tx(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    let result;
    const req = fn(store);
    if (req) req.onsuccess = () => (result = req.result);
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('Transacción abortada'));
  });
}

export async function idbGet(key) {
  return tx('readonly', (s) => s.get(key));
}
export async function idbSet(key, value) {
  return tx('readwrite', (s) => s.put(value, key));
}
export async function idbDel(key) {
  return tx('readwrite', (s) => s.delete(key));
}

function lsGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
function lsDel(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* sin acceso */
  }
}

export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

// ---------- Partida ----------

export async function saveGame(state) {
  const okLS = lsSet(LS_GAME, state);
  try {
    await idbSet('game', state);
    return true;
  } catch (e) {
    report(e, 'guardar partida');
    return okLS;
  }
}

export async function loadGame() {
  let fromIDB = null;
  try {
    fromIDB = await idbGet('game');
  } catch (e) {
    report(e, 'leer partida');
  }
  const fromLS = lsGet(LS_GAME);
  if (fromIDB && fromLS && fromIDB.id === fromLS.id) return (fromLS.rev || 0) > (fromIDB.rev || 0) ? fromLS : fromIDB;
  return fromIDB || fromLS || null;
}

export async function clearGame() {
  lsDel(LS_GAME);
  try {
    await idbDel('game');
  } catch (e) {
    report(e, 'borrar partida');
  }
}

// ---------- Perfiles y fotos ----------

export async function saveProfiles(names) {
  lsSet(LS_PROFILES, names);
  try {
    await idbSet('profiles', names);
    return true;
  } catch (e) {
    report(e, 'guardar perfiles');
    return false;
  }
}

export async function loadProfiles() {
  try {
    const p = await idbGet('profiles');
    if (p) return p;
  } catch (e) {
    report(e, 'leer perfiles');
  }
  return lsGet(LS_PROFILES);
}

/** Guarda una imagen (Blob). Si el navegador no admite Blob en IndexedDB, usa data URL. */
export async function saveImage(key, blob) {
  try {
    if (blob === null) {
      await idbDel(key);
      return true;
    }
    try {
      await idbSet(key, blob);
    } catch {
      await idbSet(key, await blobToDataURL(blob));
    }
    return true;
  } catch (e) {
    report(e, 'guardar foto');
    return false;
  }
}

/** Devuelve una URL lista para <img> o null. */
export async function loadImageURL(key) {
  try {
    const v = await idbGet(key);
    if (!v) return null;
    if (typeof v === 'string') return v;
    return URL.createObjectURL(v);
  } catch (e) {
    report(e, 'leer foto');
    return null;
  }
}

export async function hasImage(key) {
  try {
    return !!(await idbGet(key));
  } catch {
    return false;
  }
}

// ---------- Borrado total ----------

export async function wipeAll() {
  lsDel(LS_GAME);
  lsDel(LS_PROFILES);
  try {
    localStorage.removeItem('cita.prefs');
  } catch {
    /* nada */
  }
  try {
    const db = await openDB();
    db.close();
  } catch {
    /* nada */
  }
  dbPromise = null;
  await new Promise((resolve) => {
    try {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    } catch {
      resolve();
    }
  });
}

/** Pide al navegador que no borre los datos automáticamente (si lo admite). */
export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist();
  } catch {
    /* nada */
  }
  return false;
}
