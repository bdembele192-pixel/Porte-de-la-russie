// Collecte des actualités sur les sites officiels (flux RSS / Atom) et écrit trading/data/news.json.
// Lancé toutes les 5 minutes par .github/workflows/news.yml. Node 20+, aucune dépendance.
// Une source en panne est ignorée (et signalée dans "sources") sans bloquer les autres.
import { readFile, writeFile } from "node:fs/promises";
import { SOURCES, get } from "./news-core.mjs";

const OUT = new URL("../data/news.json", import.meta.url);
const KEEP_DAYS = 30, MAX_ITEMS = 250;

const now = new Date();
let prev = { items: [] };
try { prev = JSON.parse(await readFile(OUT, "utf8")); } catch { /* premier passage */ }
const seen = new Map(prev.items.map(i => [i.id, i]));

const results = await Promise.all(SOURCES.map(get));
const sources = SOURCES.map((s, k) => ({ id: s.id, name: s.name, cat: s.cat, ok: results[k].ok, count: results[k].ok ? results[k].items.length : 0, error: results[k].ok ? undefined : results[k].error }));

const merged = new Map(seen);
results.forEach(r => r.ok && r.items.forEach(it => {
  const old = seen.get(it.id);
  // firstSeen = moment où le robot a vu l'info pour la première fois (sert si le flux n'a pas de date)
  merged.set(it.id, { ...it, date: it.date || (old && old.date) || now.toISOString(), firstSeen: (old && old.firstSeen) || now.toISOString() });
}));
const limit = now.getTime() - KEEP_DAYS * 86400e3;
const items = [...merged.values()]
  .filter(i => Date.parse(i.date) >= limit && Date.parse(i.date) <= now.getTime() + 86400e3)
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  .slice(0, MAX_ITEMS);

const changed = JSON.stringify(items) !== JSON.stringify(prev.items) || JSON.stringify(sources) !== JSON.stringify(prev.sources);
if (changed || !prev.generatedAt) {
  await writeFile(OUT, JSON.stringify({ generatedAt: now.toISOString(), sources, items }, null, 1) + "\n");
}
sources.forEach(s => console.log(`${s.ok ? "✓" : "✗"} ${s.name}: ${s.ok ? s.count + " articles" : s.error}`));
console.log(`${items.length} articles au total${changed ? " (mis à jour)" : " (inchangé)"}`);
