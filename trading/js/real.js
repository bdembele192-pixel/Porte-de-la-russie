/* Trading réel (#/reel) — deux voies :
   1. Ton propre compte Binance, relié par une clé API SANS droit de retrait. Les clés sont chiffrées sur ton appareil
      (AES-GCM, clé dérivée de ta phrase secrète par PBKDF2) et ne sont jamais envoyées à Mèche : les ordres partent
      directement de ton navigateur vers l'API WebSocket de Binance, signés sur place (HMAC-SHA256).
      Mèche ne détient jamais ton argent et ne peut rien retirer.
   2. Des courtiers et SGI agréés (config.partners), pour les actions (BRVM, bourses mondiales).
   Guide : docs/TRADING-REEL.md */
window.M = window.M || {};

(function () {
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const C = () => M.CONFIG || {};
  const RC = () => Object.assign({ maxOrder: 1000, maxDaily: 3000 }, C().real || {});
  const KEY = "meche:real";
  const TERMS_V = 1;
  const ENVS = {
    testnet: { name: "Testnet (argent fictif)", ws: "wss://ws-api.testnet.binance.vision/ws-api/v3", keys: "https://testnet.binance.vision/" },
    live: { name: "Compte réel", ws: "wss://ws-api.binance.com:443/ws-api/v3", keys: "https://www.binance.com/fr/my/settings/api-management" }
  };
  const PAIRS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "TONUSDT", "LINKUSDT", "AVAXUSDT", "DOTUSDT", "LTCUSDT"];

  // ---------- Stockage local (séparé de la progression : jamais synchronisé, jamais exporté) ----------
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  let R = Object.assign({ env: "testnet", vault: {}, journal: [], limits: {} }, load());
  const save = () => localStorage.setItem(KEY, JSON.stringify(R));

  // ---------- Coffre chiffré ----------
  const b64 = u8 => btoa(String.fromCharCode(...new Uint8Array(u8)));
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const ITER = 310000;
  async function derive(pass, salt, iter) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function seal(obj, pass) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await derive(pass, salt, ITER), new TextEncoder().encode(JSON.stringify(obj)));
    return { v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
  }
  async function open(box, pass) {
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(box.iv) }, await derive(pass, unb64(box.salt), box.iter || ITER), unb64(box.ct));
    return JSON.parse(new TextDecoder().decode(pt));
  }

  // Clés déchiffrées : uniquement en mémoire, effacées après 15 minutes d'inactivité ou au verrouillage
  let keys = null, lockT = null;
  const touch = () => { clearTimeout(lockT); lockT = setTimeout(lock, 15 * 60e3); };
  function lock() { keys = null; clearTimeout(lockT); if (ws) ws.close(); if (location.hash.startsWith("#/reel")) M.go("#/reel"); }

  // ---------- Client API WebSocket Binance ----------
  let ws = null, wsEnv = null, pending = new Map(), offset = 0;
  function connect(env) {
    if (ws && wsEnv === env && ws.readyState <= 1) return ws.readyState === 1 ? Promise.resolve() : new Promise((ok, ko) => { ws.addEventListener("open", ok, { once: true }); ws.addEventListener("error", () => ko(new Error("Connexion à Binance impossible")), { once: true }); });
    if (ws) ws.close();
    wsEnv = env;
    return new Promise((ok, ko) => {
      const s = ws = new WebSocket(ENVS[env].ws);
      s.onopen = ok;
      s.onerror = () => ko(new Error("Connexion à Binance impossible (réseau, pays non pris en charge ou service indisponible)"));
      s.onclose = () => { pending.forEach(p => p.ko(new Error("Connexion fermée"))); pending.clear(); if (ws === s) ws = null; };
      s.onmessage = e => {
        let m; try { m = JSON.parse(e.data); } catch { return; }
        const p = pending.get(m.id); if (!p) return;
        pending.delete(m.id); clearTimeout(p.t);
        if (m.status === 200) p.ok(m.result); else p.ko(Object.assign(new Error(frErr(m.error)), { code: m.error && m.error.code }));
      };
    });
  }
  async function hmac(secret, msg) {
    const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return [...new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg)))].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  async function call(method, params = {}, signed = false) {
    await connect(R.env);
    params = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
    if (signed) {
      if (!keys) throw new Error("Coffre verrouillé");
      touch();
      params.apiKey = keys.apiKey;
      params.timestamp = Date.now() + offset;
      params.recvWindow = 5000;
      const payload = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
      params.signature = await hmac(keys.secret, payload);
    }
    const id = crypto.randomUUID();
    return new Promise((ok, ko) => {
      const t = setTimeout(() => { pending.delete(id); ko(new Error("Binance ne répond pas")); }, 15000);
      pending.set(id, { ok, ko, t });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  function frErr(e) {
    const c = e && e.code, m = (e && e.msg) || "Erreur";
    const T = { "-2015": "Clé API invalide, adresse IP non autorisée ou droits insuffisants.", "-2014": "Format de clé API invalide.", "-1021": "Horloge décalée : réessaie.", "-1022": "Signature invalide (clé secrète incorrecte ?).", "-2010": "Ordre refusé par Binance : " + m, "-1013": "Quantité ou prix hors des règles de la paire : " + m, "-1121": "Paire inconnue.", "-1003": "Trop de requêtes : patiente une minute.", "-2011": "Ordre introuvable ou déjà exécuté." };
    return T[String(c)] || m;
  }
  async function syncTime() { const t0 = Date.now(); const r = await call("time"); offset = Math.round(r.serverTime - (t0 + Date.now()) / 2); }

  const filt = {};
  async function rules(sym) {
    if (filt[sym]) return filt[sym];
    const r = await call("exchangeInfo", { symbol: sym });
    const s = r.symbols && r.symbols[0];
    if (!s) throw new Error("Paire inconnue sur Binance");
    const f = t => s.filters.find(x => x.filterType === t) || {};
    return filt[sym] = {
      status: s.status, base: s.baseAsset, quote: s.quoteAsset, types: s.orderTypes || [],
      step: f("LOT_SIZE").stepSize || "0.00000001", minQty: +f("LOT_SIZE").minQty || 0,
      tick: f("PRICE_FILTER").tickSize || "0.01",
      minNotional: +(f("NOTIONAL").minNotional || f("MIN_NOTIONAL").minNotional || 0)
    };
  }
  const decs = step => (String(step).split(".")[1] || "").replace(/0+$/, "").length;
  const floorTo = (v, step) => { const d = decs(step); const s = +step; return (Math.floor(v / s + 1e-9) * s).toFixed(d); };

  // ---------- Limites de sécurité ----------
  const lim = () => ({ maxOrder: Math.min(+R.limits.maxOrder || RC().maxOrder, RC().maxOrder), maxDaily: Math.min(+R.limits.maxDaily || RC().maxDaily, RC().maxDaily) });
  const today = () => R.journal.filter(j => j.env === R.env && j.status !== "REJECTED" && Date.now() - j.t < 864e5).reduce((a, j) => a + (+j.notional || 0), 0);

  async function logOrder(o) {
    R.journal.unshift(o); R.journal = R.journal.slice(0, 300); save();
    // Copie dans le compte Mèche (sans aucune clé), si l'utilisateur est connecté
    try {
      const A = M.Account, sb = A && A.enabled() && A.session() && A.sb();
      if (sb) await sb.from("real_orders").insert({
        user_id: A.session().user.id, exchange: "binance", testnet: o.env === "testnet", symbol: o.sym, side: o.side, type: o.type,
        quantity: o.qty || null, quote_amount: o.notional || null, price: o.price || null, status: o.status, exchange_order_id: o.oid ? String(o.oid) : null, note: (o.note || "").slice(0, 200) || null
      });
    } catch (e) { console.warn("journal cloud :", e.message); }
  }

  // ---------- Vue ----------
  M.views.reel = function (el, [tab]) {
    let price = null, priceT = null, cur = { sym: "BTCUSDT", side: "BUY", type: "MARKET" };
    tab = tab || (R.accepted === TERMS_V ? "binance" : "risques");

    const head = `<div class="page-head"><div><p class="eyebrow">${M.icon("zap")} <span>Trading réel</span></p>
      <h1>Passe au <span class="grad">réel</span>, sans brûler les étapes</h1>
      <p class="lede">Mèche ne garde jamais ton argent. Tu trades depuis <b>ton propre compte</b> chez une plateforme ou un courtier, et Mèche t'apporte les garde-fous : plafonds, confirmation, journal.</p></div></div>
      <div class="risk-band">${M.icon("alert")} <b>Risque de perte en capital.</b> Le trading peut te faire perdre tout l'argent engagé, très vite. N'investis que ce que tu peux perdre. Mèche ne donne pas de conseil en investissement.</div>
      <div class="tabs real-tabs">${[["risques", "Avant de commencer"], ["binance", "Mon compte Binance"], ["courtiers", "Courtiers agréés"], ["journal", "Journal"]].map(([k, t]) => `<a href="#/reel/${k}" class="${tab === k ? "on" : ""}">${t}</a>`).join("")}</div>
      <div id="real-body"></div>`;
    el.innerHTML = head;
    const body = $("#real-body", el);
    if (tab !== "risques" && tab !== "courtiers" && R.accepted !== TERMS_V) tab = "risques";
    ({ risques: drawRisk, binance: drawBinance, courtiers: drawPartners, journal: drawJournal }[tab] || drawRisk)();

    function drawRisk() {
      body.innerHTML = `<div class="glass pad real-risk">
        <h3>Avant de trader avec de l'argent réel</h3>
        <ul>
          <li><b>Commence par le testnet</b> : même interface, argent fictif fourni par Binance. Passe au réel seulement quand tes résultats simulés sont stables sur plusieurs semaines.</li>
          <li><b>Crée une clé API sans droit de retrait.</b> Coche uniquement « Activer le trading Spot ». Même si quelqu'un volait ta clé, il ne pourrait pas sortir l'argent de ton compte.</li>
          <li><b>Tes clés restent sur cet appareil</b>, chiffrées par une phrase secrète que toi seul connais. Mèche, son serveur et sa base de données ne les voient jamais.</li>
          <li><b>Plafonds</b> : ${lim().maxOrder} USDT par ordre et ${lim().maxDaily} USDT par 24 h au maximum (tu peux les baisser).</li>
          <li><b>Disponibilité</b> : Binance n'est pas accessible dans tous les pays (par exemple aux États-Unis, où c'est Binance.US, ni depuis la Russie pour les nouveaux comptes). Vérifie que la plateforme est autorisée là où tu vis et que tu respectes les règles fiscales et de change de ton pays.</li>
          <li><b>Actions et BRVM</b> : passe par une SGI ou un courtier agréé (onglet « Courtiers agréés »).</li>
        </ul>
        <label class="chk"><input type="checkbox" id="k1"> J'ai 18 ans ou plus.</label>
        <label class="chk"><input type="checkbox" id="k2"> Je comprends que je peux perdre tout l'argent engagé et que Mèche ne donne pas de conseil en investissement.</label>
        <label class="chk"><input type="checkbox" id="k3"> Les ordres sont passés sur mon propre compte, sous ma seule responsabilité, conformément aux <a href="legal.html#reel" target="_blank" rel="noopener">conditions</a>.</label>
        <div class="cta"><button class="btn primary" id="k-ok" ${R.accepted === TERMS_V ? "" : "disabled"}>${R.accepted === TERMS_V ? "Conditions acceptées ✓ — continuer" : "J'accepte et je continue"}</button></div></div>`;
      const ks = $$("#k1,#k2,#k3", body);
      if (R.accepted === TERMS_V) ks.forEach(k => k.checked = true);
      ks.forEach(k => k.onchange = () => $("#k-ok", body).disabled = !ks.every(x => x.checked));
      $("#k-ok", body).onclick = () => { R.accepted = TERMS_V; R.acceptedAt = Date.now(); save(); M.go("#/reel/binance"); };
    }

    function drawBinance() {
      const v = R.vault[R.env];
      const envSw = `<div class="seg real-env">${Object.entries(ENVS).map(([k, e]) => `<button data-env="${k}" class="${R.env === k ? "on" : ""}">${e.name}</button>`).join("")}</div>`;
      if (!v) {
        body.innerHTML = `${envSw}<div class="glass pad">
          <h3>${M.icon("key")} Relier ${R.env === "testnet" ? "un compte testnet Binance" : "ton compte Binance"}</h3>
          <ol class="small">
            <li>${R.env === "testnet" ? `Va sur <a href="${ENVS.testnet.keys}" target="_blank" rel="noopener">testnet.binance.vision</a>, connecte-toi et génère une clé « HMAC_SHA256 ».` : `Va dans <a href="${ENVS.live.keys}" target="_blank" rel="noopener">Binance → Gestion des API</a> et crée une clé « générée par le système ».`}</li>
            <li><b>Droits : uniquement « Activer la lecture » et « Activer le trading Spot ». Ne coche jamais « Activer les retraits ».</b></li>
            <li>Si ta connexion a une adresse IP fixe, restreins la clé à cette adresse.</li>
            <li>Colle la clé et le secret ci-dessous, puis choisis une phrase secrète : elle chiffre tes clés sur cet appareil.</li>
          </ol>
          <div class="acc-row"><span class="inp"><input id="v-key" placeholder="Clé API (API Key)" autocomplete="off" spellcheck="false"></span></div>
          <div class="acc-row"><span class="inp"><input id="v-sec" type="password" placeholder="Clé secrète (Secret Key)" autocomplete="off" spellcheck="false"></span></div>
          <div class="acc-row"><span class="inp"><input id="v-p1" type="password" placeholder="Phrase secrète (10 caractères minimum)" autocomplete="new-password"></span><span class="inp"><input id="v-p2" type="password" placeholder="Confirme la phrase" autocomplete="new-password"></span></div>
          <p class="small muted">Si tu oublies ta phrase secrète, il suffira de supprimer les clés ici et d'en créer de nouvelles chez Binance : personne ne peut la récupérer, pas même Mèche.</p>
          <div class="cta"><button class="btn primary" id="v-save">${M.icon("lock")} Chiffrer et vérifier</button></div></div>`;
        bindEnv();
        $("#v-save", body).onclick = async () => {
          const apiKey = $("#v-key", body).value.trim(), secret = $("#v-sec", body).value.trim(), p1 = $("#v-p1", body).value, p2 = $("#v-p2", body).value;
          if (!/^[A-Za-z0-9]{20,128}$/.test(apiKey) || !/^[A-Za-z0-9]{20,128}$/.test(secret)) return M.toast("Clé ou secret au mauvais format.", "err");
          if (p1.length < 10) return M.toast("Phrase secrète trop courte (10 caractères minimum).", "err");
          if (p1 !== p2) return M.toast("Les deux phrases sont différentes.", "err");
          const btn = $("#v-save", body); btn.disabled = true; btn.textContent = "Vérification…";
          keys = { apiKey, secret };
          try {
            await syncTime();
            const acc = await call("account.status", { omitZeroBalances: true }, true);
            if (!acc.canTrade) throw new Error("Cette clé n'a pas le droit de trader (active « Trading Spot »).");
            if (acc.canWithdraw === true && (acc.permissions || []).includes("WITHDRAW")) M.toast("Attention : ta clé semble autoriser les retraits. Crée plutôt une clé sans retrait.", "err");
            R.vault[R.env] = await seal({ apiKey, secret }, p1); save(); keys.env = R.env;
            M.toast("Clés chiffrées et vérifiées 🔐", "win"); touch(); drawBinance();
          } catch (e) { keys = null; btn.disabled = false; btn.textContent = "Chiffrer et vérifier"; M.toast(e.message, "err"); }
        };
        return;
      }
      if (keys && keys.env !== R.env) keys = null;
      if (!keys) {
        body.innerHTML = `${envSw}<div class="glass pad"><h3>${M.icon("lock")} Coffre verrouillé</h3>
          <p class="muted">Entre ta phrase secrète pour déverrouiller tes clés ${R.env === "testnet" ? "testnet" : "Binance"} sur cet appareil. Elles se reverrouillent après 15 minutes d'inactivité.</p>
          <div class="acc-row"><span class="inp"><input id="u-pass" type="password" placeholder="Phrase secrète" autocomplete="current-password"></span><button class="btn primary" id="u-ok">Déverrouiller</button></div>
          <div class="cta"><button class="btn danger sm" id="u-del">${M.icon("trash")} Supprimer ces clés de l'appareil</button></div></div>`;
        bindEnv();
        const go = async () => {
          try { keys = await open(v, $("#u-pass", body).value); keys.env = R.env; touch(); drawBinance(); }
          catch { M.toast("Phrase secrète incorrecte.", "err"); }
        };
        $("#u-ok", body).onclick = go;
        $("#u-pass", body).onkeydown = e => { if (e.key === "Enter") go(); };
        $("#u-del", body).onclick = () => { if (confirm("Supprimer les clés chiffrées de cet appareil ? Pense aussi à supprimer la clé chez Binance.")) { delete R.vault[R.env]; save(); drawBinance(); } };
        return;
      }
      keys.env = R.env;
      const L = lim();
      body.innerHTML = `${envSw}
        ${R.env === "live" ? `<div class="risk-band live">${M.icon("alert")} Mode <b>RÉEL</b> : chaque ordre engage ton argent.</div>` : `<div class="risk-band test">${M.icon("shield")} Mode <b>testnet</b> : argent fictif fourni par Binance, idéal pour t'entraîner.</div>`}
        <div class="real-grid">
          <div class="glass pad">
            <div class="real-h"><h3>${M.icon("wallet")} Solde</h3><span><button class="btn ghost sm" id="b-ref">${M.icon("refresh")}</button> <button class="btn ghost sm" id="b-lock">${M.icon("lock")} Verrouiller</button></span></div>
            <div id="bal" class="real-bal muted">Chargement…</div>
          </div>
          <div class="glass pad real-ticket">
            <h3>${M.icon("ticket")} Ordre</h3>
            <div class="acc-row"><span class="inp"><select id="t-sym">${PAIRS.map(p => `<option ${p === cur.sym ? "selected" : ""}>${p}</option>`).join("")}</select></span><b id="t-px" class="mono">—</b></div>
            <div class="seg"><button data-side="BUY" class="${cur.side === "BUY" ? "on" : ""}">Acheter</button><button data-side="SELL" class="${cur.side === "SELL" ? "on" : ""}">Vendre</button></div>
            <div class="seg" style="margin-top:6px"><button data-type="MARKET" class="${cur.type === "MARKET" ? "on" : ""}">Au marché</button><button data-type="LIMIT" class="${cur.type === "LIMIT" ? "on" : ""}">À cours limité</button></div>
            <label class="small muted" id="t-amt-l"></label>
            <div class="acc-row"><span class="inp"><input id="t-amt" inputmode="decimal" placeholder="0"></span></div>
            <div id="t-lim" hidden><label class="small muted">Prix limite (USDT)</label><div class="acc-row"><span class="inp"><input id="t-price" inputmode="decimal"></span></div></div>
            <div id="t-stopw"><label class="chk small"><input type="checkbox" id="t-stop"> Placer ensuite un stop de protection à <input id="t-stoppct" class="pct-in" value="5" inputmode="decimal"> % sous le prix d'achat</label></div>
            <p class="small muted" id="t-info"></p>
            <button class="btn primary" id="t-go" style="width:100%">Vérifier l'ordre</button>
            <p class="small muted">Plafonds : ${L.maxOrder} USDT par ordre · ${L.maxDaily} USDT par 24 h (déjà engagé : ${today().toFixed(2)} USDT).</p>
          </div>
        </div>
        <div class="glass pad"><div class="real-h"><h3>${M.icon("clock")} Ordres ouverts</h3><button class="btn ghost sm" id="o-ref">${M.icon("refresh")}</button></div><div id="open" class="muted">—</div></div>
        <div class="glass pad"><h3>${M.icon("sliders")} Mes plafonds</h3>
          <div class="acc-row"><label class="small">Par ordre (max ${RC().maxOrder})<span class="inp"><input id="l-o" inputmode="decimal" value="${L.maxOrder}"></span></label><label class="small">Par 24 h (max ${RC().maxDaily})<span class="inp"><input id="l-d" inputmode="decimal" value="${L.maxDaily}"></span></label><button class="btn ghost sm" id="l-save">Enregistrer</button></div>
          <div class="cta"><button class="btn danger sm" id="u-del2">${M.icon("trash")} Supprimer mes clés de cet appareil</button></div></div>`;
      bindEnv();
      $("#b-lock", body).onclick = lock;
      $("#b-ref", body).onclick = loadBal;
      $("#o-ref", body).onclick = loadOpen;
      $("#l-save", body).onclick = () => { R.limits = { maxOrder: Math.max(1, +$("#l-o", body).value || 0), maxDaily: Math.max(1, +$("#l-d", body).value || 0) }; save(); M.toast("Plafonds enregistrés"); drawBinance(); };
      $("#u-del2", body).onclick = () => { if (confirm("Supprimer les clés chiffrées de cet appareil ? Pense aussi à supprimer la clé chez Binance.")) { delete R.vault[R.env]; keys = null; save(); drawBinance(); } };
      $("#t-sym", body).onchange = e => { cur.sym = e.target.value; price = null; pollPrice(); ticketUI(); };
      $$("[data-side]", body).forEach(b => b.onclick = () => { cur.side = b.dataset.side; $$("[data-side]", body).forEach(x => x.classList.toggle("on", x === b)); ticketUI(); });
      $$("[data-type]", body).forEach(b => b.onclick = () => { cur.type = b.dataset.type; $$("[data-type]", body).forEach(x => x.classList.toggle("on", x === b)); ticketUI(); });
      $("#t-go", body).onclick = prepare;
      ticketUI();
      syncTime().catch(() => {}).then(() => { loadBal(); loadOpen(); pollPrice(); });
    }
    function bindEnv() {
      $$("[data-env]", body).forEach(b => b.onclick = () => {
        if (b.dataset.env === R.env) return;
        if (b.dataset.env === "live" && !confirm("Passer en mode RÉEL ? Les ordres engageront ton argent.")) return;
        R.env = b.dataset.env; save(); keys = null; if (ws) ws.close(); drawBinance();
      });
    }
    function ticketUI() {
      const buyMkt = cur.side === "BUY" && cur.type === "MARKET";
      $("#t-amt-l", body).textContent = buyMkt ? "Montant à dépenser (USDT)" : `Quantité (${cur.sym.replace(/USDT$/, "")})`;
      $("#t-lim", body).hidden = cur.type !== "LIMIT";
      $("#t-stopw", body).hidden = cur.side !== "BUY";
      if (cur.type === "LIMIT" && price && !$("#t-price", body).value) $("#t-price", body).value = price;
    }
    async function pollPrice() {
      clearTimeout(priceT);
      if (!$("#t-px", body)) return;
      try { const r = await call("ticker.price", { symbol: cur.sym }); price = +r.price; $("#t-px", body).textContent = price.toLocaleString("fr-FR", { maximumFractionDigits: 8 }) + " $"; } catch { /* hors ligne */ }
      priceT = setTimeout(pollPrice, 5000);
    }
    async function loadBal() {
      const b = $("#bal", body); if (!b) return;
      try {
        const acc = await call("account.status", { omitZeroBalances: true }, true);
        const rows = (acc.balances || []).filter(x => +x.free + +x.locked > 0).sort((a, z) => (z.asset === "USDT") - (a.asset === "USDT")).slice(0, 12);
        b.classList.remove("muted");
        b.innerHTML = rows.length ? `<table class="tbl"><tr><th>Actif</th><th>Disponible</th><th>Bloqué</th></tr>${rows.map(x => `<tr><td><b>${esc(x.asset)}</b></td><td class="mono">${(+x.free).toLocaleString("fr-FR", { maximumFractionDigits: 8 })}</td><td class="mono">${(+x.locked).toLocaleString("fr-FR", { maximumFractionDigits: 8 })}</td></tr>`).join("")}</table>` : "Compte vide.";
        if (!acc.canTrade) b.insertAdjacentHTML("beforeend", `<p class="dn small">Trading désactivé pour cette clé.</p>`);
      } catch (e) { b.textContent = e.message; }
    }
    async function loadOpen() {
      const o = $("#open", body); if (!o) return;
      try {
        const list = await call("openOrders.status", {}, true);
        o.classList.toggle("muted", !list.length);
        o.innerHTML = list.length ? `<table class="tbl"><tr><th>Paire</th><th>Sens</th><th>Type</th><th>Quantité</th><th>Prix</th><th></th></tr>${list.map(x => `<tr><td>${esc(x.symbol)}</td><td class="${x.side === "BUY" ? "up" : "dn"}">${x.side === "BUY" ? "Achat" : "Vente"}</td><td>${esc(x.type)}</td><td class="mono">${esc(x.origQty)}</td><td class="mono">${esc(+x.price ? x.price : x.stopPrice)}</td><td><button class="btn ghost sm" data-cancel="${esc(x.orderId)}" data-s="${esc(x.symbol)}">Annuler</button></td></tr>`).join("")}</table>` : "Aucun ordre ouvert.";
        $$("[data-cancel]", o).forEach(b => b.onclick = async () => {
          b.disabled = true;
          try { await call("order.cancel", { symbol: b.dataset.s, orderId: b.dataset.cancel }, true); M.toast("Ordre annulé"); logOrder({ t: Date.now(), env: R.env, sym: b.dataset.s, side: "SELL", type: "CANCEL", status: "CANCELED", oid: b.dataset.cancel, notional: 0, note: "Annulation" }); }
          catch (e) { M.toast(e.message, "err"); }
          loadOpen(); loadBal();
        });
      } catch (e) { o.textContent = e.message; }
    }

    // Prépare l'ordre, le valide auprès de Binance (order.test), demande confirmation, puis l'envoie
    async function prepare() {
      const btn = $("#t-go", body);
      const amt = +String($("#t-amt", body).value).replace(",", ".");
      if (!(amt > 0)) return M.toast("Entre un montant.", "err");
      btn.disabled = true;
      try {
        const r = await rules(cur.sym);
        if (r.status !== "TRADING") throw new Error("Cette paire n'est pas ouverte au trading.");
        if (!price) { const t = await call("ticker.price", { symbol: cur.sym }); price = +t.price; }
        const p = { symbol: cur.sym, side: cur.side, type: cur.type, newOrderRespType: "FULL" };
        let notional, qty;
        if (cur.type === "MARKET" && cur.side === "BUY") { p.quoteOrderQty = (+amt).toFixed(2); notional = amt; qty = amt / price; }
        else {
          qty = +floorTo(amt, r.step);
          if (qty < r.minQty || qty <= 0) throw new Error(`Quantité minimale : ${r.minQty} ${r.base}.`);
          p.quantity = floorTo(amt, r.step);
        }
        if (cur.type === "LIMIT") {
          const lp = +String($("#t-price", body).value).replace(",", ".");
          if (!(lp > 0)) throw new Error("Entre un prix limite.");
          p.price = floorTo(lp, r.tick); p.timeInForce = "GTC";
          if (Math.abs(lp / price - 1) > 0.2) throw new Error("Prix limite à plus de 20 % du cours : vérifie ta saisie.");
          notional = qty * +p.price;
        } else if (notional == null) notional = qty * price;
        if (notional < r.minNotional) throw new Error(`Montant minimal pour cette paire : ${r.minNotional} USDT.`);
        const L = lim();
        if (notional > L.maxOrder) throw new Error(`Au-dessus de ton plafond par ordre (${L.maxOrder} USDT).`);
        if (cur.side === "BUY" && today() + notional > L.maxDaily) throw new Error(`Au-dessus de ton plafond sur 24 h (${L.maxDaily} USDT).`);
        await call("order.test", p, true); // validation par Binance, sans exécution
        const stop = cur.side === "BUY" && $("#t-stop", body).checked ? Math.min(50, Math.max(0.5, +$("#t-stoppct", body).value || 5)) : 0;
        confirmOrder(p, notional, qty, stop, r);
      } catch (e) { M.toast(e.message, "err"); }
      btn.disabled = false;
    }
    function confirmOrder(p, notional, qty, stop, r) {
      const live = R.env === "live";
      const md = M.modal(`<h2>${M.icon("ticket")} Confirmer l'ordre</h2>
        ${live ? `<div class="risk-band live">${M.icon("alert")} Argent <b>réel</b>. L'ordre au marché s'exécute immédiatement et ne peut pas être annulé.</div>` : `<div class="risk-band test">Testnet : argent fictif.</div>`}
        <table class="tbl">
          <tr><td>Paire</td><td><b>${esc(p.symbol)}</b></td></tr>
          <tr><td>Sens</td><td class="${p.side === "BUY" ? "up" : "dn"}"><b>${p.side === "BUY" ? "Achat" : "Vente"}</b></td></tr>
          <tr><td>Type</td><td>${p.type === "MARKET" ? "Au marché" : "À cours limité " + esc(p.price) + " USDT"}</td></tr>
          <tr><td>Quantité ≈</td><td class="mono">${qty.toLocaleString("fr-FR", { maximumFractionDigits: 8 })} ${esc(r.base)}</td></tr>
          <tr><td>Montant ≈</td><td class="mono"><b>${notional.toFixed(2)} USDT</b> (+ frais Binance)</td></tr>
          ${stop ? `<tr><td>Stop de protection</td><td>${stop} % sous le prix d'achat</td></tr>` : ""}
        </table>
        <label class="chk"><input type="checkbox" id="c-ok"> Je confirme cet ordre, passé sur mon compte et sous ma responsabilité.</label>
        <div class="cta"><button class="btn ${p.side === "BUY" ? "primary" : "danger"}" id="c-go" disabled>Envoyer l'ordre</button><button class="btn ghost" data-close>Annuler</button></div>`);
      const go = $("#c-go", md.el);
      let wait = live ? 3 : 0;
      const arm = () => { go.disabled = !($("#c-ok", md.el).checked && wait <= 0); go.textContent = wait > 0 ? `Envoyer l'ordre (${wait})` : "Envoyer l'ordre"; };
      $("#c-ok", md.el).onchange = arm;
      if (wait) { const t = setInterval(() => { wait--; arm(); if (wait <= 0) clearInterval(t); }, 1000); }
      arm();
      go.onclick = async () => {
        go.disabled = true; go.textContent = "Envoi…";
        try {
          const res = await call("order.place", p, true);
          const exQty = +res.executedQty || 0, quote = +res.cummulativeQuoteQty || notional;
          const avg = exQty ? quote / exQty : +p.price || price;
          await logOrder({ t: Date.now(), env: R.env, sym: p.symbol, side: p.side, type: p.type, status: res.status, oid: res.orderId, qty: exQty || +p.quantity || qty, notional: res.status === "NEW" ? notional : quote, price: avg });
          md.close();
          M.toast(res.status === "FILLED" ? `Ordre exécuté ✓ ${exQty} ${r.base} à ~${avg.toFixed(2)}` : `Ordre placé (${res.status})`, "win");
          if (stop && res.status === "FILLED" && exQty > 0) {
            const sp = floorTo(avg * (1 - stop / 100), r.tick), lp = floorTo(avg * (1 - stop / 100) * 0.995, r.tick);
            const q = floorTo(exQty * 0.999, r.step); // marge pour les frais prélevés sur l'actif acheté
            try {
              const s = await call("order.place", { symbol: p.symbol, side: "SELL", type: "STOP_LOSS_LIMIT", quantity: q, stopPrice: sp, price: lp, timeInForce: "GTC" }, true);
              await logOrder({ t: Date.now(), env: R.env, sym: p.symbol, side: "SELL", type: "STOP_LOSS_LIMIT", status: s.status, oid: s.orderId, qty: +q, notional: 0, price: +sp, note: `Stop ${stop} %` });
              M.toast(`Stop de protection placé à ${sp} 🛡️`, "win");
            } catch (e) { M.toast("Stop non placé : " + e.message, "err"); }
          }
          loadBal(); loadOpen();
        } catch (e) {
          await logOrder({ t: Date.now(), env: R.env, sym: p.symbol, side: p.side, type: p.type, status: "REJECTED", notional: 0, note: e.message });
          M.toast(e.message, "err"); md.close();
        }
      };
    }

    function drawPartners() {
      const P = (C().partners || []).filter(p => p && p.name && /^https:\/\//.test(p.url || ""));
      body.innerHTML = `
        ${P.length ? `<div class="partners">${P.map(p => `<div class="glass pad partner"><h3>${esc(p.name)}</h3><p class="small muted">${esc(p.region || "")}${p.regulator ? " · agréé par " + esc(p.regulator) : ""}</p><p>${esc(p.note || "")}</p><a class="btn primary sm" href="${esc(p.url)}" target="_blank" rel="noopener sponsored">Ouvrir un compte</a></div>`).join("")}</div>`
          : `<div class="glass pad sub-note">${M.icon("bank")} Les partenariats avec des courtiers et des SGI sont en cours. En attendant, voici comment choisir un intermédiaire sérieux.</div>`}
        <div class="glass pad"><h3>${M.icon("shield")} Vérifie toujours l'agrément</h3>
          <p class="muted">Avant d'ouvrir un compte, vérifie que l'intermédiaire figure sur la liste officielle de l'autorité de ton pays. Méfie-toi des promesses de gains garantis et des « gestionnaires » qui te contactent sur les réseaux sociaux.</p>
          <table class="tbl">
            <tr><th>Zone</th><th>Autorité de contrôle</th><th>Pour quoi</th></tr>
            <tr><td>UEMOA (Mali, Sénégal, Côte d'Ivoire…)</td><td><a href="https://www.amf-umoa.org" target="_blank" rel="noopener">AMF-UMOA</a></td><td>Actions et obligations de la BRVM, via une SGI agréée</td></tr>
            <tr><td>Russie</td><td><a href="https://www.cbr.ru" target="_blank" rel="noopener">Banque de Russie</a></td><td>Courtiers et comptes IIS sur la Bourse de Moscou</td></tr>
            <tr><td>France / Union européenne</td><td><a href="https://www.amf-france.org" target="_blank" rel="noopener">AMF</a> · <a href="https://www.esma.europa.eu" target="_blank" rel="noopener">ESMA</a></td><td>Courtiers en ligne, PEA, CFD (très risqués)</td></tr>
            <tr><td>Canada</td><td><a href="https://www.ciro.ca" target="_blank" rel="noopener">OCRI / CIRO</a></td><td>Courtiers, comptes CELI et REER</td></tr>
          </table>
          <p class="small muted">Mèche peut recevoir une commission si tu ouvres un compte via un lien partenaire ; cela ne change ni ton prix ni nos explications, et chaque partenaire affiché doit être agréé.</p></div>`;
    }

    function drawJournal() {
      const J = R.journal;
      const fill = J.filter(j => j.status === "FILLED");
      body.innerHTML = `<div class="glass pad">
        <div class="real-h"><h3>${M.icon("book")} Journal des ordres réels</h3><span class="small muted">${J.length} entrées · enregistré sur cet appareil${M.Account && M.Account.session && M.Account.session() ? " et dans ton compte" : ""}</span></div>
        <div class="stats">${M.stat("Ordres exécutés", fill.length)}${M.stat("Volume acheté", fill.filter(j => j.side === "BUY").reduce((a, j) => a + (+j.notional || 0), 0).toFixed(2) + " $")}${M.stat("Volume vendu", fill.filter(j => j.side === "SELL").reduce((a, j) => a + (+j.notional || 0), 0).toFixed(2) + " $")}</div>
        ${J.length ? `<table class="tbl"><tr><th>Date</th><th>Mode</th><th>Paire</th><th>Sens</th><th>Type</th><th>Quantité</th><th>Prix</th><th>Statut</th></tr>${J.map(j => `<tr><td>${new Date(j.t).toLocaleString("fr-FR")}</td><td>${j.env === "live" ? "Réel" : "Test"}</td><td>${esc(j.sym)}</td><td class="${j.side === "BUY" ? "up" : "dn"}">${j.side === "BUY" ? "Achat" : "Vente"}</td><td>${esc(j.type)}</td><td class="mono">${j.qty ? (+j.qty).toLocaleString("fr-FR", { maximumFractionDigits: 8 }) : "—"}</td><td class="mono">${j.price ? (+j.price).toFixed(2) : "—"}</td><td title="${esc(j.note || "")}">${esc(j.status)}</td></tr>`).join("")}</table>` : `<p class="muted">Aucun ordre pour l'instant.</p>`}
        <div class="cta"><button class="btn ghost sm" id="j-csv">${M.icon("download")} Exporter (CSV)</button></div></div>`;
      $("#j-csv", body).onclick = () => {
        const rows = [["date", "mode", "paire", "sens", "type", "quantite", "prix", "montant_usdt", "statut", "id_binance", "note"], ...J.map(j => [new Date(j.t).toISOString(), j.env, j.sym, j.side, j.type, j.qty || "", j.price || "", j.notional || "", j.status, j.oid || "", (j.note || "").replace(/[\r\n;]/g, " ")])];
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([rows.map(r => r.join(";")).join("\n")], { type: "text/csv" }));
        a.download = "meche-journal-reel.csv"; a.click();
      };
    }

    return () => { clearTimeout(priceT); };
  };

  M.Real = { lock, state: () => ({ env: R.env, unlocked: !!keys, accepted: R.accepted === TERMS_V }) };
})();
