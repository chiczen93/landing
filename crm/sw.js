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
// notification push envoyée par le serveur (nouvelle commande)
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) {}
  const titre = d.titre || '🛒 Nouvelle commande';
  const corps = d.corps || 'Une nouvelle commande vous attend dans Zena CRM.';
  e.waitUntil(Promise.all([
    self.registration.showNotification(titre, { body: corps, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'nouvelle-commande', renotify: true }),
    self.navigator && self.navigator.setAppBadge ? self.navigator.setAppBadge().catch(() => {}) : Promise.resolve(),
  ]));
});
