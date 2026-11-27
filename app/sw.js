// Service worker Absen Online: menyimpan tampilan aplikasi supaya cepat terbuka.
// Data absen selalu diambil langsung dari server (tidak disimpan di cache).
// Naikkan angka VERSI setiap kali file aplikasi diubah.
const VERSI = 'absen-v1';
const FILES = ['./', './index.html', './config.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSI).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Ambil versi terbaru dari internet dulu; kalau offline, pakai yang tersimpan.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const salin = res.clone();
      caches.open(VERSI).then(c => c.put(e.request, salin));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
