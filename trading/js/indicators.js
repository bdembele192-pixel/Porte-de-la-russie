/* Indicateurs techniques. Chaque fonction renvoie un tableau aligné sur les bougies (null tant que non calculable). */
window.M = window.M || {};

M.Ind = {
  sma(vals, n) {
    const out = new Array(vals.length).fill(null);
    let s = 0;
    for (let i = 0; i < vals.length; i++) {
      s += vals[i];
      if (i >= n) s -= vals[i - n];
      if (i >= n - 1) out[i] = s / n;
    }
    return out;
  },
  ema(vals, n) {
    const out = new Array(vals.length).fill(null);
    const k = 2 / (n + 1);
    let e = null;
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] == null) continue;
      if (e == null) {
        if (i >= n - 1) {
          let s = 0;
          for (let j = i - n + 1; j <= i; j++) s += vals[j];
          e = s / n;
          out[i] = e;
        }
        continue;
      }
      e = vals[i] * k + e * (1 - k);
      out[i] = e;
    }
    return out;
  },
  rsi(vals, n = 14) {
    const out = new Array(vals.length).fill(null);
    let g = 0, l = 0;
    for (let i = 1; i < vals.length; i++) {
      const d = vals[i] - vals[i - 1];
      const up = Math.max(d, 0), dn = Math.max(-d, 0);
      if (i <= n) {
        g += up; l += dn;
        if (i === n) { g /= n; l /= n; out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l); }
      } else {
        g = (g * (n - 1) + up) / n;
        l = (l * (n - 1) + dn) / n;
        out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
      }
    }
    return out;
  },
  stdev(vals, n) {
    const out = new Array(vals.length).fill(null);
    for (let i = n - 1; i < vals.length; i++) {
      let s = 0, s2 = 0;
      for (let j = i - n + 1; j <= i; j++) { s += vals[j]; s2 += vals[j] * vals[j]; }
      const m = s / n;
      out[i] = Math.sqrt(Math.max(s2 / n - m * m, 0));
    }
    return out;
  },
  bollinger(vals, n = 20, k = 2) {
    const mid = M.Ind.sma(vals, n), sd = M.Ind.stdev(vals, n);
    return {
      mid,
      up: mid.map((m, i) => m == null ? null : m + k * sd[i]),
      lo: mid.map((m, i) => m == null ? null : m - k * sd[i])
    };
  },
  atr(bars, n = 14) {
    const tr = bars.map((b, i) => i === 0 ? b.h - b.l :
      Math.max(b.h - b.l, Math.abs(b.h - bars[i - 1].c), Math.abs(b.l - bars[i - 1].c)));
    const out = new Array(bars.length).fill(null);
    let a = null;
    for (let i = 0; i < bars.length; i++) {
      if (i < n - 1) continue;
      if (a == null) { a = tr.slice(0, n).reduce((s, x) => s + x, 0) / n; }
      else a = (a * (n - 1) + tr[i]) / n;
      out[i] = a;
    }
    return out;
  },
  macd(vals, f = 12, s = 26, sig = 9) {
    const ef = M.Ind.ema(vals, f), es = M.Ind.ema(vals, s);
    const line = vals.map((_, i) => ef[i] != null && es[i] != null ? ef[i] - es[i] : null);
    const first = line.findIndex(x => x != null);
    const sg = new Array(vals.length).fill(null);
    if (first >= 0) {
      const sub = M.Ind.ema(line.slice(first), sig);
      sub.forEach((x, i) => sg[first + i] = x);
    }
    return { line, signal: sg, hist: line.map((x, i) => x != null && sg[i] != null ? x - sg[i] : null) };
  },
  donchian(bars, n) {
    const hi = new Array(bars.length).fill(null), lo = new Array(bars.length).fill(null);
    for (let i = n - 1; i < bars.length; i++) {
      let h = -Infinity, l = Infinity;
      for (let j = i - n + 1; j <= i; j++) { h = Math.max(h, bars[j].h); l = Math.min(l, bars[j].l); }
      hi[i] = h; lo[i] = l;
    }
    return { hi, lo };
  },
  vwap(bars) {
    // VWAP réinitialisé chaque jour (UTC)
    const out = [];
    let pv = 0, vv = 0, day = null;
    bars.forEach(b => {
      const d = Math.floor(b.t / 86400e3);
      if (d !== day) { pv = 0; vv = 0; day = d; }
      const tp = (b.h + b.l + b.c) / 3;
      pv += tp * b.v; vv += b.v;
      out.push(vv ? pv / vv : tp);
    });
    return out;
  }
};
