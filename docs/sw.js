/* ¢ni Neon Climb — service worker v6 (game v2.0.0 "SPIRE")
   Strategy: network-first for the app shell (index.html) so updates land
   immediately when online; cache-first for immutable assets (sprites, icon,
   manifest); opaque cross-origin responses (fonts) cached best-effort. */
const CACHE = 'cni-neon-v6';
const SHELL = './index.html';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './icon-512.png',
  './cat.png', './cat_sandy.png', './cat_neon.png', './cat_cosmic.png',
  './cat_laser.png', './cat_glitch.png', './cat_diamond.png', './cat_god.png',
  './404.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isShell = req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/');

  if (isShell) {
    /* network-first: fresh game when online, cached shell offline */
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(SHELL, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(SHELL))
    );
    return;
  }

  /* cache-first for everything else (sprites, fonts, manifest) */
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(SHELL)))
  );
});
