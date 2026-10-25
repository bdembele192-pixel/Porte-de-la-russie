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

// id interne · symbole CNBC · symbole TradingView (secours) · nom · type · devise
const WORLD = [
  ["SPX", ".SPX", "SP:SPX", "S&P 500", "Indice", "USD"],
  ["NDX", ".IXIC", "NASDAQ:IXIC", "NASDAQ", "Indice", "USD"],
  ["DJI", ".DJI", "DJ:DJI", "Dow Jones", "Indice", "USD"],
  ["CAC", ".FCHI", "EURONEXT:PX1", "CAC 40", "Indice", "EUR"],
  ["DAX", ".GDAXI", "XETR:DAX", "DAX", "Indice", "EUR"],
  ["FTSE", ".FTSE", "TVC:UKX", "FTSE 100", "Indice", "GBP"],
  ["N225", ".N225", "TVC:NI225", "Nikkei 225", "Indice", "JPY"],
  ["HSI", ".HSI", "TVC:HSI", "Hang Seng", "Indice", "HKD"],
  ["AAPL", "AAPL", "NASDAQ:AAPL", "Apple", "Action", "USD"],
  ["NVDA", "NVDA", "NASDAQ:NVDA", "Nvidia", "Action", "USD"],
  ["MSFT", "MSFT", "NASDAQ:MSFT", "Microsoft", "Action", "USD"],
  ["TSLA", "TSLA", "NASDAQ:TSLA", "Tesla", "Action", "USD"],
  ["AMZN", "AMZN", "NASDAQ:AMZN", "Amazon", "Action", "USD"],
  ["META", "META", "NASDAQ:META", "Meta", "Action", "USD"],
  ["BRENT", "@LCO.1", "ICEEUR:BRN1!", "Pétrole Brent", "Matière première", "USD"],
  ["WTI", "@CL.1", "NYMEX:CL1!", "Pétrole WTI", "Matière première", "USD"],
  ["GOLD", "@GC.1", "COMEX:GC1!", "Or (once)", "Matière première", "USD"],
  ["SILVER", "@SI.1", "COMEX:SI1!", "Argent (once)", "Matière première", "USD"],
  ["COTTON", "@CT.1", "ICEUS:CT1!", "Coton", "Matière première", "USD"],
  ["COCOA", "@CC.1", "ICEUS:CC1!", "Cacao", "Matière première", "USD"],
  ["COFFEE", "@KC.1", "ICEUS:KC1!", "Café", "Matière première", "USD"],
  ["EURUSD", "EUR=", "FX:EURUSD", "Euro / Dollar", "Forex", "USD"],
  ["GBPUSD", "GBP=", "FX:GBPUSD", "Livre / Dollar", "Forex", "USD"],
  ["USDJPY", "JPY=", "FX:USDJPY", "Dollar / Yen", "Forex", "JPY"],
  ["USDCNY", "CNY=", "FX_IDC:USDCNY", "Dollar / Yuan", "Forex", "CNY"],
  ["USDNGN", "NGN=", "FX_IDC:USDNGN", "Dollar / Naira", "Forex", "NGN"],
  ["USDZAR", "ZAR=", "FX:USDZAR", "Dollar / Rand", "Forex", "ZAR"],
  ["US10Y", "US10Y", "TVC:US10Y", "Taux US 10 ans", "Taux", "%"]
];

