/* Région du client et accès Gratuit / Pro (modèle du pilote, novembre 2026).
   · Région : choisie par le client (proposée d'après le fuseau horaire), enregistrée dans son compte ;
     elle décide de la devise des prix et de l'ouverture des abonnements (pilote : Afrique de l'Ouest).
   · Gratuit : 6 modules de cours, 6 missions, 6 unités de quiz, Mèche IA 5 questions par jour, aperçu du Backtest
     (5 lancements par jour), du Labo options (4 stratégies) et du Vega Desk (1 session par jour), trading réel en
     mode test seulement, pas de synchronisation.
   · Pro : tout. Pass prépayés (1 jour à 6 mois) ; 3 jours offerts à la création du compte.
   Les verrous ne s'activent que si les comptes sont en service (config.freemium = "auto") : sans moyen de payer,
   rien n'est bloqué. Le contenu étant livré au navigateur, ces verrous sont commerciaux, pas une protection forte. */
window.M = window.M || {};

(function () {
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const C = () => M.CONFIG || {};

  // ---------- Régions ----------
  const REGIONS = [
    ["ML", "Mali", "XOF", "Africa/Bamako"], ["SN", "Sénégal", "XOF", "Africa/Dakar"], ["CI", "Côte d'Ivoire", "XOF", "Africa/Abidjan"],
    ["BF", "Burkina Faso", "XOF", "Africa/Ouagadougou"], ["BJ", "Bénin", "XOF", "Africa/Porto-Novo"], ["TG", "Togo", "XOF", "Africa/Lome"],
    ["NE", "Niger", "XOF", "Africa/Niamey"], ["GW", "Guinée-Bissau", "XOF", "Africa/Bissau"],
    ["GN", "Guinée", "GNF", "Africa/Conakry"], ["CM", "Cameroun", "XAF", "Africa/Douala"], ["CD", "RD Congo", "CDF", "Africa/Kinshasa"],
    ["MA", "Maroc", "EUR", "Africa/Casablanca"], ["FR", "France", "EUR", "Europe/Paris"], ["BE", "Belgique", "EUR", "Europe/Brussels"],
    ["CA", "Canada", "CAD", "America/Toronto"], ["US", "États-Unis", "USD", "America/New_York"], ["ZZ", "Autre pays", "USD", ""]
  ].map(([code, name, cur, tz]) => ({ code, name, cur, tz }));
  const byCode = Object.fromEntries(REGIONS.map(r => [r.code, r]));
  const pilot = () => C().pilotCountries || ["ML", "SN", "CI", "BF", "BJ", "TG"];

  const Region = {
    list: REGIONS,
    get: () => byCode[M.state.region] || null,
    guess() {
      let tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { /* navigateur ancien */ }
      return (REGIONS.find(r => r.tz && r.tz === tz) || {}).code || null;
    },
    open: code => pilot().includes(code || M.state.region),
    async set(code) {
      if (!byCode[code]) return false;
      // Enregistrée dans le compte : la base refuse plus d'un changement par 30 jours
      const A = M.Account, sb = A && A.enabled() && A.session() && A.sb();
      if (sb) {
        const { error } = await sb.from("profiles").update({ country: code, updated_at: new Date().toISOString() }).eq("id", A.session().user.id);
        if (error) { M.toast(/30 jours/.test(error.message) ? error.message : "Région non enregistrée : " + error.message, "err"); return false; }
      }
      M.state.region = code; M.save();
      document.dispatchEvent(new CustomEvent("meche:region", { detail: code }));
      return true;
    },
    // Fenêtre de choix (à l'inscription, depuis l'abonnement ou le compte)
    pick(why) {
      return new Promise(done => {
        const cur = M.state.region || Region.guess();
        const md = M.modal(`<h2>${M.icon("globe")} Ta région</h2>
          <p class="muted">${esc(why || "Elle fixe la devise de tes prix et les moyens de paiement proposés. Tu pourras la changer une fois par mois.")}</p>
          <div class="region-grid">${REGIONS.map(r => `<button class="region-b ${r.code === cur ? "on" : ""}" data-r="${r.code}"><b>${esc(r.name)}</b><small>${r.cur === "XOF" ? "FCFA" : r.cur}${Region.open(r.code) ? "" : " · bientôt"}</small></button>`).join("")}</div>
          <div class="cta"><button class="btn primary" id="rg-ok">Confirmer</button></div>`, { onClose: () => done(M.state.region || null) });
        let sel = cur;
        $$(".region-b", md.el).forEach(b => b.onclick = () => { sel = b.dataset.r; $$(".region-b", md.el).forEach(x => x.classList.toggle("on", x === b)); });
        md.el.querySelector("#rg-ok").onclick = async () => {
          if (!sel) return M.toast("Choisis ta région", "err");
          if (sel === M.state.region) return md.close();
          if (await Region.set(sel)) { M.toast("Région : " + byCode[sel].name); md.close(); }
        };
      });
    },
    // À la connexion : le compte fait foi ; sinon on y enregistre la région de l'appareil
    async syncFromAccount() {
      const A = M.Account, sb = A && A.enabled() && A.session() && A.sb();
      if (!sb) return;
      const { data } = await sb.from("profiles").select("country").eq("id", A.session().user.id).maybeSingle();
      if (data && data.country) { if (M.state.region !== data.country) { M.state.region = data.country; M.save(); } }
      else if (M.state.region) await Region.set(M.state.region);
      else await Region.pick("Choisis ta région pour terminer la création de ton compte.");
    }
  };
  M.Region = Region;

  // ---------- Accès Gratuit / Pro ----------
  const FREE = {
    courses: c => { const i = M.COURSES.indexOf(c); return i > -1 && (i < 5 || c.id === "risque"); },   // 5 premiers + Gestion du risque
    missions: new Set(["covid", "ftx", "etf", "gold", "merge", "tariffs"]),
    units: u => M.QUIZ_UNITS.indexOf(u) > -1 && M.QUIZ_UNITS.indexOf(u) < 6,
    strats: 4
  };
  const LIMITS = { ia: 5, lab: 5, vega: 1 };
  const PRO_KEY = "meche:pro";

  const on = () => C().freemium === true || (C().freemium === "auto" && !!(M.Account && M.Account.enabled()));
  const cache = () => { try { return JSON.parse(localStorage.getItem(PRO_KEY)) || {}; } catch { return {}; } };
  const pro = () => !on() || (cache().until || 0) > Date.now();

  async function refresh() {
    if (!on()) return;
    const A = M.Account;
    try {
      await A.client();
      const s = A.session() ? await A.subscription(true) : null;
      const isPro = !!(s && s.active && s.plans && (s.plans.perks || []).includes("pro"));
      localStorage.setItem(PRO_KEY, JSON.stringify(isPro ? { until: Date.parse(s.current_period_end), plan: s.plan_id } : {}));
      document.body.classList.toggle("is-pro", isPro);
      if (isPro) remind(s);
    } catch (e) { console.warn("Accès :", e.message); }
  }
  // Rappel une fois par jour à l'approche de la fin : 3 jours avant pour un mois ou plus, un tiers de la durée sinon
  // (essai de 3 jours : la dernière journée)
  function remind(s) {
    const left = (Date.parse(s.current_period_end) - Date.now()) / 864e5;
    const period = (s.plans && s.plans.period_days) || 30;
    const day = new Date().toISOString().slice(0, 10);
    if (left > Math.min(3, period / 3) || localStorage.getItem("meche:remind") === day) return;
    localStorage.setItem("meche:remind", day);
    const essai = s.plan_id === "pro-essai";
    const md = M.modal(`<h2>${M.icon("crown")} ${essai ? "Ton essai Pro se termine" : "Ton Pro se termine bientôt"}</h2>
      <p>Accès complet jusqu'au <b>${new Date(s.current_period_end).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}</b>. Ensuite, tu repasses au Gratuit : tes progrès sont gardés, mais les contenus Pro se verrouillent.</p>
      <div class="cta"><a class="btn primary" href="#/abonnement" data-close>Prolonger</a><button class="btn ghost" data-close>Plus tard</button></div>`);
    return md;
  }

  const lockedCourse = c => on() && !pro() && !FREE.courses(c);
  const lockedMission = m => on() && !pro() && !FREE.missions.has(m.id);
  const lockedUnit = u => on() && !pro() && !FREE.units(u);
  const lockedStrat = id => on() && !pro() && M.Options && M.Options.STRATS.findIndex(s => s.id === id) >= FREE.strats;

  // Quotas journaliers du Gratuit (Mèche IA, Backtest, Vega)
  function use(key) {
    if (!on() || pro()) return true;
    const day = new Date().toISOString().slice(0, 10);
    let q; try { q = JSON.parse(localStorage.getItem("meche:quota")) || {}; } catch { q = {}; }
    if (q.day !== day) q = { day };
    if ((q[key] || 0) >= LIMITS[key]) return false;
    q[key] = (q[key] || 0) + 1;
    localStorage.setItem("meche:quota", JSON.stringify(q));
    return true;
  }
  const left = key => {
    let q; try { q = JSON.parse(localStorage.getItem("meche:quota")) || {}; } catch { q = {}; }
    return q.day === new Date().toISOString().slice(0, 10) ? Math.max(0, LIMITS[key] - (q[key] || 0)) : LIMITS[key];
  };

  const WHY = {
    course: "Ce module fait partie du Pro. Le Gratuit comprend les 5 premiers modules et la gestion du risque.",
    mission: "Cette mission fait partie du Pro. Le Gratuit comprend 6 missions, signalées par « Gratuit ».",
    unit: "Cette unité fait partie du Pro. Le Gratuit comprend les 6 premières unités.",
    ia: `Tu as utilisé tes ${LIMITS.ia} questions gratuites du jour à Mèche IA. Le Pro, c'est sans limite.`,
    lab: `Tu as utilisé tes ${LIMITS.lab} backtests gratuits du jour. Le Pro, c'est sans limite.`,
    vega: "Ta session gratuite du jour au Vega Desk est utilisée. Le Pro, c'est sans limite.",
    strat: `Le Gratuit comprend les ${FREE.strats} premières stratégies du Labo options.`,
    reel: "Le trading avec ton compte réel fait partie du Pro. Le mode test (argent fictif) reste gratuit.",
    sync: "La synchronisation entre appareils fait partie du Pro."
  };
  function gate(kind) {
    const A = M.Account, logged = A && A.session && A.session();
    M.modal(`<h2>${M.icon("crown")} Contenu Pro</h2><p>${WHY[kind] || "Cette fonction fait partie du Pro."}</p>
      <p class="muted small">Pro : accès complet, à partir de 300 FCFA la journée ou 3 000 FCFA le mois.${logged ? "" : " <b>3 jours de Pro offerts</b> à la création de ton compte."}</p>
      <div class="cta">${logged ? `<a class="btn primary" href="#/abonnement" data-close>Voir le Pro</a>` : `<a class="btn primary" href="#/account" data-close>Créer mon compte (3 jours offerts)</a><a class="btn ghost" href="#/abonnement" data-close>Voir le Pro</a>`}<button class="btn ghost" data-close>Plus tard</button></div>`);
    return false;
  }

  // Écran à la place d'un contenu verrouillé ouvert par son adresse
  const lockedPage = (el, kind, back) => {
    el.innerHTML = `<div class="glass pad lock-page">${M.icon("lock")}<h2>Contenu Pro</h2><p>${WHY[kind]}</p>
      <div class="cta"><a class="btn primary" href="#/abonnement">Voir le Pro</a><a class="btn ghost" href="${back}">Retour</a></div></div>`;
  };

  // Cadenas sur les cartes des listes (cours, missions, unités de quiz, stratégies)
  function decorate(root) {
    if (!on()) return;
    $$('a[href^="#/course/"]', root).forEach(a => {
      const c = M.COURSES.find(x => x.id === decodeURIComponent(a.getAttribute("href").split("/")[2]));
      mark(a, c && lockedCourse(c), c && on() && !pro() && FREE.courses(c));
    });
    $$('a[href^="#/mission/"]', root).forEach(a => {
      const m = M.MISSIONS.find(x => x.id === decodeURIComponent(a.getAttribute("href").split("/")[2]));
      mark(a, m && lockedMission(m), m && on() && !pro() && FREE.missions.has(m.id));
    });
    $$(".qnode[data-u]", root).forEach(b => { const u = M.QUIZ_UNITS.find(x => x.id === b.dataset.u); mark(b, u && lockedUnit(u), false); });
    $$(".opt-s[data-s]", root).forEach(b => mark(b, lockedStrat(b.dataset.s), false));
  }
  function mark(node, locked, free) {
    if (!node.classList.contains("course") && !node.classList.contains("mission") && !node.classList.contains("qnode") && !node.classList.contains("opt-s")) return;
    node.classList.toggle("pro-locked", !!locked);
    let tag = node.querySelector(":scope > .pro-tag");
    if (!locked && !free) { if (tag) tag.remove(); return; }
    if (!tag) { tag = document.createElement("span"); tag.className = "pro-tag"; node.appendChild(tag); }
    const k = locked ? "pro" : "free";
    if (tag.dataset.k === k) return;   // rien à changer (évite de relancer l'observateur)
    tag.dataset.k = k;
    tag.classList.toggle("free", !locked);
    tag.innerHTML = locked ? `${M.icon("lock")} Pro` : "Gratuit";
  }

  // Les clics sur un contenu verrouillé ouvrent l'offre au lieu du contenu
  document.addEventListener("click", e => {
    if (!on() || pro()) return;
    const t = e.target.closest(".pro-locked");
    if (!t) return;
    e.preventDefault(); e.stopImmediatePropagation();
    gate(t.classList.contains("qnode") ? "unit" : t.classList.contains("opt-s") ? "strat" : t.classList.contains("mission") ? "mission" : "course");
  }, true);

  // Garde des vues ouvertes par leur adresse (lien partagé, favori…)
  function wrap(name, check) {
    const orig = M.views[name];
    if (!orig) return;
    M.views[name] = function (el, params) {
      const r = check(el, params || []);
      if (r === false) return;
      const out = orig.call(this, el, params);
      decorate(el);
      const mo = new MutationObserver(() => decorate(el));
      mo.observe(el, { childList: true, subtree: true });
      return () => { mo.disconnect(); if (typeof out === "function") out(); };
    };
  }
  function install() {
    wrap("course", (el, [id]) => { const c = M.COURSES.find(x => x.id === id); if (c && lockedCourse(c)) { lockedPage(el, "course", "#/academy"); return false; } });
    wrap("mission", (el, [id]) => { const m = M.MISSIONS.find(x => x.id === id); if (m && lockedMission(m)) { lockedPage(el, "mission", "#/missions"); return false; } });
    wrap("quiz", (el, [mode, uid]) => { const u = mode === "play" && M.QUIZ_UNITS.find(x => x.id === uid); if (u && lockedUnit(u)) { lockedPage(el, "unit", "#/quiz"); return false; } });
    wrap("vega", el => {
      if (!on() || pro()) return;
      const day = new Date().toISOString().slice(0, 10);
      if (sessionStorage.getItem("meche:vega") === day) return;   // session du jour déjà ouverte dans cet onglet
      if (!use("vega")) { lockedPage(el, "vega", "#/home"); return false; }
      sessionStorage.setItem("meche:vega", day);
    });
    ["academy", "missions", "home", "options"].forEach(v => wrap(v, () => {}));
  }

  M.Access = { on, pro, refresh, use, left, gate, decorate, lockedCourse, lockedMission, lockedUnit, lockedStrat, LIMITS, FREE };

  // Chargé après toutes les vues (et après shell.js, qui redéfinit l'accueil) : on les enveloppe tout de suite
  install();
  document.addEventListener("DOMContentLoaded", () => {
    if (!M.state.region) { const g = Region.guess(); if (g) { M.state.region = g; M.save(); } }
    refresh();
  });
  document.addEventListener("meche:auth", e => {
    const ev = e.detail && e.detail.event;
    if (ev === "SIGNED_IN") Region.syncFromAccount().catch(() => {}).then(refresh);
    if (ev === "SIGNED_OUT") { localStorage.removeItem(PRO_KEY); document.body.classList.remove("is-pro"); }
  });
})();
