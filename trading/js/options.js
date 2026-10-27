/* Labo options : prix d'une option (Black-Scholes), courbe de gain à l'échéance et aujourd'hui,
   grecques expliquées simplement, stratégies classiques. Inspiré du simulateur FX du grand frère. */
window.M = window.M || {};

(function () {
  const { $, $$, esc } = M.u;

  // ---------- Mathématiques ----------
  function cdf(x) { // loi normale cumulée (approximation d'Abramowitz-Stegun, erreur < 1e-7)
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989422804014327 * Math.exp(-x * x / 2);
    const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return x > 0 ? 1 - p : p;
  }
  const pdf = x => 0.3989422804014327 * Math.exp(-x * x / 2);

  // Prix et grecques d'une option européenne. T en années, vol et r en décimal.
  function bs(type, S, K, T, vol, r) {
    if (T <= 1e-6 || vol <= 0) {
      const v = type === "call" ? Math.max(S - K, 0) : Math.max(K - S, 0);
      return { price: v, delta: type === "call" ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, theta: 0, vega: 0 };
    }
    const sq = Math.sqrt(T), d1 = (Math.log(S / K) + (r + vol * vol / 2) * T) / (vol * sq), d2 = d1 - vol * sq;
    const disc = Math.exp(-r * T);
    const call = type === "call";
    const price = call ? S * cdf(d1) - K * disc * cdf(d2) : K * disc * cdf(-d2) - S * cdf(-d1);
    const delta = call ? cdf(d1) : cdf(d1) - 1;
    const gamma = pdf(d1) / (S * vol * sq);
    const vega = S * pdf(d1) * sq / 100;                                   // pour 1 point de volatilité
    const theta = (-S * pdf(d1) * vol / (2 * sq) - (call ? 1 : -1) * r * K * disc * cdf(call ? d2 : -d2)) / 365; // par jour
    return { price, delta, gamma, theta, vega };
  }

  // ---------- Stratégies ----------
  // Chaque jambe : type (call, put, stock), sens (+1 achat, -1 vente), k = multiple du prix d'exercice de base
  const STRATS = [
    { id: "call", name: "Achat de call", legs: [["call", 1, 1]], view: "Tu penses que le prix va monter fort.",
      text: "Tu paies une prime pour avoir le droit d'acheter au prix d'exercice. Si le marché monte au-delà du point mort, tu gagnes ; sinon tu perds au maximum la prime. C'est un pari à risque limité." },
    { id: "put", name: "Achat de put", legs: [["put", 1, 1]], view: "Tu penses que le prix va baisser, ou tu veux t'assurer.",
      text: "Tu paies une prime pour avoir le droit de vendre au prix d'exercice. Tu gagnes si le marché baisse sous le point mort. Perte maximale : la prime." },
    { id: "protect", name: "Action + put (assurance)", legs: [["stock", 1, 1], ["put", 1, 0.95]], view: "Tu détiens l'actif et tu veux te protéger d'un krach.",
      text: "Comme une assurance auto : tu paies une prime pour limiter ta perte si le marché s'effondre, tout en gardant le gain si ça monte. Les gérants de fonds font ça avant les grands événements." },
    { id: "covered", name: "Action + vente de call", legs: [["stock", 1, 1], ["call", -1, 1.05]], view: "Tu détiens l'actif et tu penses qu'il va peu bouger.",
      text: "Tu encaisses une prime chaque mois en acceptant de vendre si le prix dépasse le prix d'exercice. Revenu régulier, mais gain plafonné. Le risque de baisse de l'action reste entier." },
    { id: "spread", name: "Écart haussier (call spread)", legs: [["call", 1, 1], ["call", -1, 1.08]], view: "Tu penses que ça va monter, mais pas énormément.",
      text: "Tu achètes un call et tu en revends un plus haut : la prime coûte moins cher, mais le gain est plafonné. Gain et perte maximum sont connus dès le départ." },
    { id: "straddle", name: "Straddle (call + put)", legs: [["call", 1, 1], ["put", 1, 1]], view: "Tu attends un grand mouvement, sans savoir dans quel sens.",
      text: "Avant une annonce importante (résultats, banque centrale), tu achètes call et put au même prix d'exercice. Tu gagnes si le prix bouge beaucoup, dans un sens ou dans l'autre. Si rien ne bouge, le temps te coûte les deux primes." },
    { id: "shortput", name: "Vente de put", legs: [["put", -1, 0.95]], view: "Tu acceptes d'acheter l'actif moins cher, contre une prime.",
      text: "Tu encaisses la prime tout de suite. Mais si le marché s'effondre, tu dois acheter au prix d'exercice : la perte peut être très grande. C'est la stratégie qui a ruiné beaucoup de débutants : à n'utiliser qu'en comprenant le risque." }
  ];

  // Sous-jacents proposés : cours en direct quand ils sont disponibles, volatilité typique
  const UNDER = [
    { id: "", name: "Exemple simple", price: 100, vol: 25 },
    { id: "SPX", name: "S&P 500", vol: 16 },
    { id: "AAPL", name: "Apple", vol: 28 },
    { id: "GOLD", name: "Or", vol: 17 },
    { id: "EURUSD", name: "Euro / Dollar", vol: 8 },
    { id: "BRENT", name: "Pétrole Brent", vol: 35 }
  ];

  const nf = (v, d) => (v < 0 ? "−" : "") + Math.abs(v).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const dec = S => S >= 1000 ? 0 : S >= 10 ? 2 : 4;

  M.views.options = function (el) {
    const saved = M.state.optLab || {};
    const st = Object.assign({ strat: "call", under: "", S: 100, K: 100, days: 30, vol: 25, r: 4, qty: 1, at: 0 }, saved);

    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">Labo options</p><h1>Comprends les options <span class="grad">en les manipulant</span></h1>
      <p class="lede">Une option, c'est un droit d'acheter ou de vendre à un prix fixé, contre une prime. Choisis une stratégie, bouge les curseurs et regarde ce que tu gagnes ou perds selon le prix final.</p></div></div>
      <div class="opt-strats">${STRATS.map(s => `<button class="opt-s glass" data-s="${s.id}"><b>${s.name}</b><small>${s.view}</small></button>`).join("")}</div>
      <div class="lab opt">
        <aside class="glass pad lab-cfg">
          <label class="fld" data-tip-text="L'actif sur lequel porte l'option. Le cours est repris en direct quand il est disponible."><span>Sous-jacent</span>
            <select id="o-u">${UNDER.map(u => `<option value="${u.id}">${u.name}</option>`).join("")}</select></label>
          <div class="two">
            <label class="fld" data-tip-text="Prix actuel de l'actif."><span>Prix actuel</span><span class="inp"><input type="number" id="o-S" step="any" min="0" inputmode="decimal"></span></label>
            <label class="fld" data-tip-text="Prix d'exercice (strike) : le prix auquel l'option te permet d'acheter (call) ou de vendre (put)."><span>Prix d'exercice</span><span class="inp"><input type="number" id="o-K" step="any" min="0" inputmode="decimal"></span></label>
          </div>
          <label class="fld" data-tip-text="Nombre de jours avant l'échéance de l'option. Après, elle ne vaut plus que sa valeur intrinsèque."><span>Échéance <b id="o-dv"></b></span><input type="range" id="o-d" min="1" max="365" step="1"></label>
          <label class="fld" data-tip-text="Volatilité implicite : l'amplitude de mouvement que le marché anticipe sur un an. Plus elle est haute, plus les options sont chères."><span>Volatilité <b id="o-vv"></b></span><input type="range" id="o-v" min="3" max="120" step="1"></label>
          <div class="two">
            <label class="fld" data-tip-text="Taux d'intérêt sans risque annuel (ex. taux des bons du Trésor)."><span>Taux</span><span class="inp"><input type="number" id="o-r" step="0.1" inputmode="decimal"><em>%</em></span></label>
            <label class="fld" data-tip-text="Nombre d'unités du sous-jacent couvertes (sur les marchés réels, un contrat d'actions = souvent 100 actions)."><span>Quantité</span><span class="inp"><input type="number" id="o-q" step="1" min="1" inputmode="numeric"></span></label>
          </div>
          <label class="fld" data-tip-text="Déplace le temps : la courbe en pointillés montre la valeur de ta position à cette date, avant l'échéance."><span>Courbe en pointillés <b id="o-atv"></b></span><input type="range" id="o-at" min="0" max="100" step="1"></label>
          <div id="o-legs" class="opt-legs"></div>
        </aside>
        <section class="lab-out">
          <div class="stats" id="o-stats"></div>
          <div class="chartbox glass opt-chart" id="o-chart"></div>
          <div class="glass pad" id="o-greeks"></div>
          <div class="glass pad opt-explain" id="o-text"></div>
        </section>
      </div>
      ${M.disclaimer ? M.disclaimer() : ""}`;

    const inp = id => $("#" + id, el);
    function pull() {
      st.S = Math.max(0.0001, parseFloat(inp("o-S").value) || st.S);
      st.K = Math.max(0.0001, parseFloat(inp("o-K").value) || st.K);
      st.days = +inp("o-d").value; st.vol = +inp("o-v").value;
      st.r = parseFloat(inp("o-r").value) || 0; st.qty = Math.max(1, parseInt(inp("o-q").value) || 1);
      st.at = +inp("o-at").value;
    }
    function push() {
      inp("o-u").value = st.under; inp("o-S").value = st.S; inp("o-K").value = st.K;
      inp("o-d").value = st.days; inp("o-v").value = st.vol; inp("o-r").value = st.r; inp("o-q").value = st.qty; inp("o-at").value = st.at;
      $$(".opt-s", el).forEach(b => b.classList.toggle("on", b.dataset.s === st.strat));
    }
    const round = (v, S) => +v.toFixed(dec(S));

    function setUnder(id) {
      const u = UNDER.find(x => x.id === id) || UNDER[0];
      const q = id && M.Quotes && M.Quotes.byId[id];
      st.under = id;
      st.S = q && q.price ? q.price : u.price || st.S;
      st.vol = u.vol; st.K = round(st.S, st.S);
      if (id && !q) M.toast("Cours en direct pas encore chargé : prix d'exemple utilisé.");
    }

    // Jambes de la stratégie aux prix d'exercice actuels
    function legs() {
      const s = STRATS.find(x => x.id === st.strat);
      return s.legs.map(([type, side, k]) => ({ type, side, K: type === "stock" ? null : round(st.K * k, st.K) }));
    }
    function value(L, S, T) { // valeur de la position (par unité) au prix S, T années restantes
      return L.reduce((a, l) => a + l.side * (l.type === "stock" ? S : bs(l.type, S, l.K, T, st.vol / 100, st.r / 100).price), 0);
    }

    function draw() {
      pull();
      M.state.optLab = Object.assign({}, st); M.save && M.save();
      const L = legs(), T = st.days / 365, d = dec(st.S), q = st.qty;
      const cost = value(L, st.S, T);                                    // ce que coûte la position aujourd'hui
      const prem = L.filter(l => l.type !== "stock").reduce((a, l) => a + l.side * bs(l.type, st.S, l.K, T, st.vol / 100, st.r / 100).price, 0);
      const payoff = S => value(L, S, 0) - cost;
      const tAt = T * (1 - st.at / 100);
      const nowVal = S => value(L, S, tAt) - cost;

      // Grille de prix pour la courbe et les statistiques
      const lo = st.S * 0.6, hi = st.S * 1.4, N = 240, xs = [];
      for (let i = 0; i <= N; i++) xs.push(lo + (hi - lo) * i / N);
      const pay = xs.map(payoff), now = xs.map(nowVal);
      // Gain / perte max : regarde aussi loin au-delà de la grille pour détecter l'illimité
      const far = payoff(st.S * 10) - payoff(st.S * 5), farLow = payoff(0.0001);
      const maxG = far > 1e-9 ? Infinity : Math.max(...pay, farLow);
      const maxL = far < -1e-9 ? -Infinity : Math.min(...pay, farLow);
      const be = [];
      for (let i = 1; i < xs.length; i++) if ((pay[i - 1] < 0) !== (pay[i] < 0)) be.push(xs[i - 1] + (xs[i] - xs[i - 1]) * (-pay[i - 1]) / (pay[i] - pay[i - 1]));
      // Probabilité de finir gagnant (loi log-normale sous la volatilité choisie)
      const sig = st.vol / 100 * Math.sqrt(T), mu = Math.log(st.S) + (st.r / 100 - (st.vol / 100) ** 2 / 2) * T;
      let pWin = 0;
      for (let i = 0; i < 400; i++) {
        const z = -4 + 8 * (i + 0.5) / 400, S = Math.exp(mu + sig * z);
        if (payoff(S) > 0) pWin += pdf(z) * 8 / 400;
      }
      const g = L.reduce((a, l) => {
        if (l.type === "stock") { a.delta += l.side; return a; }
        const x = bs(l.type, st.S, l.K, T, st.vol / 100, st.r / 100);
        ["delta", "gamma", "theta", "vega"].forEach(k => a[k] += l.side * x[k]);
        return a;
      }, { delta: 0, gamma: 0, theta: 0, vega: 0 });

      $("#o-dv", el).textContent = st.days + " j";
      $("#o-vv", el).textContent = st.vol + " %";
      $("#o-atv", el).textContent = st.at === 0 ? "aujourd'hui" : st.at === 100 ? "à l'échéance" : "dans " + Math.round(st.days * st.at / 100) + " j";
      $("#o-legs", el).innerHTML = `<small class="muted">Composition</small>` + L.map(l => `<div class="opt-leg"><span class="${l.side > 0 ? "up" : "dn"}">${l.side > 0 ? "Achat" : "Vente"}</span> ${l.type === "stock" ? "de l'actif" : (l.type === "call" ? "call" : "put") + " à " + nf(l.K, d)}</div>`).join("");

      const money = v => v === Infinity ? "illimité" : v === -Infinity ? "illimitée" : nf(v * q, d);
      const pr = prem * q;
      $("#o-stats", el).innerHTML = `
        <div class="stat glass" data-tip-text="Prime totale des options : tu la paies (achat) ou tu l'encaisses (vente).">
          <small>${pr >= 0 ? "Prime à payer" : "Prime encaissée"}</small><b class="mono">${nf(Math.abs(pr), d)}</b></div>
        <div class="stat glass" data-tip-text="Le plus que tu peux gagner à l'échéance."><small>Gain max</small><b class="mono up">${money(maxG)}</b></div>
        <div class="stat glass" data-tip-text="Le plus que tu peux perdre à l'échéance."><small>Perte max</small><b class="mono dn">${money(maxL)}</b></div>
        <div class="stat glass" data-tip-text="Prix final à partir duquel la position ne perd plus rien."><small>Point mort</small><b class="mono">${be.length ? be.map(x => nf(x, d)).join(" / ") : "—"}</b></div>
        <div class="stat glass" data-tip-text="Probabilité théorique de finir gagnant à l'échéance, si le marché bouge comme le dit la volatilité choisie. Ce n'est pas une prévision."><small>Chance de gain</small><b class="mono">${Math.round(pWin * 100)} %</b></div>`;

      chart(xs, pay, now, be);

      const D = g.delta * q, Th = g.theta * q, V = g.vega * q, G = g.gamma * q;
      const step = st.S * 0.01;
      $("#o-greeks", el).innerHTML = `
        <div class="sec-head sm"><h4>Les « grecques » : comment ta position réagit</h4></div>
        <div class="opt-greeks">
          <div><b>Delta <span class="mono">${nf(D, 2)}</span></b><p>Si l'actif monte de 1 % (${nf(step, d)}), ta position ${D * step >= 0 ? "gagne" : "perd"} environ <b class="mono">${nf(Math.abs(D * step), d)}</b>.</p></div>
          <div><b>Thêta <span class="mono">${nf(Th, d)}</span></b><p>${Th < 0 ? "Chaque jour qui passe sans mouvement te coûte" : "Chaque jour qui passe sans mouvement te rapporte"} environ <b class="mono">${nf(Math.abs(Th), d)}</b>. Le temps joue ${Th < 0 ? "contre" : "pour"} toi.</p></div>
          <div><b>Véga <span class="mono">${nf(V, d)}</span></b><p>Si la volatilité monte d'un point (de ${st.vol} à ${st.vol + 1} %), ta position ${V >= 0 ? "gagne" : "perd"} environ <b class="mono">${nf(Math.abs(V), d)}</b>. ${V > 0 ? "Tu profites de la peur du marché." : V < 0 ? "La panique te coûte." : ""}</p></div>
          <div><b>Gamma <span class="mono">${nf(G, 4)}</span></b><p>${G > 0 ? "Ton delta grandit quand le marché va dans ton sens : les grands mouvements t'aident." : G < 0 ? "Ton delta joue contre toi dans les grands mouvements : prudence si le marché s'emballe." : "Pas d'effet d'accélération."}</p></div>
        </div>`;

      const s = STRATS.find(x => x.id === st.strat);
      $("#o-text", el).innerHTML = `<h4>${s.name}</h4><p><b>Quand ?</b> ${s.view}</p><p>${s.text}</p>
        <p class="muted small">Calcul : modèle de Black-Scholes (options européennes, sans dividende). Sur les vrais marchés, il faut ajouter les frais et l'écart achat-vente. Les options ne sont pas proposées par les SGI de la BRVM : ce labo sert à comprendre les marchés internationaux.</p>`;
    }

    function chart(xs, pay, now, be) {
      const box = $("#o-chart", el);
      const W = Math.max(320, box.clientWidth || 640), H = 280, pl = 58, pr = 12, pt = 14, pb = 28;
      const all = pay.concat(now), mn = Math.min(...all, 0), mx = Math.max(...all, 0), span = mx - mn || 1;
      const X = x => pl + (x - xs[0]) / (xs[xs.length - 1] - xs[0]) * (W - pl - pr);
      const Y = v => pt + (mx - v) / span * (H - pt - pb);
      const path = arr => arr.map((v, i) => (i ? "L" : "M") + X(xs[i]).toFixed(1) + " " + Y(v).toFixed(1)).join("");
      const d = dec(st.S);
      // Zones de gain (vert) et de perte (rouge) sous la courbe à l'échéance
      const area = sign => {
        let s = "M" + X(xs[0]) + " " + Y(0);
        xs.forEach((x, i) => { const v = sign > 0 ? Math.max(pay[i], 0) : Math.min(pay[i], 0); s += "L" + X(x).toFixed(1) + " " + Y(v).toFixed(1); });
        return s + "L" + X(xs[xs.length - 1]) + " " + Y(0) + "Z";
      };
      const ticks = [];
      for (let i = 0; i <= 4; i++) { const v = mn + span * i / 4; ticks.push(`<text x="${pl - 6}" y="${Y(v) + 4}" text-anchor="end">${nf(v * st.qty, d)}</text><line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/>`); }
      const xt = [0.7, 0.85, 1, 1.15, 1.3].map(k => `<text x="${X(st.S * k)}" y="${H - 8}" text-anchor="middle">${nf(st.S * k, d)}</text>`);
      box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" class="opt-svg" role="img" aria-label="Gain ou perte selon le prix final">
        ${ticks.join("")}${xt.join("")}
        <path d="${area(1)}" class="a-up"/><path d="${area(-1)}" class="a-dn"/>
        <line x1="${pl}" x2="${W - pr}" y1="${Y(0)}" y2="${Y(0)}" class="zero"/>
        <line x1="${X(st.S)}" x2="${X(st.S)}" y1="${pt}" y2="${H - pb}" class="spot"/>
        <text x="${X(st.S) + 4}" y="${pt + 10}" class="lbl">prix actuel</text>
        ${be.map(b => `<circle cx="${X(b)}" cy="${Y(0)}" r="4" class="be"/>`).join("")}
        <path d="${path(now)}" class="now"/>
        <path d="${path(pay)}" class="pay"/>
      </svg>
      <div class="opt-leg-k"><span><i class="k-pay"></i>À l'échéance</span><span><i class="k-now"></i>${$("#o-atv", el).textContent === "aujourd'hui" ? "Aujourd'hui" : "Valeur " + $("#o-atv", el).textContent}</span><span><i class="k-be"></i>Point mort</span></div>`;
    }

    $$(".opt-s", el).forEach(b => b.onclick = () => { st.strat = b.dataset.s; push(); draw(); });
    inp("o-u").onchange = () => { pull(); setUnder(inp("o-u").value); push(); draw(); };
    ["o-S", "o-K", "o-d", "o-v", "o-r", "o-q", "o-at"].forEach(id => inp(id).oninput = draw);
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    push(); draw();
    // Le cours en direct arrive parfois après l'ouverture de la page
    if (M.Quotes && !M.Quotes.loaded && M.Quotes.load) M.Quotes.load().catch(() => {});
    return () => window.removeEventListener("resize", onResize);
  };

  M.Options = { bs, cdf, STRATS };
})();
