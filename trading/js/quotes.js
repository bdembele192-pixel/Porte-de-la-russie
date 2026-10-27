/* Bourses mondiales et BRVM : cours gratuits.
   - Monde (indices, actions, matières premières, devises) : lus directement par le navigateur chez CNBC
     toutes les 30 s, graphiques compris.
   - BRVM : par le relais (M.CONFIG.relayUrl, voir relay/README.md) toutes les 60 s s'il est configuré,
     sinon par le fichier du robot GitHub (data/quotes.json), mis à jour quand GitHub lance le robot.
   - En dernier recours : la dernière copie connue du robot. */
window.M = window.M || {};

(function () {
  const Q = M.Quotes = { items: [], byId: {}, generatedAt: null, source: "", live: false, loaded: false, hist: null, lastLive: 0, brvmAt: 0, fileAt: 0 };
  const MD = M.MD;
  const cfg = k => (M.CONFIG && M.CONFIG[k]) || null;
  const bust = u => u + (u.includes("?") ? "&" : "?") + "t=" + Math.floor(Date.now() / 30000);
  const ORDER = MD.WORLD.map(w => w[0]);

  async function getJSON(list) {
    let best = null;
    for (const u of list || []) {
      try {
        const r = await fetch(bust(u), { cache: "no-store" });
        if (!r.ok) continue;
        const d = await r.json();
        if (d && (!best || Date.parse(d.generatedAt || 0) > Date.parse(best.generatedAt || 0))) best = d;
      } catch (e) { /* source suivante */ }
    }
    return best;
  }
  async function getText(u, ms = 12000) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), ms);
    try { const r = await fetch(u, { cache: "no-store", signal: ctl.signal }); if (!r.ok) throw new Error("HTTP " + r.status); return await r.text(); }
    finally { clearTimeout(to); }
  }
  const getLive = async u => JSON.parse(await getText(u));

  // Range les cours : monde (ordre de la liste), puis BRVM (indices d'abord)
  function rebuild(list) {
    const by = {};
    list.forEach(i => { by[i.id] = Object.assign(by[i.id] || {}, i); });
    Q.items = Object.values(by).sort((a, b) => {
      const ra = ORDER.indexOf(a.id), rb = ORDER.indexOf(b.id);
      if (ra >= 0 || rb >= 0) return (ra < 0 ? 999 : ra) - (rb < 0 ? 999 : rb);
      return (a.type === "BRVM indice" ? 0 : 1) - (b.type === "BRVM indice" ? 0 : 1);
    });
    Q.byId = {}; Q.items.forEach(i => Q.byId[i.id] = i);
    Q.live = Q.items.length > 0;
  }

  // ---------- 1. Copie du robot GitHub (secours) ----------
  async function loadFile() {
    Q.fileAt = Date.now();
    const d = await getJSON(cfg("quotesUrls"));
    if (!d || !Array.isArray(d.items) || !d.items.length) return false;
    Q.generatedAt = d.generatedAt; Q.source = d.source || "";
    const t = Date.parse(d.generatedAt) || 0;
    // On ne remplace jamais un cours plus récent déjà obtenu en direct
    rebuild(Q.items.concat(d.items.filter(i => { const cur = Q.byId[i.id]; return !cur || (cur.at || 0) < t; }).map(i => ({ ...i, at: t, fromFile: true }))));
    return true;
  }

  // ---------- 2. Monde : CNBC en direct ----------
  async function liveWorld() {
    const now = Date.now(), out = [];
    for (let i = 0; i < MD.WORLD.length; i += 15) {
      const part = MD.WORLD.slice(i, i + 15);
      const qs = MD.parseQuotes(await getLive(MD.quoteUrl(part.map(w => w[1]))));
      part.forEach(w => { if (qs[w[1]]) { const it = MD.cnbcItem(w, qs[w[1]], now); delete it.bars; out.push(it); } });
    }
    if (!out.length) throw new Error("aucun cours");
    rebuild(Q.items.concat(out.map(i => ({ ...i, fromFile: false }))));
    Q.lastLive = now;
    return out.length;
  }

  // ---------- 3. BRVM : relais (si configuré) ----------
  async function liveBRVM() {
    const relay = cfg("relayUrl");
    if (!relay) return false;
    const d = await getLive(relay.replace(/\/$/, "") + "/brvm");
    if (!d || !Array.isArray(d.items) || !d.items.length) return false;
    rebuild(Q.items.concat(d.items.map(i => ({ ...i, fromFile: false }))));
    Q.brvmAt = Date.now();
    return true;
  }

  Q.load = async function () {
    if (!Q.loaded) await loadFile().catch(() => false);
    Q.loaded = true;
    return Q.live;
  };
  let busy = false;
  Q.refresh = async function () {
    if (busy) return; busy = true;
    try {
      await Promise.allSettled([liveWorld(), liveBRVM()]);
      // Ce qui n'a pas de direct (BRVM sans relais, source bloquée) : copie du robot relue toutes les 5 min
      if ((Date.now() - Q.lastLive > 90e3 || !Q.brvmAt) && Date.now() - Q.fileAt > 300e3) await loadFile().catch(() => false);
    } finally { busy = false; }
    document.dispatchEvent(new CustomEvent("quotes:update"));
  };

  // ---------- Graphiques ----------
  const cache = {};
  async function cnbcSeries(cs, span, conv) {
    const k = cs + span, c = cache[k];
    if (c && Date.now() - c.t < (span === "1Y" ? 600e3 : 60e3)) return c.v;
    const v = conv(MD.parseBars(await getLive(MD.chartUrl(cs, span))));
    cache[k] = { t: Date.now(), v };
    return v;
  }
  Q.history = async function () {
    if (Q.hist) return Q.hist;
    const d = await getJSON(cfg("historyUrls"));
    Q.hist = (d && d.items) || {};
    return Q.hist;
  };
  const toBar = a => ({ t: a[0], o: a[1], h: a[2], l: a[3], c: a[4], v: a[5] || 0 });
  // « 1J » = dernière séance en 15 min, « 1S » = semaine en 1 h, au-delà : bougies journalières
  Q.bars = async function (id, range) {
    const it = Q.byId[id];
    if (!it) return [];
    const w = MD.WORLD.find(x => x[0] === id);
    if (w) {
      try {
        let b;
        if (range === "1J") b = await cnbcSeries(w[1], "5D", MD.to15m);
        else if (range === "1S") b = await cnbcSeries(w[1], "5D", MD.toHourly);
        else b = (await cnbcSeries(w[1], "1Y", MD.daily)).slice(-({ "1M": 22, "3M": 66 }[range] || 262));
        if (b.length >= 3) return b.map(toBar);
      } catch (e) { /* source directe indisponible : copie du robot */ }
      if (range === "1J" && it.bars && it.bars.length > 2) return it.bars.map(toBar);
    }
    const h = (await Q.history())[id] || [];
    // Pas assez de bougies du jour (marché fermé, source muette) : les 10 dernières séances
    const n = { "1J": 10, "1S": 5, "1M": 22, "3M": 66, "1A": 260 }[range] || 66;
    return h.slice(-n).map(toBar);
  };

  // Format d'un prix selon sa taille
  Q.fmt = function (p) {
    if (p == null || isNaN(p)) return "—";
    const d = p >= 10 ? 2 : p >= 1 ? 4 : 5;
    return p.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  // Âge des données en clair
  Q.age = function (ms) {
    if (!ms) return "";
    const s = Math.round((Date.now() - ms) / 1000);
    if (s < 60) return "à l'instant";
    const mn = Math.round(s / 60);
    if (mn < 60) return `il y a ${mn} min`;
    if (mn < 1440) return `il y a ${Math.round(mn / 60)} h`;
    return new Date(ms).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };
  // Fraîcheur lisible d'un cours : « en direct », « séance close », « il y a 3 h »…
  Q.fresh = function (q) {
    if (!q) return "";
    if (/^BRVM/.test(q.type)) return (q.open_ ? "séance en cours" : "clôture") + " · " + Q.age(q.time);
    if (!q.fromFile && q.open_) return q.rt ? "en direct" : "différé 15 min";
    if (!q.fromFile) return "marché fermé · " + Q.age(q.time);
    return "copie " + Q.age(q.at);
  };

  document.addEventListener("DOMContentLoaded", () => {
    Q.load().then(Q.refresh);
    setInterval(() => { if (!document.hidden) Q.refresh(); }, 30000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden && Date.now() - Q.lastLive > 30e3) Q.refresh(); });
  });
})();
