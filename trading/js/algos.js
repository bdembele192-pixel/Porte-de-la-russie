/* Algo Lab : les 4 stratégies et le moteur de backtest.
   Règle anti-biais : le signal est calculé sur la clôture de la bougie i
   et exécuté à l'ouverture de la bougie i+1. */
window.M = window.M || {};

(function () {
  const I = M.Ind;

  const ALGOS = [
    {
      id: "trend",
      name: "Trend Following",
      emoji: "🚀",
      tag: "Croisement d'EMA + stop ATR",
      tip: "momentum",
      desc: "Achète quand l'EMA rapide passe au-dessus de l'EMA lente, sort au croisement inverse ou si le stop suiveur ATR est touché. Gagne gros dans les tendances, perd un peu dans les ranges.",
      params: [
        { k: "fast", label: "EMA rapide", min: 5, max: 50, step: 1, v: 20, tip: "ema" },
        { k: "slow", label: "EMA lente", min: 20, max: 200, step: 5, v: 50, tip: "ema" },
        { k: "atrMult", label: "Stop (× ATR)", min: 1, max: 6, step: 0.5, v: 3, tip: "atr" }
      ],
      overlays: p => [{ type: "ema", n: p.fast, color: "#C6FF3D" }, { type: "ema", n: p.slow, color: "#8B5CFF" }],
      signals(bars, p) {
        const c = bars.map(b => b.c), f = I.ema(c, p.fast), s = I.ema(c, p.slow), atr = I.atr(bars, 14);
        let peak = 0;
        return (i, pos) => {
          if (f[i] == null || s[i] == null || f[i - 1] == null || s[i - 1] == null) return 0;
          if (!pos) {
            if (f[i - 1] <= s[i - 1] && f[i] > s[i]) { peak = bars[i].c; return 1; }
            return 0;
          }
          peak = Math.max(peak, bars[i].h);
          if (f[i] < s[i]) return "exit";
          if (atr[i] && bars[i].c < peak - p.atrMult * atr[i]) return "exit";
          return null;
        };
      }
    },
    {
      id: "breakout",
      name: "Breakout Donchian",
      emoji: "🐢",
      tag: "La méthode des Turtles",
      tip: "donchian",
      desc: "Achète quand le prix clôture au-dessus du plus haut des N dernières bougies, sort quand il clôture sous le plus bas des M dernières. Peu de trades, des gains rares mais énormes.",
      params: [
        { k: "entry", label: "Canal d'entrée", min: 10, max: 100, step: 5, v: 20, tip: "donchian" },
        { k: "exit", label: "Canal de sortie", min: 5, max: 50, step: 5, v: 10, tip: "donchian" }
      ],
      overlays: p => [{ type: "donchian", n: p.entry, color: "#3DF5FF" }],
      signals(bars, p) {
        const en = I.donchian(bars, p.entry), ex = I.donchian(bars, p.exit);
        return (i, pos) => {
          if (i < 1 || en.hi[i - 1] == null || ex.lo[i - 1] == null) return 0;
          if (!pos) return bars[i].c > en.hi[i - 1] ? 1 : 0;
          return bars[i].c < ex.lo[i - 1] ? "exit" : null;
        };
      }
    },
    {
      id: "meanrev",
      name: "Mean Reversion",
      emoji: "🧲",
      tag: "Bollinger + RSI",
      tip: "mean-reversion",
      desc: "Achète la panique (clôture sous la bande basse ET RSI survendu), revend au retour à la moyenne. Beaucoup de petits gains… et un stop ATR pour survivre aux vraies chutes.",
      params: [
        { k: "n", label: "Période Bollinger", min: 10, max: 50, step: 1, v: 20, tip: "bollinger" },
        { k: "k", label: "Écarts-types", min: 1, max: 3, step: 0.25, v: 2, tip: "bollinger" },
        { k: "rsiLo", label: "Seuil RSI", min: 10, max: 45, step: 1, v: 30, tip: "rsi" },
        { k: "atrMult", label: "Stop (× ATR)", min: 1, max: 5, step: 0.5, v: 2, tip: "atr" }
      ],
      overlays: p => [{ type: "bb", n: p.n, k: p.k, color: "#FF4DA6" }],
      signals(bars, p) {
        const c = bars.map(b => b.c), bb = I.bollinger(c, p.n, p.k), r = I.rsi(c, 14), atr = I.atr(bars, 14);
        let stop = 0;
        return (i, pos) => {
          if (bb.lo[i] == null || r[i] == null) return 0;
          if (!pos) {
            if (c[i] < bb.lo[i] && r[i] < p.rsiLo) { stop = c[i] - p.atrMult * (atr[i] || 0); return 1; }
            return 0;
          }
          if (c[i] > bb.mid[i]) return "exit";
          if (c[i] < stop) return "exit";
          return null;
        };
      }
    },
    {
      id: "pairs",
      name: "Pairs Trading",
      emoji: "⚖️",
      tag: "Arbitrage statistique ETH / BTC",
      tip: "pairs",
      desc: "Suit le ratio ETH/BTC. Quand son z-score devient extrême, l'algo parie sur le retour à la normale : long ETH + short BTC (ou l'inverse). Neutre face à la direction du marché.",
      pair: ["ETHUSDT", "BTCUSDT"],
      params: [
        { k: "look", label: "Fenêtre (bougies)", min: 20, max: 200, step: 10, v: 60, tip: "z-score" },
        { k: "zIn", label: "Z d'entrée", min: 1, max: 3.5, step: 0.25, v: 2, tip: "z-score" },
        { k: "zOut", label: "Z de sortie", min: 0, max: 1.5, step: 0.25, v: 0.5, tip: "z-score" }
      ],
      overlays: () => []
    }
  ];

  /* Backtest mono-actif, long uniquement, 100 % du capital investi par trade. */
  function backtest(algo, bars, p, { fee = 0.001, capital = 10000 } = {}) {
    const sig = algo.signals(bars, p);
    let cash = capital, qty = 0, entry = 0, entryI = 0;
    const trades = [], equity = [];
    let pending = null;
    for (let i = 0; i < bars.length; i++) {
      const b = bars[i];
      // exécution à l'ouverture de la bougie suivant le signal
      if (pending === "buy" && !qty) {
        const px = b.o;
        qty = cash * (1 - fee) / px; entry = px; entryI = i; cash = 0;
      } else if (pending === "exit" && qty) {
        const px = b.o;
        cash = qty * px * (1 - fee);
        trades.push({ in: entryI, out: i, entry, exit: px, ret: (px * (1 - fee)) / (entry / (1 - fee)) - 1 });
        qty = 0;
      }
      pending = null;
      const s = sig(i, qty > 0);
      if (!qty && s === 1) pending = "buy";
      else if (qty && s === "exit") pending = "exit";
      equity.push(cash + qty * b.c);
    }
    if (qty) {
      const px = bars[bars.length - 1].c;
      trades.push({ in: entryI, out: bars.length - 1, entry, exit: px, ret: (px * (1 - fee)) / (entry / (1 - fee)) - 1, open: true });
    }
    return stats(equity, trades, bars.map(b => b.c), capital);
  }

  /* Pairs trading : long A / short B (ou inverse), moitié du capital sur chaque jambe. */
  function backtestPairs(barsA, barsB, p, { fee = 0.001, capital = 10000 } = {}) {
    const n = Math.min(barsA.length, barsB.length);
    const A = barsA.slice(-n), B = barsB.slice(-n);
    const ratio = A.map((b, i) => Math.log(b.c) - Math.log(B[i].c));
    const m = I.sma(ratio, p.look), sd = I.stdev(ratio, p.look);
    const z = ratio.map((r, i) => m[i] == null || !sd[i] ? null : (r - m[i]) / sd[i]);
    let eq = capital, side = 0, ea = 0, eb = 0, entryI = 0, base = capital;
    const trades = [], equity = [];
    let pending = null;
    for (let i = 0; i < n; i++) {
      if (pending != null) {
        if (pending === 0 && side) {
          const r = side * ((A[i].o / ea - 1) - (B[i].o / eb - 1)) / 2;
          eq = base * (1 + r) * (1 - 2 * fee);
          trades.push({ in: entryI, out: i, ret: eq / base - 1, side });
          side = 0;
        } else if (pending !== 0 && !side) {
          side = pending; ea = A[i].o; eb = B[i].o; entryI = i;
          base = eq * (1 - 2 * fee); eq = base;
        }
        pending = null;
      }
      let cur = eq;
      if (side) cur = base * (1 + side * ((A[i].c / ea - 1) - (B[i].c / eb - 1)) / 2);
      equity.push(cur);
      if (z[i] == null) continue;
      if (!side) {
        if (z[i] > p.zIn) pending = -1;       // ETH trop cher vs BTC : short ETH / long BTC
        else if (z[i] < -p.zIn) pending = 1;  // ETH trop bon marché : long ETH / short BTC
      } else if (Math.abs(z[i]) < p.zOut) pending = 0;
    }
    if (side) trades.push({ in: entryI, out: n - 1, ret: equity[n - 1] / base - 1, side, open: true });
    const res = stats(equity, trades, A.map(b => b.c), capital);
    res.z = z; res.ratio = ratio;
    return res;
  }

  function stats(equity, trades, closes, capital) {
    const ret = equity[equity.length - 1] / capital - 1;
    const bh = closes[closes.length - 1] / closes[0] - 1;
    let peak = -Infinity, mdd = 0;
    equity.forEach(e => { peak = Math.max(peak, e); mdd = Math.min(mdd, e / peak - 1); });
    const wins = trades.filter(t => t.ret > 0), losses = trades.filter(t => t.ret <= 0);
    const gw = wins.reduce((s, t) => s + t.ret, 0), gl = -losses.reduce((s, t) => s + t.ret, 0);
    const rets = equity.slice(1).map((e, i) => e / equity[i] - 1);
    const mu = rets.reduce((s, x) => s + x, 0) / (rets.length || 1);
    const sd = Math.sqrt(rets.reduce((s, x) => s + (x - mu) ** 2, 0) / (rets.length || 1));
    return {
      equity, trades, ret, bh, mdd,
      winRate: trades.length ? wins.length / trades.length : 0,
      pf: gl > 0 ? gw / gl : (gw > 0 ? Infinity : 0),
      sharpe: sd > 0 ? (mu / sd) * Math.sqrt(rets.length) : 0, // Sharpe sur la période testée (non annualisé)
      nTrades: trades.length
    };
  }

  M.Algos = { ALGOS, backtest, backtestPairs };
})();
