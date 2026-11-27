/* Mèche · mode hors ligne (service worker).
   - Coquille de l'app (HTML, CSS, JS, icônes) : mise en cache à l'installation. La liste des fichiers est lue
     dans index.html : rien à tenir à jour à la main quand on ajoute un script.
   - Fichiers de l'app : servis depuis le cache puis rafraîchis en arrière-plan.
   - Données (cours, historique, actus du robot) : réseau d'abord, dernière copie si pas de connexion.
   - Polices Google : cache d'abord.
   - Prix en direct (Binance, CNBC), relais, comptes, IA : jamais mis en cache.
   Changer VERSION force le renouvellement complet du cache. */
const VERSION = "meche-v5-2026-11-27";
const SHELL = VERSION + "-app", DATA = VERSION + "-data", FONTS = "meche-fonts";
const EXTRA = ["./", "index.html", "manifest.webmanifest", "legal.html", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png",
  "icons/maskable-192.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "data/quotes.json", "data/news.json", "data/history.json",
  "js/content/en.js", "js/content/zh.js", "js/content/ru.js", "vega/index.html"];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    let files = [];
    try {
      const html = await (await fetch("index.html", { cache: "no-store" })).text();
      files = [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"?#]+)"/g)].map(m => m[1]);
    } catch (err) { /* hors ligne pendant l'installation : on garde l'essentiel */ }
    await Promise.all([...new Set(EXTRA.concat(files))].map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keep = [SHELL, DATA, FONTS];
    for (const k of await caches.keys()) if (!keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

const strip = u => { const x = new URL(u); x.search = ""; return x.href; };

async function networkFirst(req, cacheName) {
  const c = await caches.open(cacheName);
  try {
    const r = await fetch(req);
    if (r && r.ok) c.put(strip(req.url), r.clone());
    return r;
  } catch (err) {
    const hit = await c.match(strip(req.url)) || await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    throw err;
  }
}

async function staleWhileRevalidate(req, e) {
  const c = await caches.open(SHELL);
  const hit = await c.match(req, { ignoreSearch: true });
  const net = fetch(req).then(r => { if (r && r.ok && r.type === "basic") c.put(req, r.clone()); return r; }).catch(() => null);
  if (hit) { e.waitUntil(net); return hit; }
  const r = await net;
  if (r) return r;
  // Navigation hors ligne vers une adresse inconnue : on sert l'app (le routeur lit le #)
  if (req.mode === "navigate") return (await c.match("index.html")) || (await c.match("./")) || Response.error();
  return Response.error();
}

async function cacheFirst(req, cacheName) {
  const c = await caches.open(cacheName);
  const hit = await c.match(req);
  if (hit) return hit;
  const r = await fetch(req);
  if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone());
  return r;
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) { e.respondWith(cacheFirst(req, FONTS)); return; }
  // Copies du robot GitHub (cours, historique, actus) : sur GitHub ou dans le dossier data/
  if ((url.hostname === "raw.githubusercontent.com" && /\/trading\/data\/[^/]+\.json$/.test(url.pathname)) || (same && /\/data\/[^/]+\.json$/.test(url.pathname))) {
    e.respondWith(networkFirst(req, DATA)); return;
  }
  if (same) { e.respondWith(staleWhileRevalidate(req, e)); return; }
  // Tout le reste (Binance, CNBC, relais, Supabase, Anthropic, Wikipédia…) : réseau direct, sans cache
});
