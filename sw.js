// Service Worker：アプリの全ファイルを端末に保存し、オフラインでも動作させる
// ※ index.html などを更新したら、下の CACHE_VERSION の数字を上げてください
const CACHE_VERSION = 'v3';
const CACHE_NAME = `scicalc-${CACHE_VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

// インストール時：全ファイルをキャッシュに保存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 有効化時：古いバージョンのキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 通信時：キャッシュを優先して返す（ネットが無くても動く）
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => {
        // ページ遷移でオフラインの場合はトップページを返す
        if (event.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
