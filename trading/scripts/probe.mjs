// Sonde temporaire (2) : sources gratuites pour indices mondiaux + tableau complet BRVM.
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const T = [
  "https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=.SPX%7C.IXIC%7C.FCHI%7C%40LCO.1%7CEUR%3D%7CAAPL%7C%40CT.1%7C%40CC.1&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1",
  "https://ts-api.cnbc.com/harmony/app/charts/1D.json?symbol=.SPX",
  "https://api.nasdaq.com/api/quote/AAPL/info?assetclass=stocks",
  "https://api.nasdaq.com/api/quote/SPX/info?assetclass=index",
  "https://www.google.com/finance/quote/.INX:INDEXSP",
  "https://api.frankfurter.app/latest?from=USD",
  "https://scanner.tradingview.com/global/scan",
];
for (const u of T) {
  try {
    const opt = { headers: { "user-agent": UA, accept: "application/json, text/plain, */*" }, signal: AbortSignal.timeout(15000) };
    if (u.includes("scanner.tradingview")) { opt.method = "POST"; opt.headers["content-type"] = "application/json"; opt.body = JSON.stringify({ symbols: { tickers: ["SP:SPX", "NASDAQ:IXIC", "TVC:UKOIL", "FX:EURUSD", "NASDAQ:AAPL", "ICEUS:CT1!", "BRVM:SNTS"] }, columns: ["close", "change", "description", "update_mode"] }); }
    const r = await fetch(u, opt);
    const t = await r.text();
    console.log("=====", r.status, t.length, u.slice(0, 90));
    if (u.includes("google")) { const m = t.match(/data-last-price="([^"]+)"/); console.log("google last", m && m[1]); }
    else console.log(t.slice(0, 900));
  } catch (e) { console.log("=====", "ERR", u.slice(0, 90), e.message); }
}
// BRVM : tableau complet des actions
const r = await fetch("https://www.brvm.org/fr/cours-actions/0", { headers: { "user-agent": UA } });
const h = await r.text();
const tables = h.match(/<table[\s\S]*?<\/table>/g) || [];
console.log("BRVM tables", tables.length, tables.map(t => (t.match(/<tr/g) || []).length));
const big = tables.sort((a, b) => b.length - a.length)[0];
console.log(big.slice(0, 2500).replace(/\s+/g, " "));
const r2 = await fetch("https://www.brvm.org/fr/indices", { headers: { "user-agent": UA } });
const h2 = await r2.text();
const t2 = (h2.match(/<table[\s\S]*?<\/table>/g) || []).sort((a, b) => b.length - a.length)[0];
console.log("INDICES", t2.slice(0, 2500).replace(/\s+/g, " "));
const m = h.match(/(Séance du[^<]{0,60}|Dernière mise à jour[^<]{0,80}|mis à jour[^<]{0,80})/i); console.log("DATE", m && m[0]);
