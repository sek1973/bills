/* eslint-disable no-undef */
/// <reference lib="webworker" />

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
