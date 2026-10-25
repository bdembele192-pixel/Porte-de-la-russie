// Collecte des actualités sur les sites officiels (flux RSS / Atom) et écrit trading/data/news.json.
// Lancé toutes les 5 minutes par .github/workflows/news.yml. Node 20+, aucune dépendance.
// Une source en panne est ignorée (et signalée dans "sources") sans bloquer les autres.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const OUT = new URL("../data/news.json", import.meta.url);
const UA = "MecheNewsBot/1.0 (+https://github.com/bdembele192-pixel/Porte-de-la-russie)";
const KEEP_DAYS = 30, MAX_ITEMS = 250, PER_SOURCE = 25;

const SOURCES = [
  // Banques centrales
  { id: "fed", name: "Réserve fédérale (Fed)", cat: "Banques centrales", url: "https://www.federalreserve.gov/feeds/press_all.xml" },
  { id: "ecb", name: "Banque centrale européenne", cat: "Banques centrales", url: "https://www.ecb.europa.eu/rss/press.html" },
  { id: "boe", name: "Banque d'Angleterre", cat: "Banques centrales", url: "https://www.bankofengland.co.uk/rss/news" },
  { id: "boj", name: "Banque du Japon", cat: "Banques centrales", url: "https://www.boj.or.jp/en/rss/whatsnew.xml" },
  { id: "bis", name: "Banque des règlements internationaux", cat: "Banques centrales", url: "https://www.bis.org/doclist/all_pressrels.rss" },
  // Institutions internationales
  { id: "imf", name: "FMI", cat: "Institutions", url: "https://www.imf.org/en/News/rss?language=eng" },
  { id: "wb", name: "Banque mondiale", cat: "Institutions", url: "https://www.worldbank.org/en/news/all?format=rss" },
  { id: "wto", name: "OMC", cat: "Institutions", url: "https://www.wto.org/library/rss/latest_news_e.xml" },
  { id: "un", name: "ONU Info – Économie", cat: "Institutions", url: "https://news.un.org/feed/subscribe/fr/news/topic/economic-development/feed/rss.xml" },
  { id: "afdb", name: "Banque africaine de développement", cat: "Afrique", url: "https://www.afdb.org/en/news-and-events/rss" },
  // Régulateurs des marchés
  { id: "sec", name: "SEC (États-Unis)", cat: "Régulateurs", url: "https://www.sec.gov/news/pressreleases.rss" },
  { id: "cftc", name: "CFTC (États-Unis)", cat: "Régulateurs", url: "https://www.cftc.gov/RSS/RSSGP/rssgp.xml" },
  // Statistiques officielles
  { id: "bls", name: "Bureau of Labor Statistics", cat: "Statistiques", url: "https://www.bls.gov/feed/bls_latest.rss" },
  { id: "bea", name: "Bureau of Economic Analysis", cat: "Statistiques", url: "https://apps.bea.gov/rss/rss.xml" },
  // Énergie et matières premières
  { id: "eia", name: "EIA – Énergie (États-Unis)", cat: "Énergie", url: "https://www.eia.gov/rss/todayinenergy.xml" }
];

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function decode(s) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e.toLowerCase()] ?? m));
}
const text = s => decode(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
function tag(block, names) {
  for (const n of names) {
    const m = block.match(new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${n}>`, "i"));
    if (m) return m[1];
  }
  return "";
}
function link(block) {
  const atom = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i) || block.match(/<link[^>]*href=["']([^"']+)["']/i);
  const rss = tag(block, ["link"]);
  return text(rss) || (atom && decode(atom[1])) || text(tag(block, ["guid", "id"]));
}

function parse(xml, src) {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  return blocks.slice(0, PER_SOURCE).map(b => {
    const title = text(tag(b, ["title"]));
    const url = link(b);
    const d = text(tag(b, ["pubDate", "dc:date", "published", "updated", "date"]));
    const t = d ? Date.parse(d) : NaN;
    const summary = text(tag(b, ["description", "summary", "content", "content:encoded"])).slice(0, 320);
    return title && url ? {
      id: createHash("sha1").update(url + title).digest("hex").slice(0, 16),
      title, url, summary, source: src.name, sid: src.id, cat: src.cat,
      date: isNaN(t) ? null : new Date(t).toISOString()
    } : null;
  }).filter(Boolean);
}

async function get(src) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(src.url, { headers: { "User-Agent": UA, Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" }, signal: ctl.signal, redirect: "follow" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const items = parse(await r.text(), src);
    if (!items.length) throw new Error("flux vide ou illisible");
    return { ok: true, items };
  } catch (e) {
    return { ok: false, error: e.name === "AbortError" ? "délai dépassé" : e.message };
  } finally { clearTimeout(timer); }
}

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
