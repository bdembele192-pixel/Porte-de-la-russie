/* Bourses mondiales et BRVM : cours gratuits collectés toutes les 5 minutes par le robot GitHub
   (trading/scripts/fetch-quotes.mjs → data/quotes.json et data/history.json). Données différées. */
window.M = window.M || {};

(function () {
  const Q = M.Quotes = { items: [], byId: {}, generatedAt: null, source: "", live: false, loaded: false, hist: null };
  const urls = k => (M.CONFIG && M.CONFIG[k]) || [];
  const bust = u => u + (u.includes("?") ? "&" : "?") + "t=" + Math.floor(Date.now() / 60000);

  async function getJSON(list) {
    let best = null;
    for (const u of list) {
      try {
        const r = await fetch(bust(u), { cache: "no-store" });
        if (!r.ok) continue;
        const d = await r.json();
        if (d && (!best || Date.parse(d.generatedAt || 0) > Date.parse(best.generatedAt || 0))) best = d;
      } catch (e) { /* source suivante */ }
    }
    return best;
  }

  Q.load = async function () {
    const d = await getJSON(urls("quotesUrls"));
    Q.loaded = true;
    if (!d || !Array.isArray(d.items) || !d.items.length) return false;
    Q.items = d.items; Q.generatedAt = d.generatedAt; Q.source = d.source || "";
    Q.byId = {}; d.items.forEach(i => Q.byId[i.id] = i);
    Q.live = true;
    return true;
  };
  Q.history = async function () {
    if (Q.hist) return Q.hist;
    const d = await getJSON(urls("historyUrls"));
    Q.hist = (d && d.items) || {};
    return Q.hist;
  };

  // Barres au format de l'app ({t,o,h,l,c,v}) : « 1J » = journée en 15 min, sinon bougies journalières
  const toBar = a => ({ t: a[0], o: a[1], h: a[2], l: a[3], c: a[4], v: a[5] || 0 });
  Q.bars = async function (id, range) {
    const it = Q.byId[id];
    if (!it) return [];
    if (range === "1J" && it.bars && it.bars.length > 2) return it.bars.map(toBar);
    const h = (await Q.history())[id] || [];
    // Pas assez de bougies du jour (marché fermé, source muette) : on montre les 10 dernières séances
    const n = { "1J": 10, "1S": 5, "1M": 22, "3M": 66, "1A": 260 }[range] || 66;
    return h.slice(-n).map(toBar);
  };

  // Format d'un prix selon sa taille
  Q.fmt = function (p) {
    if (p == null || isNaN(p)) return "—";
    const d = p >= 1000 ? 2 : p >= 10 ? 2 : p >= 1 ? 4 : 5;
    return p.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  // Âge des données en clair
  Q.age = function (ms) {
    if (!ms) return "";
    const mn = Math.round((Date.now() - ms) / 60000);
    if (mn < 1) return "à l'instant";
    if (mn < 60) return `il y a ${mn} min`;
    if (mn < 1440) return `il y a ${Math.round(mn / 60)} h`;
    return new Date(ms).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  document.addEventListener("DOMContentLoaded", () => { Q.load(); setInterval(Q.load, 120000); });
})();
