// Sonde temporaire : vérifie quelles sources de cours gratuites répondent depuis GitHub Actions.
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const T = [
  "https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=1d&interval=15m",
  "https://query2.finance.yahoo.com/v8/finance/chart/CT=F?range=1y&interval=1d",
  "https://query1.finance.yahoo.com/v8/finance/chart/EURUSD=X?range=1d&interval=15m",
  "https://stooq.com/q/l/?s=%5Espx&f=sd2t2ohlcvp&h&e=csv",
  "https://stooq.com/q/d/l/?s=%5Espx&i=d",
  "https://www.brvm.org/fr/cours-actions/0",
  "https://www.brvm.org/fr/indices",
  "https://www.sikafinance.com/marches/aaz",
  "https://www.richbourse.com/common/variation/index"
];
for (const u of T) {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, accept: "*/*" }, signal: AbortSignal.timeout(15000) });
    const t = await r.text();
    console.log("=====", r.status, t.length, u);
    if (u.includes("brvm.org/fr/cours")) {
      const i = t.indexOf("<table"); console.log(t.slice(i, i + 3000).replace(/\s+/g, " "));
    } else if (u.includes("brvm.org/fr/indices")) {
      const i = t.indexOf("<table"); console.log(t.slice(i, i + 2000).replace(/\s+/g, " "));
    } else if (u.includes("sikafinance") || u.includes("richbourse")) {
      const i = t.indexOf("<table"); console.log(t.slice(i, i + 1500).replace(/\s+/g, " "));
    } else console.log(t.slice(0, 700));
  } catch (e) { console.log("=====", "ERR", u, e.message); }
}
