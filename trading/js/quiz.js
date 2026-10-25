/* Parcours Quiz façon Duolingo : unités à débloquer, 3 vies, réponses fausses reposées en fin de session,
   questions théoriques (quizbank.js) + exercices pratiques générés (calculs, lecture de graphiques). */
window.M = window.M || {};

(function () {
  const { $, $$, esc } = M.u;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fr = (v, d = 2) => (+v).toLocaleString("fr-FR", { maximumFractionDigits: d });

  /* Mélange les options d'un QCM en gardant la bonne réponse. */
  function shuffleOpts(q) {
    if (!q.o) return q;
    const idx = shuffle(q.o.map((_, i) => i));
    return Object.assign({}, q, { o: idx.map(i => q.o[i]), a: idx.indexOf(q.a) });
  }

  // ---------- Exercices pratiques générés ----------
  function scenario(kind) {
    const seed = Math.floor(Math.random() * 1e9);
    const regimes = {
      up: [{ n: 70, drift: 0.006, vol: 0.011 }],
      down: [{ n: 70, drift: -0.006, vol: 0.011 }],
      range: [{ n: 18, drift: 0.004, vol: 0.008 }, { n: 18, drift: -0.004, vol: 0.008 }, { n: 17, drift: 0.004, vol: 0.008 }, { n: 17, drift: -0.004, vol: 0.008 }],
      pump: [{ n: 50, drift: 0.001, vol: 0.008 }, { n: 20, drift: 0.012, vol: 0.01 }],
      dump: [{ n: 50, drift: -0.001, vol: 0.008 }, { n: 20, drift: -0.012, vol: 0.01 }]
    }[kind];
    return M.Market.simulate({ sym: "BTCUSDT", tf: "1h", seed, script: { start: Math.round(rnd(20000, 90000)), regimes } });
  }

  const GEN = {
    candleRead() {
      const bars = scenario(pick(["up", "down", "range"])).slice(0, 50);
      const last = bars[bars.length - 1], p = last.c, type = pick(["hammer", "star", "doji"]);
      const r = p * 0.012;
      let nb;
      if (type === "hammer") nb = { o: p, c: p + r * 0.25, h: p + r * 0.35, l: p - r * 1.6 };
      else if (type === "star") nb = { o: p, c: p - r * 0.25, h: p + r * 1.6, l: p - r * 0.35 };
      else nb = { o: p, c: p * 1.0003, h: p + r * 0.9, l: p - r * 0.9 };
      bars.push(Object.assign({ t: last.t + 3600e3, v: last.v * 1.5 }, nb));
      const o = ["Les acheteurs ont rejeté la baisse", "Les vendeurs ont rejeté la hausse", "Indécision : ni acheteurs ni vendeurs n'ont gagné"];
      const a = { hammer: 0, star: 1, doji: 2 }[type];
      return { t: "mcq", kind: "Lecture de bougie", q: "Que raconte la toute dernière bougie (à droite) ?", chart: { bars }, o, a,
        e: ["Longue mèche basse et petit corps en haut : le prix a été racheté (marteau).", "Longue mèche haute : le prix a été repoussé vers le bas (étoile filante).", "Ouverture ≈ clôture avec des mèches des deux côtés : c'est un doji."][a] };
    },
    chartTrend() {
      const kind = pick(["up", "down", "range"]);
      const bars = scenario(kind);
      const o = ["Tendance haussière", "Tendance baissière", "Range (marché latéral)"];
      const a = { up: 0, down: 1, range: 2 }[kind];
      return { t: "mcq", kind: "Lecture de graphique", q: "Quelle structure vois-tu sur ce graphique ?", chart: { bars, ema: true }, o, a,
        e: ["Plus hauts et plus bas de plus en plus hauts, prix au-dessus de l'EMA 20.", "Plus hauts et plus bas de plus en plus bas, prix sous l'EMA 20.", "Le prix oscille entre un plafond et un plancher : pas de direction claire."][a] };
    },
    chartRsi() {
      for (let k = 0; k < 20; k++) {
        const kind = pick(["pump", "dump", "range"]);
        const bars = scenario(kind);
        const rsi = M.Ind.rsi(bars.map(b => b.c), 14);
        const v = rsi[rsi.length - 1];
        const a = v > 70 ? 0 : v < 30 ? 1 : v > 40 && v < 60 ? 2 : -1;
        if (a < 0) continue;
        return { t: "mcq", kind: "Lecture d'indicateur", q: "Regarde le RSI (en bas). Dans quelle zone est-il ?", chart: { bars, rsi: true }, o: ["Suracheté (> 70)", "Survendu (< 30)", "Neutre (autour de 50)"], a,
          e: `Le RSI vaut ${fr(v, 1)}. ${a === 0 ? "Suracheté ne veut pas dire « vendre » : en tendance forte il peut y rester." : a === 1 ? "Survendu ne veut pas dire « acheter » : attends une confirmation." : "Zone neutre : le RSI ne donne pas de signal."}` };
      }
      return GEN.chartTrend();
    },
    slTpPrice() {
      const p = Math.round(rnd(50, 500)), x = pick([1, 2, 2.5, 3, 4, 5]);
      return { t: "num", kind: "Calcul", q: `Tu achètes à ${fr(p)} $. Ton stop-loss est ${fr(x)} % sous l'entrée. À quel prix est-il ?`, a: p * (1 - x / 100), tol: 0.01, rel: true, u: "$",
        e: `${fr(p)} × (1 − ${fr(x)} %) = ${fr(p * (1 - x / 100))} $.` };
    },
    sizing() {
      const C = pick([1000, 2000, 5000, 10000, 20000]), r = pick([1, 2]), E = Math.round(rnd(20, 200)), d = pick([1, 2, 4, 5]);
      const S = E - d, qty = C * r / 100 / d;
      return { t: "num", kind: "Calcul de taille", q: `Capital ${fr(C)} $, risque ${r} %. Entrée à ${E} $, stop à ${S} $. Combien d'unités acheter ?`, a: qty, tol: 0.02, rel: true, u: "unités",
        e: `Risque = ${fr(C)} × ${r} % = ${fr(C * r / 100)} $. Distance au stop = ${d} $. Taille = ${fr(C * r / 100)} ÷ ${d} = ${fr(qty)} unités.` };
    },
    liq() {
      const L = pick([2, 4, 5, 10, 20, 25, 50]);
      return { t: "num", kind: "Calcul", q: `Avec un levier ×${L}, environ quel mouvement contre toi (en %) te fait liquider ?`, a: 100 / L, tol: 0.15, u: "%",
        e: `1 ÷ ${L} = ${fr(100 / L)} % : ta marge est effacée.` };
    },
    recover() {
      const l = pick([10, 20, 25, 40, 50, 60, 75]);
      return { t: "num", kind: "Calcul", q: `Ton compte perd ${l} %. Quel gain (en %) faut-il pour revenir à l'équilibre ?`, a: l / (100 - l) * 100, tol: 1, u: "%",
        e: `Il te reste ${100 - l} %. Pour revenir à 100 : ${l} ÷ ${100 - l} = +${fr(l / (100 - l) * 100, 1)} %.` };
    },
    breakeven() {
      const k = pick([1, 1.5, 2, 3, 4]);
      return { t: "num", kind: "Calcul", q: `Ratio risque/rendement 1:${fr(k)}. Quel taux de réussite minimum (en %) pour être à l'équilibre (hors frais) ?`, a: 100 / (1 + k), tol: 1, u: "%",
        e: `1 ÷ (1 + ${fr(k)}) = ${fr(100 / (1 + k), 1)} %.` };
    },
    levPnl() {
      const m = pick([100, 200, 500, 1000]), L = pick([2, 3, 5, 10]), x = pick([1, 2, 3, 5]), up = Math.random() < 0.5;
      const pnl = m * L * x / 100 * (up ? 1 : -1);
      return { t: "num", kind: "Calcul", q: `Mise ${m} $, levier ×${L}, position longue. Le prix ${up ? "monte" : "baisse"} de ${x} %. Ton gain ou ta perte en $ (négatif si perte) ?`, a: pnl, tol: 0.5, u: "$",
        e: `Exposition = ${m} × ${L} = ${m * L} $. ${x} % de ${m * L} = ${fr(Math.abs(pnl))} $ ${up ? "de gain" : "de perte"}.` };
    },
    expectancy() {
      const w = pick([30, 35, 40, 45, 50, 55, 60]), g = pick([0.8, 1, 1.5, 2, 2.5, 3]);
      const ex = w / 100 * g - (1 - w / 100);
      const o = [ex, ex + 0.3, ex - 0.4].map(v => (v >= 0 ? "+" : "") + fr(v, 2) + " R");
      return { t: "mcq", kind: "Calcul d'espérance", q: `Ta stratégie gagne ${w} % du temps. Gain moyen : ${fr(g)} R, perte moyenne : 1 R. Espérance par trade ?`, o, a: 0,
        e: `${w} % × ${fr(g)} − ${100 - w} % × 1 = ${fr(ex, 2)} R par trade. ${ex > 0 ? "Positive : la stratégie gagne sur la durée." : "Négative : elle perd sur la durée."}` };
    },
    fcfa() {
      const e = pick([10, 20, 50, 100, 250, 500]);
      return { t: "num", kind: "Calcul", q: `Combien font ${e} € en FCFA ? (1 € = 655,957 FCFA)`, a: e * 655.957, tol: 0.005, rel: true, u: "FCFA",
        e: `${e} × 655,957 = ${fr(e * 655.957, 0)} FCFA.` };
    }
  };
  const ALL_GEN = Object.keys(GEN);

  function sessionQuestions(unit, mode) {
    if (mode === "calc") return Array.from({ length: 8 }, () => GEN[pick(["sizing", "liq", "recover", "breakeven", "levPnl", "slTpPrice", "expectancy"])]());
    if (mode === "mix") {
      const unlocked = M.QUIZ_UNITS.filter((u, i) => i === 0 || M.state.qpath[M.QUIZ_UNITS[i - 1].id]);
      const pool = [].concat(...unlocked.map(u => u.q));
      const gens = [].concat(...unlocked.map(u => u.gen)).concat(["chartTrend"]);
      return shuffle(shuffle(pool).slice(0, 7).map(shuffleOpts).concat([GEN[pick(gens)](), GEN[pick(gens)](), GEN[pick(gens)]()]));
    }
    const base = shuffle(unit.q).slice(0, 6).map(shuffleOpts);
    const gens = unit.gen.length ? unit.gen : ["chartTrend", "sizing", "candleRead"];
    const p1 = GEN[pick(gens)](), p2 = GEN[pick(gens)]();
    base.splice(2, 0, p1);
    base.push(p2);
    return base;
  }

  // ---------- Parcours ----------
  M.views.quiz = function (el, [mode, uid]) {
    if (mode === "play") return session(el, uid);
    const st = M.state.qpath || (M.state.qpath = {});
    const qs = M.state.qstats || (M.state.qstats = { done: 0, right: 0, total: 0 });
    const done = M.QUIZ_UNITS.filter(u => st[u.id]).length;
    let currentFound = false;
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">Quiz</p><h1>5 minutes par jour, <span class="grad">et tu progresses.</span></h1>
      <p class="lede">${M.QUIZ_COUNT} questions de théorie + des exercices pratiques illimités (calculs de risque, lecture de bougies, de tendances et d'indicateurs). 3 vies par leçon, les erreurs reviennent à la fin.</p>
      <div class="qtop-btns">
        <a class="btn ghost" href="#/quiz/play/mix" data-tip-text="10 questions mélangées parmi toutes les unités débloquées.">${M.icon("shuffle")} Entraînement mixte</a>
        <a class="btn ghost" href="#/quiz/play/calc" data-tip-text="8 calculs générés au hasard : taille de position, liquidation, R:R, espérance… Infini.">${M.icon("calculator")} Défi calcul</a>
      </div></div>
      <div class="glass ring-card" data-tip-text="Unités terminées"><div class="ring" style="--p:${Math.round(done / M.QUIZ_UNITS.length * 100)}"><b>${done}/${M.QUIZ_UNITS.length}</b></div>
        <small>${qs.total ? Math.round(qs.right / qs.total * 100) + " % de bonnes réponses" : "Aucune session encore"}</small></div></div>
      <div class="qpath">${M.QUIZ_UNITS.map((u, i) => {
        const unlocked = i === 0 || st[M.QUIZ_UNITS[i - 1].id];
        const stars = st[u.id] || 0;
        const isCur = unlocked && !stars && !currentFound;
        if (isCur) currentFound = true;
        const x = Math.round(Math.sin(i * 1.1) * 90);
        return `<div class="unit-h"><span class="u-e">${M.ico("unit", u.id)}</span><div><b>Unité ${i + 1} · ${u.t}</b><small>${u.sub} · ${u.q.length} questions + pratique</small></div></div>
          <button class="qnode ${unlocked ? "" : "locked"} ${stars ? "done" : ""} ${isCur ? "current" : ""}" style="--x:${x}px" data-u="${u.id}" ${unlocked ? "" : "disabled"}
            data-tip-text="${unlocked ? (stars ? "Terminé — rejoue pour améliorer ton score." : "Commencer l'unité") : "🔒 Termine l'unité précédente pour débloquer."}">
            ${unlocked ? (stars ? M.icon("star") : M.ico("unit", u.id)) : M.icon("lock")}${stars ? `<span class="stars">${"⭐".repeat(stars)}</span>` : ""}</button>`;
      }).join("")}</div>
      ${M.disclaimer()}`;
    $$(".qnode", el).forEach(b => b.onclick = () => { if (!b.disabled) M.go("#/quiz/play/" + b.dataset.u); });
  };

  // ---------- Session ----------
  function session(el, uid) {
    const unit = M.QUIZ_UNITS.find(u => u.id === uid);
    const mode = uid === "mix" || uid === "calc" ? uid : null;
    if (!unit && !mode) { M.go("#/quiz"); return; }
    const queue = sessionQuestions(unit, mode);
    const target = queue.length;
    let hearts = 3, right = 0, wrong = 0, combo = 0, bestCombo = 0, chart = null, answered = false, sel = null, retried = new Set();
    let q = null;

    function frame() {
      el.innerHTML = `
        <div class="qsession">
          <div class="qbar">
            <a class="qx" href="#/quiz" data-tip-text="Quitter la leçon (ta progression de cette session sera perdue)">✕</a>
            <div class="qprog"><i id="qp"></i></div>
            <span class="qcombo" id="qc"></span>
            <span class="qhearts" id="qh" data-tip-text="Tes vies : une erreur = une vie en moins. À zéro, la leçon s'arrête.">❤️ ${hearts}</span>
          </div>
          <div id="qbody"></div>
          <div class="qfoot" id="qfoot"></div>
        </div>`;
    }

    function hud() {
      $("#qp", el).style.width = (right / target * 100) + "%";
      $("#qh", el).textContent = "❤️ " + hearts;
      $("#qc", el).textContent = combo >= 2 ? `🔥 ×${combo}` : "";
    }

    function next() {
      if (chart) { chart.destroy(); chart = null; }
      if (hearts <= 0) return end(false);
      if (!queue.length) return end(true);
      q = queue.shift();
      answered = false; sel = null;
      const body = $("#qbody", el);
      const kind = q.kind || { mcq: "Question", tf: "Vrai ou faux ?", fill: "Complète la phrase", num: "Calcul" }[q.t];
      let html = `<p class="qkind">${q.kind ? "🧪 Pratique · " : ""}${kind}</p>`;
      if (q.chart) html += `<div class="qchart" id="qchart"></div>`;
      if (q.t === "fill") {
        const [a, b] = q.q.split("___");
        html += `<p class="qfill">${esc(a)}<span class="blank" id="blank">?</span>${esc(b || "")}</p><div class="qchips">${q.o.map((o, i) => `<button class="qopt" data-i="${i}">${esc(o)}</button>`).join("")}</div>`;
      } else {
        html += `<h2 class="qq">${M.linkTerms(esc(q.q))}</h2>`;
        if (q.t === "mcq") html += `<div class="qopts">${q.o.map((o, i) => `<button class="qopt" data-i="${i}"><b class="mono">${i + 1}</b>&nbsp; ${esc(o)}</button>`).join("")}</div>`;
        if (q.t === "tf") html += `<div class="qopts grid2"><button class="qopt big" data-i="1">✅ Vrai</button><button class="qopt big" data-i="0">❌ Faux</button></div>`;
        if (q.t === "num") html += `<div class="qnum"><span class="inp"><input type="number" step="any" inputmode="decimal" id="qn" placeholder="Ta réponse"><em>${esc(q.u || "")}</em></span></div>`;
      }
      body.innerHTML = html;
      $("#qfoot", el).innerHTML = `<button class="qcheck" id="qok" disabled>Vérifier</button>`;
      if (q.chart) {
        chart = new M.Chart($("#qchart", el), { tf: "1h", noPan: true, volume: false, rsi: !!q.chart.rsi, visible: q.chart.bars.length });
        if (q.chart.ema) chart.setOverlays([{ type: "ema", n: 20, color: getComputedStyle(document.documentElement).getPropertyValue("--lime").trim() || "#C6FF3D" }]);
        chart.setData(q.chart.bars);
      }
      $$(".qopt", body).forEach(b => b.onclick = () => {
        if (answered) return;
        $$(".qopt", body).forEach(x => x.classList.remove("sel"));
        b.classList.add("sel"); sel = +b.dataset.i;
        if (q.t === "fill") $("#blank", body).textContent = q.o[sel];
        $("#qok", el).disabled = false;
        M.sfx("tap");
      });
      const n = $("#qn", body);
      if (n) { n.oninput = () => { sel = n.value; $("#qok", el).disabled = n.value === ""; }; setTimeout(() => n.focus(), 50); }
      $("#qok", el).onclick = check;
      hud();
    }

    function isRight() {
      if (q.t === "tf") return (sel === 1) === q.a;
      if (q.t === "num") {
        const v = parseFloat(String(sel).replace(",", "."));
        if (isNaN(v)) return false;
        const tol = q.rel ? Math.abs(q.a) * q.tol : q.tol;
        return Math.abs(v - q.a) <= tol + 1e-9;
      }
      return sel === q.a;
    }

    function check() {
      if (answered || sel == null || sel === "") return;
      answered = true;
      const ok = isRight();
      const body = $("#qbody", el);
      M.state.qstats.total++;
      if (ok) { right++; combo++; bestCombo = Math.max(bestCombo, combo); M.state.qstats.right++; M.sfx("ok"); }
      else {
        wrong++; combo = 0; hearts--; M.sfx("ko");
        // Duolingo : la question ratée revient plus tard (une seule fois)
        if (!retried.has(q)) { retried.add(q); queue.push(q.t === "num" || q.chart ? q : shuffleOpts(q)); }
      }
      if (q.t !== "num") {
        const good = q.t === "tf" ? (q.a ? 1 : 0) : q.a;
        $$(".qopt", body).forEach(b => {
          b.disabled = true;
          if (+b.dataset.i === good) b.classList.add("right");
          else if (+b.dataset.i === sel) b.classList.add("wrong");
        });
      } else $("#qn", body).disabled = true;
      const answer = q.t === "num" ? `Réponse : ${(+q.a).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} ${q.u || ""}. ` : "";
      $("#qfoot", el).innerHTML = `<div class="qfeed ${ok ? "ok" : "ko"}"><div><b>${ok ? pick(["Bien joué !", "Exact ! 🔥", "Parfait 💯", "Trop fort ⚡"]) : "Pas tout à fait…"}</b><p>${!ok ? esc(answer) : ""}${M.linkTerms(esc(q.e || ""))}</p></div>
        <button class="qcheck" id="qnext">Continuer</button></div>`;
      $("#qnext", el).onclick = next;
      setTimeout(() => { const b = $("#qnext", el); b && b.focus(); }, 30);
      hud();
    }

    function end(win) {
      M.save();
      const stars = !win ? 0 : wrong === 0 ? 3 : wrong <= 2 ? 2 : 1;
      const xp = win ? 10 + right * 2 + (wrong === 0 ? 10 : 0) : Math.max(2, right);
      if (unit && win) {
        const prev = M.state.qpath[unit.id] || 0;
        M.state.qpath[unit.id] = Math.max(prev, stars);
        if (!prev && M.QUIZ_UNITS.every(u => M.state.qpath[u.id])) M.unlock("quiz_all");
      }
      if (win) { M.state.qstats.done++; M.unlock("quiz_first"); if (wrong === 0) M.unlock("quiz_perfect"); }
      if (bestCombo >= 8) M.unlock("quiz_combo");
      M.save(true);
      M.addXP(xp, win ? "leçon terminée" : "leçon");
      if (win) M.sfx("level");
      const nextU = unit ? M.QUIZ_UNITS[M.QUIZ_UNITS.indexOf(unit) + 1] : null;
      el.innerHTML = `
        <div class="qsession"><div class="qend">
          <div class="big-e">${win ? (stars === 3 ? "🏆" : "🎉") : "💔"}</div>
          <h1>${win ? (stars === 3 ? "Sans faute !" : "Leçon terminée !") : "Plus de vies…"}</h1>
          <p class="lede" style="margin:0 auto">${win ? (unit ? `Unité « ${esc(unit.t)} » : ${"⭐".repeat(stars)}` : "Entraînement terminé.") : "Pas grave : relis le module de l'Académie correspondant et retente. C'est en se trompant qu'on retient."}</p>
          <div class="stats">
            ${M.stat("XP gagnée", "+" + xp, "Expérience gagnée sur cette session.")}
            ${M.stat("Bonnes réponses", right + "/" + (right + wrong), "Les questions ratées puis réussies comptent deux fois.")}
            ${M.stat("Meilleur combo", "🔥 " + bestCombo, "Bonnes réponses d'affilée.")}
          </div>
          <div class="cta" style="justify-content:center">
            ${win && nextU ? `<a class="btn primary" href="#/quiz/play/${nextU.id}">Unité suivante : ${M.ico("unit", nextU.id)} ${esc(nextU.t)}</a>` : ""}
            <a class="btn ${win && nextU ? "ghost" : "primary"}" href="#/quiz/play/${uid}">🔁 Rejouer</a>
            <a class="btn ghost" href="#/quiz">Retour au parcours</a>
          </div>
        </div></div>`;
      if (win) M.confetti();
    }

    const keys = e => {
      if (!q || el.querySelector(".qend")) return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (answered) next(); else check();
        return;
      }
      if (answered || /input/i.test(e.target.tagName)) return;
      const n = parseInt(e.key, 10);
      const opts = $$(".qopt", el);
      if (n >= 1 && n <= opts.length) opts[n - 1].click();
    };
    document.addEventListener("keydown", keys);
    frame();
    next();
    return () => { document.removeEventListener("keydown", keys); if (chart) chart.destroy(); };
  }

  M.QUIZ_GEN = GEN;
})();
