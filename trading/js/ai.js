/* Mèche IA
   1. Modèle d'apprentissage (régression logistique) qui s'entraîne sur les VRAIES bougies du marché
      à chaque ouverture de l'app en ligne, et sur les trades des utilisateurs (pondérés par leur discipline).
      Cible : « un trade discipliné façon pro (stop 1,5 ATR, objectif 2R) aurait-il atteint son objectif ? »
   2. Copilote : analyse chaque ordre LIVE avant envoi, signale les risques et propose une version plus sûre.
      Surveille aussi les positions ouvertes. N'intervient jamais dans les missions, le swipe ni le quiz.
   3. Chat : glossaire + cours + base de connaissances + Wikipédia (apprentissage en ligne),
      et en option le « cerveau Claude » (API Anthropic, avec recherche web). */
window.M = window.M || {};

(function () {
  const I = M.Ind;
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const esc = v => String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clip = (v, a, b) => Math.max(a, Math.min(b, v));
  const sig = z => 1 / (1 + Math.exp(-z));
  const pct = v => (v * 100).toFixed(1).replace(".", ",") + " %";
  const NF = 8;
  // A priori « expert » : suivre la tendance aide, acheter un excès ou une volatilité extrême pénalise.
  const PRIOR = [0.15, 0.45, -0.15, 0.25, -0.1, -0.2, 0.1, Math.log(1 / 2)];
  const STOP_ATR = 1.5, RR = 2, HORIZON = 48;

  function st() {
    const s = M.state;
    if (!s.ai) s.ai = {};
    const a = s.ai;
    if (!a.w || a.w.length !== NF) a.w = PRIOR.slice();
    a.metrics = a.metrics || null;
    a.n = a.n || 0; a.userN = a.userN || 0;
    a.learned = a.learned || [];
    a.chat = a.chat || [];
    a.cfg = Object.assign({ guard: true, notify: true, strict: false, claudeKey: "", claudeModel: "claude-opus-5-5" }, a.cfg || {});
    return a;
  }

  // ---------- Caractéristiques ----------
  function pre(bars) {
    const c = bars.map(b => b.c), v = bars.map(b => b.v || 0);
    const atr = I.atr(bars, 14);
    const atrPct = atr.map((a, i) => a ? a / c[i] : null).filter(x => x);
    const sorted = atrPct.slice().sort((a, b) => a - b);
    return {
      c, ema20: I.ema(c, 20), ema50: I.ema(c, 50), rsi: I.rsi(c, 14), atr,
      bb: I.bollinger(c, 20, 2), sd: I.stdev(c, 20), vs: I.sma(v, 20), v,
      medAtr: sorted[Math.floor(sorted.length / 2)] || 0.01
    };
  }
  function feat(P, bars, i, dir) {
    const c = P.c[i], a = P.atr[i];
    if (i < 60 || !a || P.ema50[i] == null || P.rsi[i] == null || !P.sd[i]) return null;
    return [
      dir * clip((c - P.ema20[i]) / a, -4, 4) / 4,
      dir * clip((P.ema20[i] - P.ema50[i]) / a, -4, 4) / 4,
      dir * (P.rsi[i] / 100 - 0.5) * 2,
      dir * clip((c - P.c[i - 10]) / (a * 3.16), -3, 3) / 3,
      dir * clip((c - P.bb.mid[i]) / (2 * P.sd[i]), -2, 2) / 2,
      clip((a / c) / P.medAtr - 1, -1, 2) / 2,
      P.vs[i] ? clip(P.v[i] / P.vs[i] - 1, -1, 3) / 3 : 0,
      1
    ];
  }
  // Étiquette « triple barrière » : objectif 2R touché avant le stop (1), stop d'abord (0), sinon ignoré.
  function label(bars, P, i, dir) {
    const e = P.c[i], a = P.atr[i];
    const stop = e - dir * STOP_ATR * a, tp = e + dir * STOP_ATR * a * RR;
    for (let j = i + 1; j < Math.min(bars.length, i + 1 + HORIZON); j++) {
      const b = bars[j];
      if (dir > 0 ? b.l <= stop : b.h >= stop) return 0;
      if (dir > 0 ? b.h >= tp : b.l <= tp) return 1;
    }
    return null;
  }
  // Probabilités bornées à [3 %, 97 %] : le modèle ne doit jamais se croire certain.
  const predict = (x, w = st().w) => clip(sig(x.reduce((s, xi, k) => s + xi * w[k], 0)), 0.03, 0.97);

  function sgd(w, data, { epochs = 4, lr = 0.05, l2 = 0.002 } = {}) {
    for (let ep = 0; ep < epochs; ep++) {
      for (let k = data.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [data[k], data[j]] = [data[j], data[k]]; }
      const a = lr / (1 + ep);
      for (const s of data) {
        const g = (predict(s.x, w) - s.y) * (s.wt || 1);
        for (let f = 0; f < NF; f++) w[f] -= a * (g * s.x[f] + l2 * (w[f] - PRIOR[f]));
      }
    }
    return w;
  }

  // ---------- Entraînement sur le marché réel ----------
  let training = null;
  async function train({ force, onProgress } = {}) {
    const a = st();
    if (training) return training;
    if (!force && a.at && Date.now() - a.at < 3 * 3600e3) return null;
    training = (async () => {
      const series = [];
      const jobs = [];
      M.Market.ASSETS.forEach(as => ["1h", "4h"].forEach(tf => jobs.push([as.sym, tf])));
      let done = 0;
      for (const [sym, tf] of jobs) {
        const r = await M.Market.klines(sym, tf, { limit: 1000 });
        done++;
        onProgress && onProgress(done / jobs.length, sym, tf, r.live);
        if (r.live && r.bars.length > 200) series.push(r.bars); // jamais de données simulées
      }
      if (!series.length) return { ok: false, why: "Marché injoignable : pas d'entraînement sur des données simulées." };
      const tr = [], va = [];
      series.forEach(bars => {
        const P = pre(bars);
        const cut = Math.floor(bars.length * 0.75);
        for (let i = 60; i < bars.length - 1; i++) {
          for (const dir of [1, -1]) {
            const x = feat(P, bars, i, dir); if (!x) continue;
            const y = label(bars, P, i, dir); if (y == null) continue;
            (i < cut ? tr : va).push({ x, y });
          }
        }
      });
      // Validation honnête : on entraîne sur le passé et on mesure sur la période la plus récente, jamais vue.
      const w = sgd(a.w.slice(), tr);
      const base = va.reduce((s, d) => s + d.y, 0) / (va.length || 1);
      let brier = 0, brier0 = 0, right = 0, picked = 0, pickedWin = 0;
      va.forEach(d => {
        const p = predict(d.x, w);
        brier += (p - d.y) ** 2; brier0 += (base - d.y) ** 2;
        if ((p >= 0.5) === (d.y === 1)) right++;
        if (p > base + 0.05) { picked++; pickedWin += d.y; }
      });
      const n = va.length || 1;
      const skill = 1 - brier / (brier0 || 1);
      const rAll = base * RR - (1 - base), rPick = picked ? (pickedWin / picked) * RR - (1 - pickedWin / picked) : null;
      // Le modèle n'est adopté que s'il ne fait pas pire que la simple moyenne sur les données récentes.
      if (skill > -0.002) a.w = sgd(w, va, { epochs: 2 });
      a.n += tr.length + va.length;
      a.at = Date.now();
      a.metrics = { base, skill, acc: right / n, nVal: va.length, nTrain: tr.length, rAll, rPick, picked, series: series.length, adopted: skill > -0.002 };
      M.save();
      return { ok: true, metrics: a.metrics };
    })();
    try { return await training; } finally { training = null; }
  }

  // ---------- Apprentissage sur les trades des utilisateurs ----------
  function snapshot(bars, dir) {
    if (!bars || bars.length < 80) return null;
    const P = pre(bars), i = bars.length - 1;
    const x = feat(P, bars, i, dir);
    return x ? { x, p: predict(x) } : null;
  }
  function learnFromTrade(t, snap) {
    if (!snap) return;
    const a = st();
    // Les trades disciplinés (stop posé, risque ≤ 2 %) comptent pleinement : c'est le comportement des traders qui durent.
    const risk = t.sl ? Math.abs(t.entry - t.sl) * t.qty / Math.max(t.equityBefore, 1) : 1;
    const wt = t.sl && risk <= 0.021 && t.lev <= 5 ? 1 : 0.25;
    sgd(a.w, [{ x: snap.x, y: t.pnl > 0 ? 1 : 0, wt }], { epochs: 1, lr: 0.03 });
    a.userN++;
    M.save();
  }

  // ---------- Copilote : revue d'un ordre live ----------
  function review(c, dir, ctx) {
    const a = st(), m = a.metrics;
    const bars = ctx.bars || [];
    const out = { issues: [], good: [], score: 100 };
    const add = (lvl, t) => { out.issues.push({ lvl, t }); out.score -= { high: 30, mid: 12, low: 5 }[lvl]; };
    const price = c.price, tr = ctx.trader;
    const P = bars.length > 80 ? pre(bars) : null, i = bars.length - 1;
    const atr = P && P.atr[i] ? P.atr[i] : price * 0.01;
    const eq = tr.equity(price);
    const slDist = c.slPrice ? Math.abs(price - c.slPrice) : null;
    const tpDist = c.tpPrice ? Math.abs(c.tpPrice - price) : null;
    const trend = P ? Math.sign(P.ema20[i] - P.ema50[i]) : 0;
    const xD = P && feat(P, bars, i, dir), xO = P && feat(P, bars, i, -dir);
    const pD = xD ? predict(xD) : null, pO = xO ? predict(xO) : null;
    const base = m ? m.base : 1 / 3, trusted = m && m.skill > 0.002;

    if (!c.slPrice) add("high", "Aucun stop-loss : une seule mauvaise nouvelle peut emporter toute ta mise.");
    if (c.liq && c.slPrice && (dir > 0 ? c.liq >= c.slPrice : c.liq <= c.slPrice)) add("high", "Ta liquidation arrive AVANT ton stop : le stop ne te protège pas.");
    if (c.riskPct > 0.05) add("high", `Tu risques ${pct(c.riskPct)} de ton compte sur un seul trade.`);
    else if (c.riskPct > 0.021) add("mid", `Risque de ${pct(c.riskPct)} du compte : au-dessus de la règle des 1-2 %.`);
    else if (c.slPrice) out.good.push(`Risque maîtrisé (${pct(c.riskPct)} du compte).`);
    if (c.L > 10) add("high", `Levier ×${c.L} : un mouvement de ${(100 / c.L).toFixed(1).replace(".", ",")} % suffit à te liquider.`);
    else if (c.L > 5) add("mid", `Levier ×${c.L} élevé pour ce type de trade.`);
    if (slDist && slDist < 0.8 * atr) add("mid", `Stop trop serré : ${((slDist / atr)).toFixed(1).replace(".", ",")} ATR seulement, il risque d'être touché par le bruit normal du marché.`);
    if (slDist && tpDist && tpDist / slDist < 1.5) add("mid", `Ratio gain/risque de 1:${(tpDist / slDist).toFixed(1).replace(".", ",")} : il faudrait gagner plus de ${Math.round(100 / (1 + tpDist / slDist))} % du temps pour être rentable.`);
    if (!c.tpPrice) add("low", "Pas d'objectif : décide AVANT d'entrer où tu prendras tes gains.");
    if (P && trend && trend !== dir && (P.c[i] - P.ema50[i]) * dir < 0) add("mid", `Tu vas ${dir > 0 ? "acheter" : "vendre"} contre la tendance (EMA 20 ${dir > 0 ? "sous" : "au-dessus de"} l'EMA 50, prix ${dir > 0 ? "sous" : "au-dessus de"} l'EMA 50).`);
    else if (P && trend === dir) out.good.push("Dans le sens de la tendance.");
    if (P && P.rsi[i] != null && (dir > 0 ? P.rsi[i] > 75 : P.rsi[i] < 25)) add("low", `RSI à ${P.rsi[i].toFixed(0)} : tu entres sur un excès, le risque de repli est élevé.`);
    if (P && atr / price > 2.2 * P.medAtr) add("mid", "Volatilité exceptionnelle en ce moment : les stops sautent plus facilement, réduis la taille.");
    if (trusted && pD != null) {
      if (pD < base - 0.04) add("mid", `Le modèle estime ce setup moins favorable que la moyenne (${pct(pD)} contre ${pct(base)} habituellement).`);
      else if (pD > base + 0.04) out.good.push(`Le modèle voit ce setup plus favorable que la moyenne (${pct(pD)} contre ${pct(base)}).`);
    }
    const log = tr.s.log, last = log[log.length - 1];
    if (last && last.pnl < 0 && Date.now() - (last.closeAt || 0) < 15 * 60e3 && c.m * c.L > last.margin * last.lev * 1.4)
      add("high", "Revenge trading détecté : tu augmentes ta taille juste après une perte.");
    const d0 = new Date(); d0.setHours(0, 0, 0, 0);
    const todayLosses = log.filter(t => (t.closeAt || 0) >= d0.getTime() && t.pnl < 0).length;
    if (todayLosses >= 3) add("mid", `${todayLosses} pertes aujourd'hui : la fatigue émotionnelle augmente le risque d'erreur.`);
    const mine = log.filter(t => t.sym === ctx.sym);
    if (mine.length >= 5) {
      const wr = mine.filter(t => t.pnl > 0).length / mine.length;
      if (wr < 0.35) add("low", `Historiquement, tu gagnes seulement ${Math.round(wr * 100)} % de tes trades sur ${M.Market.asset(ctx.sym).short}.`);
    }

    // Proposition plus favorable : même sens, stop hors du bruit, objectif 2R, risque 1 % (0,5 % si signaux rouges).
    let sd = slDist && slDist >= 1.2 * atr && slDist <= 3 * atr ? slDist : STOP_ATR * atr;
    const td = Math.max(RR * sd, tpDist && tpDist > RR * sd ? tpDist : 0);
    const severe = out.issues.some(x => x.lvl === "high") || todayLosses >= 3;
    const riskTarget = eq * (severe ? 0.005 : 0.01);
    let notional = riskTarget / (sd / price + 2 * M.FEE);
    let L = Math.max(1, Math.min(c.L, 3, Math.floor(price / (1.25 * sd))));
    let margin = notional / L;
    if (margin > tr.s.cash * 0.9) { margin = tr.s.cash * 0.9; notional = margin * L; }
    const prop = {
      dir, m: margin, L, slp: sd / price * 100, tpp: td / price * 100,
      slPrice: price - dir * sd, tpPrice: price + dir * td,
      riskUsd: notional * (sd / price + 2 * M.FEE), notional, liq: L > 1 ? price * (1 - dir / L) : null
    };
    prop.riskPct = prop.riskUsd / Math.max(eq, 1);
    // Probabilités : modèle si fiable, sinon approximation « marche aléatoire » (stop / (stop + objectif))
    const rw = (s, t) => s / (s + t);
    const edge = trusted && pD != null ? clip(pD / base, 0.6, 1.5) : 1;
    prop.p = trusted && pD != null ? pD : rw(sd, td);
    prop.ev = prop.p * prop.riskUsd * (td / sd) - (1 - prop.p) * prop.riskUsd;
    const user = { p: slDist && tpDist ? clip(rw(slDist, tpDist) * edge, 0.02, 0.98) : null };
    if (user.p != null) user.ev = user.p * c.notional * (tpDist / price) - (1 - user.p) * c.riskUsd;
    out.prop = prop; out.user = user; out.trusted = trusted; out.pOpp = pO; out.pDir = pD; out.base = base;
    out.wait = P && trend && trend !== dir && (!trusted || (pO != null && pO > (pD || 0) + 0.06));
    out.score = Math.max(0, out.score);
    out.block = out.issues.some(x => x.lvl === "high" || x.lvl === "mid") || (a.cfg.strict && out.issues.length > 0);
    return out;
  }

  /* Appelé par le ticket d'ordre LIVE uniquement. Retourne true si le copilote prend la main. */
  function advise(c, dir, ctx, actions) {
    const a = st();
    if (!a.cfg.guard) return false;
    const r = review(c, dir, ctx);
    if (!r.block) {
      M.toast(`Copilote : ordre validé (score ${r.score}/100)`, "win");
      return false;
    }
    const f = M.Market.fmtPrice, fm = v => M.fmt$(v);
    const row = (k, u, p, tip) => `<div class="cmp-r" ${tip ? `data-tip-text="${esc(tip)}"` : ""}><span>${k}</span><span class="mono">${u}</span><span class="mono up">${p}</span></div>`;
    const prop = r.prop, u = c;
    const noEdge = r.wait || prop.ev <= 0;
    const md = M.modal(`
      <div class="ai-review">
        <p class="eyebrow">${M.icon("shield")} <span>Alerte du copilote</span></p>
        <h2>Ce trade peut te coûter cher</h2>
        <div class="ai-score"><div class="ring" style="--p:${r.score}"><b>${r.score}</b></div>
          <div class="cl bad">${r.issues.map(x => `<p>${x.lvl === "high" ? "🔴" : x.lvl === "mid" ? "🟠" : "🟡"} ${esc(x.t)}</p>`).join("")}</div></div>
        ${r.good.length ? `<div class="cl good">${r.good.map(x => `<p>✅ ${esc(x)}</p>`).join("")}</div>` : ""}
        ${r.wait ? `<p class="cl tips">⏸ <b>Option la plus sûre : attendre.</b> Le marché va dans l'autre sens ; laisse la tendance se retourner (EMA 20 qui recroise l'EMA 50) avant d'entrer. Si tu tiens à entrer, voici la version la moins risquée :</p>` : ""}
        <div class="cmp ai-cmp">
          <div class="cmp-r head"><span></span><span>Ton ordre</span><span>Proposition IA</span></div>
          ${row("Sens", dir > 0 ? "Long" : "Short", dir > 0 ? "Long" : "Short")}
          ${row("Mise", fm(u.m), fm(prop.m))}
          ${row("Levier", "×" + u.L, "×" + prop.L)}
          ${row("Stop", u.slPrice ? f(u.slPrice) : "aucun", f(prop.slPrice), "Proposition : 1,5 ATR, en dehors du bruit normal du marché.")}
          ${row("Objectif", u.tpPrice ? f(u.tpPrice) : "aucun", f(prop.tpPrice), "Proposition : au moins 2 fois la distance du stop.")}
          ${row("Risque max", fm(u.riskUsd) + " · " + pct(u.riskPct), fm(prop.riskUsd) + " · " + pct(prop.riskPct), "Ce que tu perds si le stop est touché (frais inclus).")}
          ${row("Liquidation", u.liq ? f(u.liq) : "—", prop.liq ? f(prop.liq) : "—")}
          ${row("Chance d'atteindre l'objectif", r.user.p != null ? pct(r.user.p) : "?", pct(prop.p), r.trusted ? "Estimée par le modèle entraîné sur l'historique réel du marché." : "Estimation statistique (modèle pas encore assez fiable sur ce marché).")}
          ${row("Espérance du trade", r.user.ev != null ? fm(r.user.ev) : "?", fm(prop.ev), "Gain moyen attendu si on répétait ce trade un grand nombre de fois. Ce n'est PAS une garantie.")}
        </div>
        <p class="muted small">L'IA réduit tes chances de grosses pertes ; elle ne peut pas les supprimer. Aucune proposition n'est une garantie de gain.</p>
        ${noEdge ? `<p class="cl tips">🧭 <b>Conseil de l'IA : ne pas trader maintenant.</b> Même avec un risque réduit, l'espérance estimée de ce trade est négative. La proposition ci-dessus limite juste les dégâts si tu tiens absolument à entrer.</p>` : ""}
        <div class="cta">
          ${noEdge ? `<button class="btn primary" id="ai-wait">${M.icon("shield")} Attendre (recommandé)</button>` : ""}
          <button class="btn ${noEdge ? "ghost" : "primary"}" id="ai-apply">${noEdge ? "Version à risque réduit" : M.icon("shield") + " Appliquer la proposition"}</button>
          <button class="btn ghost" id="ai-keep">Garder mon ordre</button>
          <button class="btn ghost" data-close>Annuler</button>
        </div>
      </div>`, { wide: true });
    $("#ai-apply", md.el).onclick = () => { md.close(); M.unlock("ai_saved"); actions.apply(prop); };
    const w = $("#ai-wait", md.el);
    if (w) w.onclick = () => { md.close(); M.unlock("ai_saved"); M.toast("Sage décision : pas de trade vaut mieux qu'un mauvais trade 🧘", "win"); };
    $("#ai-keep", md.el).onclick = () => { md.close(); actions.keep(); };
    M.sfx("ko");
    return true;
  }

  // ---------- Surveillance des positions live ----------
  const sent = {};
  function monitor(trader, price, bars, actions) {
    const a = st(), p = trader.pos;
    if (!a.cfg.guard || !p || !price) return;
    const key = p.at + ":";
    const once = (k, fn) => { if (sent[key + k]) return; sent[key + k] = 1; fn(); };
    const R = p.sl ? Math.abs(p.entry - p.sl) : null;
    const gain = p.dir * (price - p.entry);
    if (R && gain >= R && p.sl !== p.entry && (p.dir > 0 ? p.sl < p.entry : p.sl > p.entry))
      once("be", () => notify("Ton trade a gagné 1R", "Sécurise-le : remonte ton stop au prix d'entrée. Le trade ne pourra plus devenir perdant (hors gap).", [{ t: "Stop au point mort", f: actions.breakeven }]));
    if (R && gain < 0 && -gain >= 0.7 * R)
      once("sl", () => notify("Ton stop approche", "Le prix est à 70 % du chemin vers ton stop. Laisse le plan travailler : ne déplace pas ton stop plus loin.", []));
    if (p.liq && Math.abs(price - p.liq) / price < 0.02)
      once("liq", () => notify("⚠️ Liquidation proche", "Tu es à moins de 2 % de ta liquidation. Réduis le risque maintenant.", [{ t: "Clôturer", f: actions.close }]));
    if (bars && bars.length > 60) {
      const P = pre(bars), i = bars.length - 1;
      if (Math.sign(P.ema20[i] - P.ema50[i]) === -p.dir && Math.sign(P.ema20[i - 1] - P.ema50[i - 1]) !== -p.dir)
        once("flip", () => notify("La tendance se retourne", `L'EMA 20 vient de croiser l'EMA 50 contre ta position ${p.dir > 0 ? "longue" : "courte"}. Envisage de resserrer ton stop ou de sécuriser une partie.`, []));
    }
  }

  function notify(title, body, acts) {
    const box = $("#ai-notes") || (() => { const d = document.createElement("div"); d.id = "ai-notes"; document.body.appendChild(d); return d; })();
    const n = document.createElement("div");
    n.className = "ai-note glass";
    n.innerHTML = `<div class="an-h">${M.icon("bot")}<b>${esc(title)}</b><button class="an-x" aria-label="Fermer">${M.icon("x")}</button></div><p>${esc(body)}</p>
      <div class="an-a">${acts.map((x, k) => `<button class="btn primary sm" data-k="${k}">${esc(x.t)}</button>`).join("")}</div>`;
    box.appendChild(n);
    $(".an-x", n).onclick = () => n.remove();
    $$("[data-k]", n).forEach(b => b.onclick = () => { acts[+b.dataset.k].f(); n.remove(); });
    setTimeout(() => n.remove(), 20000);
    M.sfx("tap");
    try {
      if (st().cfg.notify && document.hidden && "Notification" in window && Notification.permission === "granted")
        new Notification("Mèche IA · " + title, { body });
    } catch (e) { /* notifications indisponibles */ }
  }

  // ---------- Chat : recherche dans les connaissances ----------
  const STOP = new Set("le la les un une des de du d l et ou a au aux en dans sur pour par avec sans ce cet cette ces que qui quoi quel quelle quels quelles est sont etre c qu je tu il elle on nous vous ils elles me te se mon ma mes ton ta tes son sa ses comment pourquoi quand combien explique expliquer moi definition definir veut dire signifie cest stp svp peux tu dit dis parle parler sais savoir y a t ne pas plus moins tres".split(" "));
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const toks = s => norm(s).split(/[^a-z0-9]+/).filter(w => w.length > 1 && !STOP.has(w)).map(w => w.length > 4 ? w.replace(/(s|x)$/, "") : w);
  let index = null;
  function buildIndex() {
    const docs = [];
    Object.entries(M.GLOSSARY).forEach(([k, g]) => docs.push({ t: g.t, d: "Glossaire", text: g.d, key: k + " " + g.t, src: "#/glossary" }));
    M.COURSES.forEach(c => c.lessons.forEach((l, i) => docs.push({
      t: l.h, d: "Cours · " + c.title, text: l.body.replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, k, lab) => lab || (M.GLOSSARY[k] ? M.GLOSSARY[k].t : k)).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      key: c.title + " " + l.h, src: `#/course/${c.id}/${i}`
    })));
    M.KB.forEach(e => docs.push({ t: e.t, d: e.d, text: e.a, key: e.k + " " + e.t }));
    st().learned.forEach(e => docs.push({ t: e.t, d: "Appris en ligne", text: e.a, key: e.t, src: e.url, ext: true }));
    docs.forEach(d => { d.tk = toks(d.key + " " + d.key + " " + d.t + " " + d.text); d.len = d.tk.length; });
    const df = {};
    docs.forEach(d => new Set(d.tk).forEach(w => df[w] = (df[w] || 0) + 1));
    const avg = docs.reduce((s, d) => s + d.len, 0) / docs.length;
    index = { docs, df, avg, N: docs.length };
  }
  function search(q, k = 3) {
    if (!index) buildIndex();
    const qt = [...new Set(toks(q))];
    if (!qt.length) return [];
    const { docs, df, avg, N } = index;
    return docs.map(d => {
      let s = 0;
      qt.forEach(w => {
        const f = d.tk.filter(x => x === w).length;
        if (!f) return;
        const idf = Math.log(1 + (N - df[w] + 0.5) / (df[w] + 0.5));
        s += idf * f * 2.4 / (f + 1.4 * (0.3 + 0.7 * d.len / avg));
        if (norm(d.t).includes(w)) s += idf * 0.8;
      });
      return { d, s: s / Math.sqrt(qt.length) };
    }).filter(r => r.s > 0).sort((a, b) => b.s - a.s).slice(0, k);
  }

  const ASSET_RX = [
    [/\b(btc|bitcoin)\b/, "BTCUSDT"], [/\b(eth|ethereum|ether)\b/, "ETHUSDT"], [/\b(sol|solana)\b/, "SOLUSDT"], [/\bbnb\b/, "BNBUSDT"],
    [/\b(xrp|ripple)\b/, "XRPUSDT"], [/\b(doge|dogecoin)\b/, "DOGEUSDT"], [/\b(or|gold|paxg)\b/, "PAXGUSDT"], [/\b(euro|eur|eurusd)\b/, "EURUSDT"]
  ];
  const assetOf = q => { const n = norm(q); const f = ASSET_RX.find(([rx]) => rx.test(n)); return f ? f[1] : null; };

  async function analysis(sym) {
    const as = M.Market.asset(sym);
    const [h1, h4] = await Promise.all([M.Market.klines(sym, "1h", { limit: 300 }), M.Market.klines(sym, "4h", { limit: 300 })]);
    const a = st(), m = a.metrics, trusted = m && m.skill > 0.002;
    const line = (r, tf) => {
      const b = r.bars, P = pre(b), i = b.length - 1, c = P.c[i];
      const trend = P.ema20[i] > P.ema50[i] ? "haussière" : "baissière";
      const d = I.donchian(b, 20);
      const pl = predict(feat(P, b, i, 1)), ps = predict(feat(P, b, i, -1));
      return { tf, c, trend, up: P.ema20[i] > P.ema50[i], rsi: P.rsi[i], atr: P.atr[i], hi: d.hi[i], lo: d.lo[i], pl, ps };
    };
    const A = line(h1, "1h"), B = line(h4, "4h");
    const f = M.Market.fmtPrice;
    const live = h1.live && h4.live;
    let verdict, setup = "";
    const eq = new M.Trader(M.state.wallet).equity(A.c);
    const mk = dir => {
      const sd = STOP_ATR * A.atr, stop = A.c - dir * sd, tp = A.c + dir * sd * RR;
      const qty = eq * 0.01 / sd;
      return `<b>Setup éducatif ${dir > 0 ? "LONG" : "SHORT"}</b> : entrée ~${f(A.c)}, stop ${f(stop)} (1,5 ATR), objectif ${f(tp)} (2R). Pour risquer 1 % de ton compte (${M.fmt$(eq * 0.01)}) : environ ${qty.toLocaleString("fr-FR", { maximumFractionDigits: 4 })} ${as.short}.`;
    };
    if (A.up === B.up) {
      const dir = A.up ? 1 : -1;
      const p = dir > 0 ? A.pl : A.ps;
      const ok = !trusted || p >= m.base;
      verdict = `Les tendances 1h et 4h sont alignées (${A.trend}). ${ok ? "Le contexte favorise plutôt les trades dans ce sens." : "Mais le modèle ne voit pas d'avantage statistique en ce moment : patience."}`;
      if (ok) setup = mk(dir);
    } else verdict = "Les tendances 1h et 4h se contredisent : pas de setup clair. L'option la plus sûre est d'attendre que les deux s'alignent.";
    const rsiTxt = r => r > 70 ? "suracheté" : r < 30 ? "survendu" : "neutre";
    return `<b>${as.name} (${as.short}/USDT)</b>${live ? "" : " · <i>données simulées (marché injoignable)</i>"}<br>
      Prix : <b>${f(A.c)}</b><br>
      • 1h : tendance ${A.trend}, RSI ${A.rsi.toFixed(0)} (${rsiTxt(A.rsi)}), zone ${f(A.lo)} – ${f(A.hi)}<br>
      • 4h : tendance ${B.trend}, RSI ${B.rsi.toFixed(0)} (${rsiTxt(B.rsi)}), zone ${f(B.lo)} – ${f(B.hi)}<br>
      ${trusted ? `• Modèle (1h) : objectif 2R atteint avant le stop dans ~${pct(A.pl)} des cas pour un long, ~${pct(A.ps)} pour un short (moyenne ${pct(m.base)}).<br>` : "• Modèle : pas encore assez fiable sur les données récentes, je m'appuie sur les règles de tendance et de risque.<br>"}
      <br>${verdict}${setup ? "<br><br>" + setup : ""}
      <br><br><small class="muted">Analyse éducative, pas un conseil en investissement. Aucun setup n'est garanti : le stop est obligatoire.</small>`;
  }

  async function wiki(q) {
    const lang = ["en", "zh", "ru"].includes(M.state.settings.lang) ? M.state.settings.lang : "fr";
    const clean = q.replace(/[?!.]/g, " ").replace(/\b(c'est quoi|qu'est-ce que|qu'est ce que|explique(-moi)?|definition de|définition de|parle(-moi)? de|que veut dire|c est quoi)\b/gi, " ").trim();
    const s = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(clean)}&format=json&origin=*&srlimit=1`).then(r => r.json());
    const hit = s && s.query && s.query.search && s.query.search[0];
    if (!hit) return null;
    const sum = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`).then(r => r.json());
    if (!sum || !sum.extract) return null;
    const e = { t: sum.title, a: sum.extract.slice(0, 1200), url: (sum.content_urls && sum.content_urls.desktop && sum.content_urls.desktop.page) || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`, at: Date.now() };
    const a = st();
    if (!a.learned.some(x => x.t === e.t)) { a.learned.unshift(e); a.learned = a.learned.slice(0, 150); M.save(); index = null; }
    return e;
  }

  function stats() {
    const log = M.state.wallet.log;
    if (!log.length) return "Tu n'as encore aucun trade live clôturé. Lance-toi dans <b>Live</b> avec une petite taille : je t'analyserai ensuite.";
    const wins = log.filter(t => t.pnl > 0), pnl = log.reduce((s, t) => s + t.pnl, 0);
    const noSl = log.filter(t => !t.sl).length;
    const bySym = {};
    log.forEach(t => { const b = bySym[t.sym] = bySym[t.sym] || { n: 0, w: 0, p: 0 }; b.n++; b.p += t.pnl; if (t.pnl > 0) b.w++; });
    const worst = Object.entries(bySym).sort((a, b) => a[1].p - b[1].p)[0];
    const c = M.coach(log.slice(-20));
    return `<b>Ton bilan</b> : ${log.length} trades, ${Math.round(wins.length / log.length * 100)} % gagnants, PnL réalisé ${M.fmt$(pnl)}.<br>
      ${noSl ? `• ${noSl} trade(s) sans stop-loss.<br>` : "• Stop-loss sur tous tes trades 👏<br>"}
      ${worst && worst[1].p < 0 ? `• Ton actif le plus coûteux : ${M.Market.asset(worst[0]).short} (${M.fmt$(worst[1].p)}).<br>` : ""}
      • Score de discipline du coach (20 derniers) : <b>${c.score != null ? c.score + "/100" : "—"}</b>.<br>
      ${c.tips.slice(0, 2).map(t => "👉 " + esc(t)).join("<br>")}`;
  }

  // ---------- Cerveau Claude (optionnel, clé API de l'utilisateur) ----------
  let sdk = null;
  async function claude(question, context) {
    const a = st();
    if (!sdk) sdk = (await import("https://esm.sh/@anthropic-ai/sdk")).default;
    const client = new sdk({ apiKey: a.cfg.claudeKey, dangerouslyAllowBrowser: true });
    const model = a.cfg.claudeModel || "claude-opus-5-5";
    const isHaiku = /haiku/.test(model);
    const history = a.chat.slice(-10).filter(x => x.text).map(x => ({ role: x.role, content: x.plain || x.text.replace(/<[^>]+>/g, " ") }));
    while (history.length && history[0].role !== "user") history.shift();
    const messages = history.concat([{ role: "user", content: question }]);
    const system = `Tu es Mèche IA, l'assistant de l'application éducative de trading Mèche, conçue pour les jeunes (notamment en Afrique de l'Ouest).
Tu réponds aux questions d'économie, finance, trading, politique, droit (dont OHADA, UEMOA), écologie, géopolitique, psychologie, commerce et théorie économique.
Règles : réponds dans la langue de l'utilisateur, de façon claire et concise. Sois exact : si tu n'es pas sûr, dis-le, et utilise la recherche web pour les faits récents en citant tes sources.
Tu ne donnes pas d'instruction d'investissement personnalisée avec de l'argent réel : tu expliques, tu analyses de façon éducative, et tu rappelles le risque et l'importance du stop-loss.
Contexte de l'application (données réelles ou simulées si indiqué) :
${context}`;
    let res, guard = 0;
    const body = {
      model, max_tokens: 4000, system, messages, output_config: { effort: "medium" },
      tools: [isHaiku ? { type: "web_search_20250305", name: "web_search", max_uses: 3 } : { type: "web_search_20260209", name: "web_search", max_uses: 3 }]
    };
    // Repli automatique côté serveur si un modèle refuse (non disponible sur Haiku)
    if (!isHaiku) { body.betas = ["server-side-fallback-2026-07-01"]; body.fallbacks = "default"; }
    do {
      res = isHaiku ? await client.messages.create(body) : await client.beta.messages.create(body);
      if (res.stop_reason === "pause_turn") body.messages = body.messages.concat([{ role: "assistant", content: res.content }]);
    } while (res.stop_reason === "pause_turn" && ++guard < 3);
    if (res.stop_reason === "refusal") return "Je ne peux pas répondre à cette demande.";
    const text = res.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
    return text || "Je n'ai pas de réponse fiable à cette question.";
  }

  function mdLite(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/^#+\s*(.+)$/gm, "<b>$1</b>").replace(/^[-*]\s+/gm, "• ").replace(/\n/g, "<br>");
  }

  async function answer(q) {
    const n = norm(q).trim();
    const sym = assetOf(q);
    const a = st();
    if (/^(bonjour|salut|hello|hey|yo|cc|coucou|bonsoir|slt)\b/.test(n) && n.length < 25)
      return { html: `Salut ${esc(M.state.name || "")} 👋 Je suis <b>Mèche IA</b>. Je peux :<br>• analyser un marché (« analyse le BTC »),<br>• donner un prix (« prix de l'ETH »),<br>• expliquer une notion d'économie, finance, droit, géopolitique, écologie, psychologie, commerce…,<br>• faire le bilan de tes trades (« mes stats »).<br>En Live, je surveille aussi tes ordres et je te propose une version plus sûre quand un trade est risqué.` };
    if (/\b(mes stats|mes trades|mon bilan|mes erreurs|mes performances)\b/.test(n)) return { html: stats() };
    const wantsClaude = a.cfg.claudeKey;
    if (sym && /\b(prix|cours|combien|vaut|coute|price)\b/.test(n) && !wantsClaude) {
      const r = await M.Market.tickers([sym]); const d = r.data[sym];
      return { html: `<b>${M.Market.asset(sym).name}</b> : ${M.Market.fmtPrice(d.last)} $ (${d.chg >= 0 ? "+" : ""}${d.chg.toFixed(2).replace(".", ",")} % sur 24 h)${r.live ? " · source Binance, temps réel" : " · <i>prix simulé (marché injoignable)</i>"}.` };
    }
    if (sym && /\b(analyse|analyser|acheter|vendre|long|short|avis|penses|trader|entrer|signal|prevision|tendance|setup)\b/.test(n) && !wantsClaude)
      return { html: await analysis(sym) };
    const hits = search(q, 3);
    if (wantsClaude) {
      let ctx = hits.map(h => `- ${h.d.t} (${h.d.d}) : ${h.d.text.slice(0, 500)}`).join("\n");
      if (sym) {
        try { ctx += "\n\nAnalyse technique calculée par l'app :\n" + (await analysis(sym)).replace(/<br>/g, "\n").replace(/<[^>]+>/g, ""); } catch (e) { /* ignoré */ }
      }
      if (a.metrics) ctx += `\n\nModèle interne : précision ${pct(a.metrics.acc)}, compétence ${a.metrics.skill.toFixed(3)} sur ${a.metrics.nVal} cas récents.`;
      try {
        const txt = await claude(q, ctx || "(aucun)");
        return { html: mdLite(txt), plain: txt, src: "Claude" };
      } catch (e) {
        const why = /401|authentication/i.test(e.message) ? "clé API invalide" : /import|fetch|network/i.test(e.message) ? "connexion impossible" : e.message;
        if (!hits.length) return { html: `Le cerveau Claude n'a pas répondu (${esc(why)}) et je n'ai rien trouvé dans mes connaissances locales.` };
        return { html: `<small class="muted">Cerveau Claude indisponible (${esc(why)}) — réponse locale :</small><br>` + fromHits(hits) };
      }
    }
    if (hits.length && hits[0].s > 2.2) return { html: fromHits(hits) };
    // Pas trouvé localement : on apprend en ligne (Wikipédia), puis on retient la réponse.
    try {
      const w = await wiki(q);
      if (w) return { html: `${esc(w.a)}<br><br><small class="muted">📚 Appris à l'instant sur Wikipédia : <a href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.t)}</a>. Je m'en souviendrai.</small>${hits.length ? "<br><small>Voir aussi : " + hits.map(h => esc(h.d.t)).join(", ") + "</small>" : ""}` };
    } catch (e) { /* hors ligne */ }
    if (hits.length) return { html: `<small class="muted">Je ne suis pas certain d'avoir compris ; voici le plus proche :</small><br>` + fromHits(hits) };
    return { html: "Je ne sais pas encore répondre à ça, et je n'ai pas pu chercher en ligne. Reformule avec un mot-clé (ex. « inflation », « OHADA », « levier »), ou active le cerveau Claude dans l'onglet Copilote pour des réponses complètes." };
  }
  function fromHits(hits) {
    const h = hits[0].d;
    const more = hits.slice(1).filter(x => x.s > hits[0].s * 0.5);
    return `<b>${esc(h.t)}</b> <span class="chip">${esc(h.d)}</span><br>${esc(h.text.length > 900 ? h.text.slice(0, 900) + "…" : h.text)}
      ${h.src ? `<br><a class="small" href="${esc(h.src)}" ${h.ext ? 'target="_blank" rel="noopener"' : ""}>${h.ext ? "Source" : h.d === "Glossaire" ? "Voir le glossaire" : "Lire le cours complet"} →</a>` : ""}
      ${more.length ? `<br><br><small class="muted">En lien : ${more.map(x => esc(x.d.t)).join(" · ")}</small>` : ""}`;
  }

  // ---------- Interface du chat ----------
  const SUGG = ["Analyse le BTC", "C'est quoi l'inflation ?", "Explique l'OHADA", "Qu'est-ce que l'AES ?", "Comment éviter le FOMO ?", "Mes stats", "Prix de l'or", "C'est quoi l'avantage comparatif ?"];
  function chatUI(el, { compact } = {}) {
    const a = st();
    el.innerHTML = `
      <div class="chat ${compact ? "compact" : ""}">
        <div class="chat-log" id="chat-log"></div>
        <div class="chat-sugg">${SUGG.map(s => `<button class="chip-b">${esc(s)}</button>`).join("")}</div>
        <form class="chat-in" id="chat-form">
          <input id="chat-q" autocomplete="off" placeholder="Pose ta question : marché, économie, droit, géopolitique…" maxlength="500">
          <button class="btn primary" type="submit" aria-label="Envoyer">${M.icon("send")}</button>
        </form>
      </div>`;
    const log = $("#chat-log", el);
    const draw = () => {
      log.innerHTML = (a.chat.length ? "" : `<div class="msg bot">${M.icon("ai")}<div>Salut ! Je suis <b>Mèche IA</b>. Pose-moi une question, ou demande « analyse le BTC ».</div></div>`) +
        a.chat.map(m => `<div class="msg ${m.role === "user" ? "me" : "bot"}">${m.role === "user" ? "" : M.icon("ai")}<div>${m.text}${m.src ? `<small class="muted"> · ${esc(m.src)}</small>` : ""}</div></div>`).join("");
      log.scrollTop = log.scrollHeight;
    };
    const ask = async q => {
      q = q.trim(); if (!q) return;
      a.chat.push({ role: "user", text: esc(q), plain: q });
      draw();
      const wait = document.createElement("div");
      wait.className = "msg bot"; wait.innerHTML = `${M.icon("ai")}<div class="typing"><i></i><i></i><i></i></div>`;
      log.appendChild(wait); log.scrollTop = log.scrollHeight;
      let r;
      try { r = await answer(q); } catch (e) { r = { html: "Oups, une erreur est survenue. Réessaie." }; }
      a.chat.push({ role: "assistant", text: r.html, plain: r.plain, src: r.src });
      a.chat = a.chat.slice(-40);
      M.save();
      draw();
    };
    $("#chat-form", el).onsubmit = e => { e.preventDefault(); const i = $("#chat-q", el); const q = i.value; i.value = ""; ask(q); };
    $$(".chip-b", el).forEach(b => b.onclick = () => ask(b.textContent));
    draw();
  }

  // ---------- Vue « IA » ----------
  M.views.ai = function (el, [tab]) {
    const a = st();
    tab = tab === "copilote" ? "copilote" : "chat";
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">${M.icon("ai")} <span>Mèche IA</span></p><h1>Ton copilote financier <span class="grad">qui apprend tous les jours</span></h1>
      <p class="lede">Il s'entraîne sur les vraies données du marché à chaque ouverture de l'app, apprend de tes trades, te prévient avant un trade risqué et répond à tes questions.</p></div></div>
      <div class="tabs"><a class="${tab === "chat" ? "on" : ""}" href="#/ai">${M.icon("ai")} <span>Chat</span></a><a class="${tab === "copilote" ? "on" : ""}" href="#/ai/copilote">${M.icon("shield")} <span>Copilote</span></a></div>
      <div id="ai-body"></div>`;
    const body = $("#ai-body", el);
    if (tab === "chat") {
      body.innerHTML = `<div class="glass pad"><div id="chat"></div><div style="margin-top:10px"><button class="btn ghost sm" id="chat-clear">${M.icon("trash")} <span>Effacer la conversation</span></button></div></div>`;
      chatUI($("#chat", body));
      $("#chat-clear", body).onclick = () => { a.chat = []; M.save(); M.go("#/ai"); };
      return;
    }
    const m = a.metrics;
    const ago = t => { if (!t) return "jamais"; const mn = Math.round((Date.now() - t) / 60000); return mn < 60 ? `il y a ${mn} min` : mn < 1440 ? `il y a ${Math.round(mn / 60)} h` : `il y a ${Math.round(mn / 1440)} j`; };
    body.innerHTML = `
      <div class="stats">
        ${M.stat("Exemples appris", a.n.toLocaleString("fr-FR"), "Situations de marché réelles analysées (bougies Binance 1h et 4h, 8 actifs), cumulées à chaque entraînement.")}
        ${M.stat("Trades utilisateur appris", a.userN, "Tes trades live clôturés. Les trades disciplinés (stop, risque ≤ 2 %, levier ≤ 5) comptent 4 fois plus.")}
        ${M.stat("Précision sur données non vues", m ? pct(m.acc) : "—", "Mesurée sur la période la plus récente, que le modèle n'a pas vue pendant l'entraînement.")}
        ${M.stat("Gain de prédiction", m ? (m.skill >= 0 ? "+" : "") + (m.skill * 100).toFixed(1).replace(".", ",") + " %" : "—", "Amélioration par rapport à une prédiction « moyenne » (score de Brier). Proche de 0 = le marché est très difficile à prévoir : l'IA s'appuie alors surtout sur les règles de risque.")}
        ${M.stat("Dernier entraînement", ago(a.at), "L'IA se ré-entraîne automatiquement à l'ouverture de l'app (au plus une fois toutes les 3 h) quand internet est disponible.")}
      </div>
      <div class="glass pad" style="margin-top:14px">
        <div class="set-row"><div><b>Entraînement</b><small id="tr-msg">${m ? `Dernier : ${m.series} séries, ${m.nTrain.toLocaleString("fr-FR")} cas d'entraînement, ${m.nVal.toLocaleString("fr-FR")} cas de validation. Taux de réussite moyen d'un trade discipliné (stop 1,5 ATR, objectif 2R) : ${pct(m.base)}${m.rPick != null ? `, et ${pct((m.rPick + 1) / (RR + 1))} sur les cas que le modèle juge favorables` : ""}.` : "Pas encore entraîné."}</small></div>
          <div class="set-ctl"><button class="btn primary" id="tr-go">${M.icon("refresh")} <span>Entraîner maintenant</span></button></div></div>
        <div class="xpbar"><i id="tr-bar" style="width:0"></i></div>
      </div>
      <div class="glass pad set-sec" style="margin-top:14px">
        <h2>${M.icon("shield")} Copilote de trading</h2>
        <p class="muted">Actif uniquement sur tes trades <b>Live</b> (vrais prix). Il n'intervient jamais dans les missions, le Swipe ni le quiz.</p>
        <div class="set-row"><div><b>Analyser mes ordres avant envoi</b><small>Bloque les ordres risqués et propose une version plus sûre.</small></div><div class="set-ctl"><label class="switch"><input type="checkbox" id="c-guard" ${a.cfg.guard ? "checked" : ""}><i></i></label></div></div>
        <div class="set-row"><div><b>Mode strict</b><small>Te prévient aussi pour les petits défauts (pas d'objectif, RSI extrême…).</small></div><div class="set-ctl"><label class="switch"><input type="checkbox" id="c-strict" ${a.cfg.strict ? "checked" : ""}><i></i></label></div></div>
        <div class="set-row"><div><b>Notifications</b><small>Alertes sur tes positions (1R atteint, stop proche, tendance qui se retourne, liquidation proche), même quand l'onglet est en arrière-plan.</small></div><div class="set-ctl"><button class="btn ghost sm" id="c-notif">${"Notification" in window && Notification.permission === "granted" ? "✅ Autorisées" : "Autoriser les notifications"}</button></div></div>
        <div class="set-row"><div><b>Ce qu'il surveille</b><small>Stop absent ou trop serré · risque > 2 % · levier excessif · liquidation avant le stop · ratio gain/risque faible · trade contre la tendance · RSI extrême · volatilité anormale · revenge trading · série de pertes · tes actifs perdants · probabilité estimée par le modèle.</small></div></div>
      </div>
      <div class="glass pad set-sec" style="margin-top:14px">
        <h2>${M.icon("ai")} Cerveau Claude (optionnel)</h2>
        <p class="muted">Sans clé, le chat répond avec ses connaissances locales et apprend sur Wikipédia. Avec une clé API Anthropic, il utilise Claude avec recherche web pour des réponses complètes sur tous les sujets. La clé reste sur cet appareil ; pour une app publique, il faudra passer par un serveur.</p>
        <div class="set-row"><div><b>Clé API Anthropic</b><small>À créer sur console.anthropic.com (payant à l'usage).</small></div><div class="set-ctl"><span class="inp"><input type="password" id="c-key" value="${esc(a.cfg.claudeKey)}" placeholder="sk-ant-…" autocomplete="off"></span></div></div>
        <div class="set-row"><div><b>Modèle</b></div><div class="set-ctl"><select id="c-model">${[["claude-opus-5-5", "Claude Opus 5.5 (le plus précis)"], ["claude-sonnet-5-5", "Claude Sonnet 5.5 (plus rapide)"], ["claude-haiku-5-5", "Claude Haiku 5.5 (le moins cher)"]].map(([k, t]) => `<option value="${k}" ${a.cfg.claudeModel === k ? "selected" : ""}>${t}</option>`).join("")}</select></div></div>
      </div>
      <div class="glass pad" style="margin-top:14px">
        <h4>Ce que l'IA ne peut pas faire</h4>
        <p class="small muted">Aucune IA ne connaît le futur. Les marchés sont en grande partie imprévisibles à court terme : l'objectif de Mèche IA n'est pas de deviner, mais de te faire éviter les erreurs qui ruinent (pas de stop, trop de levier, trop grosse taille, revenge trading) et de t'orienter vers des trades au profil gain/risque favorable. Il n'existe pas de trader qui ne perd jamais : les meilleurs perdent souvent, mais peu à chaque fois. C'est ce comportement que l'IA apprend et encourage.</p>
      </div>`;
    const msg = $("#tr-msg", body), bar = $("#tr-bar", body);
    $("#tr-go", body).onclick = async () => {
      const b = $("#tr-go", body); b.disabled = true;
      msg.textContent = "Téléchargement des données réelles du marché…";
      const r = await train({ force: true, onProgress: (p, sym, tf) => { bar.style.width = Math.round(p * 100) + "%"; msg.textContent = `Analyse de ${M.Market.asset(sym).short} ${tf}…`; } });
      b.disabled = false;
      if (r && r.ok) { M.toast("IA entraînée ✓", "win"); M.go("#/ai/copilote"); }
      else { msg.textContent = (r && r.why) || "Entraînement impossible."; M.toast(msg.textContent, "err"); }
    };
    const save = () => M.save();
    $("#c-guard", body).onchange = e => { a.cfg.guard = e.target.checked; save(); };
    $("#c-strict", body).onchange = e => { a.cfg.strict = e.target.checked; save(); };
    $("#c-notif", body).onclick = async e => {
      if (!("Notification" in window)) return M.toast("Ton navigateur ne gère pas les notifications.", "err");
      const p = await Notification.requestPermission();
      a.cfg.notify = p === "granted"; save();
      e.target.textContent = p === "granted" ? "✅ Autorisées" : "Refusées";
    };
    $("#c-key", body).onchange = e => { a.cfg.claudeKey = e.target.value.trim(); save(); M.toast(a.cfg.claudeKey ? "Cerveau Claude activé" : "Cerveau Claude désactivé"); };
    $("#c-model", body).onchange = e => { a.cfg.claudeModel = e.target.value; save(); };
  };

  // ---------- Bouton flottant (chat accessible partout, sauf pendant les exercices) ----------
  function fab() {
    const b = document.createElement("button");
    b.id = "ai-fab"; b.className = "ai-fab";
    b.setAttribute("data-tip-text", "Mèche IA : pose une question ou demande une analyse");
    b.innerHTML = M.icon("ai");
    document.body.appendChild(b);
    const panel = document.createElement("div");
    panel.id = "ai-panel"; panel.className = "ai-panel glass";
    panel.innerHTML = `<div class="ap-h">${M.icon("ai")}<b>Mèche IA</b><a class="btn ghost sm" href="#/ai">Plein écran</a><button class="an-x" aria-label="Fermer">${M.icon("x")}</button></div><div id="ap-chat"></div>`;
    document.body.appendChild(panel);
    b.onclick = () => { panel.classList.toggle("on"); if (panel.classList.contains("on")) { chatUI($("#ap-chat", panel), { compact: true }); setTimeout(() => $("#chat-q", panel).focus(), 50); } };
    $(".an-x", panel).onclick = () => panel.classList.remove("on");
    const upd = () => {
      const r = location.hash.replace(/^#\/?/, "").split("/")[0];
      const hide = ["mission", "swipe", "ai"].includes(r) || (r === "quiz" && location.hash.includes("/play/"));
      b.style.display = hide ? "none" : "";
      if (hide) panel.classList.remove("on");
    };
    window.addEventListener("hashchange", upd); upd();
  }

  document.addEventListener("DOMContentLoaded", () => {
    st();
    fab();
    if (M.refreshFx) M.refreshFx();
    // Auto-entraînement en arrière-plan quelques secondes après l'ouverture (si en ligne)
    setTimeout(() => { if (navigator.onLine !== false) train().catch(() => {}); }, 4000);
  });

  M.AI = { train, review, advise, monitor, snapshot, learnFromTrade, predict, answer, search, notify, state: st };
})();
