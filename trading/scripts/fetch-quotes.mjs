// Collecte des cours gratuits (bourses mondiales, matières premières, devises, BRVM)
// et écrit trading/data/quotes.json (+ history.json pour les graphiques longs).
// Lancé toutes les 5 minutes par .github/workflows/quotes.yml. Node 20+, aucune dépendance.
// Sources publiques et gratuites, données différées de quelques minutes : CNBC (cours et graphiques),
// TradingView (secours), brvm.org (BRVM). Une source en panne n'empêche pas les autres.
import { readFile, writeFile } from "node:fs/promises";

const OUT = new URL("../data/quotes.json", import.meta.url);
const HIST = new URL("../data/history.json", import.meta.url);
const DRY = process.argv.includes("--dry");
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const HIST_EVERY = 6 * 3600e3; // historique journalier rafraîchi toutes les 6 h
const T0 = Date.now(), SEED_BUDGET = 120e3; // l'amorçage BRVM s'arrête après 2 min (il reprend au passage suivant)

// Liste des marchés et lecture des sources : module partagé avec l'app et le relais
await import("../js/marketdata.js");
const { WORLD, num, round, quoteUrl, chartUrl, parseQuotes, cnbcItem, parseBars, to15m, daily, parseBRVM } = globalThis.M.MD;

async function get(url, opt = {}) {
  const r = await fetch(url, { ...opt, headers: { "user-agent": UA, accept: "application/json, text/html, */*", ...(opt.headers || {}) }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r;
}

// ---------- CNBC : cours ----------
async function cnbcQuotes() {
  const out = {};
  for (let i = 0; i < WORLD.length; i += 15)
    Object.assign(out, parseQuotes(await (await get(quoteUrl(WORLD.slice(i, i + 15).map(w => w[1])))).json()));
  return out;
}

// ---------- TradingView : secours pour les cours manquants ----------
async function tvQuotes(tickers) {
  if (!tickers.length) return {};
  const r = await get("https://scanner.tradingview.com/global/scan", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ symbols: { tickers }, columns: ["close", "change", "open", "high", "low", "update_mode"] })
  });
  const d = await r.json(), out = {};
  (d.data || []).forEach(x => { out[x.s] = { close: x.d[0], chg: x.d[1], open: x.d[2], high: x.d[3], low: x.d[4], mode: x.d[5] }; });
  return out;
}

// ---------- CNBC : graphiques ----------
const cnbcBars = async (sym, span) => parseBars(await (await get(chartUrl(sym, span))).json());

// ---------- BRVM (brvm.org) ----------
const brvm = async () => parseBRVM(await (await get("https://www.brvm.org/fr/cours-actions/0")).text(), Date.now());

async function readJSON(u, def) { try { return JSON.parse(await readFile(u, "utf8")); } catch (e) { return def; } }

const sources = [];
const items = [];
const prev = await readJSON(OUT, { items: [] });
const prevById = Object.fromEntries((prev.items || []).map(i => [i.id, i]));

// Bourses mondiales
let cq = {};
try { cq = await cnbcQuotes(); sources.push({ name: "CNBC", ok: true, count: Object.keys(cq).length }); }
catch (e) { sources.push({ name: "CNBC", ok: false, error: e.message }); }
const missing = WORLD.filter(w => !cq[w[1]]).map(w => w[2]);
let tq = {};
if (missing.length) {
  try { tq = await tvQuotes(missing); sources.push({ name: "TradingView", ok: true, count: Object.keys(tq).length }); }
  catch (e) { sources.push({ name: "TradingView", ok: false, error: e.message }); }
}
const now = Date.now();
for (const w of WORLD) {
  const [id, cs, tv, name, type, cur] = w;
  const q = cq[cs], t = tq[tv];
  let it = null;
  if (q) it = cnbcItem(w, q, now);
  else if (t && t.close != null) {
    const p = t.close >= 1000 ? 7 : 6;
    it = { id, name, short: id, type, cur, price: round(t.close, p), prev: round(t.close / (1 + (t.chg || 0) / 100), p), chg: round(t.chg || 0, 4),
      open: round(t.open, p), high: round(t.high, p), low: round(t.low, p), time: now, at: now,
      rt: t.mode === "streaming", delay: t.mode === "streaming" ? "temps réel" : "différé ~10-15 min", src: "TradingView" };
  } else if (prevById[id]) { it = { ...prevById[id], stale: true }; }
  if (!it) continue;
  try { it.bars = to15m(await cnbcBars(cs, "5D")); } catch (e) { it.bars = prevById[id] && prevById[id].bars || []; }
  items.push(it);
}

// BRVM
try { const b = await brvm(); items.push(...b.items); sources.push({ name: "BRVM (brvm.org)", ok: true, count: b.items.length }); }
catch (e) {
  sources.push({ name: "BRVM (brvm.org)", ok: false, error: e.message });
  (prev.items || []).filter(i => /^BRVM/.test(i.type)).forEach(i => items.push({ ...i, stale: true }));
}

