/* Terminal live : vrais prix en temps réel, flux des transactions réelles, ticket d'ordre et position.
   Le ticket (M.ticket) et la carte de position (M.posCard) servent aussi aux missions. */
window.M = window.M || {};

(function () {
  const { $, $$, esc, pct } = M.u;

  /* Ticket d'ordre réutilisable.
     opts : { trader, price(), sym, maxLev, onOpen(tr) } */
  // Raisons proposées dans le journal du ticket
  const WHY = ["Tendance", "Support / résistance", "Cassure", "Actualité", "Intuition"];

  M.ticket = function (el, opts) {
    const cfg = M.state.settings;
    const cur = M.currency();
    const maxLev = Math.max(1, Math.min(opts.maxLev || 20, cfg.maxLev || 20));
    const st = { dir: 1, lev: 1 };
    el.innerHTML = `
      <div class="ticket">
        <div class="seg">
          <button class="seg-b long on" data-d="1" data-tip="long">▲ Long</button>
          <button class="seg-b short" data-d="-1" data-tip="short">▼ Short</button>
        </div>
        <label class="fld" data-tip="marge"><span>Mise</span>
          <span class="inp"><input type="number" id="t-amt" min="0" step="any" inputmode="decimal"><em>${cur.sym}</em></span></label>
        <div class="chips-row">${[10, 25, 50, 100].map(p => `<button class="mini" data-p="${p}" data-tip-text="Miser ${p} % du cash disponible.">${p}%</button>`).join("")}</div>
        <small class="muted" id="t-hint" style="margin-top:-6px">Tape le montant que tu veux, ou utilise les raccourcis.</small>
        <label class="fld" data-tip="levier"><span>Levier <b id="t-levv">×1</b></span>
          <input type="range" id="t-lev" min="1" max="${maxLev}" step="1" value="1"></label>
        <div class="two">
          <label class="fld" data-tip="stop-loss"><span>Stop-loss</span>
            <span class="inp"><input type="number" id="t-sl" min="0" step="0.1" value="${cfg.defSl}" inputmode="decimal"><em>%</em></span><small id="t-slp">—</small></label>
          <label class="fld" data-tip="take-profit"><span>Objectif</span>
            <span class="inp"><input type="number" id="t-tp" min="0" step="0.1" value="${cfg.defTp}" inputmode="decimal"><em>%</em></span><small id="t-tpp">—</small></label>
        </div>
        ${opts.journal ? `<div class="fld t-why" data-tip-text="Ton journal de trading : note pourquoi tu entres. Le coach compare ensuite tes raisons à tes résultats.">
          <span>Pourquoi ce trade ? <small>journal</small></span>
          <div class="why-chips">${WHY.map(w => `<button type="button" data-w="${w}">${w}</button>`).join("")}</div>
          <input type="text" id="t-why" maxlength="140" placeholder="Ex. : rebond sur le support, stop sous le dernier creux">
        </div>` : ""}
        <div class="riskbox" id="t-risk"></div>
        <button class="go long" id="t-go" data-tip-text="Envoie l'ordre au prix actuel du marché." data-tip-kbd="B = long · S = short">Acheter</button>
      </div>`;
    const amt = $("#t-amt", el), lev = $("#t-lev", el), sl = $("#t-sl", el), tp = $("#t-tp", el);
    const tr = opts.trader;
    const why = $("#t-why", el);
    let whyTag = "";
    $$(".why-chips button", el).forEach(b => b.onclick = () => {
      whyTag = whyTag === b.dataset.w ? "" : b.dataset.w;
      $$(".why-chips button", el).forEach(x => x.classList.toggle("on", x.dataset.w === whyTag));
    });

    function setDir(d) {
      st.dir = d;
      $$(".seg-b", el).forEach(b => b.classList.toggle("on", +b.dataset.d === d));
      const go = $("#t-go", el);
      go.className = "go " + (d > 0 ? "long" : "short");
      refresh();
    }
    $$(".seg-b", el).forEach(b => b.onclick = () => setDir(+b.dataset.d));
    // Le champ « Mise » est dans la devise d'affichage ; le moteur travaille en dollars.
    const toInput = usd => { const v = usd * cur.rate; return cur.dec ? Math.floor(v * 100) / 100 : Math.floor(v); };
    $$(".mini", el).forEach(b => b.onclick = () => { amt.value = toInput(tr.s.cash * (+b.dataset.p / 100) / (1 + M.FEE * st.lev)); refresh(); });
    lev.oninput = () => { st.lev = +lev.value; refresh(); };
    [amt, sl, tp].forEach(i => i.oninput = refresh);
    if (!amt.value) amt.value = toInput(tr.s.cash * 0.1);

    function calc() {
      const price = opts.price();
      const m = Math.max(0, (parseFloat(amt.value) || 0) / cur.rate), L = st.lev;
      const slp = parseFloat(sl.value), tpp = parseFloat(tp.value);
      const slPrice = slp > 0 ? price * (1 - st.dir * slp / 100) : null;
      const tpPrice = tpp > 0 ? price * (1 + st.dir * tpp / 100) : null;
      const notional = m * L;
      const riskUsd = slPrice ? notional * slp / 100 + notional * M.FEE * 2 : m;
      const eq = tr.s.cash;
      const liq = L > 1 ? price * (1 - st.dir / L) : null;
      return { price, m, L, slp, tpp, slPrice, tpPrice, notional, riskUsd, riskPct: riskUsd / Math.max(eq, 1), liq };
    }

    function refresh() {
      const c = calc();
      $("#t-levv", el).textContent = "×" + c.L;
      $("#t-levv", el).className = c.L > 10 ? "dn" : c.L > 3 ? "warn" : "";
      $("#t-slp", el).textContent = c.slPrice ? M.Market.fmtPrice(c.slPrice) : "aucun stop !";
      $("#t-slp", el).className = c.slPrice ? "" : "dn";
      $("#t-tpp", el).textContent = c.tpPrice ? M.Market.fmtPrice(c.tpPrice) : "—";
      const liqBeforeSl = c.liq && c.slPrice && (st.dir > 0 ? c.liq >= c.slPrice : c.liq <= c.slPrice);
      const lvl = !c.slPrice || c.riskPct > 0.05 || liqBeforeSl ? "bad" : c.riskPct > 0.021 ? "warn" : "ok";
      const msg = !c.slPrice ? "Sans stop, tu risques toute ta mise (voire la liquidation)."
        : liqBeforeSl ? "Ton stop est AU-DELÀ du prix de liquidation : tu seras liquidé avant. Baisse le levier."
        : c.riskPct > 0.05 ? "Plus de 5 % du compte en jeu sur un seul trade : c'est du casino."
        : c.riskPct > 0.021 ? "Un peu au-dessus de la règle des 1-2 %. Réduis la mise ou rapproche le stop."
        : "Risque maîtrisé. Le coach valide ✅";
      $("#t-risk", el).innerHTML = `
        <div data-tip-text="Valeur totale de la position = mise × levier."><span>Exposition</span><b class="mono">${M.fmt$(c.notional)}</b></div>
        <div data-tip="regle-1pc"><span>Risque si stop</span><b class="mono ${lvl === "ok" ? "up" : lvl === "warn" ? "warn" : "dn"}">${M.fmt$(c.riskUsd)} · ${(c.riskPct * 100).toFixed(1).replace(".", ",")} %</b></div>
        ${c.liq ? `<div data-tip="liquidation"><span>Liquidation</span><b class="mono dn">${M.Market.fmtPrice(c.liq)}</b></div>` : ""}
        ${c.slp > 0 && c.tpp > 0 ? `<div data-tip="rr"><span>Ratio R:R</span><b class="mono">1 : ${(c.tpp / c.slp).toFixed(1).replace(".", ",")}</b></div>` : ""}
        <p class="coach-hint ${lvl}">${msg}</p>`;
      const go = $("#t-go", el);
      const busy = !!tr.pos;
      go.disabled = busy || c.m <= 0;
      go.textContent = busy ? "Position déjà ouverte" : (st.dir > 0 ? "▲ Acheter / Long " : "▼ Vendre / Short ") + (opts.sym ? M.Market.asset(opts.sym()).short : "");
    }

    function send(d, bypass) {
      if (d) setDir(d);
      const c = calc();
      if (tr.pos || !(c.price > 0)) return;
      if (c.m > tr.s.cash) { M.toast("Mise supérieure à ton cash (" + M.fmt$(tr.s.cash) + "). Ajoute des fonds dans Paramètres → Trading.", "err"); return; }
      if (opts.guard) { const why = opts.guard(c); if (why) { M.toast(why, "err"); M.sfx("ko"); return; } }
      // Copilote IA (trading live uniquement) : peut proposer une version plus sûre de l'ordre
      if (opts.advisor && !bypass && opts.advisor(c, st.dir, { keep: () => send(null, true), apply: p => { apply(p); send(null, true); } })) return;
      if (cfg.confirm && !confirm(`${st.dir > 0 ? "Acheter (long)" : "Vendre (short)"} pour ${M.fmt$(c.m)}${c.L > 1 ? " ×" + c.L : ""} ?\nStop : ${c.slPrice ? M.Market.fmtPrice(c.slPrice) : "aucun"} · Objectif : ${c.tpPrice ? M.Market.fmtPrice(c.tpPrice) : "aucun"}`)) return;
      const r = tr.open({ dir: st.dir, margin: c.m, lev: c.L, sl: c.slPrice, tp: c.tpPrice, price: c.price, at: opts.at ? opts.at() : Date.now(), sym: opts.sym ? opts.sym() : "",
        why: why ? { tag: whyTag, note: why.value.trim() } : null });
      if (r.err) { M.toast(r.err, "err"); return; }
      if (why) { why.value = ""; whyTag = ""; $$(".why-chips button", el).forEach(x => x.classList.remove("on")); }
      M.sfx("open");
      M.unlock("first_trade");
      if (c.slPrice) M.unlock("first_stop");
      opts.onOpen && opts.onOpen(r.pos);
      refresh();
    }
    $("#t-go", el).onclick = () => send();
    refresh();
    function apply(p) {
      setDir(p.dir);
      st.lev = p.L; lev.value = p.L;
      amt.value = toInput(p.m);
      sl.value = (+p.slp).toFixed(2); tp.value = (+p.tpp).toFixed(2);
      refresh();
    }
    return { refresh, send, setDir, apply };
  };

  /* Carte de la position ouverte. */
  M.posCard = function (el, { trader, price, onClose }) {
    let wiOpen = false;
    // « Et si ? » : résultat de la position si le prix bougeait maintenant de X %, stop et liquidation compris
    function whatIf(p, px) {
      const eq = trader.equity(px);
      return [-10, -5, -2, 2, 5, 10].map(m => {
        const t = px * (1 + m / 100), long = p.dir > 0;
        let exit = t, why = "";
        if (p.liq && (long ? t <= p.liq : t >= p.liq) && !(p.sl && (long ? p.sl > p.liq : p.sl < p.liq))) { return { m, pnl: -p.margin - p.fees, why: "liquidé : toute la mise perdue", eq }; }
        if (p.sl && (long ? t <= p.sl : t >= p.sl)) { exit = p.sl; why = "stop touché, perte limitée"; }
        else if (p.tp && (long ? t >= p.tp : t <= p.tp)) { exit = p.tp; why = "objectif atteint"; }
        const pnl = p.dir * (exit - p.entry) * p.qty - p.fees - p.qty * exit * M.FEE;
        return { m, pnl, why, eq };
      });
    }
    function draw() {
      const p = trader.pos;
      if (!p) { el.innerHTML = `<div class="nopos">Aucune position ouverte.<br><small>Choisis un sens, une mise, un stop… et lance-toi.</small></div>`; return; }
      const px = price();
      const u = trader.upnl(px);
      const roe = u / p.margin;
      el.innerHTML = `
        <div class="pos ${p.dir > 0 ? "long" : "short"}">
          <div class="pos-h"><span class="pside">${p.dir > 0 ? "▲ LONG" : "▼ SHORT"} ${p.lev > 1 ? "×" + p.lev : ""}</span>
            <span class="mono ${u >= 0 ? "up" : "dn"} pnl" data-tip="pnl">${u >= 0 ? "+" : ""}${M.fmt$(u)} <small>(${pct(roe, 1)})</small></span></div>
          <div class="pos-g">
            <div data-tip-text="Prix moyen auquel tu es entré."><small>Entrée</small><b class="mono">${M.Market.fmtPrice(p.entry)}</b></div>
            <div data-tip-text="Dernier prix du marché."><small>Prix</small><b class="mono">${M.Market.fmtPrice(px)}</b></div>
            <div data-tip="stop-loss"><small>Stop</small><b class="mono dn">${p.sl ? M.Market.fmtPrice(p.sl) : "—"}</b></div>
            <div data-tip="take-profit"><small>Objectif</small><b class="mono up">${p.tp ? M.Market.fmtPrice(p.tp) : "—"}</b></div>
            ${p.liq ? `<div data-tip="liquidation"><small>Liquidation</small><b class="mono dn">${M.Market.fmtPrice(p.liq)}</b></div>` : ""}
            <div data-tip="marge"><small>Marge</small><b class="mono">${M.fmt$(p.margin)}</b></div>
          </div>
          <div class="pos-a">
            <button class="btn ghost sm" id="p-be" data-tip-text="Déplace le stop-loss à ton prix d'entrée : le trade ne peut plus être perdant (hors frais et gap). Possible seulement si tu es en gain." ${u > 0 ? "" : "disabled"}>🔒 Stop au point mort</button>
            <button class="btn sm closeb" id="p-x" data-tip-text="Ferme toute la position au prix du marché." data-tip-kbd="X">Clôturer</button>
          </div>
          ${p.why && (p.why.tag || p.why.note) ? `<p class="wi-note">Journal : ${esc([p.why.tag, p.why.note].filter(Boolean).join(" — "))}</p>` : ""}
          <div class="whatif">
            <button type="button" id="p-wi" aria-expanded="${wiOpen}" data-tip-text="Teste ta position : ce que tu gagnes ou perds si le prix bouge d'un coup, stop et liquidation compris.">Et si le prix bougeait ? <em>${wiOpen ? "masquer" : "tester"}</em></button>
            ${wiOpen ? `<div class="wi-rows">${whatIf(p, px).map(r => `<div class="wi-r"><b class="mono ${r.m > 0 ? "up" : "dn"}">${r.m > 0 ? "+" : "−"}${Math.abs(r.m)} %</b><small>${r.why || "position toujours ouverte"}</small><b class="mono ${r.pnl >= 0 ? "up" : "dn"}">${r.pnl >= 0 ? "+" : ""}${M.fmt$(r.pnl)} <small>${pct(r.pnl / Math.max(r.eq, 1), 1)}</small></b></div>`).join("")}</div>
            <p class="wi-note">Le pourcentage est rapporté à la valeur de ton compte. Un mouvement brutal peut sauter ton stop (gap) : la perte réelle serait alors plus grande.</p>` : ""}
          </div>
        </div>`;
      $("#p-wi", el).onclick = () => { wiOpen = !wiOpen; draw(); };
      $("#p-x", el).onclick = () => onClose("manual");
      $("#p-be", el).onclick = () => { p.sl = p.entry; M.save(); M.toast("Stop déplacé au point mort 🔒"); draw(); onClose(null); };
    }
    draw();
    return { draw };
  };

  /* Message + XP + badges après la clôture d'un trade. */
  M.afterTrade = function (tr) {
    if (!tr) return;
    const r = { sl: "Stop-loss touché", tp: "Objectif atteint 🎯", liq: "LIQUIDÉ 💀", manual: "Position clôturée", end: "Fin de session" }[tr.reason] || "Clôturé";
    M.toast(`${r} · ${tr.pnl >= 0 ? "+" : ""}${M.fmt$(tr.pnl)}`, tr.pnl >= 0 ? "win" : "loss");
    M.sfx(tr.pnl >= 0 ? "win" : "loss");
    if (tr.reason === "liq") M.unlock("liquidated");
    if (tr.pnl > 0) M.unlock("first_win");
    // Seuls les trades live portent un instantané IA : missions et entraînements ne l'alimentent pas
    if (tr.ai && M.AI) M.AI.learnFromTrade(tr, tr.ai);
  };

  // ------------------------------------------------------------------
  M.views.live = function (el, [symParam]) {
    const s = M.state;
    let sym = M.Market.ASSETS.some(a => a.sym === symParam) ? symParam : s.lastSym;
    let tf = s.lastTf || "15m";
    const ind = Object.assign({ ema20: true, ema50: false, bb: false, vwap: false, rsi: false }, s.liveInd || {});
    const trader = new M.Trader(s.wallet);
    let price = null, stream = null, posStream = null, tape = null, chart = null, alive = true, mode = "…";
    let posPrice = null;

    el.innerHTML = `
      <div class="live">
        <aside class="watch glass">
          <h4 data-tip-text="Clique sur un actif pour afficher son graphique.">Marchés</h4>
          <div id="wl">${M.Market.ASSETS.map(a => `
            <button class="wl-i" data-s="${a.sym}" data-tip-title="${a.name}" data-tip-text="${a.type} · ${M.GLOSSARY[a.tip].d}">
              <span class="tk-ic sm" style="--c:${a.color}">${a.icon}</span><span class="wl-n"><b>${a.short}</b><small>${a.name}</small></span>
              <span class="wl-p mono"><b data-wp="${a.sym}">—</b><small data-wc="${a.sym}">—</small></span>
            </button>`).join("")}</div>
        </aside>

        <section class="chartcol">
          <div class="chart-top glass">
            <div class="ct-l">
              <span class="tk-ic" id="ct-ic"></span>
              <div><b id="ct-name"></b><small id="ct-type"></small></div>
              <div class="ct-price"><b class="mono" id="ct-p">—</b><small class="mono" id="ct-c"></small></div>
              <span class="pill" id="ct-mode">connexion…</span>
            </div>
            <div class="ct-r">
              <div class="tfs" data-tip="timeframe">${Object.keys(M.Market.TF).map(t => `<button class="tf ${t === tf ? "on" : ""}" data-tf="${t}">${t}</button>`).join("")}</div>
              <div class="inds">
                <button class="ind" data-i="ema20" data-tip="ema">EMA 20</button>
                <button class="ind" data-i="ema50" data-tip="ema">EMA 50</button>
                <button class="ind" data-i="bb" data-tip="bollinger">Bollinger</button>
                <button class="ind" data-i="vwap" data-tip="vwap">VWAP</button>
                <button class="ind" data-i="rsi" data-tip="rsi">RSI</button>
              </div>
            </div>
          </div>
          <div class="chartbox glass" id="chart" data-tip-text="Molette ou pincement = zoom · glisser = se déplacer dans le temps · double-clic = revenir au présent."></div>
          <div class="tape glass">
            <div class="tape-h"><h4 data-tip-text="Chaque ligne est une vraie transaction qui vient d'avoir lieu sur Binance : prix, quantité, et qui a été agressif (acheteur en vert, vendeur en rouge). 🐋 = grosse transaction.">Flux des trades réels <span class="pill sm" id="tape-mode">…</span></h4>
              <div class="flow" data-tip-text="Part des volumes à l'achat (vert) et à la vente (rouge) sur les dernières transactions. Indique quel camp est le plus pressé."><i id="flow-b"></i></div></div>
            <div class="tape-rows" id="tape"></div>
          </div>
        </section>

        <aside class="side">
          <div class="wallet glass">
            <div data-tip="equity"><small>Valeur du compte</small><b class="mono" id="w-eq">—</b></div>
            <div data-tip-text="Argent disponible pour ouvrir une position."><small>Cash dispo</small><b class="mono" id="w-cash">—</b></div>
          </div>
          <div class="glass pad" id="tk"></div>
          <div class="glass pad" id="pc"></div>
          <div class="glass pad hist">
            <div class="sec-head sm"><h4>Historique</h4><button class="btn ghost sm" id="coachb" data-tip-text="Le coach analyse tes 20 derniers trades : stop, taille, levier, revenge trading…">🧠 Analyse coach</button></div>
            <div id="hist"></div>
          </div>
        </aside>
      </div>
      ${M.disclaimer()}`;

    const ticket = M.ticket($("#tk", el), {
      trader, maxLev: 20, journal: true, price: () => price, sym: () => sym,
      guard() {
        const lim = M.state.settings.dayLoss;
        if (!lim) return null;
        const d0 = new Date(); d0.setHours(0, 0, 0, 0);
        const lost = trader.s.log.filter(t => (t.closeAt || 0) >= d0.getTime()).reduce((a, t) => a + t.pnl, 0);
        return lost <= -M.START_CASH * lim / 100 ? `Limite de perte du jour atteinte (${lim} %). Pause jusqu'à demain 🧘 — c'est ce que font les pros.` : null;
      },
      advisor: (c, dir, actions) => M.AI ? M.AI.advise(c, dir, { bars: chart ? chart.bars : [], trader, sym, tf }, actions) : false,
      onOpen(pos) {
        // L'IA mémorise la situation de marché à l'entrée pour apprendre du résultat
        if (M.AI && chart && pos) pos.ai = M.AI.snapshot(chart.bars, pos.dir);
        M.save(true); posCard.draw(); drawLines(); drawWallet(); watchPos();
      }
    });
    const posCard = M.posCard($("#pc", el), {
      trader, price: () => (trader.pos && trader.pos.sym !== sym ? posPrice : price) || trader.pos.entry,
      onClose(reason) {
        if (reason) closePos(reason);
        drawLines();
      }
    });

    function closePos(reason) {
      const p = trader.pos;
      if (!p) return;
      const px = p.sym === sym ? price : posPrice;
      const t = trader.close(px || p.entry, reason, Date.now());
      M.save(true);
      M.afterTrade(t);
      if (t) M.addXP(t.sl ? 8 : 3, "trade clôturé");
      after();
    }
    function after() {
      posCard.draw(); ticket.refresh(); drawLines(); drawWallet(); drawHist();
      if (posStream && !trader.pos) { posStream.close(); posStream = null; }
    }

    function drawWallet() {
      const p = trader.pos;
      const px = p ? (p.sym === sym ? price : posPrice) || p.entry : 0;
      $("#w-eq", el).textContent = M.fmt$(trader.equity(px));
      $("#w-cash", el).textContent = M.fmt$(trader.s.cash);
    }
    function drawHist() {
      const log = trader.s.log.slice(-8).reverse();
      $("#hist", el).innerHTML = log.length ? log.map(t => `
        <div class="h-i"><span class="${t.dir > 0 ? "up" : "dn"}">${t.dir > 0 ? "▲" : "▼"} ${M.Market.asset(t.sym).short}${t.lev > 1 ? " ×" + t.lev : ""}</span>
        <span class="muted">${{ sl: "stop", tp: "objectif", liq: "liquidé", manual: "manuel" }[t.reason] || ""}</span>
        <b class="mono ${t.pnl >= 0 ? "up" : "dn"}">${t.pnl >= 0 ? "+" : ""}${M.fmt$(t.pnl)}</b>
        ${t.why && (t.why.tag || t.why.note) ? `<span class="h-why">${esc([t.why.tag, t.why.note].filter(Boolean).join(" — "))}</span>` : ""}</div>`).join("")
        : `<p class="muted small">Tes trades clôturés apparaîtront ici.</p>`;
    }
    function drawLines() {
      if (!chart) return;
      const p = trader.pos;
      if (!p || p.sym !== sym) { chart.setLines([]); return; }
      chart.setLines([
        { price: p.entry, color: "#B4B8CC", label: p.dir > 0 ? "Entrée long" : "Entrée short", dash: true },
        p.sl && { price: p.sl, color: "#FF4D6D", label: "Stop", dash: true },
        p.tp && { price: p.tp, color: "#2BEA8B", label: "Objectif", dash: true },
        p.liq && { price: p.liq, color: "#FFD23D", label: "Liquidation", dash: true }
      ].filter(Boolean));
    }

    function overlays() {
      const o = [];
      if (ind.ema20) o.push({ type: "ema", n: 20, color: "#C6FF3D" });
      if (ind.ema50) o.push({ type: "ema", n: 50, color: "#8B5CFF" });
      if (ind.bb) o.push({ type: "bb", n: 20, k: 2, color: "#FF4DA6" });
      if (ind.vwap) o.push({ type: "vwap", color: "#3DF5FF" });
      return o;
    }
    $$(".ind", el).forEach(b => {
      b.classList.toggle("on", !!ind[b.dataset.i]);
      b.onclick = () => {
        ind[b.dataset.i] = !ind[b.dataset.i];
        b.classList.toggle("on", ind[b.dataset.i]);
        s.liveInd = ind; M.save();
        if (chart) { chart.setOverlays(overlays()); chart.setRsi(ind.rsi); }
      };
    });
    $$(".tf", el).forEach(b => b.onclick = () => {
      tf = b.dataset.tf; s.lastTf = tf; M.save();
      $$(".tf", el).forEach(x => x.classList.toggle("on", x === b));
      load();
    });
    $$(".wl-i", el).forEach(b => b.onclick = () => { history.replaceState(null, "", "#/live/" + b.dataset.s); sym = b.dataset.s; s.lastSym = sym; M.save(); load(); });

    function setMode(m) {
      mode = m;
      const pill = $("#ct-mode", el);
      if (!pill) return;
      const map = {
        live: ["● LIVE", "live", "Connecté en temps réel au flux WebSocket de Binance : ce sont les vrais prix du marché."],
        poll: ["● LIVE (4 s)", "live", "Prix réels de Binance, rafraîchis toutes les 4 secondes."],
        sim: ["● DÉMO", "demo", "Marché injoignable depuis ton réseau : les prix sont simulés. Le fonctionnement reste identique."]
      }[m];
      pill.textContent = map[0]; pill.className = "pill " + map[1]; pill.setAttribute("data-tip-text", map[2]);
    }

    function showPrice() {
      if (price == null || !chart) return;
      const bars = chart.bars;
      const ref = bars.length > 1 ? bars[Math.max(0, bars.length - 1 - Math.round(86400e3 / M.Market.TF[tf]))].o : price;
      const ch = price / ref - 1;
      $("#ct-p", el).textContent = M.Market.fmtPrice(price);
      $("#ct-c", el).textContent = pct(ch) + " (24h)";
      $("#ct-c", el).className = "mono " + (ch >= 0 ? "up" : "dn");
      document.title = `${M.Market.asset(sym).short} ${M.Market.fmtPrice(price)} · Mèche`;
    }

    let lastSave = 0;
    let lastMon = 0;
    function onTick(bar) {
      price = bar.c;
      if (M.AI && trader.pos && trader.pos.sym === sym && Date.now() - lastMon > 4000) {
        lastMon = Date.now();
        M.AI.monitor(trader, price, chart && chart.bars, {
          breakeven: () => { if (trader.pos) { trader.pos.sl = trader.pos.entry; M.save(); posCard.draw(); drawLines(); M.toast("Stop déplacé au point mort 🔒"); } },
          close: () => closePos("manual")
        });
      }
      if (trader.pos && trader.pos.sym === sym) {
        const t = trader.check({ o: bar.c, h: bar.c, l: bar.c }, Date.now());
        trader.pos && (trader.pos.lastCheck = Date.now());
        if (t) { M.save(true); M.afterTrade(t); M.addXP(t.sl ? 8 : 3, "trade clôturé"); after(); }
        else posCard.draw();
        if (Date.now() - lastSave > 5000) { lastSave = Date.now(); M.save(); }
      }
      showPrice(); ticket.refresh(); drawWallet();
    }

    async function load() {
      if (stream) stream.close();
      if (tape) tape.close();
      const a = M.Market.asset(sym);
      $$(".wl-i", el).forEach(b => b.classList.toggle("on", b.dataset.s === sym));
      $("#ct-ic", el).textContent = a.icon; $("#ct-ic", el).style.setProperty("--c", a.color);
      $("#ct-name", el).textContent = a.name + " · " + a.short + "/USDT";
      $("#ct-type", el).textContent = a.type;
      $("#ct-name", el).parentElement.setAttribute("data-tip", a.tip);
      const box = $("#chart", el);
      box.classList.add("loading");
      const r = await M.Market.klines(sym, tf, { limit: 400 });
      if (!alive) return;
      box.classList.remove("loading");
      if (!chart) chart = new M.Chart(box, { tf, rsi: ind.rsi, visible: 110 });
      chart.opts.tf = tf;
      chart.setOverlays(overlays());
      chart.setRsi(ind.rsi);
      chart.setData(r.bars);
      price = r.bars[r.bars.length - 1].c;
      setMode(r.live ? "live" : "sim");
      showPrice(); drawLines(); ticket.refresh(); posCard.draw(); drawWallet();
      stream = M.Market.stream(sym, tf, r.bars[r.bars.length - 1], (b) => { chart.push(b); onTick(b); }, setMode);
      if (!r.live) stream.forceSim();
      tape = startTape(sym, () => price, !r.live);
      watchPos();
    }

    // Une position ouverte sur un autre actif continue d'être surveillée.
    function watchPos() {
      if (posStream) { posStream.close(); posStream = null; }
      const p = trader.pos;
      if (!p || p.sym === sym) return;
      posPrice = posPrice || p.entry;
      M.Market.klines(p.sym, "1m", { limit: 2 }).then(r => {
        if (!alive || !trader.pos) return;
        posPrice = r.bars[r.bars.length - 1].c;
        posStream = M.Market.stream(p.sym, "1m", r.bars[r.bars.length - 1], b => {
          posPrice = b.c;
          const t = trader.check({ o: b.c, h: b.c, l: b.c }, Date.now());
          if (trader.pos) trader.pos.lastCheck = Date.now();
          if (t) { M.save(true); M.afterTrade(t); M.addXP(t.sl ? 8 : 3, "trade clôturé"); after(); } else { posCard.draw(); drawWallet(); }
        });
        if (!r.live) posStream.forceSim();
      });
    }

    // Rattrapage : si l'app était fermée, on rejoue les bougies 1 min depuis la dernière vérification.
    async function catchUp() {
      const p = trader.pos;
      if (!p || !p.lastCheck || Date.now() - p.lastCheck < 60e3) return;
      const r = await M.Market.klines(p.sym, "1m", { limit: 1000, startTime: p.lastCheck });
      if (!r.live || !trader.pos) return;
      for (const b of r.bars) {
        const t = trader.check(b, b.t);
        if (t) {
          M.save(true);
          M.modal(`<h2>Pendant ton absence…</h2><p>Ta position ${t.dir > 0 ? "long" : "short"} sur ${M.Market.asset(t.sym).short} a été fermée : <b>${{ sl: "stop-loss touché", tp: "objectif atteint", liq: "liquidation" }[t.reason]}</b> à ${M.Market.fmtPrice(t.exit)}.</p>
            <p class="big mono ${t.pnl >= 0 ? "up" : "dn"}">${t.pnl >= 0 ? "+" : ""}${M.fmt$(t.pnl)}</p><p class="muted">C'est exactement pour ça qu'on pose des ordres stop et objectif : le marché ne dort jamais, toi si.</p>
            <button class="btn primary" data-close>Compris</button>`);
          M.afterTrade(t);
          after();
          return;
        }
      }
      trader.pos.lastCheck = Date.now();
      M.save();
    }

    $("#coachb", el).onclick = () => showCoach(trader.s.log.slice(-20), "Tes 20 derniers trades");

    const keys = e => {
      if (/input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === "b" || e.key === "B") ticket.send(1);
      if (e.key === "s" || e.key === "S") ticket.send(-1);
      if ((e.key === "x" || e.key === "X") && trader.pos) closePos("manual");
    };
    document.addEventListener("keydown", keys);

    // Prix de la liste de marchés
    async function watchlist() {
      const r = await M.Market.tickers(M.Market.ASSETS.map(a => a.sym));
      if (!alive) return;
      if (r.live && r.data.EURUSDT) M.setEurUsd(r.data.EURUSDT.last);
      Object.entries(r.data).forEach(([k, d]) => {
        const p = $(`[data-wp="${k}"]`, el), c = $(`[data-wc="${k}"]`, el);
        if (p) p.textContent = M.Market.fmtPrice(d.last);
        if (c) { c.textContent = pct(d.chg / 100); c.className = d.chg >= 0 ? "up" : "dn"; }
      });
    }
    watchlist();
    const wiv = setInterval(watchlist, 20000);

    drawHist();
    load().then(catchUp);

    return () => {
      alive = false;
      document.removeEventListener("keydown", keys);
      clearInterval(wiv);
      if (stream) stream.close();
      if (posStream) posStream.close();
      if (tape) tape.close();
      if (chart) chart.destroy();
      document.title = "Mèche · Apprends à trader sans te brûler";
      M.save(true);
    };
  };

  /* Flux des transactions réelles (aggTrade). Repli : transactions simulées. */
  function startTape(sym, getPrice, forceSim) {
    const box = document.getElementById("tape");
    const modeEl = document.getElementById("tape-mode");
    const flowEl = document.getElementById("flow-b");
    let ws = null, sim = null, buf = [], closed = false, buyV = 0, sellV = 0;
    const whale = { BTCUSDT: 250000, ETHUSDT: 150000 }[sym] || 50000;
    const rows = [];

    function flush() {
      if (!buf.length || closed) return;
      buf.forEach(t => {
        const n = t.p * t.q;
        if (t.sell) sellV += n; else buyV += n;
        rows.unshift(`<div class="tp-r ${t.sell ? "dn" : "up"} ${n >= whale ? "whale" : ""}">
          <span>${new Date(t.t).toLocaleTimeString("fr-FR")}</span><span class="mono">${M.Market.fmtPrice(t.p)}</span>
          <span class="mono">${t.q < 1 ? t.q.toFixed(4) : t.q.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}</span>
          <span class="mono">${n >= whale ? "🐋 " : ""}${Math.round(n).toLocaleString("fr-FR")} $</span></div>`);
      });
      rows.length = Math.min(rows.length, 40);
      buf = [];
      box.innerHTML = rows.join("");
      buyV *= 0.97; sellV *= 0.97;
      const tot = buyV + sellV;
      if (flowEl && tot) flowEl.style.width = (buyV / tot * 100).toFixed(1) + "%";
    }
    const iv = setInterval(flush, 350);

    function setMode(live) {
      if (!modeEl) return;
      modeEl.textContent = live ? "réel" : "simulé";
      modeEl.className = "pill sm " + (live ? "live" : "demo");
    }
    function startSim() {
      setMode(false);
      const r = M.Market.rng(Date.now() & 0xffff);
      sim = setInterval(() => {
        const p = getPrice(); if (!p) return;
        const k = 1 + Math.floor(r() * 3);
        for (let i = 0; i < k; i++) {
          const notional = Math.exp(r() * 9) * 8;
          buf.push({ t: Date.now(), p: p * (1 + (r() - 0.5) * 0.0004), q: notional / p, sell: r() < 0.5 });
        }
      }, 450);
    }
    if (forceSim) startSim();
    else {
      let got = false;
      try {
        ws = new WebSocket("wss://data-stream.binance.vision/ws/" + sym.toLowerCase() + "@aggTrade");
        ws.onmessage = ev => {
          got = true;
          try { const d = JSON.parse(ev.data); buf.push({ t: d.T, p: +d.p, q: +d.q, sell: d.m }); } catch (e) { /* ignoré */ }
          if (buf.length > 200) buf.splice(0, buf.length - 200);
        };
        ws.onopen = () => setMode(true);
        ws.onclose = () => { if (!closed && !got) startSim(); };
      } catch (e) { startSim(); }
      setTimeout(() => { if (!got && !closed && !sim) { if (ws) { ws.onclose = null; ws.close(); } startSim(); } }, 7000);
    }
    return {
      close() {
        closed = true; clearInterval(iv); clearInterval(sim);
        if (ws) { ws.onclose = null; try { ws.close(); } catch (e) { /* déjà fermé */ } }
      }
    };
  }

  /* Fenêtre du coach. */
  function showCoach(log, title, extra = "") {
    const c = M.coach(log);
    if (c.score != null && c.score >= 90 && log.length >= 3) M.unlock("coach_90");
    M.modal(`
      <div class="coach">
        <p class="eyebrow">🧠 Coach · ${title}</p>
        ${c.score != null ? `<div class="ring big" style="--p:${c.score}"><b>${c.score}</b></div>
        <h2>${c.score >= 85 ? "Discipline de pro" : c.score >= 60 ? "Pas mal, mais…" : "On doit parler 😬"}</h2>` : `<h2>Rien à analyser</h2>`}
        ${extra}
        ${c.good.length ? `<div class="cl good">${c.good.map(x => `<p>${x}</p>`).join("")}</div>` : ""}
        ${c.bad.length ? `<div class="cl bad">${c.bad.map(x => `<p>${x}</p>`).join("")}</div>` : ""}
        <div class="cl tips"><h4>Conseils</h4>${c.tips.map(x => `<p>👉 ${x}</p>`).join("")}</div>
        <button class="btn primary" data-close>Compris</button>
      </div>`);
  }
  M.showCoach = showCoach;
})();
