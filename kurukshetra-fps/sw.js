/**
 * sw.js — service worker for Kurukshetra FPS (desktop / PC, Chrome installable).
 *
 * Goals:
 *   1. Installability + an offline app shell (top-level navigations resolve even
 *      with no network).
 *   2. True offline PLAY: the app's code (entry chunk + three.js) is precached at
 *      install; the rest of the asset graph (lazy chunks, GLB models, textures) is
 *      cached on first use, so once you've played online the game runs offline.
 *   3. Safe, prompt-driven updates: a new build installs but WAITS — it never swaps
 *      code under a running match. The page (src/desktop/settings/pwa.js) shows an
 *      "update available" prompt and posts {type:'SKIP_WAITING'} when the player
 *      accepts; only then does the new worker take over and the page reload.
 *
 * Caching strategy (all SAME-ORIGIN; cross-origin requests — e.g. OSM map tiles
 * for custom maps — are never intercepted):
 *   - navigations          -> network-first, fall back to the cached app shell
 *   - /assets/*, /icons/*  -> cache-first  (content-hashed + immutable)
 *   - /models/*, /textures/*, manifest -> stale-while-revalidate
 *   - anything else        -> passthrough (no interception). This is what keeps the
 *     Vite dev server + HMR working: dev modules live under /src, /@vite,
 *     /node_modules and are never touched.
 *
 * Bumping CACHE_VERSION invalidates every old cache on activate.
 */

const CACHE_VERSION = 'v2';
const APP_VERSION = '2.0.0';
const SHELL_CACHE = `kurukshetra-pc-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `kurukshetra-pc-runtime-${CACHE_VERSION}`;
const CACHE_ALLOWLIST = [SHELL_CACHE, RUNTIME_CACHE];

// Resolve scope-relative URLs (works whether installed at site root or a subfolder).
const ROOT_URL = new URL('./', self.location.href).href;
const INDEX_URL = new URL('./index.html', self.location.href).href;
const BASE_PATH = new URL('./', self.location.href).pathname;
const seg = (folder) => BASE_PATH + folder;

// App shell — small, always-precached, never-hashed entry points.
const SHELL_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
].map((p) => new URL(p, self.location.href).href);

// ── install: precache the shell + the built JS entry graph from index.html ──────
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cacheAllSettled(cache, SHELL_URLS);
    await precacheBuiltAssets(cache);
    // Intentionally NO self.skipWaiting(): wait for the page's update prompt.
  })());
});

// ── activate: drop stale caches, take control of open clients ───────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith('kurukshetra-pc-') && !CACHE_ALLOWLIST.includes(k))
        .map((k) => caches.delete(k)),
    );
    await self.clients.claim();
  })());
});

// ── messages: prompt-driven activation + version query ──────────────────────────
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') { self.skipWaiting(); return; }
  if (data.type === 'GET_VERSION') {
    const payload = { type: 'VERSION', version: APP_VERSION, caches: CACHE_ALLOWLIST };
    const port = event.ports && event.ports[0];
    if (port) port.postMessage(payload);
    else if (event.source) event.source.postMessage(payload);
  }
});

// ── fetch routing ───────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.headers.has('range')) return; // let the browser handle byte-range media

  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return; // cross-origin: passthrough

  if (req.mode === 'navigate') { event.respondWith(handleNavigate(req)); return; }

  const p = url.pathname;
  if (isImmutableAsset(p)) { event.respondWith(cacheFirst(req)); return; }
  if (isRuntimeAsset(p)) { event.respondWith(staleWhileRevalidate(req)); return; }
  // Everything else (dev modules under /src, /@vite, /node_modules, etc.):
  // no respondWith -> default network. Keeps Vite dev + HMR untouched.
});

// ── path classifiers ────────────────────────────────────────────────────────────
function isImmutableAsset(pathname) {
  // Content-hashed build chunks + icons: safe to serve cache-first.
  return pathname.startsWith(seg('assets/')) || pathname.startsWith(seg('icons/'));
}
function isRuntimeAsset(pathname) {
  // Stable-named assets that may change across versions: revalidate in background.
  return (
    pathname.startsWith(seg('models/')) ||
    pathname.startsWith(seg('textures/')) ||
    pathname === seg('manifest.webmanifest')
  );
}

// ── strategies ──────────────────────────────────────────────────────────────────
async function handleNavigate(req) {
  try {
    const res = await fetch(req);
    // Keep the offline shell fresh with the latest HTML.
    const copy = res.clone();
    caches.open(SHELL_CACHE).then((c) => c.put(INDEX_URL, copy)).catch(() => {});
    return res;
  } catch (e) {
    const cached = (await caches.match(INDEX_URL)) || (await caches.match(ROOT_URL));
    return cached || Response.error();
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(req, res.clone()).catch(() => {});
    }
    return res;
  } catch (e) {
    return (await caches.match(req)) || Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => { if (res && res.ok) cache.put(req, res.clone()).catch(() => {}); return res; })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

// ── precache helpers ─────────────────────────────────────────────────────────────
/** Cache each URL independently so one 404 can't abort the whole precache. */
async function cacheAllSettled(cache, urls) {
  await Promise.all(urls.map(async (u) => {
    try {
      const res = await fetch(u, { cache: 'no-cache' });
      if (res && res.ok) await cache.put(u, res.clone());
    } catch (e) { /* skip missing/optional entries */ }
  }));
}

/**
 * Fetch index.html and precache every built /assets/*.js|css it references
 * (the entry chunk + Vite modulepreloads, e.g. three.js) so the core game loads
 * offline even on a cold first-offline launch. In dev there are no /assets/* URLs,
 * so this is a harmless no-op.
 */
async function precacheBuiltAssets(cache) {
  try {
    const res = await fetch(INDEX_URL, { cache: 'no-cache' });
    if (!res || !res.ok) return;
    const html = await res.text();
    const urls = new Set();
    const re = /(?:href|src)\s*=\s*["']([^"']+\.(?:js|css))(?:\?[^"']*)?["']/gi;
    let m;
    while ((m = re.exec(html))) {
      try {
        const abs = new URL(m[1], INDEX_URL);
        if (abs.origin === self.location.origin && abs.pathname.startsWith(seg('assets/'))) {
          urls.add(abs.href);
        }
      } catch (e) { /* ignore malformed */ }
    }
    if (urls.size) await cacheAllSettled(cache, [...urls]);
  } catch (e) { /* offline at install or no built assets — fine */ }
}