// Historique journalier (1 an) : CNBC pour le monde, accumulation jour après jour pour la BRVM
const hist = await readJSON(HIST, { generatedAt: null, items: {} });
const histDue = !hist.generatedAt || Date.now() - Date.parse(hist.generatedAt) > HIST_EVERY;
let histChanged = false;
if (histDue) {
  let ok = 0;
  for (const [id, cs] of WORLD) {
    try {
      const list = daily(await cnbcBars(cs, "1Y"));
      if (list.length > 20) { hist.items[id] = list; ok++; }
    } catch (e) { /* on garde l'ancien historique */ }
  }
  sources.push({ name: "CNBC historique", ok: ok > 0, count: ok });
  hist.generatedAt = new Date().toISOString(); histChanged = true;
}
// Amorçage : un an d'historique BRVM depuis Sikafinance (une seule fois par titre)
function sikaTicker(sym) {
  if (/^BRVM-/.test(sym)) return { "BRVM-C": "BRVMC", "BRVM-30": "BRVM30", "BRVM-PRES": "BRVMPRES" }[sym];
  if (/BF$/.test(sym)) return sym + ".bf";
  return sym + "." + ({ C: "ci", S: "sn", B: "bj", M: "ml", N: "ne", T: "tg" }[sym.slice(-1)] || "ci");
}
const isoDay = t => new Date(t).toISOString().slice(0, 10);
async function sikaHistory(sym) {
  const tk = sikaTicker(sym);
  if (!tk) return [];
  const out = {};
  for (let k = 3; k >= 0; k--) {
    const fin = Date.now() - k * 91 * 864e5, deb = fin - 90 * 864e5;
    const r = await get("https://www.sikafinance.com/api/general/GetHistos", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ ticker: tk, datedeb: isoDay(deb), datefin: isoDay(fin), xperiod: "0" })
    });
    const d = await r.json();
    (d.lst || []).forEach(x => {
      const [dd, mm, yy] = String(x.Date).split("/").map(Number);
      if (!yy) return;
      const t = Date.UTC(yy, mm - 1, dd);
      out[t] = [t, +x.Open, +x.High, +x.Low, +x.Close, +x.Volume || 0];
    });
  }
  return Object.values(out).filter(b => b[4] > 0).sort((a, b) => a[0] - b[0]);
}
let seeded = 0, seedErr = null, seedFails = 0;
for (const it of items.filter(i => /^BRVM/.test(i.type) && !i.stale)) {
  if ((hist.items[it.id] || []).length >= 20 || seeded >= 60) continue;
  if (Date.now() - T0 > SEED_BUDGET || seedFails >= 3) break;
  try {
    const h = await sikaHistory(it.short);
    if (h.length >= 20) { hist.items[it.id] = h.slice(-262); histChanged = true; seeded++; }
    else if (DRY && !seedErr) seedErr = it.short + " : " + h.length + " jours";
  } catch (e) { seedErr = seedErr || it.short + " : " + e.message; seedFails++; }
}
if (seeded || seedErr) sources.push({ name: "Sikafinance (historique BRVM)", ok: seeded > 0, count: seeded, error: seedErr || undefined });
for (const it of items.filter(i => /^BRVM/.test(i.type) && !i.stale)) {
  const day = Date.UTC(...new Date(it.time).toISOString().slice(0, 10).split("-").map((v, i) => i === 1 ? v - 1 : +v));
  const h = hist.items[it.id] = hist.items[it.id] || [];
  const o = it.open != null ? it.open : it.prev != null ? it.prev : it.price;
  const bar = [day, o, Math.max(o, it.price), Math.min(o, it.price), it.price, it.vol || 0];
  const last = h[h.length - 1];
  if (last && last[0] === day) { if (last[4] !== bar[4] || last[5] !== bar[5]) { h[h.length - 1] = bar; histChanged = true; } }
  else { h.push(bar); if (h.length > 262) h.shift(); histChanged = true; }
}

const data = { generatedAt: new Date().toISOString(), source: "CNBC, TradingView et brvm.org (gratuit, différé de quelques minutes)", sources, items };
const same = JSON.stringify(prev.items) === JSON.stringify(items);
console.log(sources.map(s => `${s.ok ? "OK " : "KO "}${s.name} ${s.ok ? s.count : s.error}`).join("\n"));
console.log(`${items.length} cours (${items.filter(i => i.rt).length} temps réel), ${items.filter(i => i.bars && i.bars.length).length} avec graphique du jour`);
if (DRY) {
  items.slice(0, 40).forEach(i => console.log(i.id.padEnd(12), String(i.price).padStart(12), (i.chg >= 0 ? "+" : "") + i.chg.toFixed(2) + "%", i.delay, i.bars ? i.bars.length + " barres" : ""));
  console.log("historique", Object.keys(hist.items).length, "séries ; ex. SPX", (hist.items.SPX || []).length, "jours ; SNTS", (hist.items["BRVM:SNTS"] || []).length, "jours ; BRVM-C", (hist.items["BRVM:BRVM-C"] || []).length);
  console.log("SNTS fin", JSON.stringify((hist.items["BRVM:SNTS"] || []).slice(-3)), "| AAPL 1J", JSON.stringify((items.find(i => i.id === "AAPL") || {}).bars?.slice(-2)), (items.find(i => i.id === "AAPL") || {}).bars?.length);
} else {
  // Rien de neuf (marché fermé) : on ne réécrit pas le fichier, donc pas de commit inutile
  if (!same) await writeFile(OUT, JSON.stringify(data).replace(/\},\{"id"/g, '},\n{"id"') + "\n");
  if (histChanged) await writeFile(HIST, JSON.stringify(hist).replace(/\],"/g, '],\n"') + "\n");
  console.log(same ? "Cours inchangés" : "quotes.json mis à jour", histChanged ? "· history.json mis à jour" : "");
}
