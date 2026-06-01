/**
 * RecipeBox Service Worker — manual implementation (no Workbox)
 *
 * Caching strategies:
 *   Precache         – app shell (/), /offline.html, /manifest.webmanifest
 *   Cache-First      – Vite content-hashed JS/CSS bundles (never change)
 *   Stale-While-Rev  – images, /api/categories (large, rarely updated)
 *   Network-First    – /api/search, /api/meal/:id, /api/filter (fresh data preferred)
 *   Navigate fallback– /offline.html when navigation fails
 */

const CACHE_VER = 'v1';
const PRECACHE = `precache-${CACHE_VER}`;
const RUNTIME  = `runtime-${CACHE_VER}`;

const PRECACHE_URLS = ['/', '/offline.html', '/manifest.webmanifest'];

// ── Lifecycle ─────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== PRECACHE && k !== RUNTIME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Navigation (HTML pages) → network-first with offline.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Images → stale-while-revalidate (bandwidth-friendly)
  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Category list changes rarely → stale-while-revalidate
  if (url.pathname === '/api/categories') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Other API calls (search, meal detail, filter) → network-first so users
  // always get fresh results, with a cache fallback for offline use
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets (content-hashed by Vite) → cache-first, near-permanent
  event.respondWith(cacheFirst(request));
});

// ── Strategy helpers ──────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);

  // Kick off a background refresh regardless
  const networkPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });

  // Return stale immediately if available; otherwise wait for network
  return cached ?? networkPromise;
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Return a JSON error response so the client knows it's offline
    return new Response(JSON.stringify({ error: 'You are offline', meals: null }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
