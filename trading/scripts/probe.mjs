// Sonde temporaire : quelles sources acceptent les requêtes d'un navigateur (CORS) ?
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36";
const T = [
  ["GET", "https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=.SPX%7CAAPL&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1"],
  ["GET", "https://ts-api.cnbc.com/harmony/app/charts/1D.json?symbol=.SPX"],
  ["POST", "https://scanner.tradingview.com/global/scan"],
  ["GET", "https://api.nasdaq.com/api/quote/AAPL/info?assetclass=stocks"],
  ["GET", "https://www.brvm.org/fr/cours-actions/0"],
  ["POST", "https://www.sikafinance.com/api/general/GetHistos"],
  ["GET", "https://www.richbourse.com/common/variation/index"],
  ["GET", "https://api.frankfurter.app/latest?from=USD"],
  ["GET", "https://data-api.binance.vision/api/v3/ticker/price?symbol=BTCUSDT"],
  ["GET", "https://api.coinbase.com/v2/prices/BTC-USD/spot"],
  ["GET", "https://www.federalreserve.gov/feeds/press_all.xml"],
  ["GET", "https://www.ecb.europa.eu/rss/press.html"],
  ["GET", "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.ecb.europa.eu%2Frss%2Fpress.html"]
];
for (const [m, u] of T) {
  try {
    const opt = { method: m, headers: { "user-agent": UA, origin: "https://example.github.io", accept: "*/*" }, signal: AbortSignal.timeout(15000) };
    if (m === "POST") { opt.headers["content-type"] = "application/json"; opt.body = u.includes("tradingview") ? JSON.stringify({ symbols: { tickers: ["SP:SPX"] }, columns: ["close"] }) : JSON.stringify({ ticker: "SNTS.sn", datedeb: "2026-10-01", datefin: "2026-10-27", xperiod: "0" }); }
    const r = await fetch(u, opt);
    // Pré-vol (OPTIONS) pour les requêtes avec en-têtes
    let pre = "";
    try { const o = await fetch(u, { method: "OPTIONS", headers: { origin: "https://example.github.io", "access-control-request-method": m, "access-control-request-headers": "content-type" }, signal: AbortSignal.timeout(10000) }); pre = `preflight ${o.status} ACAO=${o.headers.get("access-control-allow-origin")} ACAH=${o.headers.get("access-control-allow-headers")}`; } catch (e) { pre = "preflight ERR"; }
    console.log(`${r.status} ACAO=${r.headers.get("access-control-allow-origin")} cache=${r.headers.get("cache-control")} | ${pre} | ${u.slice(0, 80)}`);
  } catch (e) { console.log("ERR", e.message, u.slice(0, 80)); }
}
