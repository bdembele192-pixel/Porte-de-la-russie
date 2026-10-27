/* Design « Or noir » : barre du haut (profil, recherche, mode clair), recherche rapide (Ctrl+K)
   et page d'accueil en tableau de bord (bannière, marchés, graphique, portefeuille, cartes). */
window.M = window.M || {};

(function () {
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (v, d = 2) => v.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const pctTxt = v => (v >= 0 ? "+" : "") + num(v, 2) + " %";

  // ---------- Illustration de la bannière : cité futuriste au crépuscule et mosquée de Djenné ----------
  function heroArt() {
    const r = M.Market.rng(7);
    let far = "", mid = "", stars = "", wins = "";
    for (let i = 0; i < 40; i++) stars += `<circle cx="${(r() * 900).toFixed(0)}" cy="${(r() * 150).toFixed(0)}" r="${(r() * 1.1 + 0.3).toFixed(1)}" fill="#FBE3A1" opacity="${(r() * 0.5 + 0.2).toFixed(2)}"/>`;
    for (let x = 300; x < 900; x += 14 + r() * 16) {
      const w = 10 + r() * 20, h = 70 + r() * 200, y = 400 - h, t = r();
      const top = t < 0.35 ? `<path d="M${x} ${y}L${x + w / 2} ${y - 18 - r() * 30}L${x + w} ${y}Z"/>` : t < 0.6 ? `<rect x="${x + w / 2 - 1}" y="${y - 30}" width="2" height="30"/>` : "";
      far += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}"/>${top}`;
    }
    for (let x = 300; x < 900; x += 40 + r() * 36) {
      if (x > 470 && x < 840) x = 846;
      const w = 18 + r() * 26, h = 140 + r() * 190, y = 410 - h, taper = 4 + r() * 6;
      mid += `<path d="M${x} 410V${y + 20}L${x + taper} ${y}H${x + w - taper}L${x + w} ${y + 20}V410Z" fill="url(#hTower)"/>
        <path d="M${x + taper} ${y}L${x + w / 2} ${y - 26 - r() * 40}L${x + w - taper} ${y}" fill="#120D0E" stroke="#E8B64C" stroke-opacity=".55" stroke-width="1"/>
        <path d="M${x} 410V${y + 20}L${x + taper} ${y}" fill="none" stroke="#F2B45A" stroke-opacity=".5" stroke-width="1.2"/>`;
      for (let k = 0; k < 6; k++) if (r() < 0.6) wins += `<rect x="${(x + 4 + r() * (w - 8)).toFixed(0)}" y="${(y + 30 + r() * (h - 60)).toFixed(0)}" width="2" height="3" fill="#FFD27A" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
    }
    // Mosquée de Djenné : façade crénelée, trois tours hérissées de « toron » (pieux de palmier)
    let mosque = `<path d="M500 410V338H820V410Z" fill="#0B0809"/>`;
    for (let x = 506; x < 818; x += 16) mosque += `<path d="M${x} 340L${x + 4} 322Q${x + 6} 318 ${x + 8} 322L${x + 12} 340Z" fill="#0B0809"/>`;
    [[560, 250, 34], [660, 214, 42], [760, 250, 34]].forEach(([cx, top, w]) => {
      mosque += `<path d="M${cx - w / 2 - 6} 340L${cx - w / 2} ${top + 16}Q${cx} ${top - 22} ${cx + w / 2} ${top + 16}L${cx + w / 2 + 6} 340Z" fill="#0B0809" stroke="#E8B64C" stroke-opacity=".35"/>
        <path d="M${cx - 4} ${top - 2}L${cx} ${top - 26}L${cx + 4} ${top - 2}Z" fill="#0B0809"/><circle cx="${cx}" cy="${top - 28}" r="3.2" fill="#E8B64C" opacity=".85"/>`;
      for (let y = top + 22; y < 330; y += 15) mosque += `<path d="M${cx - w / 2 - 8} ${y}h8M${cx + w / 2} ${y}h8M${cx - 4} ${y + 6}h8" stroke="#C08A3E" stroke-width="2" opacity=".7"/>`;
    });
    for (let x = 520; x < 810; x += 22) mosque += `<path d="M${x} 356h7M${x + 3} 372h7" stroke="#C08A3E" stroke-width="2" opacity=".55"/>`;
    const ship = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 0Q0 -9 22 0Q0 6 -22 0Z" fill="#141016" stroke="#E8B64C" stroke-opacity=".5"/><circle cx="14" cy="0" r="1.8" fill="#FFD27A"/><path d="M-22 0h-26" stroke="#F2B45A" stroke-opacity=".35"/></g>`;
    const panther = `<g transform="translate(858 96)" fill="none" stroke="#E8B64C" stroke-width="1.6" stroke-linejoin="round"><path d="M-16-14L-12-26-4-16M16-14L12-26 4-16M-16-14L-18 2-8 16 0 20 8 16 18 2 16-14 4-16 0-14-4-16Z"/><path d="M-11-3L-4-1M11-3L4-1M-3 8H3L0 12ZM0 12V15"/></g>`;
    return `<svg class="hero-art" viewBox="0 0 900 460" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="hSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06070D"/><stop offset=".42" stop-color="#1A1322"/><stop offset=".68" stop-color="#5B3322"/><stop offset=".86" stop-color="#C47A32"/><stop offset="1" stop-color="#F0B25A"/></linearGradient>
        <radialGradient id="hSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF1C9"/><stop offset=".18" stop-color="#FFD27A"/><stop offset=".45" stop-color="#E89A3C" stop-opacity=".75"/><stop offset="1" stop-color="#F6B657" stop-opacity="0"/></radialGradient>
        <linearGradient id="hTower" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2A1B18"/><stop offset=".25" stop-color="#140E0F"/><stop offset="1" stop-color="#0A0708"/></linearGradient>
        <linearGradient id="hGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A0708"/><stop offset="1" stop-color="#050404"/></linearGradient>
      </defs>
      <rect width="900" height="460" fill="url(#hSky)"/>${stars}
      <circle cx="660" cy="340" r="330" fill="url(#hSun)"/><ellipse cx="660" cy="392" rx="330" ry="40" fill="#FFD27A" opacity=".25"/>
      <g fill="#4A2E22" opacity=".55">${far}</g>${mid}${wins}
      ${ship(470, 120, 1.1)}${ship(720, 70, 0.8)}${ship(380, 190, 0.6)}
      ${mosque}
      <rect y="408" width="900" height="52" fill="url(#hGround)"/>
      <path d="M0 424${Array.from({ length: 46 }, (_, i) => `l10 ${i % 2 ? 8 : -8}`).join("")}" fill="none" stroke="#E8B64C" stroke-opacity=".3"/>
      <path d="M836 24h44v196l-22-16-22 16Z" fill="#0B0909" stroke="#E8B64C" stroke-opacity=".55"/>${panther}
    </svg>`;
  }

  // Petites illustrations des cartes (icône dorée sur halo + motif bogolan)
  const cardArt = (icon, tint) => `<span class="fc-art" style="--tint:${tint}">${M.icon(icon)}</span>`;

  // ---------- Barre du haut ----------
  const baseTopbar = M.updateTopbar;
  M.updateTopbar = function () {
    baseTopbar && baseTopbar();
    const L = M.level();
    const n = $("#tb-name"), l = $("#tb-lv");
    if (n) n.textContent = M.state.name || "Invité";
    if (l) l.textContent = `Niveau ${L.idx} · ${L.name}`;
    const b = $("#tb-bell");
    if (b && M.News) { const k = M.News.unseen(); b.classList.toggle("dot", k > 0 && !location.hash.startsWith("#/news")); }
  };

  function toggleMode() {
    const s = M.state.settings;
    if (s.theme === "clair") s.theme = s.darkTheme || "ornoir";
    else { s.darkTheme = s.theme; s.theme = "clair"; }
    M.save(); M.applySettings();
    if (location.hash.startsWith("#/settings")) M.go(location.hash);
  }

  // ---------- Recherche rapide ----------
  function searchIndex() {
    const out = [];
    $$(".sidebar .nav a").forEach(a => out.push({ k: "Page", t: a.textContent.trim(), h: a.getAttribute("href"), ic: a.querySelector("[data-icon]") ? a.querySelector("[data-icon]").dataset.icon : "home" }));
    out.push({ k: "Page", t: "Paramètres", h: "#/settings", ic: "settings" }, { k: "Page", t: "Glossaire", h: "#/glossary", ic: "book" }, { k: "Page", t: "Mon compte", h: "#/account", ic: "lock" });
    M.Market.ASSETS.forEach(a => out.push({ k: "Actif", t: `${a.name} (${a.short})`, s: a.type, h: "#/live/" + a.sym, ic: "chart" }));
    (M.Quotes.items || []).forEach(q => out.push({ k: q.type === "BRVM" ? "BRVM" : "Cours", t: `${q.name} (${q.short})`, s: q.type + " · " + q.delay, h: "#/home", ic: "chart", qs: "Q:" + q.id }));
    (M.COURSES || []).forEach(c => out.push({ k: "Cours", t: c.title, s: c.sub, h: "#/course/" + c.id, ic: "academy" }));
    (M.MISSIONS || []).forEach(m => out.push({ k: "Krach", t: m.title, s: m.year, h: "#/mission/" + m.id, ic: "missions" }));
    Object.entries(M.GLOSSARY || {}).forEach(([id, g]) => out.push({ k: "Glossaire", t: g.t, s: g.d, h: "#/glossary", q: g.t, ic: "book" }));
    return out;
  }
  const norm = v => String(v || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function openSearch() {
    if ($(".cmdk")) return;
    const idx = searchIndex();
    const box = document.createElement("div");
    box.className = "cmdk-bg";
    box.innerHTML = `<div class="cmdk glass" role="dialog" aria-label="Recherche">
      <div class="cmdk-in">${M.icon("search")}<input id="cmdk-q" placeholder="Bitcoin, stop-loss, krach Covid, RSI…" autocomplete="off"><kbd>Échap</kbd></div>
      <div class="cmdk-list" id="cmdk-list"></div></div>`;
    document.body.appendChild(box);
    const q = $("#cmdk-q", box), list = $("#cmdk-list", box);
    let res = [], sel = 0;
    function draw() {
      const v = norm(q.value.trim());
      res = v ? idx.map(it => {
        const t = norm(it.t), s = norm(it.s);
        const sc = t.startsWith(v) ? 3 : t.includes(v) ? 2 : s.includes(v) ? 1 : 0;
        return [sc, it];
      }).filter(x => x[0]).sort((a, b) => b[0] - a[0]).slice(0, 12).map(x => x[1]) : idx.filter(i => i.k === "Page" || i.k === "Actif").slice(0, 12);
      sel = Math.min(sel, Math.max(0, res.length - 1));
      list.innerHTML = res.length ? res.map((it, i) => `<a class="cmdk-i ${i === sel ? "on" : ""}" href="${it.h}" data-i="${i}">${M.icon(it.ic)}<span><b>${esc(it.t)}</b>${it.s ? `<small>${esc(String(it.s).slice(0, 90))}</small>` : ""}</span><em>${it.k}</em></a>`).join("")
        : `<p class="muted pad">Aucun résultat. Essaie « bitcoin », « levier » ou « krach ».</p>`;
    }
    const close = () => { box.remove(); document.removeEventListener("keydown", key, true); };
    function key(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + res.length) % Math.max(1, res.length); draw(); const o = $(".cmdk-i.on", list); if (o) o.scrollIntoView({ block: "nearest" }); }
      else if (e.key === "Enter" && res[sel]) { e.preventDefault(); close(); pick(res[sel]); }
    }
    document.addEventListener("keydown", key, true);
    function pick(it) {
      if (it.qs) {
        const q = M.Quotes.byId[it.qs.slice(2)];
        M.state.homeSym = it.qs;
        if (q) M.state.homeTab = Object.keys(TABS).find(k => TABS[k][1] && TABS[k][1](q)) || M.state.homeTab;
        M.save(); M.go("#/home"); return;
      }
      M.go(it.h);
      if (it.q) setTimeout(() => { const g = $("#gq"); if (g) { g.value = it.q; g.dispatchEvent(new Event("input")); } }, 60);
    }
    box.addEventListener("click", e => {
      const a = e.target.closest(".cmdk-i");
      if (e.target === box) close();
      else if (a) { e.preventDefault(); close(); pick(res[+a.dataset.i]); }
    });
    q.oninput = () => { sel = 0; draw(); };
    draw(); q.focus();
  }
  M.openSearch = openSearch;

  // ---------- Accueil ----------
  // Onglets : actifs Binance (temps réel) + cours gratuits différés (M.Quotes : bourses mondiales, BRVM)
  const TABS = {
    "Indices": [null, q => q.type === "Indice" || q.type === "Taux"],
    "Actions": [null, q => q.type === "Action"],
    "Crypto": [a => /Crypto|Memecoin/.test(a.type), null],
    "Matières": [a => a.type === "Matière première", q => q.type === "Matière première"],
    "Forex": [a => a.type === "Forex", q => q.type === "Forex"],
    "BRVM": [null, q => /^BRVM/.test(q.type)]
  };
  const CUR = { USD: " $", EUR: " €", GBP: " £", JPY: " ¥", HKD: " HK$", CNY: " ¥", NGN: " ₦", ZAR: " R", XOF: " FCFA", pts: "", "%": " %" };
  const QSTYLE = { "Indice": ["chart", "#E8B64C"], "Taux": ["scale", "#C4B5FD"], "Action": ["trending", "#4D8BFF"], "Matière première": ["leaf", "#C47A32"], "Forex": ["globe", "#2BEA8B"], "BRVM": ["bank", "#2BEA8B"], "BRVM indice": ["chart", "#14B866"] };
  const QICON = { BRENT: "flame", WTI: "flame", GOLD: "coins", SILVER: "coins" };
  // Vue unifiée d'un actif (Binance ou cours différé)
  function info(sym, tick) {
    if (sym.startsWith("Q:")) {
      const q = M.Quotes.byId[sym.slice(2)];
      if (!q) return null;
      const st = QSTYLE[q.type] || ["chart", "#E8B64C"];
      return { q: true, sym, short: q.short, name: q.name, label: q.type === "BRVM" ? q.short : q.name, sub: q.type === "BRVM" ? q.name : M.Quotes.fresh(q),
        icon: M.icon(QICON[q.id] || st[0]), color: st[1], price: q.price, chg: q.chg, cur: CUR[q.cur] != null ? CUR[q.cur] : " " + q.cur,
        fmt: q.cur === "XOF" ? (v => Math.round(v).toLocaleString("fr-FR")) : M.Quotes.fmt, delay: q.delay, src: q.src || "brvm.org", rt: q.rt, tip: null };
    }
    const a = M.Market.asset(sym), d = tick[sym];
    return { q: false, sym, short: a.short, name: a.name, label: a.short === "OR" ? "OR/USD" : a.short + "/USD", sub: a.name, icon: a.icon, color: a.color,
      price: d ? d.last : null, chg: d ? d.chg : null, cur: " $", fmt: M.Market.fmtPrice, tip: a.tip, rt: true };
  }
  const RANGES = { "1J": ["15m", 96], "1S": ["1h", 168], "1M": ["4h", 180], "3M": ["1d", 90], "1A": ["1d", 365] };

  M.views.home = function (el) {
    const s = M.state, L = M.level();
    const tr = new M.Trader(s.wallet);
    const dm = M.dailyMission();
    const coursesDone = M.COURSES.filter(c => Object.keys(s.lessons[c.id] || {}).length >= c.lessons.length).length;
    let tab = TABS[s.homeTab] ? s.homeTab : "Indices", sym = s.homeSym || "BTCUSDT", range = "1J", tick = {}, bars = [], alive = true, pfRange = "TOUT";
    const hero = s.settings.heroImg;

    el.innerHTML = `
      <section class="hero3 ${hero ? "custom" : ""}">
        <div class="h3-art">${hero ? `<img src="${hero}" alt="">` : heroArt()}</div>
        <div class="h3-txt">
          <p class="eyebrow">Simulateur de trading</p>
          <h1>Apprends à trader<br><span class="gold">sans te brûler</span></h1>
          <p class="lede">Le simulateur le plus complet pour maîtriser les marchés : trading live sur les vrais prix, krachs historiques, algos, académie et coach IA intégré.</p>
          <div class="cta">
            <a class="btn gold-btn" href="#/live" data-tip-text="Ouvre le terminal : vrais prix, argent virtuel.">Commencer maintenant ${M.icon("arrow")}</a>
            <button class="btn line-btn" id="h-demo" type="button" data-tip-text="Visite guidée de l'app en 1 minute.">${M.icon("play")} Voir la démo</button>
          </div>
          <div class="h3-feats">
            <a href="#/live" data-tip-text="Prix réels de l'API publique Binance.">${M.icon("chart")} Marchés réels</a>
            <a href="#/live" data-tip-text="${M.fmt$(M.START_CASH)} virtuels pour t'entraîner.">${M.icon("wallet")} Portefeuille virtuel</a>
            <a href="#/ai" data-tip-text="Ton copilote anti-erreurs.">${M.icon("bot")} Coach IA</a>
            <a href="#/academy" data-tip-text="${M.COURSES.length} modules de cours.">${M.icon("academy")} Académie</a>
          </div>
        </div>
        <div class="h3-motto"><span>Discipline</span><span>Stratégie</span><span>Réussite</span></div>
      </section>

      <div class="dash">
        <section class="card3 mk3">
          <header><h3>${M.icon("chart")} Marchés en temps réel</h3><a class="see" href="#/live">Voir tout ${M.icon("arrow")}</a></header>
          <div class="seg" id="mk-tabs">${Object.keys(TABS).map(t => `<button class="${t === tab ? "on" : ""}" data-t="${t}">${t}</button>`).join("")}</div>
          <div class="mk-rows" id="mk-rows"></div>
          <span class="pill" id="mk-mode">connexion…</span>
        </section>

        <section class="card3 ch3">
          <header class="ch3-h">
            <span class="coin" id="ch-ic"></span>
            <div><b id="ch-n"></b><div class="ch3-p"><span class="mono" id="ch-p">—</span><span class="mono" id="ch-c"></span></div></div>
            <a class="btn line-btn sm" id="ch-go" href="#/live/${sym}">Trader ${M.icon("arrow")}</a><span class="pill" id="ch-dl" hidden></span>
          </header>
          <div class="ch3-bar">
            <div class="seg sm" id="ch-r">${Object.keys(RANGES).map(k => `<button class="${k === range ? "on" : ""}" data-r="${k}">${k}</button>`).join("")}</div>
            <div class="hlv"><span><small>Haut</small><b class="mono" id="ch-h">—</b></span><span><small>Bas</small><b class="mono" id="ch-l">—</b></span><span><small>Vol.</small><b class="mono" id="ch-v">—</b></span></div>
          </div>
          <div class="ch3-cv"><canvas id="ch-cv"></canvas><p class="ch-empty muted small" id="ch-empty" hidden>Historique en cours de constitution : le robot ajoute une bougie par séance. Essaie « 1J » ou reviens dans quelques jours.</p></div>
        </section>

        <section class="card3 pf3">
          <header><h3>${M.icon("wallet")} Mon portefeuille virtuel</h3><button class="tb-btn sm" id="pf-eye" type="button" aria-label="Masquer les montants" data-tip-text="Masquer / afficher les montants">${M.icon("eyeo")}</button></header>
          <b class="pf-eq mono" id="pf-eq">—</b>
          <span class="pf-d mono" id="pf-d"></span>
          <div class="pf-cv"><canvas id="pf-cv"></canvas></div>
          <div class="seg sm" id="pf-r">${["1J", "1S", "1M", "TOUT"].map(k => `<button class="${k === pfRange ? "on" : ""}" data-r="${k}">${k}</button>`).join("")}</div>
          <div class="pf-stats">
            <span><small>Capital initial</small><b class="mono">${M.fmt$(M.START_CASH)}</b></span>
            <span><small>Performance</small><b class="mono" id="pf-perf">—</b></span>
            <span><small>Trades</small><b class="mono">${s.wallet.log.length}${tr.pos ? " + 1" : ""}</b></span>
          </div>
          <a class="btn line-btn wide" href="#/live">Voir mon portefeuille ${M.icon("arrow")}</a>
        </section>
      </div>

      <div class="feats3">
        <a class="fc3" href="#/missions">${cardArt("missions", "#7C3AED")}<span><b>Krachs historiques</b><small>Rejoue les plus grands krachs (Covid, FTX, tarifs 2025…) et découvre comment tu aurais réagi.</small><em>Découvrir ${M.icon("arrow")}</em></span></a>
        <a class="fc3" href="#/lab">${cardArt("lab", "#E8B64C")}<span><b>Backtest d'algorithmes</b><small>Teste 4 stratégies sur des données réelles, frais inclus, et compare-les au marché.</small><em>Découvrir ${M.icon("arrow")}</em></span></a>
        <a class="fc3" href="#/academy">${cardArt("academy", "#C47A32")}<span><b>Académie</b><small>${M.COURSES.length} modules, ${M.QUIZ_COUNT || 80}+ quiz et un glossaire pour progresser à ton rythme.</small><em>Découvrir ${M.icon("arrow")}</em></span></a>
        <a class="fc3" href="#/ai">${cardArt("bot", "#5B3FD6")}<span><b>Coach &amp; Mèche IA</b><small>Un copilote qui bloque tes trades dangereux et répond à toutes tes questions.</small><em>Découvrir ${M.icon("arrow")}</em></span></a>
      </div>

      <div class="row3">
        <a class="card3 dly3" href="#/mission/${dm.id}">
          <span class="tag3">${M.icon("target")} Défi du jour</span>
          <b>${esc(dm.title)}</b><small>Termine cette mission avec un score Coach d'au moins 70 : <b class="gold">+60 XP</b>.</small>
          <em>${s.daily[M.u.today()] ? M.icon("check") + " Défi réussi aujourd'hui" : "Relever le défi " + M.icon("arrow")}</em>
        </a>
        <a class="card3 lv3" href="#/profile">
          <span class="tag3">${M.icon("trophy")} Ta progression</span>
          <b>Niveau ${L.idx} · ${esc(L.name)}</b>
          <div class="xpbar big"><i style="width:${Math.round(L.progress * 100)}%"></i></div>
          <div class="lv3-s"><span>${M.icon("flame")} ${s.streak.days} j</span><span>${M.icon("academy")} ${coursesDone}/${M.COURSES.length}</span><span>${M.icon("award")} ${Object.keys(s.badges).length}/${M.BADGES.length}</span></div>
        </a>
        <a class="card3 qz3" href="#/quiz">
          <span class="tag3">${M.icon("quiz")} Quiz express</span>
          <b>5 minutes par jour</b><small>Théorie, calculs, lecture de graphiques. Façon Duolingo.</small>
          <em>Commencer ${M.icon("arrow")}</em>
        </a>
      </div>
      ${M.disclaimer()}`;

    $("#h-demo", el).onclick = () => M.startTour && M.startTour();

    // ----- Marchés -----
    function drawRows() {
      const [fa, fq] = TABS[tab];
      const syms = (fq ? M.Quotes.items.filter(fq).map(q => "Q:" + q.id) : []).concat(fa ? M.Market.ASSETS.filter(fa).map(a => a.sym) : []);
      const list = syms.map(x => info(x, tick)).filter(Boolean);
      $("#mk-rows", el).innerHTML = list.length ? list.map(a => `<button class="mk-r ${a.sym === sym ? "on" : ""}" data-s="${a.sym}" ${a.tip ? `data-tip="${a.tip}"` : `data-tip-text="${esc(a.name)} · ${esc(a.delay || "")} · source : ${esc(a.src || "")}"`}>
          <span class="coin sm" style="--c:${a.color}">${a.icon}</span><span class="mk-n"><b>${esc(a.label)}</b><small>${esc(a.sub)}</small></span>
          <span class="mono mk-p">${a.price != null ? a.fmt(a.price) : "—"}</span>
          <span class="mono mk-c ${a.chg != null ? (a.chg >= 0 ? "up" : "dn") : ""}">${a.chg != null ? (a.chg >= 0 ? "▲ " : "▼ ") + pctTxt(a.chg) : ""}</span></button>`).join("")
        : `<p class="muted small pad">${M.Quotes.loaded ? "Cours indisponibles pour l'instant : le robot de collecte n'a pas encore tourné ou la connexion a échoué." : "Chargement des cours…"}</p>`;
      $$(".mk-r", el).forEach(b => b.onclick = () => { sym = b.dataset.s; s.homeSym = sym; M.save(); drawRows(); loadChart(); });
    }
    $$("#mk-tabs button", el).forEach(b => b.onclick = () => { tab = b.dataset.t; s.homeTab = tab; M.save(); $$("#mk-tabs button", el).forEach(x => x.classList.toggle("on", x === b)); drawRows(); });

    // ----- Graphique -----
    const cv = $("#ch-cv", el);
    function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
    function drawChart() {
      const box = cv.parentElement, W = box.clientWidth, H = box.clientHeight, dpr = window.devicePixelRatio || 1;
      if (!W || !H) return;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
      const c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
      if (!bars.length || (sym.startsWith("Q:") && bars.length < 3)) return;
      const n = Math.min(bars.length, Math.max(30, Math.floor(W / 7))), B = bars.slice(-n);
      const top = 8, vh = H * 0.16, axis = 18, ph = H - vh - axis - top - 6;
      const hi = Math.max(...B.map(b => b.h)), lo = Math.min(...B.map(b => b.l)), vmax = Math.max(...B.map(b => b.v)) || 1;
      const y = p => top + (hi - p) / ((hi - lo) || 1) * ph, bw = W / n;
      c.strokeStyle = "rgba(255,255,255,0.05)"; c.lineWidth = 1;
      for (let i = 1; i < 4; i++) { const yy = top + ph * i / 4; c.beginPath(); c.moveTo(0, yy); c.lineTo(W, yy); c.stroke(); }
      const up = css("--up") || "#2BEA8B", dn = css("--dn") || "#FF4D6D";
      B.forEach((b, i) => {
        const x = i * bw + bw / 2, col = b.c >= b.o ? up : dn;
        c.strokeStyle = col; c.fillStyle = col;
        c.beginPath(); c.moveTo(x, y(b.h)); c.lineTo(x, y(b.l)); c.stroke();
        const y1 = y(Math.max(b.o, b.c)), y2 = y(Math.min(b.o, b.c));
        c.fillRect(x - bw * 0.32, y1, bw * 0.64, Math.max(1, y2 - y1));
        c.globalAlpha = 0.45; c.fillRect(x - bw * 0.32, H - axis - b.v / vmax * vh, bw * 0.64, b.v / vmax * vh); c.globalAlpha = 1;
      });
      [[9, "#E8B64C"], [26, "#8B5CF6"]].forEach(([p, col]) => {
        const k = 2 / (p + 1); let e = B[0].c;
        c.strokeStyle = col; c.lineWidth = 1.4; c.beginPath();
        B.forEach((b, i) => { e = i ? b.c * k + e * (1 - k) : b.c; const x = i * bw + bw / 2; i ? c.lineTo(x, y(e)) : c.moveTo(x, y(e)); });
        c.stroke();
      });
      c.fillStyle = css("--mut") || "#888"; c.font = "10px " + (css("--mono") || "monospace"); c.textAlign = "center";
      const tf = sym.startsWith("Q:") ? (B[B.length - 1].t - B[0].t < 2 * 864e5 ? "15m" : "1d") : RANGES[range][0];
      for (let i = 0; i < 6; i++) {
        const b = B[Math.floor((i + 0.5) * n / 6)]; if (!b) continue;
        const d = new Date(b.t);
        const lab = tf === "1d" ? d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : tf === "4h" || tf === "1h" ? d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) : d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        c.fillText(lab, (i + 0.5) * W / 6, H - 4);
      }
    }
    function drawHead() {
      const a = info(sym, tick) || info("BTCUSDT", tick);
      $("#ch-ic", el).innerHTML = a.icon; $("#ch-ic", el).style.setProperty("--c", a.color);
      $("#ch-n", el).innerHTML = `${esc(a.name)} <span class="muted">(${esc(a.short)})</span>`;
      const go = $("#ch-go", el), dl = $("#ch-dl", el);
      go.hidden = a.q; go.setAttribute("href", "#/live/" + sym);
      dl.hidden = !a.q;
      if (a.q) {
        const q = M.Quotes.byId[sym.slice(2)], direct = q && !q.fromFile && q.open_;
        dl.textContent = "● " + M.Quotes.fresh(q).replace(/^./, c => c.toUpperCase()) + " · " + a.src;
        dl.className = "pill " + (direct ? "live" : "demo");
        dl.setAttribute("data-tip-text", `Source : ${a.src} (${a.delay}). Cours gratuit, actualisé toutes les 30 s quand la source le permet. Pas encore échangeable dans le terminal Live.`);
      }
      const last = !a.q && livePrice != null ? livePrice : a.price != null ? a.price : bars.length ? bars[bars.length - 1].c : null;
      $("#ch-p", el).textContent = last != null ? a.fmt(last) + a.cur : "—";
      const cc = $("#ch-c", el);
      if (a.chg != null) { cc.textContent = (a.chg >= 0 ? "▲ " : "▼ ") + pctTxt(a.chg) + (a.q ? " (séance)" : " (24 h)"); cc.className = "mono " + (a.chg >= 0 ? "up" : "dn"); }
      else cc.textContent = "";
      $("#ch-empty", el).hidden = !(a.q && bars.length < 3);
      if (bars.length) {
        const n = Math.min(bars.length, Math.max(30, Math.floor(cv.parentElement.clientWidth / 7))), B = bars.slice(-n);
        $("#ch-h", el).textContent = a.fmt(Math.max(...B.map(b => b.h)));
        $("#ch-l", el).textContent = a.fmt(Math.min(...B.map(b => b.l)));
        const v = B.reduce((t, b) => t + b.v * b.c, 0);
        $("#ch-v", el).textContent = v >= 1e9 ? num(v / 1e9, 1) + " Md" : v >= 1e6 ? num(v / 1e6, 1) + " M" : num(v / 1e3, 0) + " k";
      }
    }
    let req = 0, live = null, raf = 0, livePrice = null;
    // Direct : flux Binance pour les cryptos (bougie en cours mise à jour à chaque transaction)
    function startLive() {
      if (live) { live.close(); live = null; }
      livePrice = null;
      if (sym.startsWith("Q:") || !bars.length) return;
      live = M.Market.stream(sym, RANGES[range][0], bars[bars.length - 1], b => {
        const last = bars[bars.length - 1];
        if (last && b.t === last.t) bars[bars.length - 1] = b;
        else if (!last || b.t > last.t) { bars.push(b); if (bars.length > 600) bars.shift(); }
        livePrice = b.c;
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (alive) { drawHead(); drawChart(); } });
      });
    }
    async function loadChart(keep) {
      const my = ++req, [tf, n] = RANGES[range];
      if (sym.startsWith("Q:") && !M.Quotes.loaded) await M.Quotes.load();
      if (sym.startsWith("Q:") && !M.Quotes.byId[sym.slice(2)]) sym = "BTCUSDT";
      if (!keep) { bars = []; drawHead(); drawChart(); }
      const nb = sym.startsWith("Q:") ? await M.Quotes.bars(sym.slice(2), range) : (await M.Market.klines(sym, tf, { limit: n })).bars;
      if (!alive || my !== req) return;
      bars = nb; drawHead(); drawChart(); startLive();
    }
    $$("#ch-r button", el).forEach(b => b.onclick = () => { range = b.dataset.r; $$("#ch-r button", el).forEach(x => x.classList.toggle("on", x === b)); loadChart(); });

    // ----- Portefeuille -----
    function equityNow() {
      if (!tr.pos) return s.wallet.cash;
      const d = tick[tr.pos.sym];
      return d ? tr.equity(d.last) : s.wallet.cash + tr.pos.margin;
    }
    function drawPf() {
      const eq = equityNow(), log = s.wallet.log;
      const disc = document.body.classList.contains("discreet");
      $("#pf-eq", el).textContent = disc ? "••••••" : M.fmt$(eq);
      const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
      const today = log.filter(t => t.closeAt >= +dayStart).reduce((a, t) => a + t.pnl, 0) + (tr.pos && tick[tr.pos.sym] ? tr.upnl(tick[tr.pos.sym].last) : 0);
      const pd = $("#pf-d", el);
      pd.textContent = disc ? "" : `${today >= 0 ? "▲ +" : "▼ "}${M.fmt$(today).replace(/^-/, "− ")} aujourd'hui`;
      pd.className = "pf-d mono " + (today >= 0 ? "up" : "dn");
      const perf = (eq / M.START_CASH - 1) * 100;
      const pe = $("#pf-perf", el); pe.textContent = pctTxt(perf); pe.className = "mono " + (perf >= 0 ? "up" : "dn");
      // Courbe : capital après chaque trade clôturé
      const span = { "1J": 864e5, "1S": 6048e5, "1M": 2592e6, "TOUT": Infinity }[pfRange];
      const realized = log.reduce((a, t) => a + t.pnl, 0);
      let v = eq - realized - (tr.pos && tick[tr.pos.sym] ? tr.upnl(tick[tr.pos.sym].last) : 0);
      const pts = [[log.length ? log[0].openAt || log[0].closeAt : Date.now() - 864e5, v]];
      log.forEach(t => { v += t.pnl; pts.push([t.closeAt, v]); });
      pts.push([Date.now(), eq]);
      const P = pts.filter(p => Date.now() - p[0] <= span);
      const series = P.length >= 2 ? P : [[Date.now() - 1, eq], [Date.now(), eq]];
      const pc = $("#pf-cv", el), box = pc.parentElement, W = box.clientWidth, H = box.clientHeight, dpr = window.devicePixelRatio || 1;
      if (!W || !H) return;
      pc.width = W * dpr; pc.height = H * dpr; pc.style.width = W + "px"; pc.style.height = H + "px";
      const c = pc.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
      const vs = series.map(p => p[1]);
      let hi = Math.max(...vs), lo = Math.min(...vs);
      if (hi - lo < Math.abs(hi) * 1e-6 + 1e-9) { hi += Math.abs(hi) * 0.01 + 1; lo -= Math.abs(lo) * 0.01 + 1; }
      const rg = hi - lo;
      const xy = (p, i) => [i / (series.length - 1) * (W - 4) + 2, 6 + (hi - p[1]) / rg * (H - 14)];
      const col = series[series.length - 1][1] >= series[0][1] ? (css("--up") || "#2BEA8B") : (css("--dn") || "#FF4D6D");
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, col + "55"); g.addColorStop(1, col + "00");
      c.beginPath(); series.forEach((p, i) => { const [x, yy] = xy(p, i); i ? c.lineTo(x, yy) : c.moveTo(x, yy); });
      c.strokeStyle = col; c.lineWidth = 2; c.stroke();
      c.lineTo(W - 2, H); c.lineTo(2, H); c.closePath(); c.fillStyle = g; c.fill();
      if (!log.length) { c.fillStyle = css("--mut") || "#888"; c.font = "12px " + (css("--body") || "sans-serif"); c.textAlign = "center"; c.fillText("Ta courbe apparaîtra après ton premier trade", W / 2, H / 2 - 6); }
    }
    $$("#pf-r button", el).forEach(b => b.onclick = () => { pfRange = b.dataset.r; $$("#pf-r button", el).forEach(x => x.classList.toggle("on", x === b)); drawPf(); });
    $("#pf-eye", el).onclick = () => { s.settings.discreet = !s.settings.discreet; M.save(); M.applySettings(); drawPf(); };

    // ----- Rafraîchissement -----
    const syms = M.Market.ASSETS.map(a => a.sym);
    let cryptoLive = null;
    function updMode() {
      const mode = $("#mk-mode", el); if (!mode) return;
      const bourses = M.Quotes.lastLive && Date.now() - M.Quotes.lastLive < 120e3 ? " · Bourses en direct" : M.Quotes.live ? " · Bourses : copie " + M.Quotes.age(Date.parse(M.Quotes.generatedAt)) : "";
      mode.textContent = (cryptoLive == null ? "● Connexion…" : cryptoLive ? "● Crypto en direct" : "● Crypto : démo") + bourses;
      mode.className = "pill " + (cryptoLive ? "live" : "demo");
    }
    async function refresh() {
      if (!M.Quotes.loaded) await M.Quotes.load();
      const r = await M.Market.tickers(syms);
      if (!alive) return;
      tick = r.data; cryptoLive = r.live;
      if (r.live && r.data.EURUSDT) M.setEurUsd(r.data.EURUSDT.last);
      updMode();
      const mode = $("#mk-mode", el);
      mode.setAttribute("data-tip-text", (r.live ? "Cryptos : prix réels de l'API publique Binance, rafraîchis toutes les 15 s." : "Cryptos : marché injoignable, prix simulés.")
        + " Bourses, matières premières et devises : CNBC, lu directement toutes les 30 s (indices US, actions US et devises en temps réel, autres places différées de 15 min). BRVM : brvm.org, cours de la séance.");
      drawRows(); drawHead(); drawPf();
    }
    drawRows(); drawPf(); refresh(); loadChart();
    const iv = setInterval(refresh, 15000);
    // Bourses : nouveaux cours toutes les 30 s ; le graphique du jour suit
    let qN = 0;
    const onQ = () => { if (!alive) return; drawRows(); drawHead(); updMode(); if (sym.startsWith("Q:") && (range === "1J" || range === "1S") && ++qN % 2 === 0) loadChart(true); };
    document.addEventListener("quotes:update", onQ);
    const onR = () => { drawChart(); drawPf(); };
    window.addEventListener("resize", onR);
    return () => { alive = false; clearInterval(iv); if (live) live.close(); document.removeEventListener("quotes:update", onQ); window.removeEventListener("resize", onR); };
  };

  document.addEventListener("DOMContentLoaded", () => {
    const sb = $("#tb-search"); if (sb) sb.onclick = openSearch;
    const md = $("#tb-mode"); if (md) md.onclick = toggleMode;
    document.addEventListener("keydown", e => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || "") || (e.target && e.target.isContentEditable);
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); openSearch(); }
      else if (e.key === "/" && !typing) { e.preventDefault(); openSearch(); }
    });
    window.addEventListener("hashchange", () => M.updateTopbar());
    M.updateTopbar();
    setInterval(() => M.updateTopbar(), 30000);
  });
})();
