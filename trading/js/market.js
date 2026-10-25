/* Données de marché : vrais prix via l'API publique de Binance (sans clé),
   avec repli automatique sur des données simulées si le réseau est indisponible. */
window.M = window.M || {};

(function () {
  const REST = ["https://data-api.binance.vision", "https://api.binance.com"];
  const WS = ["wss://data-stream.binance.vision/ws/", "wss://stream.binance.com:9443/ws/"];

  const ASSETS = [
    { sym: "BTCUSDT", short: "BTC", name: "Bitcoin", type: "Crypto", icon: "₿", color: "#F7931A", base: 100000, tip: "crypto" },
    { sym: "ETHUSDT", short: "ETH", name: "Ethereum", type: "Crypto", icon: "Ξ", color: "#8C8CFF", base: 3500, tip: "crypto" },
    { sym: "SOLUSDT", short: "SOL", name: "Solana", type: "Crypto", icon: "◎", color: "#14F195", base: 180, tip: "crypto" },
    { sym: "BNBUSDT", short: "BNB", name: "BNB", type: "Crypto", icon: "◆", color: "#F3BA2F", base: 900, tip: "crypto" },
    { sym: "XRPUSDT", short: "XRP", name: "XRP", type: "Crypto", icon: "✕", color: "#23B5E8", base: 2.5, tip: "crypto" },
    { sym: "DOGEUSDT", short: "DOGE", name: "Dogecoin", type: "Memecoin", icon: "Ð", color: "#C2A633", base: 0.2, tip: "crypto" },
    { sym: "PAXGUSDT", short: "OR", name: "Or (PAXG)", type: "Matière première", icon: "Au", color: "#E8C55A", base: 4000, tip: "matieres-premieres" },
    { sym: "EURUSDT", short: "EUR", name: "Euro / Dollar", type: "Forex", icon: "€", color: "#4D8BFF", base: 1.16, tip: "forex" }
  ];

  const TF = {
    "1m": 60e3, "5m": 300e3, "15m": 900e3, "1h": 3600e3, "4h": 14400e3, "1d": 86400e3
  };

  const asset = sym => ASSETS.find(a => a.sym === sym) || ASSETS[0];

  function decimals(p) {
    const a = Math.abs(p);
    if (a >= 1000) return 2;
    if (a >= 10) return 2;
    if (a >= 1) return 4;
    if (a >= 0.01) return 5;
    return 7;
  }
  const fmtPrice = p => (p == null || isNaN(p)) ? "—" :
    p.toLocaleString("fr-FR", { minimumFractionDigits: decimals(p), maximumFractionDigits: decimals(p) });

  // ---------- Générateur pseudo-aléatoire déterministe ----------
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function gauss(r) {
    let u = 0, v = 0;
    while (u === 0) u = r();
    while (v === 0) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /* Génère des bougies simulées. "script" = { start: prix, regimes: [{n, drift, vol}] }
     pour reconstituer approximativement un événement quand on est hors ligne. */
  function simulate({ sym, tf, n = 300, end = Date.now(), seed, start, script }) {
    const a = asset(sym);
    const step = TF[tf] || TF["1h"];
    const r = rng(seed != null ? seed : hash(sym + tf + Math.floor(end / step / 50)));
    let regimes = script ? script.regimes.slice() : null;
    const total = regimes ? regimes.reduce((s, x) => s + x.n, 0) : n;
    const t0 = start != null ? start : Math.floor(end / step) * step - (total - 1) * step;
    let p = (script && script.start) || a.base * (0.9 + r() * 0.2);
    const baseVol = { "1m": 0.0012, "5m": 0.0025, "15m": 0.004, "1h": 0.007, "4h": 0.013, "1d": 0.03 }[tf] || 0.007;
    const volMul = a.sym === "EURUSDT" ? 0.12 : a.sym === "PAXGUSDT" ? 0.35 : a.type === "Memecoin" ? 1.8 : 1;
    const bars = [];
    let ri = 0, left = regimes ? regimes[0].n : Infinity, drift = 0, vol = baseVol * volMul, trendPhase = r() * 6;
    for (let i = 0; i < total; i++) {
      if (regimes) {
        if (left <= 0) { ri++; left = regimes[ri].n; }
        drift = regimes[ri].drift; vol = regimes[ri].vol; left--;
      } else {
        // dérive lente qui alterne tendances et ranges
        drift = Math.sin(i / 37 + trendPhase) * baseVol * volMul * 0.18;
      }
      const o = p;
      const ret = drift + vol * gauss(r);
      const c = Math.max(o * (1 + ret), o * 0.5);
      const h = Math.max(o, c) * (1 + Math.abs(gauss(r)) * vol * 0.45);
      const l = Math.min(o, c) * (1 - Math.abs(gauss(r)) * vol * 0.45);
      const v = (1 + Math.abs(ret) / vol) * (500 + r() * 800);
      bars.push({ t: t0 + i * step, o, h, l, c, v });
      p = c;
    }
    return bars;
  }

  // ---------- Réseau ----------
  async function fetchJSON(path, timeout = 7000) {
    let lastErr;
    for (const base of REST) {
      const ctl = new AbortController();
      const id = setTimeout(() => ctl.abort(), timeout);
      try {
        const res = await fetch(base + path, { signal: ctl.signal });
        clearTimeout(id);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return await res.json();
      } catch (e) { clearTimeout(id); lastErr = e; }
    }
    throw lastErr || new Error("réseau indisponible");
  }

  const parseK = k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] });

  /* Bougies réelles. Retourne { bars, live:true } ou, en cas d'échec, { bars simulées, live:false }. */
  async function klines(sym, tf, { limit = 300, startTime, endTime, script } = {}) {
    let q = `/api/v3/klines?symbol=${sym}&interval=${tf}&limit=${Math.min(limit, 1000)}`;
    if (startTime) q += `&startTime=${startTime}`;
    if (endTime) q += `&endTime=${endTime}`;
    try {
      const data = await fetchJSON(q);
      if (!Array.isArray(data) || data.length < 10) throw new Error("données vides");
      return { bars: data.map(parseK), live: true };
    } catch (e) {
      const bars = simulate({ sym, tf, n: limit, start: startTime, end: endTime || Date.now(), script, seed: startTime ? hash(sym + startTime) : undefined });
      return { bars, live: false, error: e.message };
    }
  }

  /* Bougies sur une longue période (plusieurs requêtes de 1000). */
  async function history(sym, tf, n) {
    if (n <= 1000) return klines(sym, tf, { limit: n });
    const step = TF[tf];
    const end = Date.now();
    let start = end - n * step;
    const out = [];
    try {
      while (out.length < n) {
        const data = await fetchJSON(`/api/v3/klines?symbol=${sym}&interval=${tf}&limit=1000&startTime=${start}`);
        if (!data.length) break;
        data.forEach(k => out.push(parseK(k)));
        start = data[data.length - 1][0] + step;
        if (data.length < 1000) break;
      }
      if (out.length < 50) throw new Error("données insuffisantes");
      return { bars: out, live: true };
    } catch (e) {
      return { bars: simulate({ sym, tf, n }), live: false, error: e.message };
    }
  }

  async function tickers(syms) {
    try {
      const data = await fetchJSON(`/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(syms))}`);
      const out = {};
      data.forEach(d => out[d.symbol] = { last: +d.lastPrice, chg: +d.priceChangePercent, vol: +d.quoteVolume });
      return { data: out, live: true };
    } catch (e) {
      const out = {};
      syms.forEach(s => {
        const b = simulate({ sym: s, tf: "1h", n: 25 });
        const last = b[b.length - 1].c;
        out[s] = { last, chg: (last / b[0].o - 1) * 100, vol: 0 };
      });
      return { data: out, live: false };
    }
  }

  /* Flux temps réel d'une paire. onBar(bar, isClosed) est appelé à chaque tick.
     Ordre de repli : WebSocket → interrogation REST toutes les 4 s → simulation. */
  function stream(sym, tf, lastBar, onBar, onMode) {
    let ws = null, poll = null, sim = null, closed = false, wsIdx = 0, gotData = false;
    let cur = Object.assign({}, lastBar);
    const step = TF[tf];

    const emit = (b, isClosed) => { if (!closed) onBar(b, isClosed); };

    function startSim() {
      onMode && onMode("sim");
      const r = rng(hash(sym + Date.now()));
      const a = asset(sym);
      const vol = ({ "1m": 0.0006, "5m": 0.001, "15m": 0.0015, "1h": 0.002, "4h": 0.003, "1d": 0.005 }[tf] || 0.002) *
        (a.sym === "EURUSDT" ? 0.12 : a.sym === "PAXGUSDT" ? 0.35 : 1);
      let ticks = 0;
      sim = setInterval(() => {
        ticks++;
        if (ticks % 8 === 0) {
          emit(Object.assign({}, cur), true);
          cur = { t: cur.t + step, o: cur.c, h: cur.c, l: cur.c, c: cur.c, v: 0 };
        }
        const c = cur.c * (1 + vol * gauss(r));
        cur.c = c; cur.h = Math.max(cur.h, c); cur.l = Math.min(cur.l, c); cur.v += 50 + r() * 300;
        emit(Object.assign({}, cur), false);
      }, 1000);
    }

    function startPoll() {
      onMode && onMode("poll");
      const tick = async () => {
        try {
          const d = await fetchJSON(`/api/v3/klines?symbol=${sym}&interval=${tf}&limit=2`, 5000);
          const bars = d.map(parseK);
          const last = bars[bars.length - 1];
          if (last.t > cur.t && bars.length > 1) emit(bars[bars.length - 2], true);
          cur = last;
          emit(Object.assign({}, cur), false);
        } catch (e) {
          clearInterval(poll); poll = null;
          if (!closed) startSim();
        }
      };
      tick();
      poll = setInterval(tick, 4000);
    }

    function startWs() {
      if (wsIdx >= WS.length) { startPoll(); return; }
      let opened = false;
      try { ws = new WebSocket(WS[wsIdx] + sym.toLowerCase() + "@kline_" + tf); }
      catch (e) { wsIdx++; startWs(); return; }
      const guard = setTimeout(() => { if (!opened && ws) { ws.onclose = null; ws.close(); wsIdx++; startWs(); } }, 6000);
      ws.onopen = () => { opened = true; clearTimeout(guard); onMode && onMode("live"); };
      ws.onmessage = ev => {
        try {
          const k = JSON.parse(ev.data).k;
          if (!k) return;
          gotData = true;
          const b = { t: k.t, o: +k.o, h: +k.h, l: +k.l, c: +k.c, v: +k.v };
          cur = b;
          emit(b, !!k.x);
        } catch (e) { /* message ignoré */ }
      };
      ws.onerror = () => {};
      ws.onclose = () => {
        clearTimeout(guard);
        if (closed) return;
        if (!opened || !gotData) { wsIdx++; startWs(); }
        else setTimeout(() => { if (!closed) { gotData = false; startWs(); } }, 2000);
      };
    }

    startWs();
    return {
      close() {
        closed = true;
        if (ws) { ws.onclose = null; try { ws.close(); } catch (e) { /* déjà fermé */ } }
        clearInterval(poll); clearInterval(sim);
      },
      forceSim() { if (ws) { ws.onclose = null; ws.close(); } clearInterval(poll); startSim(); }
    };
  }

  M.Market = { ASSETS, TF, asset, klines, history, tickers, stream, simulate, fmtPrice, decimals, rng, hash };
})();
