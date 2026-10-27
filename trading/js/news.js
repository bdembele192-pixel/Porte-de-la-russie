/* Actus : communiqués officiels collectés par le robot GitHub (scripts/fetch-news.mjs),
   relus toutes les 2 minutes, + mouvements des marchés en direct. */
window.M = window.M || {};

(function () {
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const CATS = ["Tout", "Banques centrales", "Institutions", "Régulateurs", "Statistiques", "Énergie", "Afrique"];
  const CAT_IC = { "Banques centrales": "database", "Institutions": "globe", "Régulateurs": "shield", "Statistiques": "chart", "Énergie": "flame", "Afrique": "globe" };

  const N = M.News = { items: [], sources: [], generatedAt: null, loaded: false, error: null };
  let lastMax = 0;

  function ago(iso) {
    if (!iso) return "";
    const mn = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
    if (mn < 1) return "à l'instant";
    if (mn < 60) return `il y a ${mn} min`;
    if (mn < 1440) return `il y a ${Math.round(mn / 60)} h`;
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }
  N.ago = ago;
  const seenAt = () => (M.state.newsSeen || 0);
  N.unseen = () => N.items.filter(i => Date.parse(i.date) > seenAt()).length;

  async function load() {
    // Relais (s'il est installé) : communiqués de moins de 5 min ; sinon fichier du robot GitHub
    const relay = M.CONFIG && M.CONFIG.relayUrl ? [M.CONFIG.relayUrl.replace(/\/$/, "") + "/news"] : [];
    const urls = relay.concat((M.CONFIG && M.CONFIG.newsUrls) || ["data/news.json"]);
    for (const u of urls) {
      try {
        const r = await fetch(u + (u.includes("?") ? "&" : "?") + "t=" + Math.floor(Date.now() / 60000), { cache: "no-store" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const d = await r.json();
        if (!d || !Array.isArray(d.items)) throw new Error("format");
        // On garde la version la plus récente entre les sources
        if (N.generatedAt && d.generatedAt && Date.parse(d.generatedAt) < Date.parse(N.generatedAt)) continue;
        N.items = d.items; N.sources = d.sources || []; N.generatedAt = d.generatedAt; N.loaded = true; N.error = null;
        // Premier chargement : on ne compte comme « nouveaux » que les communiqués publiés après l'installation
        if (!M.state.newsSeen) { M.state.newsSeen = Date.now(); M.save(); }
        onUpdate();
        return true;
      } catch (e) { N.error = e.message; }
    }
    N.loaded = true;
    return false;
  }
  N.load = load;

  function onUpdate() {
    const max = N.items.reduce((m, i) => Math.max(m, Date.parse(i.date) || 0), 0);
    if (lastMax && max > lastMax) {
      const fresh = N.items.filter(i => Date.parse(i.date) > lastMax).slice(0, 3);
      fresh.forEach(i => {
        M.toast(`📰 ${i.source} : ${i.title.slice(0, 90)}`, "xp");
        try {
          if (M.state.settings.newsAlerts !== false && document.hidden && "Notification" in window && Notification.permission === "granted")
            new Notification("Mèche · " + i.source, { body: i.title });
        } catch (e) { /* notifications indisponibles */ }
      });
    }
    lastMax = max;
    if (M.AI && M.AI.resetIndex) M.AI.resetIndex();
    badge();
    if (location.hash.startsWith("#/news") && N.redraw) N.redraw();
  }
  function badge() {
    const a = document.querySelector('.nav a[data-nav="news"]');
    if (!a) return;
    let b = a.querySelector(".nbadge");
    const n = location.hash.startsWith("#/news") ? 0 : N.unseen();
    if (!n) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement("b"); b.className = "nbadge"; a.appendChild(b); }
    b.textContent = n > 99 ? "99+" : n;
  }
  N.badge = badge;

  // ---------- Vue ----------
  M.views.news = function (el) {
    let cat = "Tout", q = "";
    const prevSeen = seenAt();
    M.state.newsSeen = Date.now(); M.save(); badge();
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">${M.icon("globe")} <span>Actus</span></p><h1>L'actu des marchés, <span class="grad">à la source</span></h1>
      <p class="lede">Communiqués officiels des banques centrales, du FMI, de la Banque mondiale, de l'OMC, de l'ONU, des régulateurs et des instituts de statistiques. Collectés automatiquement à la source, sans intermédiaire : toutes les 4 minutes avec le relais, sinon plusieurs fois par jour par le robot GitHub.</p></div></div>
      <div class="glass pad news-status" id="n-status"></div>
      <div class="sec-head"><h2>Mouvements <span class="muted">en direct</span></h2><span class="pill" id="mv-mode">…</span></div>
      <div class="movers" id="movers"></div>
      <div class="sec-head"><h2>Communiqués officiels</h2></div>
      <div class="news-tools">
        <div class="chips-cat">${CATS.map(c => `<button class="chip-b ${c === cat ? "on" : ""}" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>
        <input class="search" id="n-q" placeholder="Rechercher : Fed, inflation, taux, Afrique…" autocomplete="off">
      </div>
      <div class="news-list" id="n-list"></div>
      ${M.disclaimer()}`;

    function drawStatus() {
      const ok = N.sources.filter(s => s.ok).length;
      $("#n-status", el).innerHTML = N.generatedAt
        ? `<div class="ns-row"><span>${M.icon("refresh")} Dernière collecte <b>${ago(N.generatedAt)}</b> · <b>${ok}/${N.sources.length}</b> sources actives · ${N.items.length} communiqués</span>
            <button class="btn ghost sm" id="n-src">Voir les sources</button></div>
           <div class="ns-src" id="ns-src" hidden>${N.sources.map(s => `<span class="chip ${s.ok ? "ok" : "d-ext"}" data-tip-text="${esc(s.ok ? s.count + " articles récupérés" : "Indisponible : " + (s.error || "erreur"))}">${s.ok ? "●" : "○"} ${esc(s.name)}</span>`).join("")}</div>`
        : `<div class="ns-row"><span>${M.icon("refresh")} ${N.error && !N.loaded ? "Chargement…" : "La première collecte n'a pas encore eu lieu : elle démarre automatiquement dès la mise en ligne (relais, ou robot GitHub)."}</span></div>`;
      const b = $("#n-src", el); if (b) b.onclick = () => { const x = $("#ns-src", el); x.hidden = !x.hidden; };
    }
    function drawList() {
      const qq = q.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      const list = N.items.filter(i => (cat === "Tout" || i.cat === cat) &&
        (!qq || (i.title + " " + i.summary + " " + i.source).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(qq))).slice(0, 80);
      $("#n-list", el).innerHTML = list.length ? list.map(i => `
        <article class="news glass ${Date.parse(i.date) > prevSeen && prevSeen ? "fresh" : ""}">
          <div class="nw-h"><span class="nw-ic">${M.icon(CAT_IC[i.cat] || "globe")}</span><b>${esc(i.source)}</b><span class="chip">${esc(i.cat)}</span>
            <span class="muted small" title="${esc(new Date(i.date).toLocaleString("fr-FR"))}">${ago(i.date)}</span>${Date.parse(i.date) > prevSeen && prevSeen ? `<span class="chip daily">NOUVEAU</span>` : ""}</div>
          <a class="nw-t" href="${esc(i.url)}" target="_blank" rel="noopener noreferrer">${esc(i.title)}</a>
          ${i.summary ? `<p>${esc(i.summary)}</p>` : ""}
          <div class="nw-a"><a class="btn ghost sm" href="${esc(i.url)}" target="_blank" rel="noopener noreferrer">Source officielle ↗</a>
            <button class="btn ghost sm" data-ask="${esc(i.id)}">${M.icon("ai")} Expliquer avec l'IA</button></div>
        </article>`).join("")
        : `<div class="glass pad muted">${N.items.length ? "Aucun communiqué pour ce filtre." : "Aucun communiqué pour l'instant."}</div>`;
      $$("[data-ask]", el).forEach(b => b.onclick = () => {
        const it = N.items.find(x => x.id === b.dataset.ask);
        if (it && M.AI) M.AI.openChat(`Explique simplement ce communiqué et son impact possible sur les marchés : « ${it.title} » (${it.source}, ${new Date(it.date).toLocaleDateString("fr-FR")}). ${it.summary || ""}`);
      });
    }
    async function movers() {
      const syms = M.Market.ASSETS.map(a => a.sym);
      const r = await M.Market.tickers(syms);
      const box = $("#movers", el); if (!box) return;
      const mode = $("#mv-mode", el);
      mode.textContent = r.live ? "● Binance live" : "● Démo"; mode.className = "pill " + (r.live ? "live" : "demo");
      const rows = syms.map(s => ({ a: M.Market.asset(s), d: r.data[s] })).filter(x => x.d).sort((x, y) => Math.abs(y.d.chg) - Math.abs(x.d.chg));
      box.innerHTML = rows.map(({ a, d }) => {
        const big = Math.abs(d.chg) >= 5, mid = Math.abs(d.chg) >= 2;
        const txt = big ? (d.chg > 0 ? "s'envole" : "chute fortement") : mid ? (d.chg > 0 ? "progresse nettement" : "recule nettement") : (d.chg > 0 ? "légère hausse" : "légère baisse");
        return `<a class="mover glass" href="#/live/${a.sym}" data-tip="${a.tip}"><span class="tk-ic sm" style="--c:${a.color}">${a.icon}</span>
          <span><b>${a.name}</b><small>${txt} sur 24 h</small></span><b class="mono ${d.chg >= 0 ? "up" : "dn"}">${d.chg >= 0 ? "+" : ""}${d.chg.toFixed(2).replace(".", ",")} %</b></a>`;
      }).join("");
    }

    $$(".chip-b", el).forEach(b => b.onclick = () => { cat = b.dataset.c; $$(".chip-b", el).forEach(x => x.classList.toggle("on", x === b)); drawList(); });
    $("#n-q", el).oninput = e => { q = e.target.value; drawList(); };
    N.redraw = () => { drawStatus(); drawList(); };
    drawStatus(); drawList(); movers();
    load();
    const iv = setInterval(movers, 60000);
    return () => { clearInterval(iv); N.redraw = null; };
  };

  document.addEventListener("DOMContentLoaded", () => {
    load();
    setInterval(load, 120000);
    window.addEventListener("hashchange", badge);
  });
})();
