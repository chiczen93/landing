// Zena CRM – service worker : installable, ouverture rapide (l'appli est servie depuis le cache puis mise à jour en arrière-plan)
// Les données (webhooks n8n) ne sont JAMAIS mises en cache : seules les pages / icônes / sons de ce dossier le sont.
const CACHE = 'zena-crm-v2';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/version.txt') || url.pathname.endsWith('/sw.js')) return;   // toujours depuis le réseau
  const asset = /\/(icons|sons)\//.test(url.pathname) || /\.(webmanifest|png|mp3|wav|ogg|webp|svg)$/.test(url.pathname);
  if (req.mode !== 'navigate' && !asset) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    const maj = fetch(req).then(r => { if (r && r.ok) cache.put(req, r.clone()); return r; }).catch(() => null);
    if (cached) { e.waitUntil(maj); return cached; }       // instantané, mise à jour en arrière-plan
    return (await maj) || Response.error();
  })());
});
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
    self.registration.showNotification(titre, { body: corps, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: d.tag || 'zena-' + Date.now(), renotify: true }),
    self.navigator && self.navigator.setAppBadge ? self.navigator.setAppBadge().catch(() => {}) : Promise.resolve(),
  ]));
});
