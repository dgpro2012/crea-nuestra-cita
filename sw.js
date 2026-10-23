// Service worker: guarda todos los recursos en caché para jugar sin conexión.
// Cambia VERSION al publicar una actualización para que los teléfonos descarguen los archivos nuevos.
const VERSION = 'cita-v1.0.0';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'fonts/dm-sans-latin-400-normal.woff2',
  'fonts/dm-sans-latin-500-normal.woff2',
  'fonts/dm-sans-latin-700-normal.woff2',
  'fonts/fraunces-latin-400-italic.woff2',
  'fonts/fraunces-latin-400-normal.woff2',
  'fonts/fraunces-latin-600-normal.woff2',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512-maskable.png',
  'icons/icon-512.png',
  'img/portada.jpg',
  'js/app.js',
  'js/content.js',
  'js/data.js',
  'js/engine/index.js',
  'js/engine/levels.js',
  'js/engine/scoring.js',
  'js/engine/state.js',
  'js/engine/tiebreak.js',
  'js/engine/turns.js',
  'js/engine/wildcards.js',
  'js/images.js',
  'js/storage.js',
  'js/ui/components.js',
  'js/ui/cover.js',
  'js/ui/dom.js',
  'js/ui/final.js',
  'js/ui/game.js',
  'js/ui/profiles.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // la app no usa recursos externos

  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html').then((cached) => cached || fetch(req)).catch(() => caches.match('index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
