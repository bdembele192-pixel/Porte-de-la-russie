/* Algo Lab : backtest des 4 algos sur de vraies données, frais inclus. */
window.M = window.M || {};

(function () {
  const { $, $$, pct } = M.u;

  const num = v => (v < 0 ? "−" : "") + Math.abs(v).toFixed(2).replace(".", ",");

  M.views.lab = function (el) {
    const A = M.Algos.ALGOS;
    const st = Object.assign({ algo: "trend", sym: "BTCUSDT", tf: "4h", n: 1000, fee: 0.1 }, M.state.labCfg || {});
    const params = {};
    A.forEach(a => params[a.id] = Object.fromEntries(a.params.map(p => [p.k, p.v])));
    if (M.state.labParams) Object.keys(M.state.labParams).forEach(k => Object.assign(params[k] || {}, M.state.labParams[k]));
    let chart = null, alive = true, cache = {};

    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">Algo Lab</p><h1>Teste les algos des pros <span class="grad">sur de vraies données</span></h1>
      <p class="lede">Choisis un algo, règle ses paramètres, lance le backtest. Frais inclus, exécution à la bougie suivante (pas de triche avec le futur). Puis compare au simple « acheter et garder ».</p></div></div>
      <div class="algos">${A.map(a => `<button class="algo glass" data-a="${a.id}" data-tip="${a.tip}">
        <span class="al-e">${M.ico("algo", a.id)}</span><b>${a.name}</b><small>${a.tag}</small></button>`).join("")}</div>
      <div class="lab">
        <aside class="glass pad lab-cfg">
          <div id="desc"></div>
          <div class="two">
            <label class="fld" id="symf" data-tip-text="L'actif sur lequel tester l'algo."><span>Actif</span><select id="sym">${M.Market.ASSETS.map(a => `<option value="${a.sym}">${a.short} — ${a.name}</option>`).join("")}</select></label>
            <label class="fld" data-tip="timeframe"><span>Unité de temps</span><select id="tf">${["1h", "4h", "1d"].map(t => `<option>${t}</option>`).join("")}</select></label>
          </div>
          <div class="two">
            <label class="fld" data-tip-text="Nombre de bougies de l'historique testé. Plus c'est long, plus le test est significatif."><span>Historique</span><select id="n">${[500, 1000, 2000].map(n => `<option value="${n}">${n} bougies</option>`).join("")}</select></label>
            <label class="fld" data-tip="frais"><span>Frais / ordre</span><span class="inp"><input type="number" id="fee" step="0.01" min="0" max="1"><em>%</em></span></label>
          </div>
          <div id="params"></div>
          <button class="btn primary wide" id="run" data-tip-text="Lance la simulation de l'algo sur l'historique choisi." data-tip-kbd="Entrée">🧪 Lancer le backtest</button>
          <button class="btn ghost wide" id="cmp" data-tip-text="Lance les 4 algos avec leurs réglages par défaut sur les mêmes données, pour voir lequel s'adapte le mieux à ce marché.">🏁 Comparer les 4 algos</button>
          <p class="muted small">⚠️ <span class="term" data-tip="overfitting">Overfitting</span> : si tu règles les paramètres jusqu'à trouver « le meilleur », tu optimises le passé, pas le futur.</p>
        </aside>
        <section class="lab-out">
          <div class="stats" id="stats"></div>
          <div class="chartbox glass" id="chart"></div>
          <div class="glass pad"><div class="sec-head sm"><h4 id="eqt">Courbe de capital</h4><span class="legend"><i style="--c:#C6FF3D"></i>Algo <i style="--c:#8C90A8"></i>Acheter & garder</span></div>
            <div class="eqbox"><canvas id="eq"></canvas></div></div>
          <div class="glass pad" id="trades"></div>
        </section>
      </div>
      ${M.disclaimer()}`;

    const symSel = $("#sym", el), tfSel = $("#tf", el), nSel = $("#n", el), feeIn = $("#fee", el);
    symSel.value = st.sym; tfSel.value = st.tf; nSel.value = st.n; feeIn.value = st.fee;

    function algo() { return A.find(a => a.id === st.algo); }

    function drawCfg() {
      const a = algo();
      $$(".algo", el).forEach(b => b.classList.toggle("on", b.dataset.a === a.id));
      $("#desc", el).innerHTML = `<h3>${M.ico("algo", a.id)} ${a.name}</h3><p class="small">${M.linkTerms(a.desc)}</p>`;
      $("#symf", el).style.display = a.pair ? "none" : "";
      $("#params", el).innerHTML = a.params.map(p => `
        <label class="fld" data-tip="${p.tip}"><span>${p.label} <b class="mono" id="pv-${p.k}">${params[a.id][p.k]}</b></span>
          <input type="range" data-k="${p.k}" min="${p.min}" max="${p.max}" step="${p.step}" value="${params[a.id][p.k]}"></label>`).join("") +
        (a.pair ? `<p class="small muted">Données : ETH/USDT et BTC/USDT sur la même période.</p>` : "");
      $$("#params input", el).forEach(i => i.oninput = () => {
        params[a.id][i.dataset.k] = +i.value;
        $("#pv-" + i.dataset.k, el).textContent = i.value;
      });
    }
    $$(".algo", el).forEach(b => b.onclick = () => { st.algo = b.dataset.a; drawCfg(); run(); });

    async function data(sym) {
      const k = sym + st.tf + st.n;
      if (!cache[k]) cache[k] = await M.Market.history(sym, st.tf, st.n);
      return cache[k];
    }

    function readCfg() {
      st.sym = symSel.value; st.tf = tfSel.value; st.n = +nSel.value;
      st.fee = Math.max(0, Math.min(1, parseFloat(feeIn.value) || 0));
      M.state.labCfg = st; M.state.labParams = params; M.save();
    }

    async function run() {
      readCfg();
      const a = algo();
      $("#stats", el).innerHTML = `<p class="muted">Chargement des données…</p>`;
      $("#chart", el).classList.add("loading");
      let res, bars, live;
      const opt = { fee: st.fee / 100 };
      if (a.pair) {
        const [ra, rb] = await Promise.all([data(a.pair[0]), data(a.pair[1])]);
        if (!alive) return;
        const n = Math.min(ra.bars.length, rb.bars.length);
        bars = ra.bars.slice(-n);
        live = ra.live && rb.live;
        res = M.Algos.backtestPairs(ra.bars, rb.bars, params[a.id], opt);
      } else {
        const r = await data(st.sym);
        if (!alive) return;
        bars = r.bars; live = r.live;
        res = M.Algos.backtest(a, bars, params[a.id], opt);
      }
      $("#chart", el).classList.remove("loading");
      M.state.lab.runs++; M.save();
      M.unlock("lab_run");
      if (M.state.lab.runs === 1) M.addXP(20, "premier backtest");
      show(a, res, bars, live);
    }

    function show(a, res, bars, live) {
      const beat = res.ret > res.bh;
      $("#stats", el).innerHTML =
        M.stat("Rendement algo", pct(res.ret, 1), "Performance de l'algo sur la période, frais inclus.", null, res.ret >= 0 ? "up" : "dn") +
        M.stat(a.pair ? "ETH (acheter & garder)" : "Acheter & garder", pct(res.bh, 1), "Ce qu'aurait rapporté un simple achat au début, conservé jusqu'à la fin.", null, res.bh >= 0 ? "up" : "dn") +
        M.stat("Perte max", pct(res.mdd, 1), "", "drawdown", "dn") +
        M.stat("Réussite", Math.round(res.winRate * 100) + " %", "", "win-rate") +
        M.stat("Profit factor", isFinite(res.pf) ? res.pf.toFixed(2).replace(".", ",") : "∞", "", "profit-factor") +
        M.stat("Trades", res.nTrades, "Nombre de trades pris par l'algo.") +
        M.stat("Sharpe", num(res.sharpe), "", "sharpe") +
        `<div class="stat glass verdict ${beat ? "ok" : "ko"}" data-tip-text="${live ? "Données réelles Binance." : "Données simulées : marché injoignable."}"><small>Verdict ${live ? "" : "(démo)"}</small><b>${beat ? "🏆 Bat le marché" : "🐢 Battu par le buy & hold"}</b></div>`;

      if (!chart) chart = new M.Chart($("#chart", el), { tf: st.tf, visible: 200 });
      chart.opts.tf = st.tf;
      chart.setOverlays(a.overlays(params[a.id]));
      chart.setLines([]);
      chart.setData(bars);
      const mk = [];
      res.trades.forEach(t => {
        mk.push({ i: t.in, type: a.pair ? (t.side > 0 ? "buy" : "sell") : "buy" });
        if (!t.open) mk.push({ i: t.out, type: "exit" });
      });
      chart.setMarkers(mk);

      const cap = 10000;
      const bh = bars.map(b => cap * b.c / bars[0].c);
      $("#eqt", el).textContent = a.pair ? "Capital (stratégie neutre au marché)" : "Courbe de capital";
      M.lineChart($("#eq", el), [{ data: bh, color: "#8C90A8", width: 1.4 }, { data: res.equity, color: "#C6FF3D", fill: true }]);

      const tr = res.trades.slice(-12).reverse();
      $("#trades", el).innerHTML = `<h4>Derniers trades de l'algo</h4>` + (tr.length ? `<div class="tt">${tr.map(t => `
        <div class="tt-r"><span>${M.fmtTime(bars[t.in].t, "1d")}</span><span>${a.pair ? (t.side > 0 ? "Long ETH / Short BTC" : "Short ETH / Long BTC") : "Long"}</span>
        <span class="muted">${t.out - t.in} bougies${t.open ? " · ouvert" : ""}</span><b class="mono ${t.ret >= 0 ? "up" : "dn"}">${pct(t.ret, 2)}</b></div>`).join("")}</div>`
        : `<p class="muted small">Aucun trade sur cette période : les conditions d'entrée n'ont jamais été réunies. Essaie d'autres paramètres ou un autre actif.</p>`);
    }

    async function compare() {
      readCfg();
      const btn = $("#cmp", el); btn.disabled = true; btn.textContent = "Calcul…";
      const opt = { fee: st.fee / 100 };
      const r = await data(st.sym);
      const [re, rb] = await Promise.all([data("ETHUSDT"), data("BTCUSDT")]);
      if (!alive) return;
      btn.disabled = false; btn.textContent = "🏁 Comparer les 4 algos";
      const rows = A.map(a => {
        const p = Object.fromEntries(a.params.map(x => [x.k, x.v]));
        const res = a.pair ? M.Algos.backtestPairs(re.bars, rb.bars, p, opt) : M.Algos.backtest(a, r.bars, p, opt);
        return { a, res };
      });
      const best = rows.reduce((b, x) => x.res.sharpe > b.res.sharpe ? x : b, rows[0]);
      M.unlock("lab_compare");
      M.modal(`
        <p class="eyebrow">Grand prix des algos · ${M.Market.asset(st.sym).short} · ${st.tf} · ${st.n} bougies${r.live ? "" : " · démo"}</p>
        <h2>🏁 Résultats</h2>
        <div class="cmp">
          <div class="cmp-r head"><span>Algo</span><span data-tip-text="Rendement total, frais inclus">Rendement</span><span data-tip="drawdown">Perte max</span><span data-tip="win-rate">Réussite</span><span data-tip-text="Nombre de trades">Trades</span><span data-tip="sharpe">Sharpe</span></div>
          ${rows.map(({ a, res }) => `<div class="cmp-r ${a === best.a ? "best" : ""}">
            <span>${M.ico("algo", a.id)} ${a.name}${a.pair ? " <small>(ETH/BTC)</small>" : ""}</span>
            <span class="mono ${res.ret >= 0 ? "up" : "dn"}">${pct(res.ret, 1)}</span>
            <span class="mono dn">${pct(res.mdd, 1)}</span>
            <span class="mono">${Math.round(res.winRate * 100)} %</span>
            <span class="mono">${res.nTrades}</span>
            <span class="mono">${num(res.sharpe)}</span></div>`).join("")}
          <div class="cmp-r bh"><span>📦 Acheter & garder ${M.Market.asset(st.sym).short}</span><span class="mono ${rows[0].res.bh >= 0 ? "up" : "dn"}">${pct(rows[0].res.bh, 1)}</span><span></span><span></span><span></span><span></span></div>
        </div>
        <p class="small">Le meilleur rapport rendement/risque ici : <b>${M.ico("algo", best.a.id)} ${best.a.name}</b>. Mais attention : relance la comparaison sur un autre actif ou une autre unité de temps, et le classement change souvent. C'est exactement la leçon : <b>chaque algo a son régime de marché</b>. Les pros en combinent plusieurs.</p>
        <button class="btn primary" data-close>Compris</button>`, { wide: true });
    }

    $("#run", el).onclick = run;
    $("#cmp", el).onclick = compare;
    [symSel, tfSel, nSel].forEach(s => s.onchange = run);
    const keys = e => { if (e.key === "Enter" && !/textarea/i.test(e.target.tagName)) run(); };
    document.addEventListener("keydown", keys);

    drawCfg();
    run();
    return () => { alive = false; document.removeEventListener("keydown", keys); if (chart) chart.destroy(); };
  };
})();
