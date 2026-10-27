// Cœur de la collecte des actualités officielles (flux RSS / Atom).
// Partagé par le robot GitHub (fetch-news.mjs) et le relais Cloudflare (relay/worker.js) :
// uniquement des API web standard (fetch, crypto.subtle), aucune dépendance.
export const UA = "MecheNewsBot/1.0 (+https://github.com/bdembele192-pixel/Porte-de-la-russie)";
export const PER_SOURCE = 25;

export const SOURCES = [
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

async function sha1(s) {
  const d = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, "0")).join("");
}

export async function parse(xml, src) {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  const out = await Promise.all(blocks.slice(0, PER_SOURCE).map(async b => {
    const title = text(tag(b, ["title"]));
    const url = link(b);
    const d = text(tag(b, ["pubDate", "dc:date", "published", "updated", "date"]));
    const t = d ? Date.parse(d) : NaN;
    const summary = text(tag(b, ["description", "summary", "content", "content:encoded"])).slice(0, 320);
    return title && url ? {
      id: (await sha1(url + title)).slice(0, 16),
      title, url, summary, source: src.name, sid: src.id, cat: src.cat,
      date: isNaN(t) ? null : new Date(t).toISOString()
    } : null;
  }));
  return out.filter(Boolean);
}

export async function get(src) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(src.url, { headers: { "User-Agent": UA, Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" }, signal: ctl.signal, redirect: "follow" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const items = await parse(await r.text(), src);
    if (!items.length) throw new Error("flux vide ou illisible");
    return { ok: true, items };
  } catch (e) {
    return { ok: false, error: e.name === "AbortError" ? "délai dépassé" : e.message };
  } finally { clearTimeout(timer); }
}
