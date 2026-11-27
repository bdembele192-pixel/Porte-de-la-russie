// Construit js/missions2.js : vérifie chaque mission sur les vraies bougies Binance et calcule les chiffres de l'histoire.
const fs = require("fs");
const SPEC = require("./missions-spec.js").concat(require("./missions-spec2.js"));
const OUT = require("path").join(__dirname, "../../js/missions2.js");
const TF = { "1h": 3600e3, "4h": 14400e3, "1d": 86400e3 };
const SHORT = { BTCUSDT: "BTC", ETHUSDT: "ETH", SOLUSDT: "SOL", BNBUSDT: "BNB", XRPUSDT: "XRP", DOGEUSDT: "DOGE", PAXGUSDT: "l'or (PAXG)", EURUSDT: "l'EUR/USD" };
const CACHE = require("path").join(require("os").tmpdir(), "meche-kcache"); fs.mkdirSync(CACHE, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function klines(sym, tf, start, limit) {
  const f = `${CACHE}/${sym}-${tf}-${start}-${limit}.json`;
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f));
  const u = `https://data-api.binance.vision/api/v3/klines?symbol=${sym}&interval=${tf}&startTime=${start}&limit=${limit}`;
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(u); const d = await r.json(); if (Array.isArray(d)) { fs.writeFileSync(f, JSON.stringify(d)); return d; } } catch (e) {}
    await sleep(1000);
  }
  return [];
}
const dec = p => p >= 1000 ? 0 : p >= 100 ? 1 : p >= 10 ? 2 : p >= 1 ? 3 : p >= 0.1 ? 4 : 5;
const fmt = (p, sym) => p.toLocaleString("fr-FR", { minimumFractionDigits: sym === "EURUSDT" ? 4 : 0, maximumFractionDigits: sym === "EURUSDT" ? 4 : dec(p) }).replace(/ /g, " ");
const pc = v => (v >= 0 ? "+" : "−") + Math.abs(v * 100).toFixed(1).replace(".", ",") + " %";
const r4 = v => +v.toPrecision(3);
(async () => {
  const out = [], icons = {}, report = [];
  for (const s of SPEC) {
    const [id, icon, sym, tf, play0, ctx, play, title, year, teaser, story, lesson] = s;
    const start = Date.parse(play0) - ctx * TF[tf];
    const raw = await klines(sym, tf, start, ctx + play);
    const bars = raw.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4] }));
    if (bars.length < ctx + play * 0.9 || !bars.length || Math.abs(bars[0].t - start) > TF[tf]) { report.push(`✗ ${id} ${sym} : ${bars.length} bougies seulement`); continue; }
    const pb = bars.slice(ctx), p0 = bars[ctx - 1].c, p1 = pb[pb.length - 1].c;
    const lo = Math.min(...pb.map(b => b.l)), hi = Math.max(...pb.map(b => b.h));
    const loI = pb.findIndex(b => b.l === lo), hiI = pb.findIndex(b => b.h === hi);
    const k = { EURUSDT: 8, PAXGUSDT: 3 }[sym] || 1, range = (hi - lo) / p0 * k;
    const diff = range < 0.10 ? "Facile" : range < 0.2 ? "Moyen" : range < 0.38 ? "Difficile" : "Extrême";
    const unit = sym === "EURUSDT" ? "" : " $";
    const first = loI < hiI ? `un plus bas à ${fmt(lo, sym)}${unit} puis un plus haut à ${fmt(hi, sym)}${unit}` : `un plus haut à ${fmt(hi, sym)}${unit} puis un plus bas à ${fmt(lo, sym)}${unit}`;
    const data = ` Sur la mission, ${SHORT[sym]} passe de ${fmt(p0, sym)}${unit} à ${fmt(p1, sym)}${unit} (${pc(p1 / p0 - 1)}), avec ${first}.`;
    // Reconstitution hors ligne : dérive et volatilité réelles par tranches de bougies
    const regimes = [];
    const n = Math.max(8, Math.round(bars.length / 6));
    for (let i = 1; i < bars.length; i += n) {
      const seg = bars.slice(i, i + n), rets = seg.map((b, j) => Math.log(b.c / (j ? seg[j - 1].c : bars[i - 1].c)));
      const m = rets.reduce((a, x) => a + x, 0) / rets.length, sd = Math.sqrt(rets.reduce((a, x) => a + (x - m) ** 2, 0) / rets.length);
      regimes.push({ n: seg.length, drift: r4(m), vol: r4(Math.max(sd, 1e-5)) });
    }
    out.push({ id, emoji: "", title, year, sym, tf, start: new Date(start).toISOString().replace(".000", ""), ctx, play, diff, teaser, story: story + data, lesson, sim: { start: r4(bars[0].o), regimes } });
    icons[id] = icon;
    report.push(`✓ ${id.padEnd(12)} ${sym.padEnd(9)} ${tf} ${diff.padEnd(9)} ${pc(p1 / p0 - 1).padStart(9)} bas ${pc(lo / p0 - 1).padStart(9)} haut ${pc(hi / p0 - 1).padStart(9)}`);
  }
  const js = `/* Time Machine, suite : ${out.length} moments de marché supplémentaires (2017-2025), générés par build-missions.js.
   Les chiffres de chaque histoire sont calculés sur les vraies bougies Binance de la mission ; "sim" (dérive et
   volatilité réelles par tranches) sert de reconstitution hors ligne. */
window.M = window.M || {};
Object.assign(M.IC.mission, ${JSON.stringify(icons)});
M.MISSIONS.push(
${out.map(m => "  " + JSON.stringify(m)).join(",\n")}
);
`;
  fs.writeFileSync(OUT, js);
  console.log(report.join("\n"));
  console.log(out.length, "missions écrites");
})();
