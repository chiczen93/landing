// Zena CRM – service worker : rend l'application installable et ouvre l'appli au clic sur une notification.
// Pas de cache : les données viennent toujours du serveur.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const liste = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of liste) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  })());
});
