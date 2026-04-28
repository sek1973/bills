/* eslint-disable no-undef */
/// <reference lib="webworker" />

// ─── App Shell Caching ────────────────────────────────────────────────────────

const CACHE_NAME = 'bills-shell-v1';

// Pre-cache only the known, non-hashed shell entries on install.
// Hashed JS/CSS bundles are cached dynamically on first fetch via the
// stale-while-revalidate strategy below.
const SHELL_URLS = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_URLS))
  );
  // Take control immediately without waiting for old clients to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Remove any caches from previous versions.
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests over http(s).
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Let Supabase API calls go straight to the network — never cache auth/data.
  if (url.hostname.includes('supabase.co')) return;

  // ── Navigation requests (HTML) ──────────────────────────────────────────────
  // Network-first: try to get a fresh page; on failure serve the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // ── Same-origin static assets (JS, CSS, fonts, images) ─────────────────────
  // Stale-while-revalidate: serve from cache immediately if available,
  // update cache in the background so next visit gets the latest.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          const networkFetch = fetch(request).then(response => {
            cache.put(request, response.clone());
            return response;
          });
          return cached ?? networkFetch;
        })
      )
    );
  }
});

// ─── Push Notifications ───────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? 'Rachunki';
  const options = {
    body: data.body ?? '',
    icon: '/assets/icons/coins.svg',
    badge: '/assets/icons/coins.svg',
    data: { url: data.url ?? '/' },
    tag: data.tag ?? 'bills-notification',
    renotify: true,
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[SW] showNotification succeeded'))
      .catch((e) => console.error('[SW] showNotification failed', e))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) return client.focus();
        }
        return clients.openWindow(url);
      }),
  );
});
