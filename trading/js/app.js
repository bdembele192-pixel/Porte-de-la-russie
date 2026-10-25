/* Cœur de l'app : état sauvegardé, XP / niveaux / badges, interface commune, routeur, et vues
   Accueil, Académie, Glossaire, Profil. Les vues Live, Missions, Swipe et Algo Lab sont dans leurs fichiers. */
window.M = window.M || {};

(function () {
  const KEY = "meche:v1";
  const START_CASH = 10000;

  // ---------- Utilitaires ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pct = (v, d = 2) => (v >= 0 ? "+" : "−") + Math.abs(v * 100).toFixed(d).replace(".", ",") + " %";
  const today = () => new Date().toISOString().slice(0, 10);
  M.u = { $, $$, esc, pct, today };

  // ---------- État ----------
  function fresh() {
    return {
      name: "", xp: 0, onboarded: false,
      wallet: { cash: START_CASH, pos: null, log: [] },
      lessons: {}, quiz: {}, missions: {}, swipe: { games: 0, best: 0, right: 0, total: 0 },
      lab: { runs: 0 }, badges: {}, streak: { last: null, days: 0 }, daily: {},
      settings: Object.assign({}, M.SETTINGS_DEFAULT), lastSym: "BTCUSDT", lastTf: "15m",
      photo: null, fx: { eurusd: 1.16 }, qpath: {}, qstats: { done: 0, right: 0, total: 0 }
    };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && typeof s === "object") {
        const st = Object.assign(fresh(), s);
        st.settings = Object.assign({}, M.SETTINGS_DEFAULT, s.settings || {});
        // Migration : le thème « Panthère » devient le thème principal (une seule fois)
        if (!st.themeV2) { if (!st.settings.theme || st.settings.theme === "neon") st.settings.theme = "panthere"; st.themeV2 = true; }
        // Migration : nouveau design « Or noir » par défaut (une seule fois)
        if (!st.themeV3) { if (["neon", "panthere"].includes(st.settings.theme)) { st.settings.theme = "ornoir"; st.settings.fontHead = "grotesk"; st.settings.font = "inter"; } st.themeV3 = true; }
        return st;
      }
    } catch (e) { /* stockage indisponible : on repart de zéro */ }
    return fresh();
  }
  M.state = load();
  let saveT = null;
  M.save = function (now) {
    clearTimeout(saveT);
    const w = () => { try { localStorage.setItem(KEY, JSON.stringify(M.state)); } catch (e) { /* mode privé */ } };
    if (now) w(); else saveT = setTimeout(w, 400);
  };
  // Capital de départ réglable (Paramètres → Trading), en dollars
  Object.defineProperty(M, "START_CASH", { get: () => M.state.settings.startCash || START_CASH });

  // ---------- Niveaux & XP ----------
  const LEVELS = [
    [0, "Bébé trader", "🐣"], [100, "Curieux", "👀"], [300, "Apprenti", "📚"], [600, "Chartiste", "📈"],
    [1000, "Swing Lord", "🌊"], [1600, "Risk Master", "🛡️"], [2500, "Algo Wizard", "🤖"], [4000, "Market Legend", "👑"]
  ];
  M.level = function (xp = M.state.xp) {
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
    const cur = LEVELS[i], next = LEVELS[i + 1];
    return {
      idx: i + 1, name: cur[1], emoji: cur[2],
      from: cur[0], to: next ? next[0] : cur[0],
      progress: next ? (xp - cur[0]) / (next[0] - cur[0]) : 1,
      nextName: next ? next[1] : null
    };
  };
  M.addXP = function (n, why) {
    const before = M.level().idx;
    M.state.xp += n;
    M.save();
    toast(`+${n} XP${why ? " · " + why : ""}`, "xp");
    const after = M.level();
    if (after.idx > before) {
      setTimeout(() => {
        confetti(); M.sfx && M.sfx("level");
        toast(`Niveau ${after.idx} : ${after.name} !`, "level");
      }, 500);
    }
    updateTopbar();
  };

  // ---------- Badges ----------
  M.BADGES = [
    { id: "first_trade", e: "🎬", n: "Premier trade", d: "Ouvre ta première position." },
    { id: "first_stop", e: "🪂", n: "Ceinture attachée", d: "Ouvre un trade avec un stop-loss." },
    { id: "first_win", e: "💸", n: "Premier billet", d: "Ferme un trade gagnant." },
    { id: "liquidated", e: "💀", n: "Ça pique", d: "Te faire liquider (on apprend aussi comme ça)." },
    { id: "mission_1", e: "⏳", n: "Voyageur temporel", d: "Termine une mission Time Machine." },
    { id: "survivor", e: "🧯", n: "Survivant", d: "Finis en positif une mission « Extrême »." },
    { id: "mission_all", e: "📜", n: "Historien des krachs", d: "Termine toutes les missions." },
    { id: "swipe_game", e: "👆", n: "Swiper", d: "Termine une partie de Swipe." },
    { id: "swipe_7", e: "🔮", n: "Voyant", d: "Fais une série de 5 bonnes prédictions au Swipe." },
    { id: "lab_run", e: "🧪", n: "Quant en herbe", d: "Lance ton premier backtest." },
    { id: "lab_compare", e: "🏁", n: "Grand prix des algos", d: "Compare les 4 algos sur les mêmes données." },
    { id: "course_1", e: "🎓", n: "Premier module", d: "Termine tous les chapitres d'un module." },
    { id: "course_all", e: "🧠", n: "Diplômé", d: "Termine tous les modules de l'Académie." },
    { id: "quiz_perfect", e: "💯", n: "Sans faute", d: "Réussis un quiz à 100 %." },
    { id: "coach_90", e: "🧘", n: "Moine du trading", d: "Obtiens 90+ au Coach sur au moins 3 trades." },
    { id: "streak_3", e: "🔥", n: "On fire", d: "Reviens 3 jours d'affilée." },
    { id: "quiz_first", e: "🦉", n: "Première leçon", d: "Termine une leçon du parcours Quiz." },
    { id: "quiz_combo", e: "⚡", n: "Combo x8", d: "Enchaîne 8 bonnes réponses d'affilée au Quiz." },
    { id: "quiz_all", e: "🏅", n: "Parcours complet", d: "Termine toutes les unités du Quiz." },
    { id: "ai_saved", e: "🛟", n: "Sauvé par l'IA", d: "Applique une proposition du copilote Mèche IA en Live." }
  ];
  M.unlock = function (id) {
    if (M.state.badges[id]) return;
    const b = M.BADGES.find(x => x.id === id);
    if (!b) return;
    M.state.badges[id] = Date.now();
    M.save();
    setTimeout(() => { confetti(); M.sfx && M.sfx("win"); toast(`Badge débloqué : ${b.n}`, "badge"); }, 300);
  };

  // ---------- Série de jours ----------
  (function streak() {
    const s = M.state.streak, d = today();
    if (s.last === d) return;
    const y = new Date(Date.now() - 86400e3).toISOString().slice(0, 10);
    s.days = s.last === y ? s.days + 1 : 1;
    s.last = d;
    M.save();
    if (s.days >= 3) M.unlock("streak_3");
  })();

  // ---------- UI commune ----------
  function toast(msg, kind = "") {
    let box = $("#toasts");
    if (!box) { box = document.createElement("div"); box.id = "toasts"; document.body.appendChild(box); }
    const t = document.createElement("div");
    t.className = "toast " + kind;
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.classList.add("out"), 2600);
    setTimeout(() => t.remove(), 3100);
  }
  M.toast = toast;

  M.modal = function (html, { wide, onClose } = {}) {
    const wrap = document.createElement("div");
    wrap.className = "modal-wrap";
    wrap.innerHTML = `<div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true"><button class="modal-x" data-tip-text="Fermer" data-tip-kbd="Échap" aria-label="Fermer">✕</button>${html}</div>`;
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add("on"));
    const close = () => {
      wrap.classList.remove("on");
      document.removeEventListener("keydown", key);
      setTimeout(() => wrap.remove(), 200);
      onClose && onClose();
    };
    const key = e => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", key);
    wrap.addEventListener("click", e => { if (e.target === wrap || e.target.closest(".modal-x") || e.target.closest("[data-close]")) close(); });
    return { el: wrap.firstChild, close };
  };

  function confetti() {
    if (M.state.settings.motion === false) return;
    const cv = document.createElement("canvas");
    cv.className = "confetti";
    document.body.appendChild(cv);
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    const ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);
    const cols = ["#C6FF3D", "#8B5CFF", "#FF4DA6", "#3DF5FF", "#FFD23D"];
    const P = Array.from({ length: 120 }, () => ({
      x: innerWidth / 2, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 12 - 4,
      s: 4 + Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)], r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4
    }));
    let f = 0;
    (function loop() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      P.forEach(p => {
        p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= 0.99;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
      });
      if (++f < 110) requestAnimationFrame(loop); else cv.remove();
    })();
  }
  M.confetti = confetti;

  function updateTopbar() {
    const L = M.level();
    const el = $("#tb-level");
    if (!el) return;
    el.innerHTML = `<span class="lv-emoji">${M.ico("level", L.idx - 1)}</span><span class="lv-txt"><b>Niv. ${L.idx}</b> ${L.name}</span>
      <span class="xpbar"><i style="width:${Math.round(L.progress * 100)}%"></i></span>`;
    el.setAttribute("data-tip-text", L.nextName ? `${M.state.xp} XP — encore ${L.to - M.state.xp} XP pour devenir « ${L.nextName} ». Gagne de l'XP en lisant des cours, en réussissant des quiz et des missions.` : `${M.state.xp} XP — niveau max atteint. Légende.`);
    $("#tb-streak").innerHTML = `${M.icon("flame")} ${M.state.streak.days}`;
    const av = $("#tb-av");
    if (av) av.innerHTML = M.state.photo ? `<img src="${M.state.photo}" alt="">` : M.icon("profile");
  }
  M.updateTopbar = updateTopbar;

  // ---------- Routeur ----------
  M.views = M.views || {};
  let cleanup = null;
  function route() {
    const [name = "home", ...params] = location.hash.replace(/^#\/?/, "").split("/");
    const view = M.views[name] ? name : "home";
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
    M.hideTip && M.hideTip();
    const el = $("#view");
    el.innerHTML = "";
    el.className = "view view-" + view;
    const navKey = { mission: "missions", course: "academy", glossary: "academy", account: "profile" }[view] || view;
    $$(".nav a, .tb-gear").forEach(a => a.classList.toggle("on", a.dataset.nav === navKey));
    window.scrollTo(0, 0);
    cleanup = M.views[view](el, params.map(decodeURIComponent)) || null;
  }
  M.go = h => { if (location.hash === h) route(); else location.hash = h; };
  window.addEventListener("hashchange", route);

  // ---------- Accueil ----------
  M.views.home = function (el) {
    const s = M.state, L = M.level();
    const tr = new M.Trader(s.wallet);
    const eq = tr.pos ? null : s.wallet.cash;
    const coursesDone = M.COURSES.filter(c => courseProgress(c) === 1).length;
    const dm = dailyMission();
    el.innerHTML = `
      <section class="hero">
        <div class="hero-txt">
          <p class="eyebrow">${s.name ? "Yo " + esc(s.name) + " 👋" : "Bienvenue 👋"}</p>
          <h1>Apprends à trader.<br><span class="grad">Sans te brûler.</span></h1>
          <p class="lede">Des <b>vrais prix de marché</b> en temps réel, de l'argent virtuel, des krachs historiques à rejouer, des algos à tester et un coach qui te dit la vérité.</p>
          <div class="cta">
            <a class="btn primary" href="#/live" data-tip-text="Trade le Bitcoin, l'or ou l'euro sur les prix réels du marché, avec 10 000 $ virtuels." data-tip-title="Trading live">${M.icon("live")} Trader en live</a>
            <a class="btn ghost" href="#/missions" data-tip-text="Remonte le temps et revis les plus gros krachs de l'histoire crypto, bougie par bougie." data-tip-title="Time Machine">${M.icon("missions")} Rejouer un krach</a>
          </div>
        </div>
        <div class="hero-card glass">
          <div class="hc-row"><a class="hc-emoji av" href="#/settings/profil" style="border-radius:16px" data-tip-text="Change ta photo dans Paramètres → Profil">${s.photo ? `<img src="${s.photo}" alt="">` : M.ico("level", L.idx - 1)}</a><div><small>Niveau ${L.idx}</small><b>${L.name}</b></div><span class="pill" data-tip-text="Jours d'affilée où tu as ouvert l'app. Reviens demain pour garder la flamme.">${M.icon("flame")} ${s.streak.days} j</span></div>
          <div class="xpbar big" data-tip-text="${s.xp} XP. ${L.nextName ? "Prochain niveau : " + L.nextName : "Niveau max"}"><i style="width:${Math.round(L.progress * 100)}%"></i></div>
          <div class="hc-grid">
            <div data-tip="equity"><small>Portefeuille</small><b class="mono" id="h-eq">${eq != null ? M.fmt$(eq) : "…"}</b></div>
            <div data-tip-text="Nombre de trades clôturés sur ton compte live."><small>Trades</small><b class="mono">${s.wallet.log.length}</b></div>
            <div data-tip-text="Modules de l'Académie terminés."><small>Cours</small><b class="mono">${coursesDone}/${M.COURSES.length}</b></div>
            <div data-tip-text="Badges débloqués. Va dans ton profil pour voir ceux qui restent."><small>Badges</small><b class="mono">${Object.keys(s.badges).length}/${M.BADGES.length}</b></div>
          </div>
        </div>
      </section>

      <div class="sec-head"><h2>Marchés <span class="muted">en direct</span></h2><span class="pill" id="mk-mode">connexion…</span></div>
      <div class="tickers" id="tickers">${M.Market.ASSETS.map(a => `
        <a class="tick" href="#/live/${a.sym}" data-tip="${a.tip}">
          <span class="tk-ic" style="--c:${a.color}">${a.icon}</span>
          <span class="tk-n"><b>${a.short}</b><small>${a.type}</small></span>
          <span class="tk-p mono" data-p="${a.sym}">—</span>
          <span class="tk-c mono" data-c="${a.sym}">—</span>
        </a>`).join("")}
      </div>

      <div class="bento">
        <a class="tile t-live" href="#/live">
          <span class="t-tag">${M.icon("live")} LIVE</span><h3>Trading temps réel</h3>
          <p>Prix réels, flux des transactions en direct, levier, stop-loss. 10 000 $ virtuels pour faire tes armes.</p>
          <span class="t-go">Ouvrir le terminal →</span>
        </a>
        <a class="tile t-time" href="#/missions">
          <span class="t-tag">${M.icon("missions")} TIME MACHINE</span><h3>Rejoue l'histoire</h3>
          <p>Covid, FTX, ETF Bitcoin, choc des tarifs 2025… ${M.MISSIONS.length} vrais moments de marché, bougie par bougie.</p>
          <span class="t-go">Choisir une mission →</span>
        </a>
        <a class="tile t-ai" href="#/ai">
          <span class="t-tag">${M.icon("ai")} MÈCHE IA</span><h3>Ton copilote financier</h3>
          <p>Il apprend chaque jour sur les vrais marchés, bloque tes trades dangereux en Live et te propose une option plus sûre. Et répond à toutes tes questions.</p>
          <span class="t-go">Discuter avec l'IA →</span>
        </a>
        <a class="tile t-swipe" href="#/swipe">
          <span class="t-tag">${M.icon("swipe")} MINI-JEU</span><h3>Swipe : haut ou bas ?</h3>
          <p>10 vraies bougies à deviner. Spoiler : c'est plus dur que TikTok le laisse croire.</p>
          <span class="t-go">Jouer →</span>
        </a>
        <a class="tile t-lab" href="#/lab">
          <span class="t-tag">${M.icon("lab")} ALGO LAB</span><h3>4 algos à backtester</h3>
          <p>Trend following, Turtles, mean reversion, pairs trading. Sur de vraies données, frais inclus.</p>
          <span class="t-go">Lancer un test →</span>
        </a>
        <a class="tile t-quiz" href="#/quiz">
          <span class="t-tag">${M.icon("quiz")} QUIZ · ${M.QUIZ_COUNT || 80}+ QUESTIONS</span><h3>Apprends en 5 min/jour</h3>
          <p>Un parcours façon Duolingo : théorie, calculs et lecture de graphiques. Garde ta série 🔥</p>
          <span class="t-go">Commencer →</span>
        </a>
        <a class="tile t-acad" href="#/academy">
          <span class="t-tag">${M.icon("academy")} ACADÉMIE</span><h3>${M.COURSES.length} modules à jour</h3>
          <p>Instruments, styles, stratégies, algos, BRVM & UEMOA, options, crypto, macro 2025-2026, arnaques à éviter.</p>
          <div class="xpbar"><i style="width:${Math.round(coursesDone / M.COURSES.length * 100)}%"></i></div>
        </a>
        <a class="tile t-daily" href="#/mission/${dm.id}">
          <span class="t-tag">${M.icon("target")} DÉFI DU JOUR</span><h3>${M.ico("mission", dm.id)} ${dm.title}</h3>
          <p>Termine cette mission avec un score Coach d'au moins 70 → <b>+60 XP bonus</b>.</p>
          <span class="t-go">${s.daily[today()] ? "✅ Défi réussi aujourd'hui" : "Relever le défi →"}</span>
        </a>
      </div>
      ${disclaimer()}`;

    let alive = true;
    const syms = M.Market.ASSETS.map(a => a.sym);
    async function refresh() {
      const r = await M.Market.tickers(syms);
      if (!alive) return;
      if (r.live && r.data.EURUSDT) M.setEurUsd(r.data.EURUSDT.last);
      const mode = $("#mk-mode");
      mode.textContent = r.live ? "● Binance live" : "● Démo (hors ligne)";
      mode.className = "pill " + (r.live ? "live" : "demo");
      mode.setAttribute("data-tip-text", r.live ? "Prix réels de l'API publique Binance, rafraîchis toutes les 15 s." : "Impossible de joindre le marché : les prix affichés sont simulés.");
      syms.forEach(sy => {
        const d = r.data[sy]; if (!d) return;
        const p = $(`[data-p="${sy}"]`), c = $(`[data-c="${sy}"]`);
        if (p) p.textContent = M.Market.fmtPrice(d.last);
        if (c) { c.textContent = pct(d.chg / 100); c.className = "tk-c mono " + (d.chg >= 0 ? "up" : "dn"); }
      });
      if (tr.pos) {
        const d = r.data[tr.pos.sym];
        if (d) $("#h-eq").textContent = M.fmt$(tr.equity(d.last));
      }
    }
    refresh();
    const iv = setInterval(refresh, 15000);
    return () => { alive = false; clearInterval(iv); };
  };

  function dailyMission() {
    const d = Math.floor(Date.now() / 86400e3);
    return M.MISSIONS[d % M.MISSIONS.length];
  }
  M.dailyMission = dailyMission;

  function disclaimer() {
    return `<p class="disclaimer">⚠️ Mèche est un simulateur éducatif : l'argent est virtuel, les prix sont réels (API publique Binance) ou simulés si la connexion échoue. Rien ici n'est un conseil en investissement. Le trading comporte un risque de perte en capital ; la majorité des particuliers qui tradent des produits à levier perdent de l'argent.</p>`;
  }
  M.disclaimer = disclaimer;

  // ---------- Académie ----------
  function courseProgress(c) {
    const read = M.state.lessons[c.id] || {};
    return Object.keys(read).length / c.lessons.length;
  }

  M.views.academy = function (el) {
    const total = M.COURSES.reduce((s, c) => s + c.lessons.length, 0);
    const read = M.COURSES.reduce((s, c) => s + Object.keys(M.state.lessons[c.id] || {}).length, 0);
    el.innerHTML = `
      <div class="page-head">
        <div><p class="eyebrow">Académie</p><h1>Apprends les vraies règles du jeu</h1>
        <p class="lede">Chaque terme souligné en pointillés s'explique au survol (ou d'un tap sur mobile). Chaque module se termine par un quiz.</p></div>
        <div class="glass ring-card" data-tip-text="Chapitres lus sur l'ensemble des modules. Chaque chapitre lu = +10 XP.">
          <div class="ring" style="--p:${Math.round(read / total * 100)}"><b>${Math.round(read / total * 100)}%</b></div>
          <small>${read}/${total} chapitres</small>
        </div>
      </div>
      <div class="tabs"><a class="on" href="#/academy">📚 Modules</a><a href="#/glossary" data-tip-text="Les ${Object.keys(M.GLOSSARY).length} termes du trading expliqués simplement.">📖 Glossaire</a></div>
      <div class="courses">${M.COURSES.map((c, i) => {
        const p = courseProgress(c), q = M.state.quiz[c.id];
        return `<a class="course glass" href="#/course/${c.id}">
          <div class="c-top"><span class="c-emoji">${M.ico("course", c.id)}</span><span class="c-num">${String(i + 1).padStart(2, "0")}</span></div>
          <h3>${c.title}</h3><p>${c.sub}</p>
          <div class="c-meta"><span class="chip lvl-${c.level}">${c.level}</span><span class="chip" data-tip-text="Temps de lecture estimé">⏱ ${c.mins} min</span>
          ${q != null ? `<span class="chip ${q === 1 ? "ok" : ""}" data-tip-text="Ton meilleur score au quiz de ce module">Quiz ${Math.round(q * 100)} %</span>` : ""}</div>
          <div class="xpbar"><i style="width:${Math.round(p * 100)}%"></i></div>
        </a>`;
      }).join("")}</div>
      ${disclaimer()}`;
  };

  M.views.course = function (el, [id, step]) {
    const c = M.COURSES.find(x => x.id === id);
    if (!c) { M.go("#/academy"); return; }
    let i = step === "quiz" ? c.lessons.length : Math.min(+step || 0, c.lessons.length);

    function markRead(k) {
      const r = M.state.lessons[c.id] = M.state.lessons[c.id] || {};
      if (r[k]) return;
      r[k] = true;
      M.save();
      M.addXP(10, "chapitre lu");
      if (Object.keys(r).length === c.lessons.length) {
        M.unlock("course_1");
        if (M.COURSES.every(x => courseProgress(x) === 1)) M.unlock("course_all");
      }
    }

    function render() {
      const isQuiz = i >= c.lessons.length;
      const read = M.state.lessons[c.id] || {};
      el.innerHTML = `
        <a class="back" href="#/academy">← Académie</a>
        <div class="course-layout">
          <aside class="toc glass">
            <div class="toc-head"><span class="c-emoji">${M.ico("course", c.id)}</span><b>${c.title}</b></div>
            ${c.lessons.map((l, k) => `<button class="toc-i ${k === i ? "on" : ""} ${read[k] ? "done" : ""}" data-k="${k}">
              <span>${read[k] ? "✓" : k + 1}</span>${l.h}</button>`).join("")}
            <button class="toc-i quiz ${isQuiz ? "on" : ""}" data-k="${c.lessons.length}"><span>?</span>Quiz final</button>
          </aside>
          <article class="lesson glass" id="lesson"></article>
        </div>`;
      $$(".toc-i", el).forEach(b => b.onclick = () => { i = +b.dataset.k; render(); });
      const box = $("#lesson", el);
      if (!isQuiz) {
        const l = c.lessons[i];
        box.innerHTML = `
          <p class="eyebrow">Chapitre ${i + 1}/${c.lessons.length}</p>
          <h1>${l.h}</h1>
          <div class="prose">${M.linkTerms(l.body)}</div>
          <div class="lesson-nav">
            ${i > 0 ? `<button class="btn ghost" id="prev">← Précédent</button>` : "<span></span>"}
            <button class="btn primary" id="next">${i + 1 < c.lessons.length ? "Chapitre suivant →" : "Passer au quiz 🎯"}</button>
          </div>`;
        markRead(i);
        const p = $("#prev", box); if (p) p.onclick = () => { i--; render(); };
        $("#next", box).onclick = () => { i++; render(); };
      } else quiz(box);
    }

    function quiz(box) {
      let q = 0, right = 0;
      const show = () => {
        if (q >= c.quiz.length) return done();
        const it = c.quiz[q];
        box.innerHTML = `
          <p class="eyebrow">Quiz · question ${q + 1}/${c.quiz.length}</p>
          <h2 class="q">${it.q}</h2>
          <div class="answers">${it.o.map((o, k) => `<button class="ans" data-k="${k}"><span>${"ABC"[k]}</span>${o}</button>`).join("")}</div>
          <div id="why"></div>`;
        $$(".ans", box).forEach(b => b.onclick = () => {
          const k = +b.dataset.k, ok = k === it.a;
          if (ok) right++;
          $$(".ans", box).forEach(x => { x.disabled = true; if (+x.dataset.k === it.a) x.classList.add("good"); });
          if (!ok) b.classList.add("bad");
          $("#why", box).innerHTML = `<div class="why ${ok ? "ok" : "ko"}"><b>${ok ? "✅ Exact !" : "❌ Pas tout à fait."}</b> ${M.linkTerms(it.why)}</div>
            <button class="btn primary" id="nq">${q + 1 < c.quiz.length ? "Question suivante →" : "Voir mon score"}</button>`;
          $("#nq", box).onclick = () => { q++; show(); };
        });
      };
      const done = () => {
        const sc = right / c.quiz.length;
        const prev = M.state.quiz[c.id];
        M.state.quiz[c.id] = Math.max(prev || 0, sc);
        M.save();
        const xp = right * 5 + (sc === 1 ? 20 : 0);
        if (prev == null || sc > prev) M.addXP(xp, "quiz");
        if (sc === 1) M.unlock("quiz_perfect");
        const nextC = M.COURSES[M.COURSES.indexOf(c) + 1];
        const tryMap = { live: ["#/live", "⚡ Pratiquer en live"], missions: ["#/missions", "⏳ Tester sur un vrai krach"], swipe: ["#/swipe", "👆 Jouer au Swipe"], lab: ["#/lab", "🧪 Ouvrir l'Algo Lab"], quiz: ["#/quiz", "🦉 S'entraîner au Quiz"], profil: ["#/profile", "👤 Voir mon profil"] };
        const t = tryMap[c.try] || tryMap.live;
        box.innerHTML = `
          <div class="quiz-end">
            <div class="ring big" style="--p:${Math.round(sc * 100)}"><b>${right}/${c.quiz.length}</b></div>
            <h2>${sc === 1 ? "Sans faute 🔥" : sc >= 0.6 ? "Bien joué 👏" : "À revoir 📚"}</h2>
            <div class="keys"><h4>À retenir</h4><ul>${c.key.map(k => `<li>${k}</li>`).join("")}</ul></div>
            <div class="cta">
              <a class="btn primary" href="${t[0]}">${t[1]}</a>
              ${nextC ? `<a class="btn ghost" href="#/course/${nextC.id}">Module suivant : ${M.ico("course", nextC.id)} ${nextC.title}</a>` : ""}
              <button class="btn ghost" id="redo">Refaire le quiz</button>
            </div>
          </div>`;
        $("#redo", box).onclick = () => quiz(box);
      };
      show();
    }
    render();
  };

  // ---------- Glossaire ----------
  M.views.glossary = function (el) {
    const keys = Object.keys(M.GLOSSARY).sort((a, b) => M.GLOSSARY[a].t.localeCompare(M.GLOSSARY[b].t, "fr"));
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">Glossaire</p><h1>Le dico du trader</h1>
      <p class="lede">${keys.length} termes expliqués sans jargon. Ces définitions apparaissent aussi au survol partout dans l'app.</p></div></div>
      <div class="tabs"><a href="#/academy">📚 Modules</a><a class="on" href="#/glossary">📖 Glossaire</a></div>
      <input class="search" id="gq" placeholder="Rechercher : RSI, levier, ETF, funding…" autocomplete="off">
      <div class="gloss" id="gl"></div>`;
    const draw = q => {
      q = (q || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      $("#gl", el).innerHTML = keys.filter(k => {
        const g = M.GLOSSARY[k];
        return !q || (g.t + " " + g.d + " " + k).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q);
      }).map(k => `<div class="gl-i glass"><b>${M.GLOSSARY[k].t}</b><p>${M.GLOSSARY[k].d}</p></div>`).join("") || `<p class="muted">Aucun terme trouvé.</p>`;
    };
    $("#gq", el).oninput = e => draw(e.target.value);
    draw();
  };

  // ---------- Profil ----------
  M.views.profile = function (el) {
    const s = M.state, L = M.level();
    const log = s.wallet.log;
    const wins = log.filter(t => t.pnl > 0).length;
    const best = log.reduce((m, t) => Math.max(m, t.pnl), 0);
    const realized = log.reduce((m, t) => m + t.pnl, 0);
    const missionsDone = Object.keys(s.missions).length;
    const qs = s.qstats || { right: 0, total: 0, done: 0 };
    el.innerHTML = `
      <div class="profile-top glass">
        <div class="avatar">${s.photo ? `<img src="${s.photo}" alt="Photo de profil">` : M.ico("level", L.idx - 1)}
          <label class="avatar-edit file-btn" data-tip-text="Choisis une photo depuis ton téléphone ou ton ordinateur.">📷 Modifier<input type="file" accept="image/*" id="pphoto"></label></div>
        <div class="pf-id">
          <input id="pname" value="${esc(s.name)}" placeholder="Ton pseudo" maxlength="20" data-tip-text="Clique pour changer ton pseudo.">
          <p>Niveau ${L.idx} · <b>${L.name}</b> · ${s.xp} XP</p>
          <div class="xpbar big"><i style="width:${Math.round(L.progress * 100)}%"></i></div>
          <small class="muted">${L.nextName ? `Encore ${L.to - s.xp} XP pour « ${L.nextName} »` : "Niveau maximum. Respect."}</small>
        </div>
        <div class="cta" style="margin:0;flex-direction:column"><a class="btn ghost" href="#/account">${M.icon("shield")} Mon compte</a><a class="btn ghost" href="#/settings">${M.icon("settings")} Paramètres</a></div>
      </div>
      <div class="stats">
        ${stat("Portefeuille", M.fmt$(s.wallet.cash + (s.wallet.pos ? s.wallet.pos.margin : 0)), "Cash + marge engagée (hors PnL latent).", "equity")}
        ${stat("PnL réalisé", M.fmt$(realized), "Somme des gains et pertes de tous tes trades clôturés en live.", "pnl", realized >= 0 ? "up" : "dn")}
        ${stat("Taux de réussite", log.length ? Math.round(wins / log.length * 100) + " %" : "—", "", "win-rate")}
        ${stat("Meilleur trade", M.fmt$(best), "Ton plus gros gain sur un seul trade.")}
        ${stat("Missions", missionsDone + "/" + M.MISSIONS.length, "Missions Time Machine terminées.")}
        ${stat("Quiz", qs.total ? Math.round(qs.right / qs.total * 100) + " %" : "—", "Bonnes réponses sur toutes tes sessions de quiz.")}
        ${stat("Swipe", s.swipe.total ? Math.round(s.swipe.right / s.swipe.total * 100) + " %" : "—", "Pourcentage de bonnes prédictions sur toutes tes parties de Swipe.")}
      </div>
      <div class="sec-head"><h2>Tes badges <span class="muted">${Object.keys(s.badges).length}/${M.BADGES.length}</span></h2></div>
      <div class="badges">${M.BADGES.map(b => `<div class="badge ${s.badges[b.id] ? "got" : ""}" data-tip-title="${b.n}" data-tip-text="${s.badges[b.id] ? "Débloqué le " + new Date(s.badges[b.id]).toLocaleDateString("fr-FR") + ". " : "🔒 "}${b.d}">
        <span>${M.ico("badge", b.id)}</span><small>${b.n}</small></div>`).join("")}</div>
      ${disclaimer()}`;
    $("#pname", el).onchange = e => { s.name = e.target.value.trim().slice(0, 20); M.save(); M.toast("Pseudo enregistré ✓"); };
    $("#pphoto", el).onchange = async e => {
      try { s.photo = await M.imgToDataURL(e.target.files[0], 320, true); M.save(true); updateTopbar(); M.toast("Photo de profil mise à jour 📷"); M.go("#/profile"); }
      catch (err) { M.toast(err.message, "err"); }
    };
  };
  function stat(label, value, tip, key, cls = "") {
    return `<div class="stat glass" ${key ? `data-tip="${key}"` : `data-tip-text="${esc(tip)}"`}><small>${label}</small><b class="mono ${cls}">${value}</b></div>`;
  }
  M.stat = stat;

  // ---------- Bienvenue ----------
  function onboarding() {
    if (M.state.onboarded) return;
    const m = M.modal(`
      <div class="onb">
        <div class="onb-logo">${M.logoSVG(72)}</div>
        <h2>Bienvenue sur <span class="grad">Mèche</span></h2>
        <p>L'app pour apprendre le trading <b>sur les vrais marchés</b>, avec de l'argent virtuel.</p>
        <div class="onb-grid">
          <div><b>⚡ Live</b><span>Vrais prix, en temps réel</span></div>
          <div><b>⏳ Time Machine</b><span>Rejoue les krachs historiques</span></div>
          <div><b>🧪 Algo Lab</b><span>Teste 4 algos de trading</span></div>
          <div><b>🎓 Académie</b><span>${M.COURSES.length} modules + quiz Duolingo</span></div>
        </div>
        <p class="hint">💡 <b>Astuce</b> : survole n'importe quel bouton ou <span class="term" data-tip="spread">terme souligné</span> pour obtenir une explication (appui long sur mobile).</p>
        <input id="onb-name" placeholder="Ton pseudo (optionnel)" maxlength="20">
        <button class="btn primary wide" data-close>C'est parti 🚀</button>
      </div>`, {
      onClose() {
        const v = ($("#onb-name") || {}).value;
        if (v) M.state.name = v.trim().slice(0, 20);
        M.state.onboarded = true; M.save(true);
        if (location.hash === "" || location.hash === "#/home" || location.hash === "#/") route();
        // Première ouverture : visite guidée de toutes les parties de l'app
        if (!M.state.tourDone && M.startTour) M.startTour();
      }
    });
    setTimeout(() => { const i = $("#onb-name", m.el); i && i.focus(); }, 300);
  }

  // ---------- Démarrage ----------
  document.addEventListener("DOMContentLoaded", () => {
    M.applySettings();
    updateTopbar();
    route();
    onboarding();
  });
})();
