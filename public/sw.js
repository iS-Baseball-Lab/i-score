// public/sw.js
// 💡 キャッシュ名を v2 に変更して、スマホに「新しい設定が来たぞ！」と認識させます
const CACHE_NAME = 'iscore-cache-v2';

// 💡 最初に絶対に保存しておくべきリスト（Precache）
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/logo.png'
];

// 1. インストール時：必須ファイルを強制的にキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('必須ファイルをキャッシュしました');
      // 例外が起きても止まらないように、一つずつ安全にキャッシュします
      return Promise.allSettled(PRECACHE_URLS.map(url => cache.add(url)));
    })
  );
  self.skipWaiting();
});

// 2. アクティベート時：古いバージョンのキャッシュを掃除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 3. 通信の傍受とキャッシュ戦略
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http') || event.request.method !== 'GET') return;
  // Next.jsの開発用通信などは無視
  if (event.request.url.includes('_next/webpack') || event.request.url.includes('__nextjs')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // ⚾️ キャッシュがあれば、それを一瞬で返す（裏でこっそり最新化）
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }).catch(() => {}); // オフライン時は無視
        return cachedResponse;
      }

      // ⚾️ キャッシュがない場合は通信する
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(async () => {
        // ⚾️ 圏外（オフライン）で、かつキャッシュにも無かった場合の最終手段！
        
        // もし画面遷移（HTMLの要求）であれば、強制的にダッシュボードのキャッシュを表示する
        if (event.request.mode === 'navigate') {
          const fallbackCache = await caches.match('/dashboard') || await caches.match('/');
          if (fallbackCache) return fallbackCache;
        }
        
        // それでもダメならそのままエラー（恐竜画面など）
        throw new Error('Offline and no cache available');
      });
    })
  );
});
