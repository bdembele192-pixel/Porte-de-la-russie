/* Moteur de paper trading (positions long/short, levier, stop, objectif, liquidation, frais)
   et Coach qui analyse le comportement après coup. */
window.M = window.M || {};

(function () {
  const FEE = 0.001; // 0,1 % par exécution

  class Trader {
    constructor(state) {
      // state = { cash, pos, log } (objet persistant éventuel)
      this.s = state;
      if (!this.s.log) this.s.log = [];
    }
    get pos() { return this.s.pos; }

    equity(price) {
      const p = this.s.pos;
      if (!p) return this.s.cash;
      return this.s.cash + p.margin + this.upnl(price);
    }
    upnl(price) {
      const p = this.s.pos;
      return p ? p.dir * (price - p.entry) * p.qty : 0;
    }
    liqPrice(p) {
      return p.dir > 0 ? p.entry * (1 - 1 / p.lev) : p.entry * (1 + 1 / p.lev);
    }

    /* Ouvre une position. margin = mise en $, lev = levier, sl/tp = prix (ou null). */
    open({ dir, margin, lev, sl, tp, price, at, sym }) {
      if (this.s.pos) return { err: "Une position est déjà ouverte." };
      margin = Math.min(margin, this.s.cash / (1 + FEE * lev));
      if (!(margin > 0.5)) return { err: "Solde insuffisant." };
      const notional = margin * lev;
      const qty = notional / price;
      const fee = notional * FEE;
      const equityBefore = this.s.cash;
      this.s.cash -= margin + fee;
      this.s.pos = { dir, qty, entry: price, margin, lev, sl: sl || null, tp: tp || null, at, sym, fees: fee, equityBefore };
      this.s.pos.liq = lev > 1 ? this.liqPrice(this.s.pos) : null;
      return { ok: true, pos: this.s.pos };
    }

    close(price, reason, at) {
      const p = this.s.pos;
      if (!p) return null;
      let pnl = p.dir * (price - p.entry) * p.qty;
      const fee = p.qty * price * FEE;
      let back = p.margin + pnl - fee;
      if (reason === "liq" || back < 0) { back = 0; pnl = -p.margin; }
      this.s.cash += back;
      const tr = {
        sym: p.sym, dir: p.dir, entry: p.entry, exit: price, qty: p.qty, lev: p.lev, margin: p.margin,
        sl: p.sl, tp: p.tp, pnl: back - p.margin - p.fees, gross: pnl, fees: p.fees + fee, reason, openAt: p.at, closeAt: at,
        equityBefore: p.equityBefore
      };
      this.s.log.push(tr);
      this.s.pos = null;
      return tr;
    }

    /* Vérifie stop / objectif / liquidation sur une bougie (o, h, l). Gère les gaps à l'ouverture. */
    check(bar, at) {
      const p = this.s.pos;
      if (!p) return null;
      const long = p.dir > 0;
      const adverse = long ? bar.l : bar.h;
      const favorable = long ? bar.h : bar.l;
      // 1) liquidation
      if (p.liq && (long ? adverse <= p.liq : adverse >= p.liq)) {
        const hitSl = p.sl && (long ? p.sl > p.liq : p.sl < p.liq) && (long ? adverse <= p.sl : adverse >= p.sl);
        if (hitSl) return this.close(gapFill(bar.o, p.sl, long, true), "sl", at);
        return this.close(p.liq, "liq", at);
      }
      // 2) stop-loss (le pire cas est testé d'abord : prudence)
      if (p.sl && (long ? adverse <= p.sl : adverse >= p.sl)) return this.close(gapFill(bar.o, p.sl, long, true), "sl", at);
      // 3) objectif
      if (p.tp && (long ? favorable >= p.tp : favorable <= p.tp)) return this.close(gapFill(bar.o, p.tp, long, false), "tp", at);
      return null;
    }
  }

  // Si le marché ouvre au-delà du niveau, l'exécution se fait au prix d'ouverture (gap).
  function gapFill(open, level, long, isStop) {
    if (isStop) return long ? Math.min(open, level) : Math.max(open, level);
    return long ? Math.max(open, level) : Math.min(open, level);
  }

  /* Coach : analyse une liste de trades fermés et renvoie un score /100 + des retours concrets. */
  function coach(log, { bars } = {}) {
    const out = { score: 100, good: [], bad: [], tips: [] };
    if (!log.length) {
      out.score = null;
      out.tips.push("Aucun trade : parfois ne rien faire est la meilleure position. Mais pour progresser, il faut s'exposer (petite taille !).");
      return out;
    }
    const n = log.length;
    const noStop = log.filter(t => !t.sl);
    const liq = log.filter(t => t.reason === "liq");
    const risks = log.filter(t => t.sl).map(t => Math.abs(t.entry - t.sl) * t.qty / Math.max(t.equityBefore, 1));
    const avgRisk = risks.length ? risks.reduce((s, x) => s + x, 0) / risks.length : null;
    const maxLev = Math.max(...log.map(t => t.lev));
    const wins = log.filter(t => t.pnl > 0), losses = log.filter(t => t.pnl <= 0);
    const avgW = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgL = losses.length ? -losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;

    let revenge = 0;
    for (let i = 1; i < n; i++) {
      const prev = log[i - 1], t = log[i];
      if (prev.pnl < 0 && t.margin * t.lev > prev.margin * prev.lev * 1.4) {
        const gap = (t.openAt || 0) - (prev.closeAt || 0);
        const quick = bars ? gap <= 3 : gap <= 10 * 60e3;
        if (quick) revenge++;
      }
    }

    if (liq.length) { out.score -= 35; out.bad.push(`💀 ${liq.length} liquidation(s). Le levier a décidé à ta place.`); out.tips.push("Divise ton levier par 2… puis encore par 2. Avec ×3 max, une liquidation devient presque impossible si tu as un stop."); }
    if (noStop.length) {
      const pct = Math.round(noStop.length / n * 100);
      out.score -= Math.min(30, 8 + pct / 4);
      out.bad.push(`🪂 ${pct} % de tes trades sans stop-loss.`);
      out.tips.push("Règle d'or : pas de trade sans stop. Pose-le AU MOMENT d'entrer, pas « plus tard ».");
    } else out.good.push("🛡️ Stop-loss sur 100 % des trades. Respect.");

    if (avgRisk != null) {
      if (avgRisk > 0.05) { out.score -= 20; out.bad.push(`🔥 Risque moyen de ${pctFr(avgRisk)} du compte par trade.`); out.tips.push("Vise 1 à 2 % de risque par trade : rapproche ton stop ou réduis ta mise."); }
      else if (avgRisk > 0.021) { out.score -= 8; out.bad.push(`⚠️ Risque moyen de ${pctFr(avgRisk)} par trade, un peu élevé.`); }
      else out.good.push(`🎯 Risque moyen de ${pctFr(avgRisk)} par trade : gestion pro.`);
    }
    if (maxLev > 10) { out.score -= 12; out.bad.push(`🎰 Levier jusqu'à ×${maxLev}.`); }
    else if (maxLev <= 3) out.good.push(`🧘 Levier raisonnable (max ×${maxLev}).`);

    if (revenge) { out.score -= 12 * Math.min(revenge, 2); out.bad.push(`😤 ${revenge} trade(s) de revenge : taille augmentée juste après une perte.`); out.tips.push("Après une perte : pause. Le trade suivant doit avoir la MÊME taille de risque, jamais plus."); }

    if (bars && n > bars / 6) { out.score -= 10; out.bad.push(`🌀 ${n} trades en ${bars} bougies : surtrading. Les frais t'ont coûté ${fmt$(log.reduce((s, t) => s + t.fees, 0))}.`); }

    if (wins.length && losses.length) {
      const rr = avgW / avgL;
      if (rr >= 1.5) out.good.push(`📐 Gain moyen ${rr.toFixed(1)}× plus gros que la perte moyenne. C'est ça, l'edge.`);
      else if (rr < 0.8) { out.score -= 8; out.bad.push(`✂️ Tu coupes tes gains trop tôt : gain moyen ${fmt$(avgW)} vs perte moyenne ${fmt$(avgL)}.`); out.tips.push("Fixe un objectif à au moins 2× la distance de ton stop (R:R 1:2), et laisse-le travailler."); }
    }
    if (log.some(t => t.reason === "tp")) out.good.push("💰 Objectif touché au moins une fois : plan suivi jusqu'au bout.");

    out.score = Math.max(0, Math.min(100, Math.round(out.score)));
    if (!out.tips.length) out.tips.push(out.score >= 85 ? "Discipline solide. Prochaine étape : tenir un journal pour comprendre POURQUOI tes meilleurs trades marchent." : "Continue à pratiquer avec des petites tailles et un plan écrit.");
    return out;
  }

  function pctFr(v) { return (v * 100).toFixed(1).replace(".", ",") + " %"; }
  function fmt$(v) {
    // v est en dollars ; affichage dans la devise choisie (Paramètres → Montants)
    const c = M.currency ? M.currency() : { rate: 1, sym: "$", dec: 2 };
    const x = v * c.rate;
    return (x < 0 ? "−" : "") + Math.abs(x).toLocaleString("fr-FR", { maximumFractionDigits: c.dec, minimumFractionDigits: c.dec }) + " " + c.sym;
  }

  M.Trader = Trader;
  M.coach = coach;
  M.fmt$ = fmt$;
  M.FEE = FEE;
})();