const num = s => { if (s == null) return null; const v = parseFloat(String(s).replace(/[,%$\s ]/g, "")); return isFinite(v) ? v : null; };
const frNum = s => { const v = parseFloat(String(s).replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").replace(/[\s ]/g, "").replace(",", ".")); return isFinite(v) ? v : null; };
const round = (v, p) => v == null ? null : +(+v).toPrecision(p);

async function get(url, opt = {}) {
  const r = await fetch(url, { ...opt, headers: { "user-agent": UA, accept: "application/json, text/html, */*", ...(opt.headers || {}) }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r;
}

// ---------- CNBC : cours ----------
async function cnbcQuotes() {
  const out = {};
  for (let i = 0; i < WORLD.length; i += 15) {
    const syms = WORLD.slice(i, i + 15).map(w => w[1]).join("|");
    const r = await get(`https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=${encodeURIComponent(syms)}&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1`);
    const d = await r.json();
    let list = d && d.FormattedQuoteResult && d.FormattedQuoteResult.FormattedQuote;
    if (list && !Array.isArray(list)) list = [list];
    (list || []).forEach(q => { if (q && q.symbol && num(q.last) != null) out[q.symbol] = q; });
  }
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
async function cnbcBars(sym, span) {
  const r = await get(`https://ts-api.cnbc.com/harmony/app/charts/${span}.json?symbol=${encodeURIComponent(sym)}`);
  const d = await r.json();
  const bars = (d && d.barData && d.barData.priceBars) || [];
  return bars.map(b => [b.tradeTimeinMills, num(b.open), num(b.high), num(b.low), num(b.close), b.volume || 0])
    .filter(b => b[0] && b[4] != null);
}
// Regroupe des barres minute en bougies de 15 min et garde la dernière séance
function to15m(bars, prec) {
  if (!bars.length) return [];
  const lastDay = new Date(bars[bars.length - 1][0]).toISOString().slice(0, 10);
  const day = bars.filter(b => Date.now() - b[0] < 26 * 3600e3 || new Date(b[0]).toISOString().slice(0, 10) === lastDay);
  const out = [];
  for (const b of day) {
    const t = Math.floor(b[0] / 900e3) * 900e3, o = out[out.length - 1];
    if (o && o[0] === t) { o[2] = Math.max(o[2], b[2]); o[3] = Math.min(o[3], b[3]); o[4] = b[4]; o[5] += b[5]; }
    else out.push([t, b[1], b[2], b[3], b[4], b[5]]);
  }
  return out.slice(-110).map(b => [b[0], round(b[1], prec), round(b[2], prec), round(b[3], prec), round(b[4], prec), Math.round(b[5])]);
}

// ---------- BRVM (brvm.org) ----------
const MOIS = { janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5, juillet: 6, août: 7, aout: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11, decembre: 11 };
function brvmDate(html) {
  const m = html.match(/Dernière mise à jour\s*:\s*\w+,\s*(\d{1,2})\s+([a-zéû]+),?\s+(\d{4})\s*-\s*(\d{1,2}):(\d{2})/i);
  if (!m || MOIS[m[2].toLowerCase()] == null) return null;
  return Date.UTC(+m[3], MOIS[m[2].toLowerCase()], +m[1], +m[4], +m[5]); // Abidjan = UTC
}
const cells = row => (row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || []).map(c => c.replace(/<[^>]+>/g, " ").replace(/&#039;|&rsquo;|’/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim());
async function brvm() {
  const html = await (await get("https://www.brvm.org/fr/cours-actions/0")).text();
  const time = brvmDate(html) || Date.now();
  const tables = html.match(/<table[\s\S]*?<\/table>/g) || [];
  const main = tables.find(t => /Cours veille/i.test(t));
  if (!main) throw new Error("tableau des actions introuvable");
  const items = [];
  (main.match(/<tr>[\s\S]*?<\/tr>/g) || []).forEach(tr => {
    const c = cells(tr);
    if (c.length < 7 || !/^[A-Z0-9]{3,6}$/.test(c[0])) return;
    const prev = frNum(c[3]), open = frNum(c[4]), close = frNum(c[5]), chg = frNum(c[6]);
    if (close == null) return;
    items.push({ id: "BRVM:" + c[0], name: c[1].replace(/\b(\w)(\w*)/g, (m, a, b) => a + b.toLowerCase()), short: c[0], type: "BRVM", cur: "XOF",
      price: close, prev, open, chg: chg != null ? chg : prev ? (close / prev - 1) * 100 : 0, vol: frNum(c[2]) || 0, time, rt: false, delay: "fin de séance ou différé" });
  });
  // Indices phares (tableau « Activités du marché »)
  const act = tables.find(t => /BRVM-C/.test(t));
  if (act) (act.match(/<tr>[\s\S]*?<\/tr>/g) || []).forEach(tr => {
    const c = cells(tr);
    if (!/^BRVM-(C|30|PRES)$/.test(c[0] || "")) return;
    const v = frNum(c[1]), chg = frNum(c[2]);
    if (v == null) return;
    const names = { "BRVM-C": "BRVM Composite", "BRVM-30": "BRVM 30", "BRVM-PRES": "BRVM Prestige" };
    items.unshift({ id: "BRVM:" + c[0], name: names[c[0]], short: c[0], type: "BRVM indice", cur: "pts", price: v, prev: chg != null ? v / (1 + chg / 100) : null, chg: chg || 0, time, rt: false, delay: "fin de séance ou différé" });
  });
  return { items, time };
}

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
for (const [id, cs, tv, name, type, cur] of WORLD) {
  const q = cq[cs], t = tq[tv];
  let it = null;
  if (q) {
    const price = num(q.last), prevClose = num(q.previous_day_closing);
    it = { id, name, short: q.shortName && q.shortName.length <= 12 ? q.shortName : id, type, cur, price, prev: prevClose,
      chg: num(q.change_pct) != null ? num(q.change_pct) : prevClose ? (price / prevClose - 1) * 100 : 0,
      open: num(q.open), high: num(q.high), low: num(q.low),
      time: Date.parse(q.last_time) || Date.now(), rt: q.realTime === "true", delay: q.realTime === "true" ? "temps réel" : "différé ~15 min", src: "CNBC" };
  } else if (t && t.close != null) {
    it = { id, name, short: id, type, cur, price: t.close, prev: t.close / (1 + (t.chg || 0) / 100), chg: t.chg || 0, open: t.open, high: t.high, low: t.low,
      time: Date.now(), rt: t.mode === "streaming", delay: t.mode === "streaming" ? "temps réel" : "différé ~10-15 min", src: "TradingView" };
  } else if (prevById[id]) { it = { ...prevById[id], stale: true }; }
  if (!it) continue;
  const prec = it.price >= 1000 ? 7 : 6;
  try { it.bars = to15m(await cnbcBars(cs, "1D"), prec); } catch (e) { it.bars = prevById[id] && prevById[id].bars || []; }
  ["price", "prev", "open", "high", "low"].forEach(k => it[k] = round(it[k], prec));
  it.chg = round(it.chg, 4);
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
      const b = await cnbcBars(cs, "1Y");
      const days = {};
      b.forEach(x => { days[new Date(x[0]).toISOString().slice(0, 10)] = x; });
      const list = Object.values(days).sort((a, c) => a[0] - c[0]).slice(-262);
      if (list.length > 20) { const p = list[list.length - 1][4] >= 1000 ? 7 : 6; hist.items[id] = list.map(x => [x[0], round(x[1], p), round(x[2], p), round(x[3], p), round(x[4], p), Math.round(x[5])]); ok++; }
    } catch (e) { /* on garde l'ancien historique */ }
  }
  sources.push({ name: "CNBC historique", ok: ok > 0, count: ok });
  hist.generatedAt = new Date().toISOString(); histChanged = true;
}
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
  console.log("historique", Object.keys(hist.items).length, "séries ; ex. SPX", (hist.items.SPX || []).length, "jours");
} else {
  // Rien de neuf (marché fermé) : on ne réécrit pas le fichier, donc pas de commit inutile
  if (!same) await writeFile(OUT, JSON.stringify(data).replace(/\},\{"id"/g, '},\n{"id"') + "\n");
  if (histChanged) await writeFile(HIST, JSON.stringify(hist).replace(/\],"/g, '],\n"') + "\n");
  console.log(same ? "Cours inchangés" : "quotes.json mis à jour", histChanged ? "· history.json mis à jour" : "");
}
