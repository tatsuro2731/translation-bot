// あといくら家計簿 - シンプルな Service Worker
// - app shell (アイコン/マニフェスト/HTML) をキャッシュ
// - ナビゲーションは network-first → 失敗時に /home のキャッシュ
// - 画像/フォント/Next の静的アセットは stale-while-revalidate

const VERSION = "v1";
const SHELL = `atoikura-shell-${VERSION}`;
const RUNTIME = `atoikura-runtime-${VERSION}`;

const SHELL_URLS = [
  "/",
  "/home",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL && k !== RUNTIME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // 同一オリジンのみ扱う
  if (url.origin !== self.location.origin) return;

  // Next.js の HMR / RSC ストリームは触らない
  if (url.pathname.startsWith("/_next/data") ||
      url.pathname.startsWith("/_next/webpack-hmr")) {
    return;
  }

  // ナビゲーション (HTMLページ) は network-first
  const isNav = req.mode === "navigate" ||
                (req.headers.get("accept") || "").includes("text/html");
  if (isNav) {
    event.respondWith(networkFirst(req));
    return;
  }

  // それ以外は stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req));
});

async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
    const cache = await caches.open(RUNTIME);
    cache.put(req, fresh.clone()).catch(() => {});
    return fresh;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    const fallback = await caches.match("/home");
    if (fallback) return fallback;
    return new Response("オフラインです", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res && res.status === 200) cache.put(req, res.clone()).catch(() => {});
      return res;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
