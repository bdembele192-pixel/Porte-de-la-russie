/* Paramètres : apparence (thème, couleur, police, taille, flou, arrondis, fond d'écran, icône),
   profil (pseudo, photo), langue, devise et montants, trading, sons, données. */
window.M = window.M || {};

(function () {
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const esc = v => String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  M.views = M.views || {};

  M.SETTINGS_DEFAULT = {
    tips: true, tipDelay: 280,
    theme: "neon", accent: null, font: "inter", fontHead: "grotesk", fs: 1, blur: 14, radius: 18, motion: true,
    wall: null, wallDim: 0.7, icon: "🕯️", iconImg: null, appName: "Mèche",
    lang: "fr", currency: "USD", startCash: 10000,
    maxLev: 20, defSl: 2, defTp: 4, confirm: false, dayLoss: 0,
    sound: true, haptic: true, discreet: false
  };

  const THEMES = [
    { id: "neon", n: "Néon nuit", c: ["#07070C", "#C6FF3D", "#8B5CFF", "#FF4DA6"] },
    { id: "minuit", n: "Minuit violet", c: ["#0B0716", "#B794FF", "#FF4DA6", "#7DD3FC"] },
    { id: "ocean", n: "Océan", c: ["#04111A", "#3DF5FF", "#2D7FF9", "#2BEA8B"] },
    { id: "sunset", n: "Sunset", c: ["#140A0A", "#FF9F43", "#FF4D6D", "#FFD23D"] },
    { id: "matrix", n: "Matrix", c: ["#020A04", "#39FF88", "#1FAF5A", "#9CFFB8"] },
    { id: "bamako", n: "Bamako 🇲🇱", c: ["#120C05", "#FCD116", "#14B866", "#CE1126"] },
    { id: "clair", n: "Clair", c: ["#F4F5FA", "#6D28D9", "#0E7490", "#12131C"] }
  ];
  const FONTS = {
    inter: ["Inter", "Inter"], poppins: ["Poppins", "Poppins"], outfit: ["Outfit", "Outfit"], dmsans: ["DM Sans", "DM+Sans"],
    nunito: ["Nunito", "Nunito"], lexend: ["Lexend", "Lexend"], atkinson: ["Atkinson Hyperlegible", "Atkinson+Hyperlegible"],
    grotesk: ["Space Grotesk", "Space+Grotesk"], sora: ["Sora", "Sora"], mono: ["JetBrains Mono", "JetBrains+Mono"], system: ["system-ui", null]
  };
  const FONT_NAMES = { inter: "Inter (défaut)", poppins: "Poppins", outfit: "Outfit", dmsans: "DM Sans", nunito: "Nunito (arrondie)", lexend: "Lexend (lisibilité)", atkinson: "Atkinson (malvoyants)", grotesk: "Space Grotesk", sora: "Sora", mono: "JetBrains Mono", system: "Police du système" };
  const ICONS = ["🕯️", "🚀", "📈", "💎", "🔥", "🐂", "🦁", "🐺", "⚡", "🌙", "👑", "🎯", "💸", "🧠", "🇲🇱", "🪙"];
  const CURRENCIES = {
    USD: { sym: "$", dec: 2, n: "Dollar US ($)" },
    EUR: { sym: "€", dec: 2, n: "Euro (€)" },
    XOF: { sym: "FCFA", dec: 0, n: "Franc CFA (FCFA, UEMOA)" },
    RUB: { sym: "₽", dec: 2, n: "Rouble russe (₽)" },
    JPY: { sym: "¥", dec: 0, n: "Yen japonais (¥)" },
    CNY: { sym: "CN¥", dec: 2, n: "Yuan chinois (CN¥)" }
  };
  // Taux de repli (unités pour 1 $) si le service de change est injoignable
  const FX_FALLBACK = { RUB: 80, JPY: 150, CNY: 7.1 };
  const XOF_PER_EUR = 655.957; // parité fixe FCFA / euro

  const S = () => (M.state && M.state.settings) || M.SETTINGS_DEFAULT;

  /* Devise d'affichage. Les montants internes sont en dollars. */
  M.currency = function () {
    const code = S().currency || "USD";
    const eurusd = (M.state.fx && M.state.fx.eurusd) || 1.16;
    const fx = (M.state && M.state.fx && M.state.fx.rates) || {};
    const rate = code === "EUR" ? 1 / eurusd : code === "XOF" ? XOF_PER_EUR / eurusd
      : FX_FALLBACK[code] ? (fx[code] || FX_FALLBACK[code]) : 1;
    return Object.assign({ code, rate, approx: !!FX_FALLBACK[code] && !fx[code] }, CURRENCIES[code] || CURRENCIES.USD);
  };
  M.setEurUsd = function (v) {
    if (v > 0.5 && v < 2) { M.state.fx = Object.assign({}, M.state.fx, { eurusd: v }); M.save(); }
  };
  /* Taux du rouble, du yen et du yuan (service public gratuit, rafraîchi toutes les 12 h). */
  M.refreshFx = async function () {
    const fx = M.state.fx || {};
    if (fx.at && Date.now() - fx.at < 12 * 3600e3) return;
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/USD");
      const d = await r.json();
      if (d && d.rates && d.rates.JPY) {
        M.state.fx = Object.assign({}, M.state.fx, { rates: { RUB: d.rates.RUB, JPY: d.rates.JPY, CNY: d.rates.CNY }, at: Date.now() });
        M.save();
      }
    } catch (e) { /* hors ligne : taux de repli */ }
  };

  // ---------- Sons & vibrations ----------
  let actx = null;
  M.sfx = function (kind) {
    if (!S().sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { ok: [660, 880], ko: [220, 160], open: [520], win: [523, 659, 784], loss: [300, 220], level: [523, 659, 784, 1047], tap: [700] }[kind] || [600];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = kind === "ko" || kind === "loss" ? "sawtooth" : "triangle";
        o.frequency.value = f;
        const t = actx.currentTime + i * 0.09;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        o.connect(g); g.connect(actx.destination);
        o.start(t); o.stop(t + 0.18);
      });
    } catch (e) { /* audio indisponible */ }
    if (S().haptic && navigator.vibrate) navigator.vibrate(kind === "ko" || kind === "loss" ? [40, 40, 40] : 25);
  };

  // ---------- Images (photo de profil, fond, icône) ----------
  M.imgToDataURL = function (file, max, square) {
    return new Promise((res, rej) => {
      if (!file || !/^image\//.test(file.type)) return rej(new Error("Ce fichier n'est pas une image."));
      const fr = new FileReader();
      fr.onerror = () => rej(new Error("Lecture impossible."));
      fr.onload = () => {
        const img = new Image();
        img.onerror = () => rej(new Error("Image illisible."));
        img.onload = () => {
          let w = img.width, h = img.height, sx = 0, sy = 0, sw = w, sh = h;
          if (square) { const m = Math.min(w, h); sx = (w - m) / 2; sy = (h - m) / 2; sw = sh = m; w = h = Math.min(m, max); }
          else { const k = Math.min(1, max / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k); }
          const cv = document.createElement("canvas");
          cv.width = w; cv.height = h;
          cv.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
          res(cv.toDataURL("image/jpeg", 0.85));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  };

  function iconDataURL(size) {
    const s = S();
    const cv = document.createElement("canvas");
    cv.width = cv.height = size;
    const ctx = cv.getContext("2d");
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#07070C";
    ctx.fillStyle = bg;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(0, 0, size, size, size * 0.22); else ctx.rect(0, 0, size, size);
    ctx.fill();
    ctx.font = `${size * 0.62}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(s.icon || "🕯️", size / 2, size * 0.55);
    return cv.toDataURL("image/png");
  }

  function applyIcon() {
    const s = S();
    const href = s.iconImg || iconDataURL(192);
    const set = (rel, h) => {
      let l = document.querySelector(`link[rel="${rel}"]`);
      if (!l) { l = document.createElement("link"); l.rel = rel; document.head.appendChild(l); }
      l.href = h;
    };
    set("icon", href);
    set("apple-touch-icon", href);
    const logo = $(".logo-i");
    if (logo) logo.innerHTML = s.iconImg ? `<img src="${s.iconImg}" alt="">` : esc(s.icon || "🕯️");
    const name = $(".logo span:last-child");
    if (name) name.textContent = s.appName || "Mèche";
    // Manifeste dynamique : l'icône choisie est utilisée si l'app est installée sur l'écran d'accueil
    try {
      const man = {
        name: (s.appName || "Mèche") + " — apprends à trader", short_name: s.appName || "Mèche", start_url: location.href.split("#")[0],
        display: "standalone", background_color: "#07070C", theme_color: "#07070C",
        icons: [{ src: s.iconImg || iconDataURL(512), sizes: "512x512", type: s.iconImg ? "image/jpeg" : "image/png" }]
      };
      const url = URL.createObjectURL(new Blob([JSON.stringify(man)], { type: "application/manifest+json" }));
      set("manifest", url);
    } catch (e) { /* manifeste non pris en charge */ }
  }

  const loadedFonts = {};
  function loadFont(key) {
    const f = FONTS[key];
    if (!f || !f[1] || loadedFonts[key]) return;
    loadedFonts[key] = true;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = `https://fonts.googleapis.com/css2?family=${f[1]}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(l);
  }

  /* Applique tous les réglages visuels. */
  M.applySettings = function () {
    const s = S(), root = document.documentElement, st = root.style;
    root.setAttribute("data-theme", s.theme || "neon");
    root.setAttribute("data-motion", s.motion === false ? "off" : "on");
    root.lang = ["en", "zh", "ru"].includes(s.lang) ? s.lang : "fr";
    st.removeProperty("--lime");
    if (s.accent) st.setProperty("--lime", s.accent);
    loadFont(s.font); loadFont(s.fontHead);
    const fam = k => FONTS[k] ? `"${FONTS[k][0]}", system-ui, sans-serif` : null;
    if (s.font && s.font !== "inter") st.setProperty("--body", fam(s.font)); else st.removeProperty("--body");
    if (s.fontHead && s.fontHead !== "grotesk") st.setProperty("--head", fam(s.fontHead)); else st.removeProperty("--head");
    st.setProperty("--fs", s.fs || 1);
    root.classList.toggle("big-text", (s.fs || 1) > 1.05);
    st.setProperty("--blur", (s.blur != null ? s.blur : 14) + "px");
    st.setProperty("--r", (s.radius != null ? s.radius : 18) + "px");
    document.body.classList.toggle("has-wall", !!s.wall);
    document.body.classList.toggle("discreet", !!s.discreet);
    if (s.wall) { document.body.style.setProperty("--wall", `url("${s.wall}")`); document.body.style.setProperty("--wall-dim", s.wallDim); }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue("--bg").trim();
    applyIcon();
    if (M.Chart && M.Chart.setTheme) M.Chart.setTheme();
    M.i18n.apply();
  };

  // ---------- Langue (interface) ----------
  const EN = {
    "Accueil": "Home", "Live": "Live", "Missions": "Missions", "Swipe": "Swipe", "Algo Lab": "Algo Lab", "Académie": "Academy", "Quiz": "Quiz", "Profil": "Profile", "Paramètres": "Settings",
    "Apprends à trader.": "Learn to trade.", "Sans te brûler.": "Without getting burned.", "Trader en live": "Trade live", "Rejouer un krach": "Replay a crash",
    "Portefeuille": "Portfolio", "Trades": "Trades", "Cours": "Courses", "Badges": "Badges", "Marchés": "Markets", "en direct": "live",
    "Trading temps réel": "Real-time trading", "Ouvrir le terminal": "Open the terminal", "Rejoue l'histoire": "Replay history", "Choisir une mission": "Pick a mission",
    "Swipe : haut ou bas ?": "Swipe: up or down?", "Jouer": "Play", "4 algos à backtester": "4 algos to backtest", "Lancer un test": "Run a test",
    "Relever le défi": "Take the challenge", "Quiz express": "Quick quiz", "Commencer": "Start",
    "Valeur du compte": "Account value", "Cash dispo": "Available cash", "Mise": "Amount", "Levier": "Leverage", "Stop-loss": "Stop-loss", "Objectif": "Take-profit",
    "Exposition": "Exposure", "Risque si stop": "Risk at stop", "Liquidation": "Liquidation", "Ratio R:R": "R:R ratio", "Historique": "History", "Analyse coach": "Coach review",
    "Clôturer": "Close", "Stop au point mort": "Stop to breakeven", "Entrée": "Entry", "Prix": "Price", "Marge": "Margin", "Aucune position ouverte.": "No open position.",
    "Flux des trades réels": "Live trade feed", "Long": "Long", "Short": "Short", "Position déjà ouverte": "Position already open",
    "Bougie suivante ▶": "Next candle ▶", "Aller à la fin": "Skip to end", "Compte mission": "Mission account", "Pas encore jouée": "Not played yet", "Rejouer": "Replay", "Autres missions": "Other missions",
    "Baisse": "Down", "Hausse": "Up", "Manche": "Round",
    "Lancer le backtest": "Run backtest", "Comparer les 4 algos": "Compare the 4 algos", "Actif": "Asset", "Unité de temps": "Timeframe", "Frais / ordre": "Fees / order",
    "Rendement algo": "Algo return", "Acheter & garder": "Buy & hold", "Perte max": "Max drawdown", "Réussite": "Win rate", "Courbe de capital": "Equity curve", "Derniers trades de l'algo": "Algo's latest trades",
    "Modules": "Modules", "Glossaire": "Glossary", "Chapitre suivant →": "Next chapter →", "← Précédent": "← Previous", "Passer au quiz 🎯": "Take the quiz 🎯", "Quiz final": "Final quiz",
    "Question suivante →": "Next question →", "Voir mon score": "See my score", "À retenir": "Key takeaways", "Refaire le quiz": "Retake quiz",
    "Taux de réussite": "Win rate", "Meilleur trade": "Best trade", "PnL réalisé": "Realized PnL",
    "Vérifier": "Check", "Continuer": "Continue", "Vrai": "True", "Faux": "False", "Bien joué !": "Well done!", "Pas tout à fait…": "Not quite…",
    "Apparence": "Appearance", "Profil & icône": "Profile & icon", "Langue & devise": "Language & currency", "Trading": "Trading", "Sons & confort": "Sound & comfort", "Données": "Data",
    "Thème": "Theme", "Couleur d'accent": "Accent color", "Police du texte": "Body font", "Police des titres": "Heading font", "Taille du texte": "Text size",
    "Intensité du flou": "Blur intensity", "Arrondis": "Corner radius", "Animations": "Animations", "Fond d'écran": "Wallpaper", "Pseudo": "Username", "Photo de profil": "Profile picture",
    "Icône de l'app": "App icon", "Nom de l'app": "App name", "Langue": "Language", "Devise d'affichage": "Display currency", "Capital de départ": "Starting capital",
    "Ajouter des fonds virtuels": "Add virtual funds", "Levier maximum": "Maximum leverage", "Stop-loss par défaut": "Default stop-loss", "Objectif par défaut": "Default take-profit",
    "Confirmer chaque ordre": "Confirm every order", "Limite de perte du jour": "Daily loss limit", "Sons": "Sounds", "Vibrations": "Vibrations", "Infobulles explicatives": "Explanatory tooltips",
    "Mode discret": "Discreet mode", "Exporter ma progression": "Export my progress", "Importer une sauvegarde": "Import a backup", "Réinitialiser le portefeuille": "Reset portfolio", "Tout effacer": "Erase everything",
    "Choisir une image": "Choose an image", "Retirer": "Remove", "Réinitialiser l'apparence": "Reset appearance", "Tes badges": "Your badges"
  };
  let observer = null, busy = false;
  const RX = /^([^\p{L}\d]*)(.*?)([^\p{L}\d.!?…]*)$/u;
  function tr(node) {
    const lang = S().lang;
    if (node.__fr == null) node.__fr = node.nodeValue;
    const fr = node.__fr;
    const EN_ALL = Object.assign({}, EN, (M.I18N && M.I18N.en) || {});
    const DICT = lang === "en" ? EN_ALL : (M.I18N && M.I18N[lang]);
    if (!DICT) { if (node.nodeValue !== fr) node.nodeValue = fr; return; }
    const t = fr.trim();
    if (!t) return;
    let out = DICT[t];
    if (!out) {
      const m = t.match(RX);
      if (m && DICT[m[2]]) out = m[1] + DICT[m[2]] + m[3];
    }
    if (out) node.nodeValue = fr.replace(t, out);
  }
  function walk(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const p = n.parentElement;
      if (p && /SCRIPT|STYLE|TEXTAREA/.test(p.tagName)) continue;
      tr(n);
    }
  }
  M.i18n = {
    apply() {
      busy = true;
      walk(document.body);
      busy = false;
      const on = ["en", "zh", "ru"].includes(S().lang);
      if (on && !observer) {
        observer = new MutationObserver(muts => {
          if (busy) return;
          busy = true;
          muts.forEach(m => m.addedNodes.forEach(n => n.nodeType === 3 ? tr(n) : n.nodeType === 1 && walk(n)));
          busy = false;
        });
        observer.observe(document.body, { childList: true, subtree: true });
      } else if (!on && observer) { observer.disconnect(); observer = null; }
    }
  };

  // ---------- Vue Paramètres ----------
  M.views.settings = function (el, [section]) {
    const s = S();
    const cur = M.currency();
    const row = (title, sub, ctl, tip) => `<div class="set-row" ${tip ? `data-tip-text="${esc(tip)}"` : ""}><div><b>${title}</b>${sub ? `<small>${sub}</small>` : ""}</div><div class="set-ctl">${ctl}</div></div>`;
    const sw = (id, on) => `<label class="switch"><input type="checkbox" id="${id}" ${on ? "checked" : ""}><i></i></label>`;
    const range = (id, min, max, step, v, fmt) => `<input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${v}"><span class="val" id="${id}-v">${fmt(v)}</span>`;
    const photo = M.state.photo;

    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">Paramètres</p><h1>Fais-la à ton image</h1>
      <p class="lede">Thème, police, taille, flou, photo, icône, devise, montants, sons… Tout est sauvegardé sur cet appareil.</p></div></div>
      <div class="set-layout">
        <nav class="set-nav glass">
          <a href="#/settings/apparence">${M.icon("palette")}<span>Apparence</span></a><a href="#/settings/profil">${M.icon("profile")}<span>Profil & icône</span></a><a href="#/settings/langue">${M.icon("globe")}<span>Langue & devise</span></a>
          <a href="#/settings/trading">${M.icon("chart")}<span>Trading</span></a><a href="#/settings/confort">${M.icon("bell")}<span>Sons & confort</span></a><a href="#/settings/donnees">${M.icon("database")}<span>Données</span></a>
        </nav>
        <div>
          <section class="set-sec glass" id="apparence">
            <h2>${M.icon("palette")} Apparence</h2><p class="muted">Les changements s'appliquent immédiatement.</p>
            <div class="set-row"><div><b>Thème</b><small>Ambiance de couleurs de toute l'app.</small></div></div>
            <div class="themes">${THEMES.map(t => `<button class="theme-c ${s.theme === t.id ? "on" : ""}" data-theme="${t.id}" style="background:${t.c[0]}">
              <div class="sw">${t.c.slice(1).map((c, i) => `<i style="background:${c};height:${[34, 24, 16][i]}px"></i>`).join("")}</div>
              <span style="color:${t.id === "clair" ? "#12131C" : "#F2F3F8"}">${t.n}</span></button>`).join("")}</div>
            ${row("Couleur d'accent", "Remplace la couleur principale du thème (boutons, barres, liens).",
              `<input type="color" class="swatch" id="accent" value="${s.accent || "#C6FF3D"}"><button class="btn ghost sm" id="accent-x">Couleur du thème</button>`)}
            ${row("Police du texte", "", `<select id="font">${Object.keys(FONTS).map(k => `<option value="${k}" ${s.font === k ? "selected" : ""}>${FONT_NAMES[k]}</option>`).join("")}</select>`, "Lexend et Atkinson sont conçues pour faciliter la lecture (dyslexie, basse vision).")}
            ${row("Police des titres", "", `<select id="fontHead">${Object.keys(FONTS).map(k => `<option value="${k}" ${s.fontHead === k ? "selected" : ""}>${k === "grotesk" ? "Space Grotesk (défaut)" : FONT_NAMES[k].replace(" (défaut)", "")}</option>`).join("")}</select>`)}
            ${row("Taille du texte", "De 80 % à 140 %.", range("fs", 0.8, 1.4, 0.05, s.fs, v => Math.round(v * 100) + " %"))}
            ${row("Intensité du flou", "Effet « verre dépoli » des panneaux. 0 = désactivé (plus rapide sur les vieux téléphones).", range("blur", 0, 40, 1, s.blur, v => v + " px"))}
            <div class="blur-demo"><div>Aperçu du flou</div></div>
            ${row("Arrondis", "Des angles carrés aux bulles toutes rondes.", range("radius", 0, 32, 1, s.radius, v => v + " px"))}
            ${row("Animations", "Désactive les mouvements (confort visuel, économie de batterie).", sw("motion", s.motion !== false))}
            ${row("Fond d'écran", "Ta propre image en arrière-plan, assombrie pour rester lisible.",
              `<label class="btn ghost sm file-btn">🖼 Choisir une image<input type="file" accept="image/*" id="wall"></label>${s.wall ? `<button class="btn ghost sm" id="wall-x">Retirer</button>` : ""}`)}
            ${s.wall ? row("Assombrissement du fond", "", range("wallDim", 0.2, 0.95, 0.05, s.wallDim, v => Math.round(v * 100) + " %")) : ""}
            <div class="preview-box"><h3 style="margin:0 0 4px">Aperçu du titre</h3><p style="margin:0">Le texte ressemblera à ça. <span class="term" data-tip="rsi">RSI</span>, <span class="mono">98 450,20 $</span>.</p></div>
            <div style="margin-top:14px"><button class="btn ghost sm" id="reset-look">↺ Réinitialiser l'apparence</button></div>
          </section>

          <section class="set-sec glass" id="profil">
            <h2>${M.icon("profile")} Profil & icône</h2><p class="muted">Ton identité dans l'app et l'icône sur ton écran d'accueil.</p>
            ${row("Pseudo", "", `<span class="inp"><input id="pname" maxlength="20" value="${esc(M.state.name || "")}" placeholder="Ton pseudo"></span>`)}
            ${row("Photo de profil", "Recadrée en carré et stockée uniquement sur cet appareil.",
              `<span class="av" style="width:56px;height:56px;font-size:28px">${photo ? `<img src="${photo}" alt="">` : M.level().emoji}</span>
               <label class="btn ghost sm file-btn">📷 Choisir une image<input type="file" accept="image/*" id="photo"></label>${photo ? `<button class="btn ghost sm" id="photo-x">Retirer</button>` : ""}`)}
            ${row("Nom de l'app", "Affiché en haut à gauche et sous l'icône si tu l'installes.", `<span class="inp"><input id="appName" maxlength="16" value="${esc(s.appName || "Mèche")}"></span>`)}
            <div class="set-row"><div><b>Icône de l'app</b><small>Onglet du navigateur, logo, et écran d'accueil si tu installes l'app (menu du navigateur → « Ajouter à l'écran d'accueil »).</small></div></div>
            <div class="icons">${ICONS.map(i => `<button class="ico ${!s.iconImg && s.icon === i ? "on" : ""}" data-ico="${i}">${i}</button>`).join("")}
              ${s.iconImg ? `<button class="ico on" data-tip-text="Ton image perso"><img src="${s.iconImg}" alt=""></button>` : ""}
              <label class="ico file-btn" data-tip-text="Utiliser ta propre image comme icône">＋<input type="file" accept="image/*" id="iconImg"></label></div>
          </section>

          <section class="set-sec glass" id="langue">
            <h2>${M.icon("globe")} Langue & devise</h2><p class="muted">Les prix des marchés restent en dollars (USDT) ; ton portefeuille et tes gains s'affichent dans ta devise.</p>
            ${row("Langue", "L'anglais, le chinois et le russe traduisent l'interface (menus, boutons) ; les cours et le quiz restent en français pour l'instant.",
              `<select id="lang">${[["fr", "🇫🇷 Français"], ["en", "🇬🇧 English (interface)"], ["zh", "🇨🇳 中文（界面）"], ["ru", "🇷🇺 Русский (интерфейс)"]].map(([k, n]) => `<option value="${k}" ${(s.lang || "fr") === k ? "selected" : ""}>${n}</option>`).join("")}</select>`)}
            ${row("Devise d'affichage", `Taux utilisé : 1 $ = ${cur.code === "USD" ? "1 $" : M.fmt$(1)}. Le FCFA suit la parité fixe avec l'euro (1 € = 655,957 FCFA) ; rouble, yen et yuan sont mis à jour en ligne toutes les 12 h${cur.approx ? " (taux approximatif : hors ligne)" : ""}.`,
              `<select id="currency">${Object.keys(CURRENCIES).map(k => `<option value="${k}" ${s.currency === k ? "selected" : ""}>${CURRENCIES[k].n}</option>`).join("")}</select>`)}
          </section>

          <section class="set-sec glass" id="trading">
            <h2>${M.icon("chart")} Trading</h2><p class="muted">Choisis tes montants et tes garde-fous.</p>
            ${row("Capital de départ", `Utilisé pour les missions et à chaque réinitialisation du portefeuille. Actuellement : <b class="mono">${M.fmt$(M.START_CASH)}</b>`,
              `<span class="inp"><input type="number" id="startCash" min="1" step="any" value="${Math.round(M.START_CASH * cur.rate * 100) / 100}"><em>${cur.sym}</em></span>
               <button class="btn primary sm" id="startCash-ok" data-tip-text="Enregistre ce montant ET remet ton portefeuille live à ce montant (l'historique est effacé).">Appliquer</button>`)}
            ${row("Ajouter des fonds virtuels", `Solde actuel : <b class="mono">${M.fmt$(M.state.wallet.cash)}</b>`,
              `<span class="inp"><input type="number" id="addFunds" min="1" step="any" value="${Math.round(1000 * cur.rate)}"><em>${cur.sym}</em></span>
               <button class="btn ghost sm" id="addFunds-ok">＋ Ajouter</button>`)}
            ${row("Levier maximum", "Mode prudent : limite le levier proposé dans le ticket d'ordre.", range("maxLev", 1, 50, 1, s.maxLev, v => "×" + v))}
            ${row("Stop-loss par défaut", "Distance pré-remplie dans le ticket.", range("defSl", 0.5, 10, 0.5, s.defSl, v => String(v).replace(".", ",") + " %"))}
            ${row("Objectif par défaut", "", range("defTp", 0.5, 20, 0.5, s.defTp, v => String(v).replace(".", ",") + " %"))}
            ${row("Limite de perte du jour", "Bloque les nouveaux ordres live si tu as perdu plus que ce % du capital aujourd'hui. 0 = désactivé.", range("dayLoss", 0, 20, 1, s.dayLoss, v => v ? v + " %" : "off"), "Les pros ont tous une limite de perte quotidienne : c'est le meilleur antidote au revenge trading.")}
            ${row("Confirmer chaque ordre", "Une fenêtre de confirmation avant chaque achat / vente.", sw("confirm", s.confirm))}
          </section>

          <section class="set-sec glass" id="confort">
            <h2>${M.icon("bell")} Sons & confort</h2>
            ${row("Sons", "Petits sons sur les trades, les quiz et les niveaux.", sw("sound", s.sound))}
            ${row("Vibrations", "Sur mobile compatible.", sw("haptic", s.haptic))}
            ${row("Infobulles explicatives", "Les bulles qui expliquent chaque bouton et chaque terme.", sw("tips", s.tips !== false))}
            ${row("Délai des infobulles", "", range("tipDelay", 0, 1200, 50, s.tipDelay, v => v + " ms"))}
            ${row("Mode discret", "Floute les montants (pratique pour filmer ou montrer ton écran).", sw("discreet", s.discreet))}
          </section>

          <section class="set-sec glass" id="donnees">
            <h2>${M.icon("database")} Données</h2><p class="muted">Ta progression est stockée dans ce navigateur. Exporte-la pour la garder ou la transférer sur un autre appareil.</p>
            <div class="set-ctl">
              <button class="btn ghost" id="export">⬇️ Exporter ma progression</button>
              <label class="btn ghost file-btn">⬆️ Importer une sauvegarde<input type="file" accept="application/json,.json" id="import"></label>
              <button class="btn ghost" id="rw">💸 Réinitialiser le portefeuille</button>
              <button class="btn danger" id="ra">🗑 Tout effacer</button>
            </div>
          </section>
          ${M.disclaimer()}
        </div>
      </div>`;

    // Re-dessine la page en gardant la position de défilement
    const rerender = () => { const y = window.scrollY; el.innerHTML = ""; M.views.settings(el, []); M.i18n.apply(); window.scrollTo(0, y); };
    const save = (k, v, again) => { s[k] = v; M.save(); M.applySettings(); if (again) rerender(); };
    const bindRange = (id, fmt, k = id, live = true) => {
      const i = $("#" + id, el); if (!i) return;
      i.oninput = () => { $("#" + id + "-v", el).textContent = fmt(+i.value); if (live) save(k, +i.value); };
      if (!live) i.onchange = () => save(k, +i.value);
    };
    const bindSw = (id, k = id, cb) => { const i = $("#" + id, el); if (i) i.onchange = () => { save(k, i.checked); cb && cb(i.checked); }; };
    const upload = (id, max, square, cb) => {
      const i = $("#" + id, el); if (!i) return;
      i.onchange = async () => {
        try { const url = await M.imgToDataURL(i.files[0], max, square); cb(url); }
        catch (e) { M.toast(e.message, "err"); }
      };
    };

    $$(".theme-c", el).forEach(b => b.onclick = () => { s.accent = null; save("theme", b.dataset.theme, true); });
    $("#accent", el).oninput = e => save("accent", e.target.value);
    $("#accent-x", el).onclick = () => save("accent", null, true);
    $("#font", el).onchange = e => save("font", e.target.value);
    $("#fontHead", el).onchange = e => save("fontHead", e.target.value);
    bindRange("fs", v => Math.round(v * 100) + " %");
    bindRange("blur", v => v + " px");
    bindRange("radius", v => v + " px");
    bindRange("wallDim", v => Math.round(v * 100) + " %");
    bindSw("motion");
    upload("wall", 1600, false, url => {
      try { save("wall", url, true); M.toast("Fond d'écran appliqué 🖼"); }
      catch (e) { s.wall = null; M.toast("Image trop lourde pour ce navigateur.", "err"); }
    });
    const wx = $("#wall-x", el); if (wx) wx.onclick = () => save("wall", null, true);
    $("#reset-look", el).onclick = () => {
      ["theme", "accent", "font", "fontHead", "fs", "blur", "radius", "motion", "wall", "wallDim"].forEach(k => s[k] = M.SETTINGS_DEFAULT[k]);
      M.save(); M.applySettings(); rerender();
    };

    $("#pname", el).onchange = e => { M.state.name = e.target.value.trim().slice(0, 20); M.save(); M.updateTopbar(); M.toast("Pseudo enregistré ✓"); };
    upload("photo", 320, true, url => { M.state.photo = url; M.save(); M.updateTopbar(); M.toast("Photo de profil mise à jour 📷"); rerender(); });
    const px = $("#photo-x", el); if (px) px.onclick = () => { M.state.photo = null; M.save(); M.updateTopbar(); rerender(); };
    $("#appName", el).onchange = e => save("appName", e.target.value.trim().slice(0, 16) || "Mèche");
    $$("[data-ico]", el).forEach(b => b.onclick = () => { s.iconImg = null; save("icon", b.dataset.ico, true); });
    upload("iconImg", 512, true, url => save("iconImg", url, true));

    $("#lang", el).onchange = e => { save("lang", e.target.value); rerender(); };
    $("#currency", el).onchange = e => save("currency", e.target.value, true);

    $("#startCash-ok", el).onclick = () => {
      const v = parseFloat($("#startCash", el).value) / M.currency().rate;
      if (!(v > 0)) return M.toast("Montant invalide", "err");
      if (M.state.wallet.pos && !confirm("Une position est ouverte : elle sera supprimée. Continuer ?")) return;
      s.startCash = v;
      M.state.wallet = { cash: v, pos: null, log: [] };
      M.save(true); M.toast("Capital fixé à " + M.fmt$(v) + " 💰"); rerender();
    };
    $("#addFunds-ok", el).onclick = () => {
      const v = parseFloat($("#addFunds", el).value) / M.currency().rate;
      if (!(v > 0)) return M.toast("Montant invalide", "err");
      M.state.wallet.cash += v;
      M.save(true); M.toast("+" + M.fmt$(v) + " ajoutés 💸"); rerender();
    };
    bindRange("maxLev", v => "×" + v);
    bindRange("defSl", v => String(v).replace(".", ",") + " %");
    bindRange("defTp", v => String(v).replace(".", ",") + " %");
    bindRange("dayLoss", v => v ? v + " %" : "off");
    bindSw("confirm");

    bindSw("sound", "sound", on => on && M.sfx("ok"));
    bindSw("haptic");
    bindSw("tips");
    bindRange("tipDelay", v => v + " ms");
    bindSw("discreet");

    $("#export", el).onclick = () => {
      const blob = new Blob([JSON.stringify(M.state, null, 1)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `meche-progression-${M.u.today()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    $("#import", el).onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const fr = new FileReader();
      fr.onload = () => {
        try {
          const d = JSON.parse(fr.result);
          if (!d || typeof d !== "object" || !d.wallet || d.xp == null) throw new Error();
          if (!confirm("Remplacer ta progression actuelle par cette sauvegarde ?")) return;
          localStorage.setItem("meche:v1", JSON.stringify(d));
          location.reload();
        } catch (err) { M.toast("Fichier de sauvegarde invalide", "err"); }
      };
      fr.readAsText(f);
    };
    $("#rw", el).onclick = () => {
      if (!confirm("Remettre le portefeuille à " + M.fmt$(M.START_CASH) + " et effacer l'historique de trades ?")) return;
      M.state.wallet = { cash: M.START_CASH, pos: null, log: [] }; M.save(true); M.toast("Portefeuille réinitialisé"); rerender();
    };
    $("#ra", el).onclick = () => {
      if (!confirm("Effacer TOUTE ta progression (XP, badges, photo, réglages) ? C'est irréversible.")) return;
      localStorage.removeItem("meche:v1"); location.hash = "#/home"; location.reload();
    };

    // Sommaire : défile vers la section demandée
    const secs = ["apparence", "profil", "langue", "trading", "confort", "donnees"];
    $$(".set-nav a", el).forEach(a => a.classList.toggle("on", a.getAttribute("href").endsWith("/" + (section || "apparence"))));
    if (section && secs.includes(section)) setTimeout(() => { const t = $("#" + section, el); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }, 30);
  };
})();
