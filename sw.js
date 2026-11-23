/* Service worker RentFleet — aset statis cache-first (instan & tetap terbuka saat sinyal lemah),
 * font & pustaka luar stale-while-revalidate, permintaan ke Google Apps Script SELALU ke jaringan. */
const VERSI = 'rentfleet-v1.0.0';
const ASET = [
  './', './index.html', './manifest.json', './css/style.css?v=1.0.0', './css/panel.css?v=1.0.0',
  './js/config.js?v=1.0.0', './js/core.js?v=1.0.0', './js/landing.js?v=1.0.0',
  './js/panel.js?v=1.0.0', './js/hal-operasional.js?v=1.0.0', './js/hal-lapangan.js?v=1.0.0', './js/hal-keuangan.js?v=1.0.0', './js/hal-admin.js?v=1.0.0',
  './js/struk-engine.js?v=1.0.0', './js/struk-printer.js?v=1.0.0', './js/struk-ui.js?v=1.0.0', './js/vendor/qrcode.js?v=2.0.4',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon.svg'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSI).then(function (c) { return Promise.all(ASET.map(function (u) { return c.add(u).catch(function () { }); })); }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== VERSI; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;                                                   // POST ke API tidak disentuh
  if (/script\.google(usercontent)?\.com$/.test(url.hostname) || /accounts\.google\.com$/.test(url.hostname)) return;   // API & login: jaringan
  if (/drive\.google\.com|googleusercontent\.com/.test(url.hostname)) {               // foto katalog: cache saat online
    e.respondWith(caches.open(VERSI + '-img').then(function (c) { return c.match(req).then(function (hit) { const net = fetch(req).then(function (r) { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(function () { return hit; }); return hit || net; }); }));
    return;
  }
  if (url.origin !== location.origin) {                                               // font & CDN: stale-while-revalidate
    e.respondWith(caches.open(VERSI + '-ext').then(function (c) { return c.match(req).then(function (hit) { const net = fetch(req).then(function (r) { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(function () { return hit; }); return hit || net; }); }));
    return;
  }
  if (req.mode === 'navigate') {                                                      // halaman: jaringan dulu, cadangan cache
    e.respondWith(fetch(req).then(function (r) { const cp = r.clone(); caches.open(VERSI).then(function (c) { c.put('./index.html', cp); }); return r; }).catch(function () { return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) { return hit || fetch(req).then(function (r) { if (r && r.ok) { const cp = r.clone(); caches.open(VERSI).then(function (c) { c.put(req, cp); }); } return r; }); }));
});
