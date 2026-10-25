/* Time Machine (missions sur de vrais événements de marché) et Swipe (haut ou bas ?). */
window.M = window.M || {};

(function () {
  const { $, $$, pct } = M.u;
  const DIFF = { "Facile": "ok", "Moyen": "mid", "Difficile": "hard", "Extrême": "ext" };

  // ---------- Liste des missions ----------
  M.views.missions = function (el) {
    const dm = M.dailyMission();
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">Time Machine</p><h1>Rejoue les moments qui ont secoué les marchés</h1>
      <p class="lede">De vraies bougies historiques, révélées une par une. Tu ne vois pas le futur : à toi de décider quand entrer, où mettre ton stop, et quand sortir. À la fin, l'histoire réelle et l'avis du coach.</p></div></div>
      <div class="missions">${M.MISSIONS.map(m => {
        const r = M.state.missions[m.id];
        return `<a class="mission glass ${m.id === dm.id ? "daily" : ""}" href="#/mission/${m.id}">
          <div class="m-top"><span class="m-emoji">${M.ico("mission", m.id)}</span>
            <span class="chip d-${DIFF[m.diff]}" data-tip-text="Difficulté : volatilité et pièges du scénario.">${m.diff}</span>
            ${m.id === dm.id ? `<span class="chip daily" data-tip-text="Score coach ≥ 70 sur cette mission aujourd'hui = +60 XP bonus.">🎯 Défi du jour</span>` : ""}</div>
          <h3>${m.title}</h3><p class="m-year">${m.year} · ${M.Market.asset(m.sym).short} · bougies ${m.tf}</p>
          <p>${m.teaser}</p>
          ${r ? `<div class="m-res"><span data-tip-text="Ton meilleur score sur cette mission.">🏆 ${r.score}/100</span><span class="${r.ret >= 0 ? "up" : "dn"}">${pct(r.ret, 1)}</span></div>` : `<div class="m-res muted">Pas encore jouée</div>`}
        </a>`;
      }).join("")}</div>
      ${M.disclaimer()}`;
  };

  // ---------- Partie ----------
  M.views.mission = function (el, [id]) {
    const m = M.MISSIONS.find(x => x.id === id);
    if (!m) { M.go("#/missions"); return; }
    const CAP = M.START_CASH;
    const wallet = { cash: CAP, pos: null, log: [] };
    const trader = new M.Trader(wallet);
    let bars = [], shown = 0, end = 0, chart = null, auto = null, alive = true, finished = false, live = true;

    el.innerHTML = `
      <a class="back" href="#/missions">← Missions</a>
      <div class="mission-play">
        <section class="chartcol">
          <div class="chart-top glass">
            <div class="ct-l"><span class="m-emoji">${M.ico("mission", m.id)}</span><div><b>${m.title}</b><small>${m.year} · ${M.Market.asset(m.sym).name} · ${m.tf}</small></div>
              <span class="pill" id="mm">chargement…</span></div>
            <div class="ct-r">
              <div class="prog" data-tip-text="Bougies révélées sur le total de la mission."><i id="pr"></i></div>
              <span class="mono small" id="prt"></span>
            </div>
          </div>
          <div class="briefing glass" id="brief"><b>📡 Briefing :</b> ${m.teaser}</div>
          <div class="chartbox glass tall" id="chart"></div>
          <div class="controls glass">
            <button class="btn primary" id="next" data-tip-text="Révèle la bougie suivante." data-tip-kbd="Espace / →">Bougie suivante ▶</button>
            <button class="btn ghost" id="auto" data-tip-text="Fait défiler les bougies automatiquement. Reclique pour mettre en pause." data-tip-kbd="A">▶▶ Auto</button>
            <button class="btn ghost" id="skip" data-tip-text="Révèle tout le reste d'un coup et termine la mission (ta position est conservée jusqu'au bout).">⏭ Aller à la fin</button>
          </div>
        </section>
        <aside class="side">
          <div class="wallet glass">
            <div data-tip="equity"><small>Compte mission</small><b class="mono" id="w-eq">—</b></div>
            <div data-tip-text="Performance depuis le début de la mission."><small>Perf.</small><b class="mono" id="w-perf">—</b></div>
          </div>
          <div class="glass pad" id="tk"></div>
          <div class="glass pad" id="pc"></div>
        </aside>
      </div>`;

    const cur = () => bars[shown - 1];
    const ticket = M.ticket($("#tk", el), {
      trader, maxLev: 10, price: () => cur() ? cur().c : 0, sym: () => m.sym, at: () => shown - 1,
      onOpen() { posCard.draw(); drawLines(); drawWallet(); markers(); }
    });
    const posCard = M.posCard($("#pc", el), {
      trader, price: () => cur().c,
      onClose(reason) { if (reason) { const t = trader.close(cur().c, reason, shown - 1); M.afterTrade(t); } after(); }
    });

    function after() { posCard.draw(); ticket.refresh(); drawLines(); drawWallet(); markers(); }
    function drawWallet() {
      if (!cur()) return;
      const e = trader.equity(cur().c);
      $("#w-eq", el).textContent = M.fmt$(e);
      const r = e / CAP - 1;
      $("#w-perf", el).textContent = pct(r, 2);
      $("#w-perf", el).className = "mono " + (r >= 0 ? "up" : "dn");
      $("#pr", el).style.width = ((shown - m.ctx) / (end - m.ctx) * 100) + "%";
      $("#prt", el).textContent = `${shown - m.ctx}/${end - m.ctx}`;
    }
    function drawLines() {
      const p = trader.pos;
      chart.setLines(p ? [
        { price: p.entry, color: "#B4B8CC", label: "Entrée", dash: true },
        p.sl && { price: p.sl, color: "#FF4D6D", label: "Stop", dash: true },
        p.tp && { price: p.tp, color: "#2BEA8B", label: "Objectif", dash: true },
        p.liq && { price: p.liq, color: "#FFD23D", label: "Liq.", dash: true }
      ].filter(Boolean) : []);
    }
    function markers() {
      const mk = [];
      trader.s.log.forEach(t => {
        mk.push({ i: t.openAt, type: t.dir > 0 ? "buy" : "sell" });
        mk.push({ i: t.closeAt, type: "exit" });
      });
      if (trader.pos) mk.push({ i: trader.pos.at, type: trader.pos.dir > 0 ? "buy" : "sell" });
      chart.setMarkers(mk);
    }

    function step() {
      if (finished || shown >= end) return;
      shown++;
      const b = cur();
      chart.setData(bars.slice(0, shown), { keepView: true });
      const t = trader.check(b, shown - 1);
      if (t) M.afterTrade(t);
      after();
      if (shown >= end) finish();
    }
    function toggleAuto(force) {
      const on = force != null ? force : !auto;
      if (auto) { clearInterval(auto); auto = null; }
      if (on) auto = setInterval(step, 450);
      $("#auto", el).textContent = auto ? "⏸ Pause" : "▶▶ Auto";
    }

    function finish() {
      if (finished) return;
      finished = true;
      toggleAuto(false);
      const last = bars[end - 1];
      if (trader.pos) { const t = trader.close(last.c, "end", end - 1); M.afterTrade(t); }
      after();
      const ret = trader.s.cash / CAP - 1;
      const bh = last.c / bars[m.ctx - 1].c - 1;
      const c = M.coach(trader.s.log, { bars: end - m.ctx });
      const perfScore = Math.max(0, Math.min(100, 50 + ret * 100 * 4));
      const score = c.score == null ? Math.round(perfScore * 0.5) : Math.round(c.score * 0.6 + perfScore * 0.4);
      const prev = M.state.missions[m.id];
      M.state.missions[m.id] = { score: Math.max(score, prev ? prev.score : 0), ret: prev && prev.score > score ? prev.ret : ret, at: Date.now() };
      M.save(true);
      M.addXP(prev ? 15 : 40 + Math.round(score / 3), "mission terminée");
      M.unlock("mission_1");
      if (m.diff === "Extrême" && ret > 0 && trader.s.log.length) M.unlock("survivor");
      if (M.MISSIONS.every(x => M.state.missions[x.id])) M.unlock("mission_all");
      if (c.score != null && c.score >= 90 && trader.s.log.length >= 3) M.unlock("coach_90");
      const today = M.u.today();
      let dailyWon = false;
      if (m.id === M.dailyMission().id && !M.state.daily[today] && c.score != null && c.score >= 70) {
        M.state.daily[today] = true; M.save(); dailyWon = true;
        setTimeout(() => M.addXP(60, "défi du jour 🎯"), 900);
      }
      // affiche toute la période jouée
      chart.visible = end; chart.setData(bars.slice(0, end));
      M.modal(`
        <div class="debrief">
          <p class="eyebrow">Mission terminée ${live ? "" : "· reconstitution simulée"}</p>
          <h2>${M.ico("mission", m.id)} ${m.title}</h2>
          <div class="db-grid">
            <div class="ring big" style="--p:${score}" data-tip-text="60 % discipline (coach) + 40 % performance."><b>${score}</b><small>/100</small></div>
            <div class="db-stats">
              ${M.stat("Ta perf.", pct(ret, 2), "Rendement de ton compte sur la mission.", null, ret >= 0 ? "up" : "dn")}
              ${M.stat("Marché", pct(bh, 2), "Ce qu'aurait fait un simple achat au début de la partie jouée, revendu à la fin (buy & hold).", null, bh >= 0 ? "up" : "dn")}
              ${M.stat("Trades", trader.s.log.length, "Nombre de positions ouvertes puis fermées.")}
              ${M.stat("Coach", c.score == null ? "—" : c.score + "/100", "Note de discipline : stop, taille, levier, revenge trading.")}
            </div>
          </div>
          ${dailyWon ? `<p class="daily-won">🎯 Défi du jour réussi : +60 XP !</p>` : ""}
          <div class="story"><h4>📰 Ce qui s'est vraiment passé</h4><p>${m.story}</p><p class="moral">💡 ${m.lesson}</p></div>
          ${c.good.length ? `<div class="cl good">${c.good.map(x => `<p>${x}</p>`).join("")}</div>` : ""}
          ${c.bad.length ? `<div class="cl bad">${c.bad.map(x => `<p>${x}</p>`).join("")}</div>` : ""}
          <div class="cl tips">${c.tips.map(x => `<p>👉 ${x}</p>`).join("")}</div>
          <div class="cta"><button class="btn primary" id="again">🔁 Rejouer</button><a class="btn ghost" href="#/missions" data-close>Autres missions</a></div>
        </div>`, { wide: true });
      const ag = document.getElementById("again");
      if (ag) ag.onclick = () => { document.querySelector(".modal-wrap .modal-x").click(); M.go("#/mission/" + m.id); };
    }

    $("#next", el).onclick = step;
    $("#auto", el).onclick = () => toggleAuto();
    $("#skip", el).onclick = () => { if (!confirm("Révéler toutes les bougies restantes et terminer ?")) return; while (shown < end && !finished) step(); };

    const keys = e => {
      if (/input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === " " || e.key === "ArrowRight") { e.preventDefault(); step(); }
      if (e.key === "a" || e.key === "A") toggleAuto();
      if (e.key === "b" || e.key === "B") ticket.send(1);
      if (e.key === "s" || e.key === "S") ticket.send(-1);
      if ((e.key === "x" || e.key === "X") && trader.pos) { const t = trader.close(cur().c, "manual", shown - 1); M.afterTrade(t); after(); }
    };
    document.addEventListener("keydown", keys);

    (async () => {
      const r = await M.Market.klines(m.sym, m.tf, { limit: m.ctx + m.play, startTime: Date.parse(m.start), script: m.sim });
      if (!alive) return;
      live = r.live;
      bars = r.bars;
      end = Math.min(bars.length, m.ctx + m.play);
      shown = Math.min(m.ctx, end - 1);
      const pill = $("#mm", el);
      pill.textContent = r.live ? "● Données réelles" : "● Reconstitution";
      pill.className = "pill " + (r.live ? "live" : "demo");
      pill.setAttribute("data-tip-text", r.live ? "Bougies historiques réelles (Binance). Exactement ce que les traders ont vécu." : "Historique injoignable : scénario simulé qui reproduit l'allure de l'événement.");
      chart = new M.Chart($("#chart", el), { tf: m.tf, visible: Math.min(end, m.ctx + 40) });
      chart.setOverlays([{ type: "ema", n: 20, color: "#C6FF3D" }, { type: "ema", n: 50, color: "#8B5CFF" }]);
      chart.setData(bars.slice(0, shown));
      after();
    })();

    return () => { alive = false; toggleAuto(false); document.removeEventListener("keydown", keys); if (chart) chart.destroy(); };
  };

  // ---------- Swipe : haut ou bas ? ----------
  M.views.swipe = function (el) {
    const ROUNDS = 10, CTX = 60;
    let bars = [], round = 0, right = 0, streak = 0, bestStreak = 0, chart = null, alive = true, lock = false, info = null, live = true;

    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">Mini-jeu</p><h1>Swipe : <span class="grad">haut ou bas ?</span></h1>
      <p class="lede">Un vrai graphique, un actif et une période tirés au hasard. Devine la couleur de la prochaine bougie. 10 manches.</p></div></div>
      <div class="swipe glass" id="sw">
        <div class="sw-top">
          <span class="pill" id="sw-a">…</span>
          <span data-tip-text="Manche en cours">Manche <b id="sw-r">1</b>/${ROUNDS}</span>
          <span data-tip-text="Bonnes réponses">✅ <b id="sw-s">0</b></span>
          <span data-tip-text="Bonnes réponses d'affilée">🔥 <b id="sw-k">0</b></span>
        </div>
        <div class="chartbox tall" id="chart"></div>
        <div class="sw-fb" id="fb"></div>
        <div class="sw-btns">
          <button class="sw-b dn" id="down" data-tip-text="La prochaine bougie clôturera plus bas que son ouverture." data-tip-kbd="↓">▼ Baisse</button>
          <button class="sw-b up" id="up" data-tip-text="La prochaine bougie clôturera plus haut que son ouverture." data-tip-kbd="↑">▲ Hausse</button>
        </div>
        <p class="muted small center">Sur mobile : glisse vers le haut ou vers le bas sur le graphique.</p>
      </div>`;

    async function newGame() {
      round = 0; right = 0; streak = 0; bestStreak = 0;
      const pool = M.Market.ASSETS.filter(a => a.sym !== "EURUSDT");
      const a = pool[Math.floor(Math.random() * pool.length)];
      const tf = ["15m", "1h", "4h", "1d"][Math.floor(Math.random() * 4)];
      const span = 2 * 365 * 86400e3;
      const endT = Date.now() - 86400e3 * 2 - Math.random() * span;
      info = { a, tf };
      $("#sw-a", el).textContent = "chargement…";
      const r = await M.Market.klines(a.sym, tf, { limit: CTX + ROUNDS, endTime: Math.floor(endT) });
      if (!alive) return;
      live = r.live;
      bars = r.bars.slice(-(CTX + ROUNDS));
      $("#sw-a", el).textContent = `${a.short} · ${tf} · ${new Date(bars[CTX].t).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}${r.live ? "" : " · démo"}`;
      $("#sw-a", el).className = "pill " + (r.live ? "live" : "demo");
      $("#sw-a", el).setAttribute("data-tip-text", r.live ? "Données réelles tirées au hasard dans les 2 dernières années." : "Données simulées (marché injoignable).");
      if (!chart) chart = new M.Chart($("#chart", el), { tf, visible: CTX + ROUNDS, noPan: true });
      chart.opts.tf = tf; chart.visible = CTX + ROUNDS;
      chart.setOverlays([{ type: "ema", n: 20, color: "#C6FF3D" }]);
      chart.setData(bars.slice(0, CTX));
      $("#fb", el).innerHTML = "";
      hud();
      lock = false;
    }
    function hud() {
      $("#sw-r", el).textContent = Math.min(round + 1, ROUNDS);
      $("#sw-s", el).textContent = right;
      $("#sw-k", el).textContent = streak;
    }
    function guess(up) {
      if (lock || !bars.length) return;
      lock = true;
      const b = bars[CTX + round];
      const isUp = b.c >= b.o;
      const ok = up === isUp;
      if (ok) { right++; streak++; bestStreak = Math.max(bestStreak, streak); } else streak = 0;
      if (streak >= 5) M.unlock("swipe_7");
      chart.setData(bars.slice(0, CTX + round + 1));
      const fb = $("#fb", el);
      fb.innerHTML = `<div class="fb ${ok ? "ok" : "ko"}">${ok ? "✅ Bien vu" : "❌ Raté"} · bougie ${isUp ? "verte" : "rouge"} <span class="mono">${pct(b.c / b.o - 1, 2)}</span></div>`;
      $("#sw", el).classList.remove("flash-ok", "flash-ko");
      void $("#sw", el).offsetWidth;
      $("#sw", el).classList.add(ok ? "flash-ok" : "flash-ko");
      round++;
      hud();
      setTimeout(() => { if (!alive) return; if (round >= ROUNDS) end(); else lock = false; }, 650);
    }
    function end() {
      const s = M.state.swipe;
      s.games++; s.right += right; s.total += ROUNDS; s.best = Math.max(s.best, right);
      M.save();
      M.unlock("swipe_game");
      M.addXP(5 + right * 3, "partie de Swipe");
      const acc = right / ROUNDS;
      M.modal(`
        <div class="debrief center">
          <p class="eyebrow">Partie terminée${live ? "" : " · démo"}</p>
          <div class="ring big" style="--p:${acc * 100}"><b>${right}/${ROUNDS}</b></div>
          <h2>${acc >= 0.8 ? "Voyant extralucide 🔮" : acc >= 0.6 ? "Pas mal du tout 👀" : acc >= 0.4 ? "Pile ou face, en fait 🪙" : "Le marché t'a lu 😅"}</h2>
          <p>Meilleure série : <b>${bestStreak}</b> · Historique global : <b>${Math.round(s.right / s.total * 100)} %</b> sur ${s.total} bougies</p>
          <div class="story"><h4>🧠 La vraie leçon</h4><p>Sur une seule bougie, même les pros tournent autour de 50 %. Le court terme est presque aléatoire. Les traders qui gagnent ne devinent pas mieux : ils <b>coupent vite leurs pertes, laissent courir leurs gains et contrôlent leur taille</b>. C'est la gestion du risque, pas la prédiction, qui fait la différence.</p></div>
          <div class="cta"><button class="btn primary" id="replay">🔁 Rejouer</button><a class="btn ghost" href="#/course/risque" data-close>📚 Module gestion du risque</a></div>
        </div>`);
      document.getElementById("replay").onclick = () => { document.querySelector(".modal-wrap .modal-x").click(); newGame(); };
    }

    $("#up", el).onclick = () => guess(true);
    $("#down", el).onclick = () => guess(false);
    const keys = e => {
      if (e.key === "ArrowUp") { e.preventDefault(); guess(true); }
      if (e.key === "ArrowDown") { e.preventDefault(); guess(false); }
    };
    document.addEventListener("keydown", keys);
    let ty = null;
    const box = $("#chart", el);
    box.addEventListener("touchstart", e => { ty = e.touches[0].clientY; }, { passive: true });
    box.addEventListener("touchmove", e => { if (ty != null) e.preventDefault(); }, { passive: false });
    box.addEventListener("touchend", e => {
      if (ty == null) return;
      const dy = e.changedTouches[0].clientY - ty; ty = null;
      if (Math.abs(dy) > 40) guess(dy < 0);
    });

    newGame();
    return () => { alive = false; document.removeEventListener("keydown", keys); if (chart) chart.destroy(); };
  };
})();
