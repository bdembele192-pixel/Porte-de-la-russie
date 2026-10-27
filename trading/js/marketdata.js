/* Marchés suivis (bourses, matières premières, devises, BRVM) et lecture des sources gratuites.
   Fichier partagé : chargé par l'app (cours en direct dans le navigateur), par le robot GitHub
   (scripts/fetch-quotes.mjs) et par le relais Cloudflare (relay/worker.js). Aucune dépendance. */
(function (root) {
  const M = root.M = root.M || {};

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
  const prec = p => p >= 1000 ? 7 : 6;

  // ---------- CNBC (accepte les requêtes directes du navigateur) ----------
  const quoteUrl = syms => `https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=${encodeURIComponent(syms.join("|"))}&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1`;
  const chartUrl = (sym, span) => `https://ts-api.cnbc.com/harmony/app/charts/${span}.json?symbol=${encodeURIComponent(sym)}`;
  function parseQuotes(d) {
    let list = d && d.FormattedQuoteResult && d.FormattedQuoteResult.FormattedQuote;
    if (list && !Array.isArray(list)) list = [list];
    const out = {};
    (list || []).forEach(q => { if (q && q.symbol && num(q.last) != null) out[q.symbol] = q; });
    return out;
  }
  function cnbcItem(w, q, now) {
    const [id, , , name, type, cur] = w;
    const price = num(q.last), prevClose = num(q.previous_day_closing), p = prec(price);
    const rt = q.realTime === "true";
    return {
      id, name, short: q.shortName && q.shortName.length <= 12 ? q.shortName : id, type, cur,
      price: round(price, p), prev: round(prevClose, p),
      chg: round(num(q.change_pct) != null ? num(q.change_pct) : prevClose ? (price / prevClose - 1) * 100 : 0, 4),
      open: round(num(q.open), p), high: round(num(q.high), p), low: round(num(q.low), p),
      // Heure de la donnée : instant de la lecture si le marché cote, sinon jour de la dernière séance
      time: q.curmktstatus === "REG_MKT" ? now : (Date.parse(q.last_time) || now),
      at: now, open_: q.curmktstatus === "REG_MKT", mkt: q.curmktstatus || "",
      rt, delay: rt ? "temps réel" : "différé ~15 min", src: "CNBC"
    };
  }
  function parseBars(d) {
    const bars = (d && d.barData && d.barData.priceBars) || [];
    return bars.map(b => [b.tradeTimeinMills, num(b.open), num(b.high), num(b.low), num(b.close), b.volume || 0]).filter(b => b[0] && b[4] != null);
  }
  // Regroupe des barres en bougies de « step » ms ; garde la fenêtre « span » ms avant la dernière cotation
  function group(bars, step, span, max) {
    if (!bars.length) return [];
    const end = bars[bars.length - 1][0], out = [];
    for (const b of bars) {
      if (end - b[0] >= span) continue;
      const t = Math.floor(b[0] / step) * step, o = out[out.length - 1];
      if (o && o[0] === t) { o[2] = Math.max(o[2], b[2]); o[3] = Math.min(o[3], b[3]); o[4] = b[4]; o[5] += b[5]; }
      else out.push([t, b[1], b[2], b[3], b[4], b[5]]);
    }
    const p = prec(out.length ? out[out.length - 1][4] : 0);
    return out.slice(-(max || 400)).map(b => [b[0], round(b[1], p), round(b[2], p), round(b[3], p), round(b[4], p), Math.round(b[5])]);
  }
  const to15m = bars => group(bars, 900e3, 24 * 3600e3, 110);              // dernière séance, bougies 15 min
  const toHourly = bars => group(bars, 3600e3, 8 * 864e5, 200);           // ~1 semaine, bougies 1 h
  function daily(bars) {
    const days = {};
    bars.forEach(x => { days[new Date(x[0]).toISOString().slice(0, 10)] = x; });
    const list = Object.values(days).sort((a, c) => a[0] - c[0]).slice(-262);
    const p = prec(list.length ? list[list.length - 1][4] : 0);
    return list.map(x => [x[0], round(x[1], p), round(x[2], p), round(x[3], p), round(x[4], p), Math.round(x[5])]);
  }

  // ---------- BRVM (brvm.org, page « cours des actions ») ----------
  const MOIS = { janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5, juillet: 6, août: 7, aout: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11, decembre: 11 };
  function brvmDate(html) {
    const m = html.match(/Dernière mise à jour\s*:\s*\w+,\s*(\d{1,2})\s+([a-zéû]+),?\s+(\d{4})\s*-\s*(\d{1,2}):(\d{2})/i);
    if (!m || MOIS[m[2].toLowerCase()] == null) return null;
    return Date.UTC(+m[3], MOIS[m[2].toLowerCase()], +m[1], +m[4], +m[5]); // Abidjan = UTC
  }
  const cells = row => (row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || []).map(c => c.replace(/<[^>]+>/g, " ").replace(/&#039;|&rsquo;|’/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim());
  // Séance BRVM : du lundi au vendredi, 9 h – 15 h 30 (heure d'Abidjan = UTC)
  function brvmOpen(t) { const d = new Date(t), h = d.getUTCHours() + d.getUTCMinutes() / 60, w = d.getUTCDay(); return w >= 1 && w <= 5 && h >= 9 && h < 15.5; }
  function parseBRVM(html, now) {
    const time = brvmDate(html) || now;
    const tables = html.match(/<table[\s\S]*?<\/table>/g) || [];
    const main = tables.find(t => /Cours veille/i.test(t));
    if (!main) throw new Error("tableau des actions introuvable");
    // « Séance en cours » seulement si la page date d'aujourd'hui et que la bourse est ouverte
    const live = brvmOpen(now) && new Date(time).toISOString().slice(0, 10) === new Date(now).toISOString().slice(0, 10);
    const base = { cur: "XOF", time, at: now, rt: false, open_: live, delay: live ? "séance en cours (différé)" : "cours de clôture", src: "brvm.org" };
    const items = [];
    (main.match(/<tr>[\s\S]*?<\/tr>/g) || []).forEach(tr => {
      const c = cells(tr);
      if (c.length < 7 || !/^[A-Z0-9]{3,6}$/.test(c[0])) return;
      const prev = frNum(c[3]), open = frNum(c[4]), close = frNum(c[5]), chg = frNum(c[6]);
      if (close == null) return;
      items.push({ ...base, id: "BRVM:" + c[0], name: c[1].replace(/\b(\w)(\w*)/g, (m, a, b) => a + b.toLowerCase()), short: c[0], type: "BRVM",
        price: close, prev, open, chg: chg != null ? chg : prev ? (close / prev - 1) * 100 : 0, vol: frNum(c[2]) || 0 });
    });
    const act = tables.find(t => /BRVM-C/.test(t));
    const names = { "BRVM-C": "BRVM Composite", "BRVM-30": "BRVM 30", "BRVM-PRES": "BRVM Prestige" };
    const idx = [];
    if (act) (act.match(/<tr>[\s\S]*?<\/tr>/g) || []).forEach(tr => {
      const c = cells(tr);
      if (!names[c[0]]) return;
      const v = frNum(c[1]), chg = frNum(c[2]);
      if (v == null) return;
      idx.push({ ...base, cur: "pts", id: "BRVM:" + c[0], name: names[c[0]], short: c[0], type: "BRVM indice", price: v, prev: chg != null ? v / (1 + chg / 100) : null, chg: chg || 0 });
    });
    return { items: idx.concat(items), time };
  }

  M.MD = { WORLD, num, frNum, round, quoteUrl, chartUrl, parseQuotes, cnbcItem, parseBars, to15m, toHourly, daily, parseBRVM, brvmOpen };
})(typeof window !== "undefined" ? window : globalThis);
