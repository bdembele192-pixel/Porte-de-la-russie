// Relais Mèche (Cloudflare Worker, offre gratuite).
// Fournit à l'app ce que le navigateur ne peut pas lire seul :
//   GET  /brvm  → cours BRVM (brvm.org), mis en cache 60 s pendant la séance
//   GET  /news  → communiqués officiels (banques centrales, FMI…), mis en cache 4 min
//   POST /ai    → réponses de Mèche IA par Claude, avec la clé API du propriétaire (secret ANTHROPIC_API_KEY)
//   GET  /      → état du relais
import Anthropic from "@anthropic-ai/sdk";
import "../../trading/js/marketdata.js"; // définit globalThis.M.MD (liste des marchés, lecture BRVM)
import { SOURCES, get as getFeed } from "../../trading/scripts/news-core.mjs";

const MD = globalThis.M.MD;
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36";

// ---------- CORS ----------
function cors(env, req) {
  const allowed = (env.ALLOWED_ORIGINS || "*").split(",").map(s => s.trim()).filter(Boolean);
  const origin = req.headers.get("origin") || "";
  const ok = allowed.includes("*") || allowed.includes(origin);
  return {
    "access-control-allow-origin": allowed.includes("*") ? "*" : ok ? origin : allowed[0],
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "origin"
  };
}
const json = (data, init, h) => new Response(JSON.stringify(data), { ...init, headers: { "content-type": "application/json; charset=utf-8", ...h, ...(init && init.headers) } });

// Cache partagé du relais : une seule lecture de la source pour tous les utilisateurs
async function cached(ctx, key, ttl, make) {
  const cache = caches.default, req = new Request("https://meche-relais.cache/" + key);
  const hit = await cache.match(req);
  if (hit) return hit.json();
  const data = await make();
  ctx.waitUntil(cache.put(req, new Response(JSON.stringify(data), { headers: { "content-type": "application/json", "cache-control": `max-age=${ttl}` } })));
  return data;
}

// ---------- BRVM ----------
async function brvm(ctx) {
  const now = Date.now();
  return cached(ctx, "brvm", MD.brvmOpen(now) ? 60 : 900, async () => {
    const r = await fetch("https://www.brvm.org/fr/cours-actions/0", { headers: { "user-agent": UA } });
    if (!r.ok) throw new Error("brvm.org HTTP " + r.status);
    const { items, time } = MD.parseBRVM(await r.text(), now);
    return { generatedAt: new Date(now).toISOString(), time, items };
  });
}

// ---------- Actualités ----------
async function news(ctx) {
  return cached(ctx, "news", 240, async () => {
    const results = await Promise.all(SOURCES.map(getFeed));
    const now = Date.now(), limit = now - 30 * 864e5, byId = new Map();
    results.forEach(r => r.ok && r.items.forEach(it => byId.set(it.id, { ...it, date: it.date || new Date(now).toISOString() })));
    const items = [...byId.values()].filter(i => { const t = Date.parse(i.date); return t >= limit && t <= now + 864e5; })
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 200);
    const sources = SOURCES.map((s, k) => ({ id: s.id, name: s.name, cat: s.cat, ok: results[k].ok, count: results[k].ok ? results[k].items.length : 0, error: results[k].ok ? undefined : results[k].error }));
    return { generatedAt: new Date(now).toISOString(), sources, items };
  });
}

// ---------- Mèche IA (Claude) ----------
// Prompt système figé (mis en cache par l'API) : les données du moment vont dans le message de l'utilisateur.
const SYSTEM = `Tu es Mèche IA, l'assistant de Mèche, une application éducative de trading pour les jeunes, en particulier en Afrique de l'Ouest (Mali, UEMOA, BRVM, franc CFA).
Tu réponds aux questions de trading, finance, économie, politique, droit (OHADA, UEMOA, BCEAO), géopolitique, écologie, psychologie et commerce.

Comment répondre :
- Réponds dans la langue de la question, avec des phrases simples et des exemples concrets (en FCFA quand c'est naturel). Va droit au but : 3 à 8 phrases ou une courte liste, sauf si on te demande plus.
- Sois exact. Pour tout fait qui peut avoir changé (taux directeur, dirigeant, cours, chiffre récent, actualité), utilise la recherche web et donne la date de l'information. Si tu n'es pas sûr, dis-le plutôt que d'inventer.
- Les « Données de l'app » jointes à la question viennent de l'application au moment où la question est posée : sers-t'en pour les prix et les actualités, en citant l'heure.
- Pour expliquer pourquoi un marché monte ou baisse, distingue les faits (variation, actualités datées) des hypothèses, et rappelle qu'une cause unique est rarement certaine.
- Tu ne donnes pas d'ordre d'investissement personnalisé avec de l'argent réel : tu expliques, tu analyses de façon éducative, tu rappelles le risque, la taille de position et le stop-loss. Tu mets en garde contre les arnaques (faux gestionnaires, promesses de gains garantis).
- Utilise un formatage léger : **gras** pour les mots clés, listes avec « - ». Pas de tableaux.`;

