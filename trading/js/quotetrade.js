/* Trading papier sur les cours différés (M.Quotes) : indices, actions, matières premières, devises et BRVM.
   Les actifs s'appellent « Q:<id> » (ex. Q:AAPL, Q:BRVM:SNTS) et passent par la même API que les cryptos
   Binance (M.Market.asset / klines / tickers / stream), ce qui permet au terminal Live de les traiter pareil.
   Règles réalistes : horaires de séance, levier plafonné par type de marché, pas de vente à découvert ni de
   levier à la BRVM, limite de variation quotidienne de ±7,5 % à la BRVM. */
window.M = window.M || {};

(function () {
  const Mk = M.Market, Q = M.Quotes;
  const base = { asset: Mk.asset, klines: Mk.klines, tickers: Mk.tickers, stream: Mk.stream };
  const isQ = s => typeof s === "string" && s.startsWith("Q:");

  // Règles par type de marché : levier max, vente à découvert, place de cotation (horaires)
  const RULES = {
    "Indice": { lev: 10, short: true, how: "CFD sur indice" },
    "Action": { lev: 5, short: true, how: "CFD sur action" },
    "Matière première": { lev: 10, short: true, how: "contrat à terme (future)" },
    "Forex": { lev: 20, short: true, how: "paire de devises" },
    "BRVM": { lev: 1, short: false, how: "action au comptant via une SGI" }
  };
  const STYLE = { "Indice": ["▤", "#E8B64C", "indice"], "Action": ["◆", "#4D8BFF", "action"], "Matière première": ["◉", "#C47A32", "matieres-premieres"],
    "Forex": ["¤", "#2BEA8B", "forex"], "BRVM": ["▲", "#2BEA8B", "brvm"], "BRVM indice": ["▤", "#14B866", "brvm"], "Taux": ["%", "#C4B5FD", "obligation"] };

  // Horaires de séance (heure locale de la place) · [fuseau, jours ouvrés, ouverture, fermeture]
  const SESS = {
    US: ["America/New_York", "9:30", "16:00", "Wall Street"],
    PAR: ["Europe/Paris", "9:00", "17:30", "Euronext Paris"],
    FRA: ["Europe/Berlin", "9:00", "17:30", "Francfort (Xetra)"],
    LON: ["Europe/London", "8:00", "16:30", "Londres"],
    TYO: ["Asia/Tokyo", "9:00", "15:30", "Tokyo"],
    HKG: ["Asia/Hong_Kong", "9:30", "16:00", "Hong Kong"],
    BRVM: ["Africa/Abidjan", "9:45", "15:00", "BRVM (Abidjan)"]
  };
  const PLACE = { SPX: "US", NDX: "US", DJI: "US", CAC: "PAR", DAX: "FRA", FTSE: "LON", N225: "TYO", HSI: "HKG" };
  const placeOf = q => /^BRVM/.test(q.type) ? "BRVM" : q.type === "Action" ? "US" : PLACE[q.id] || "H24";

  const DAYS = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
  function local(tz, now) {
    const p = {};
    new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(now).forEach(x => p[x.type] = x.value);
    return { d: DAYS[p.weekday], m: (+p.hour) * 60 + (+p.minute) };
  }
  const mins = s => { const [h, m] = s.split(":"); return +h * 60 + +m; };

  /* État du marché : { open, label, place }. Matières premières et devises : du dimanche 17 h au vendredi 17 h (New York),
     avec la pause quotidienne de 17 h à 18 h des contrats à terme. */
  function session(q, now = new Date()) {
    const pl = placeOf(q);
    if (pl === "H24") {
      const { d, m } = local("America/New_York", now);
      const fx = q.type === "Forex";
      const closed = d === 6 || (d === 0 && m < 17 * 60) || (d === 5 && m >= 17 * 60) || (!fx && m >= 17 * 60 && m < 18 * 60);
      return { open: !closed, place: fx ? "marché des changes (24 h/24, 5 j/7)" : "marché à terme (quasi 24 h/24, 5 j/7)", hours: fx ? "dim. 17 h → ven. 17 h (New York)" : "dim. 18 h → ven. 17 h (New York), pause 17 h–18 h" };
    }
    const [tz, o, c, name] = SESS[pl];
    const { d, m } = local(tz, now);
    const open = d >= 1 && d <= 5 && m >= mins(o) && m < mins(c);
    return { open, place: name, hours: `lun.–ven. ${o.replace(":", " h ")} → ${c.replace(":", " h ")} (heure de la place)`.replace(/ h 00/g, " h") };
  }

  const tradable = q => !!(q && RULES[q.type]);

  function qAsset(sym) {
    const id = sym.slice(2), q = Q.byId[id] || { id, name: id.replace(/^BRVM:/, ""), short: id.replace(/^BRVM:/, ""), type: /^BRVM:/.test(id) ? "BRVM" : "Action", cur: "" };
    const st = STYLE[q.type] || STYLE.Action, r = RULES[q.type] || { lev: 1, short: false, how: "" };
    return {
      sym, short: q.short, name: q.name, type: q.type, icon: st[0], color: st[1], tip: M.GLOSSARY[st[2]] ? st[2] : "action",
      quote: true, id, cur: q.cur, maxLev: r.lev, canShort: r.short, how: r.how, tradable: tradable(q)
    };
  }

  // ---------- Bougies ----------
  const agg = (bars, step) => {
    const out = [];
    bars.forEach(b => {
      const t = Math.floor(b.t / step) * step, l = out[out.length - 1];
      if (l && l.t === t) { l.h = Math.max(l.h, b.h); l.l = Math.min(l.l, b.l); l.c = b.c; l.v += b.v || 0; }
      else out.push({ t, o: b.o, h: b.h, l: b.l, c: b.c, v: b.v || 0 });
    });
    return out;
  };
  const QTF = ["15m", "1h", "4h", "1d"];
  async function qKlines(sym, tf) {
    if (!Q.loaded) await Q.load();
    const id = sym.slice(2), q = Q.byId[id];
    const t = QTF.includes(tf) ? tf : "15m";
    let bars = [];
    try {
      if (t === "15m") bars = await Q.bars(id, "1J");
      else if (t === "1h") bars = await Q.bars(id, "1S");
      else if (t === "4h") bars = agg(await Q.bars(id, "1S"), 4 * 3600e3);
      else bars = await Q.bars(id, "1A");
    } catch (e) { bars = []; }
    if (bars.length < 3 && t !== "1d") { try { bars = await Q.bars(id, "1A"); } catch (e) { /* rien */ } }
    bars = bars.filter(b => b && b.c > 0);
    // Le dernier cours connu complète la dernière bougie
    if (q && q.price > 0) {
      const step = Mk.TF[t], now = Date.now(), last = bars[bars.length - 1];
      const bt = Math.floor((q.time || now) / step) * step;
      if (last && last.t === bt) { last.c = q.price; last.h = Math.max(last.h, q.price); last.l = Math.min(last.l, q.price); }
      else if (!last || bt > last.t) bars.push({ t: bt, o: q.price, h: q.price, l: q.price, c: q.price, v: 0 });
    }
    if (!bars.length) return { bars: [{ t: Date.now(), o: 1, h: 1, l: 1, c: 1, v: 0 }], live: false, quote: true, empty: true };
    return { bars, live: true, quote: true, tf: t };
  }

  /* Flux d'un cours différé : relit M.Quotes toutes les 30 s et met à jour la bougie en cours. */
  function qStream(sym, tf, lastBar, onBar, onMode) {
    const id = sym.slice(2), step = Mk.TF[QTF.includes(tf) ? tf : "15m"];
    let cur = Object.assign({}, lastBar), closed = false, lastPx = lastBar && lastBar.c;
    const tick = async (refresh) => {
      if (closed) return;
      if (refresh) await Q.refresh().catch(() => {});
      const q = Q.byId[id];
      if (!q || !(q.price > 0) || closed) return;
      onMode && onMode(q.fromFile ? "qfile" : "qlive");
      if (q.price === lastPx && cur.c === q.price) return;
      lastPx = q.price;
      const bt = Math.floor(Date.now() / step) * step;
      if (bt > cur.t) { onBar(Object.assign({}, cur), true); cur = { t: bt, o: cur.c, h: cur.c, l: cur.c, c: cur.c, v: 0 }; }
      cur.c = q.price; cur.h = Math.max(cur.h, q.price); cur.l = Math.min(cur.l, q.price);
      onBar(Object.assign({}, cur), false);
    };
    const onUpd = () => tick(false);
    document.addEventListener("quotes:update", onUpd);
    tick(false);
    const iv = setInterval(() => tick(true), 30000);
    return { close() { closed = true; clearInterval(iv); document.removeEventListener("quotes:update", onUpd); }, forceSim() {} };
  }

  // ---------- Branchement sur l'API commune ----------
  Mk.asset = sym => isQ(sym) ? qAsset(sym) : base.asset(sym);
  Mk.klines = (sym, tf, o) => isQ(sym) ? qKlines(sym, tf, o) : base.klines(sym, tf, o);
  Mk.stream = (sym, tf, last, onBar, onMode) => isQ(sym) ? qStream(sym, tf, last, onBar, onMode) : base.stream(sym, tf, last, onBar, onMode);
  Mk.tickers = async syms => {
    const qs = syms.filter(isQ), bs = syms.filter(s => !isQ(s));
    const r = bs.length ? await base.tickers(bs) : { data: {}, live: true };
    if (qs.length && !Q.loaded) await Q.load().catch(() => {});
    qs.forEach(s => { const q = Q.byId[s.slice(2)]; if (q) r.data[s] = { last: q.price, chg: +q.chg || 0, vol: 0 }; });
    return r;
  };

  /* Tout ce qui est échangeable, regroupé pour la liste des marchés du terminal. */
  function groups() {
    const its = (Q.items || []).filter(tradable);
    return [
      ["Bourses", its.filter(q => q.type === "Indice" || q.type === "Action")],
      ["Matières", its.filter(q => q.type === "Matière première")],
      ["Devises", its.filter(q => q.type === "Forex")],
      ["BRVM", its.filter(q => q.type === "BRVM")]
    ].filter(g => g[1].length);
  }

  /* Contrôle avant un ordre sur un cours différé. Renvoie un message d'erreur ou null. */
  function guard(sym, dir, lev, price) {
    if (!isQ(sym)) return null;
    const q = Q.byId[sym.slice(2)];
    if (!q) return "Cours indisponible pour l'instant.";
    if (!tradable(q)) return `${q.name} n'est pas un produit qu'on peut acheter directement (indice de référence ou taux).`;
    const a = qAsset(sym), s = session(q);
    if (!s.open) return `Marché fermé : ${s.place} ouvre ${s.hours}. Ton ordre n'est pas passé, comme chez un vrai courtier.`;
    if (dir < 0 && !a.canShort) return "Pas de vente à découvert à la BRVM : on ne peut vendre que des actions qu'on possède. Passe un ordre long.";
    if (lev > a.maxLev) return a.maxLev === 1 ? "Pas d'effet de levier sur les actions BRVM achetées au comptant : mets le levier à ×1." : `Levier maximum sur ce marché : ×${a.maxLev} (${a.how}).`;
    if (q.type === "BRVM" && q.prev > 0 && Math.abs(price / q.prev - 1) > 0.075) return "Limite de variation de la BRVM (±7,5 % par séance) atteinte : le titre est réservé.";
    return null;
  }

  M.QTrade = { isQ, session, tradable, groups, guard, QTF, asset: qAsset };
})();
