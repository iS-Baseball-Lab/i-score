// public/sw.js
const CACHE_NAME = 'iscore-v3'; // バージョンを上げて古いキャッシュを破棄させます

self.addEventListener('install', (e) => {
  self.skipWaiting(); // 新しいバージョンをすぐに有効化
});

self.addEventListener('activate', (e) => {
  // 古いバージョンの不要なキャッシュを綺麗に掃除する
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // GETリクエスト以外（データ保存など）や、Next.jsの開発用通信は無視
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) return;
  if (url.pathname.includes('/_next/webpack')) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // ⚾️ 【戦略 1】画像やNext.jsのシステムファイル（JS/CSS）は「キャッシュ優先」
    // 一度ダウンロードしたら、次からは通信せずにスマホの中から爆速で表示します。
    if (url.pathname.startsWith('/_next/static') || url.pathname.match(/\.(png|jpg|jpeg|svg|ico)$/)) {
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch (err) {
        return new Response('', { status: 408 });
      }
    }

    // ⚾️ 【戦略 2】画面（HTML）やAPIデータは「通信優先（Network First）」
    try {
      // 常に最新のデータを取りに行き、成功したら裏でキャッシュを更新（記憶）する
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      // 💡 圏外（オフライン）で通信に失敗した場合、すかさず記憶しておいたキャッシュを返す！
      const cached = await cache.match(req);
      if (cached) return cached;

      throw err; // 初回アクセスで圏外だった場合は諦める
    }
  })());
});