const recent = new Map(); // limite simple par adresse IP (par instance du relais)
function allow(ip, perMin) {
  const now = Date.now(), list = (recent.get(ip) || []).filter(t => now - t < 60e3);
  if (list.length >= perMin) return false;
  list.push(now); recent.set(ip, list);
  if (recent.size > 5000) recent.clear();
  return true;
}

async function ai(req, env) {
  if (!env.ANTHROPIC_API_KEY) return json({ error: "Le cerveau Claude n'est pas configuré sur ce relais." }, { status: 503 });
  const ip = req.headers.get("cf-connecting-ip") || "?";
  if (!allow(ip, +(env.AI_PER_MINUTE || 6))) return json({ error: "Trop de questions d'affilée : réessaie dans une minute." }, { status: 429 });
  let body;
  try { body = await req.json(); } catch (e) { return json({ error: "Requête illisible." }, { status: 400 }); }
  const q = String(body.q || "").trim().slice(0, 1500);
  if (!q) return json({ error: "Question vide." }, { status: 400 });
  const context = String(body.context || "").slice(0, 6000);
  // Historique court, alterné et commençant par l'utilisateur
  const history = (Array.isArray(body.history) ? body.history : []).slice(-8)
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.slice(0, 3000) }));
  while (history.length && history[0].role !== "user") history.shift();
  const messages = [];
  history.forEach(m => { if (messages.length && messages[messages.length - 1].role === m.role) messages[messages.length - 1].content += "\n\n" + m.content; else messages.push(m); });
  if (messages.length && messages[messages.length - 1].role === "user") messages.pop();
  messages.push({ role: "user", content: (context ? `Données de l'app (${new Date().toISOString()}) :\n${context}\n\n` : "") + "Question : " + q });

  const model = env.MODEL || "claude-opus-5-5";
  const basicSearch = /haiku/.test(model); // les modèles Haiku utilisent la version de base de la recherche web
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const params = {
    model, max_tokens: 8000,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages,
    output_config: { effort: env.EFFORT || "medium" },
    tools: [{ type: basicSearch ? "web_search_20250305" : "web_search_20260209", name: "web_search", max_uses: 3 }]
  };
  // Repli automatique côté serveur si le modèle refuse (Opus 5.5 / Sonnet 5.5 sur l'API Claude)
  if (/^claude-(opus-5-5|sonnet-5-5|opus-5|fable-5-1)$/.test(model)) { params.betas = ["server-side-fallback-2026-07-01"]; params.fallbacks = "default"; }

  try {
    let res, guard = 0;
    do {
      res = await client.beta.messages.create(params);
      if (res.stop_reason === "pause_turn") params.messages = params.messages.concat([{ role: "assistant", content: res.content }]);
    } while (res.stop_reason === "pause_turn" && ++guard < 3);
    if (res.stop_reason === "refusal") return json({ text: "Je ne peux pas répondre à cette demande.", model: res.model });
    const text = res.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
    // Sources citées par la recherche web (liens à afficher sous la réponse)
    const seen = new Set(), sources = [];
    res.content.forEach(b => (b.type === "text" && b.citations || []).forEach(c => {
      if (c.url && !seen.has(c.url) && sources.length < 5) { seen.add(c.url); sources.push({ url: c.url, title: c.title || c.url }); }
    }));
    return json({ text: text || "Je n'ai pas de réponse fiable à cette question.", sources, model: res.model });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: "Le cerveau Claude est très demandé : réessaie dans un instant." }, { status: 503 });
    if (e instanceof Anthropic.AuthenticationError) return json({ error: "Clé API du relais invalide." }, { status: 503 });
    if (e instanceof Anthropic.APIError) return json({ error: `Erreur du cerveau Claude (${e.status || "?"}).` }, { status: 502 });
    return json({ error: "Le cerveau Claude n'a pas répondu." }, { status: 502 });
  }
}

export default {
  async fetch(req, env, ctx) {
    const h = cors(env, req);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    const path = new URL(req.url).pathname.replace(/\/+$/, "") || "/";
    try {
      if (path === "/brvm" && req.method === "GET") return json(await brvm(ctx), null, h);
      if (path === "/news" && req.method === "GET") return json(await news(ctx), null, h);
      if (path === "/ai" && req.method === "POST") { const r = await ai(req, env); Object.entries(h).forEach(([k, v]) => r.headers.set(k, v)); return r; }
      if (path === "/") return json({ ok: true, service: "Relais Mèche", ai: !!env.ANTHROPIC_API_KEY, model: env.MODEL || "claude-opus-5-5" }, null, h);
      return json({ error: "Introuvable" }, { status: 404 }, h);
    } catch (e) {
      return json({ error: e.message }, { status: 502 }, h);
    }
  }
};
