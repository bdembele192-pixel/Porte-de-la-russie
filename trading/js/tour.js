/* Tutoriel guidé : met en lumière chaque partie de l'app, une par une.
   Lancé à la première ouverture, et relançable depuis Paramètres → Aide & tutoriel. */
window.M = window.M || {};

(function () {
  const $ = (q, r = document) => r.querySelector(q);
  const STEPS = [
    { t: "Bienvenue sur Mèche 👋", d: "En une minute, je te montre tout ce que l'app contient. Tu peux passer à tout moment et reprendre ce tutoriel dans Paramètres → Aide & tutoriel." },
    { s: '.nav a[data-nav="home"]', t: "Accueil", d: "Ton tableau de bord : niveau, portefeuille virtuel, marchés en direct et défi du jour." },
    { s: '.nav a[data-nav="live"]', t: "Live : trading sur les vrais prix", d: "Achète ou vends le Bitcoin, l'or, l'euro… sur les prix réels du marché, avec de l'argent virtuel. Stop-loss, objectif, levier, et le flux des vraies transactions." },
    { s: '.nav a[data-nav="missions"]', t: "Missions : la machine à remonter le temps", d: "Rejoue de vrais krachs et rallyes (Covid, FTX, tarifs 2025…) bougie par bougie, puis découvre ce qui s'est réellement passé." },
    { s: '.nav a[data-nav="swipe"]', t: "Swipe", d: "Mini-jeu : la prochaine bougie sera-t-elle verte ou rouge ? Parfait pour comprendre pourquoi la gestion du risque compte plus que la prédiction." },
    { s: '.nav a[data-nav="lab"]', t: "Algo Lab", d: "Teste 4 algorithmes de trading célèbres sur de vraies données, frais inclus, et compare-les au simple « acheter et garder »." },
    { s: '.nav a[data-nav="options"]', t: "Labo options", d: "Manipule des options : prix, gains et pertes possibles selon le prix final, grecques expliquées simplement, 7 stratégies classiques." },
    { s: '.nav a[data-nav="quiz"]', t: "Quiz façon Duolingo", d: "5 minutes par jour : théorie, calculs et lecture de graphiques, avec des vies, des combos et des étoiles." },
    { s: '.nav a[data-nav="ai"]', t: "Mèche IA", d: "Ton copilote : il s'entraîne chaque jour sur les vrais marchés, bloque tes trades dangereux en Live et te propose une option plus sûre. Il répond aussi à tes questions d'économie, de droit, de géopolitique…" },
    { s: '.nav a[data-nav="news"]', t: "Actus", d: "Les communiqués officiels des banques centrales, du FMI, de la Banque mondiale, de l'OMC, des régulateurs… collectés automatiquement à la source." },
    { s: '.nav a[data-nav="academy"]', t: "Académie", d: "Les cours complets : instruments, stratégies, algos, BRVM & UEMOA, options, crypto, psychologie, et un glossaire de plus de 120 termes." },
    { s: '.nav a[data-nav="profile"]', t: "Profil", d: "Ta photo, ton pseudo, tes statistiques et tes badges." },
    { s: "#tb-level", t: "Niveau et XP", d: "Chaque cours lu, quiz réussi, mission ou trade discipliné te rapporte de l'XP. 8 niveaux, du Bébé trader à la Market Legend." },
    { s: "#tb-streak", t: "Ta série", d: "Le nombre de jours d'affilée où tu ouvres l'app. Reviens chaque jour pour garder la flamme." },
    { s: ".tb-gear", t: "Paramètres", d: "Thème, police, taille du texte, langue, devise (dont FCFA), montants, sons, ton compte, et ce tutoriel." },
    { s: "#tickers", t: "Marchés en direct", d: "Les prix réels et la variation sur 24 h. Touche un actif pour ouvrir son graphique." },
    { s: ".t-daily", t: "Défi du jour", d: "Une mission différente chaque jour : réussis-la avec un bon score de discipline pour gagner de l'XP bonus." },
    { s: "#ai-fab", t: "Mèche IA, partout", d: "Ce bouton ouvre le chat de l'IA depuis n'importe quelle page (sauf pendant les exercices)." },
    { t: "Dernière astuce 💡", d: "Survole n'importe quel bouton ou terme souligné pour une explication (appui long sur mobile). Bon trading, et pense toujours à ton stop-loss !" }
  ];

  let i = 0, ui = null, onKey = null;

  function visible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
  }

  function place() {
    const st = STEPS[i];
    const el = st.s ? $(st.s) : null;
    const spot = ui.querySelector(".tour-spot"), card = ui.querySelector(".tour-card");
    card.querySelector(".tour-n").textContent = `${i + 1} / ${STEPS.length}`;
    card.querySelector("h3").textContent = st.t;
    card.querySelector("p").textContent = st.d;
    card.querySelector("[data-prev]").disabled = i === 0;
    card.querySelector("[data-next]").textContent = i === STEPS.length - 1 ? "Terminer ✓" : "Suivant →";
    if (!el) {
      spot.style.cssText = "left:50%;top:50%;width:0;height:0";
      card.className = "tour-card glass center";
      card.style.left = card.style.top = "";
      return;
    }
    const r0 = el.getBoundingClientRect();
    if (r0.top < 70 || r0.bottom > innerHeight - 20) el.scrollIntoView({ block: "center" });
    const r = el.getBoundingClientRect(), pad = 6;
    spot.style.cssText = `left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px`;
    card.className = "tour-card glass";
    const cw = Math.min(340, innerWidth - 24), ch = card.offsetHeight || 190;
    let left = Math.min(Math.max(12, r.left + r.width / 2 - cw / 2), innerWidth - cw - 12);
    let top = r.bottom + 14;
    if (top + ch > innerHeight - 12) top = Math.max(12, r.top - ch - 14);
    card.style.left = left + "px"; card.style.top = top + "px"; card.style.width = cw + "px";
  }

  function go(d) {
    let n = i + d;
    while (n >= 0 && n < STEPS.length && STEPS[n].s && !visible($(STEPS[n].s))) n += d || 1;
    if (n >= STEPS.length) return end(true);
    if (n < 0) return;
    i = n; place();
  }

  function end(done) {
    if (!ui) return;
    ui.remove(); ui = null;
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", place);
    M.state.tourDone = true; M.save();
    if (done) { M.toast("Tutoriel terminé : à toi de jouer 🚀", "win"); M.addXP && M.addXP(15, "tutoriel"); }
  }

  M.startTour = function () {
    if (ui) return;
    const run = () => {
      i = 0;
      ui = document.createElement("div");
      ui.className = "tour";
      ui.innerHTML = `<div class="tour-spot"></div>
        <div class="tour-card glass" role="dialog" aria-live="polite"><span class="tour-n"></span><h3></h3><p></p>
          <div class="tour-a"><button class="btn ghost sm" data-skip>Passer</button><span></span><button class="btn ghost sm" data-prev>← Retour</button><button class="btn primary sm" data-next>Suivant →</button></div></div>`;
      document.body.appendChild(ui);
      ui.querySelector("[data-skip]").onclick = () => end(false);
      ui.querySelector("[data-prev]").onclick = () => go(-1);
      ui.querySelector("[data-next]").onclick = () => go(1);
      onKey = e => { if (e.key === "Escape") end(false); if (e.key === "ArrowRight" || e.key === "Enter") go(1); if (e.key === "ArrowLeft") go(-1); };
      document.addEventListener("keydown", onKey);
      window.addEventListener("resize", place);
      place();
    };
    // Le tutoriel se déroule sur l'accueil, où toutes les zones sont visibles
    if (!["", "#", "#/", "#/home"].includes(location.hash)) { M.go("#/home"); setTimeout(run, 600); }
    else setTimeout(run, 200);
  };
})();
