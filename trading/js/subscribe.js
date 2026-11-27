/* Abonnement (#/abonnement) — modèle du pilote Afrique de l'Ouest :
   · deux offres : Gratuit (limité) et Pro (accès complet) ;
   · le Pro se paie en pass prépayés : 1 jour, 7 jours, 1 mois, 3 mois, 6 mois, en FCFA par mobile money ou carte (CinetPay) ;
   · prix lus dans la base (table plans) ; le navigateur ne fixe jamais le prix : la fonction serveur « checkout » crée
     la page de paiement et « payment-webhook » prolonge l'abonnement après vérification. Guide : docs/PAIEMENTS.md */
window.M = window.M || {};

(function () {
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const C = () => M.CONFIG || {};

  const PROVIDERS = {
    cinetpay: { cur: "XOF", name: "Mobile money ou carte", sub: "Orange Money, Wave, Moov, MTN, Free, Visa, Mastercard · FCFA", ic: "phone", hosts: ["cinetpay.com"] },
    stripe: { cur: "EUR", name: "Carte bancaire", sub: "Visa, Mastercard, Apple Pay, Google Pay", ic: "wallet", hosts: ["checkout.stripe.com"] }
  };
  // Pass Pro par défaut (identiques au contenu initial de la table plans), affichés tant que la base n'est pas reliée
  const PASSES = [
    { id: "pro-1j", name: "Pro · 1 jour", period_days: 1, prices: { XOF: 300 } },
    { id: "pro-7j", name: "Pro · 7 jours", period_days: 7, prices: { XOF: 1000 } },
    { id: "pro-1m", name: "Pro · 1 mois", period_days: 30, prices: { XOF: 3000 } },
    { id: "pro-3m", name: "Pro · 3 mois", period_days: 90, prices: { XOF: 8000 } },
    { id: "pro-6m", name: "Pro · 6 mois", period_days: 180, prices: { XOF: 15000 } }
  ];
  const COMPARE = [
    ["Trading live en argent virtuel", "Oui", "Oui"],
    ["Cours de l'Académie", "5 modules + gestion du risque", "Tous les modules"],
    ["Missions (krachs historiques)", "6 missions", "Toutes les missions"],
    ["Quiz", "6 unités", "Toutes les unités"],
    ["Mèche IA", "5 questions par jour", "Sans limite"],
    ["Backtest", "5 lancements par jour", "Sans limite"],
    ["Labo options", "4 stratégies", "Toutes les stratégies"],
    ["Vega Desk", "1 session par jour", "Sans limite"],
    ["Trading réel (ton compte Binance)", "Mode test (argent fictif)", "Mode test et compte réel"],
    ["Synchronisation entre appareils", "Non", "Oui"]
  ];
  const label = d => d === 1 ? "1 jour" : d === 7 ? "7 jours" : d === 30 ? "1 mois" : d === 90 ? "3 mois" : d === 180 ? "6 mois" : d + " jours";
  const fcfa = v => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";
  const fmt = (v, cur) => v == null ? null : cur === "XOF" ? fcfa(v) : new Intl.NumberFormat("fr-FR", { style: "currency", currency: cur }).format(v);
  const safeUrl = (u, p) => { try { const x = new URL(u); return x.protocol === "https:" && p.hosts.some(h => x.hostname === h || x.hostname.endsWith("." + h)); } catch { return false; } };

  M.views.abonnement = function (el, [ret]) {
    const A = M.Account, on = A && A.enabled();
    const pays = (C().payments || []).filter(p => PROVIDERS[p]);
    let passes = PASSES, pick = "pro-1m";
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">${M.icon("crown")} <span>Abonnement</span></p>
        <h1>Gratuit ou <span class="grad">Pro</span></h1>
        <p class="lede">Le Gratuit suffit pour découvrir. Le Pro ouvre tout : tous les cours, toutes les missions, Mèche IA sans limite et le trading réel encadré. Tu paies seulement la durée que tu choisis, sans prélèvement automatique.</p></div></div>
      <div id="sub-ret"></div>
      <div id="sub-region"></div>
      <div id="sub-me"></div>
      <div class="plans two">
        <div class="glass pad plan">
          <h3>Gratuit</h3><p class="muted small">Pour découvrir Mèche, sans limite de temps.</p>
          <div class="plan-price"><b>0 FCFA</b><span>pour toujours</span></div>
          <ul class="plan-f">${COMPARE.map(([k, f]) => `<li class="${f === "Non" ? "no" : ""}">${M.icon(f === "Non" ? "x" : "check")} <span><b>${esc(k)}</b> : ${esc(f)}</span></li>`).join("")}</ul>
        </div>
        <div class="glass pad plan hot">
          <span class="plan-tag">Accès complet</span>
          <h3>Pro</h3><p class="muted small">Tout Mèche, pour la durée de ton choix.</p>
          <div class="plan-price"><b id="pro-from">3 000 FCFA</b><span>par mois · ou dès 300 FCFA la journée</span></div>
          <ul class="plan-f">${COMPARE.map(([k, , p]) => `<li>${M.icon("check")} <span><b>${esc(k)}</b> : ${esc(p)}</span></li>`).join("")}</ul>
          <div id="passes" class="passes"></div>
          <div id="pay" class="plan-pay"></div>
        </div>
      </div>
      <div class="glass pad sub-pay">
        <h4>${M.icon("shield")} Paiement sécurisé</h4>
        <div class="pay-list">${pays.map(k => `<div class="pay-i">${M.icon(PROVIDERS[k].ic)}<div><b>${PROVIDERS[k].name}</b><small>${PROVIDERS[k].sub}</small></div></div>`).join("")}</div>
        <p class="small muted">Tu paies sur la page sécurisée de CinetPay : Mèche ne voit ni ne stocke jamais ton numéro de carte ni ton code mobile money. Le montant est fixé par le serveur et le Pro n'est activé qu'après confirmation du paiement. Chaque pass s'ajoute à ta période en cours, rien n'est prélevé ensuite. Voir les <a href="legal.html#paiements" target="_blank" rel="noopener">conditions de vente</a>.</p>
      </div>`;

    if (ret === "ok" || ret === "retour") $("#sub-ret", el).innerHTML = `<div class="glass pad sub-note win">${M.icon("check")} <b>Merci !</b> Ton paiement est en cours de vérification. Le Pro s'active dès que le prestataire le confirme (en général moins d'une minute). <button class="btn ghost sm" id="sub-refresh">${M.icon("refresh")} Actualiser</button></div>`;
    if (ret === "annule") $("#sub-ret", el).innerHTML = `<div class="glass pad sub-note">Paiement annulé : rien n'a été débité.</div>`;
    const rf = $("#sub-refresh", el);
    if (rf) rf.onclick = () => drawMe(true);

    function drawRegion() {
      const r = M.Region && M.Region.get();
      $("#sub-region", el).innerHTML = `<div class="glass pad sub-note">${M.icon("globe")} Ta région : <b>${r ? esc(r.name) : "pas encore choisie"}</b>${r && !M.Region.open() ? " · <span class='warn'>les abonnements n'y sont pas encore ouverts : le pilote commence en Afrique de l'Ouest. Le Gratuit reste disponible.</span>" : ""} <button class="btn ghost sm" id="sub-rg">${r ? "Changer" : "Choisir"}</button></div>`;
      $("#sub-rg", el).onclick = async () => { await M.Region.pick(); drawRegion(); drawPasses(); };
    }
    async function drawMe(force) {
      const box = $("#sub-me", el);
      if (!on) { box.innerHTML = `<div class="glass pad sub-note">${M.icon("lock")} Les abonnements ouvriront avec les comptes. En attendant, tout Mèche reste accessible gratuitement.</div>`; return; }
      await A.client();
      if (!A.session()) { box.innerHTML = `<div class="glass pad sub-note">${M.icon("profile")} <a href="#/account">Crée ton compte</a> : <b>3 jours de Pro offerts</b>, sans moyen de paiement. Ton abonnement suivra ton compte sur tous tes appareils.</div>`; return; }
      const s = await A.subscription(force).catch(() => null);
      if (M.Access) M.Access.refresh();
      const end = s && new Date(s.current_period_end).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
      box.innerHTML = s && s.active
        ? `<div class="glass pad sub-note win">${M.icon("crown")} ${s.plan_id === "pro-essai" ? "Essai Pro offert" : "Pro actif"} jusqu'au <b>${end}</b>. Un nouveau pass s'ajoute à la suite.</div>`
        : `<div class="glass pad sub-note">${M.icon("profile")} Tu es sur le Gratuit.${s && !s.active ? ` Ton Pro a pris fin le ${end}.` : ""}</div>`;
    }
    function drawPasses() {
      const month = passes.find(p => p.period_days === 30);
      const perDayMonth = month ? month.prices.XOF / 30 : null;
      $("#passes", el).innerHTML = `<p class="small muted" style="margin:6px 0;grid-column:1/-1">Choisis ta durée :</p>` + passes.map(p => {
        const v = p.prices && p.prices.XOF, perDay = v ? Math.round(v / p.period_days) : null;
        const save = perDayMonth && p.period_days > 30 && v ? Math.round((1 - v / (perDayMonth * p.period_days)) * 100) : 0;
        return `<button class="pass ${p.id === pick ? "on" : ""}" data-p="${esc(p.id)}" ${v ? "" : "disabled"}>
          <b>${label(p.period_days)}</b><span class="mono">${v ? fcfa(v) : "—"}</span><small>${perDay ? perDay + " FCFA / jour" : ""}${save > 0 ? ` · -${save} %` : ""}</small></button>`;
      }).join("");
      $$(".pass", el).forEach(b => b.onclick = () => { pick = b.dataset.p; drawPasses(); });
      const p = passes.find(x => x.id === pick) || passes[0];
      const regionOk = !M.Region || !M.Region.get() || M.Region.open();
      $("#pay", el).innerHTML = pays.map(k => {
        const v = p.prices && p.prices[PROVIDERS[k].cur];
        return `<button class="btn primary" data-prov="${k}" ${v && regionOk ? "" : "disabled"}>${M.icon(PROVIDERS[k].ic)} Payer ${v ? fmt(v, PROVIDERS[k].cur) : ""} · ${PROVIDERS[k].name}</button>`;
      }).join("") || `<p class="small muted">Paiement bientôt disponible.</p>`;
      $$("[data-prov]", el).forEach(b => b.onclick = () => buy(p, b.dataset.prov, b));
    }
    async function buy(p, prov, btn) {
      if (!on) return M.toast("Les abonnements ouvriront avec les comptes.", "err");
      await A.client();
      if (!A.session()) { M.toast("Crée ton compte d'abord : 3 jours de Pro offerts"); return M.go("#/account"); }
      if (!M.Region.get()) { await M.Region.pick("Choisis ta région avant de payer."); if (!M.Region.get()) return; drawRegion(); }
      if (!M.Region.open()) return M.toast("Les abonnements ne sont pas encore ouverts dans ta région.", "err");
      const P = PROVIDERS[prov], v = p.prices[P.cur];
      const md = M.modal(`<h2>${M.icon("crown")} ${esc(p.name)}</h2>
        <p>Montant : <b>${fmt(v, P.cur)}</b> pour ${label(p.period_days)} d'accès complet, payé par <b>${P.name}</b>.</p>
        <p class="small muted">Tu vas être redirigé vers la page sécurisée du prestataire. Paiement unique : rien n'est prélevé ensuite. La durée s'ajoute à ton abonnement en cours.</p>
        <div class="cta"><button class="btn primary" id="go-pay">Continuer vers le paiement</button><button class="btn ghost" data-close>Annuler</button></div>`);
      $("#go-pay", md.el).onclick = async () => {
        const go = $("#go-pay", md.el); go.disabled = true; go.textContent = "Préparation…"; btn.disabled = true;
        try {
          const { data, error } = await A.sb().functions.invoke("checkout", { body: { plan_id: p.id, provider: prov } });
          if (error) {
            let msg = error.message;
            try { const j = await error.context.json(); if (j && j.error) msg = j.error; } catch { /* réponse sans JSON */ }
            throw new Error(msg);
          }
          if (!data || !safeUrl(data.url, P)) throw new Error("Adresse de paiement inattendue : paiement bloqué par sécurité.");
          location.href = data.url;
        } catch (e) { M.toast(e.message, "err"); md.close(); btn.disabled = false; }
      };
    }

    drawRegion();
    drawPasses();
    drawMe();
    if (on) A.plans().then(d => {
      const pro = (d || []).filter(p => p.buyable !== false && (p.perks || []).includes("pro")).sort((a, b) => a.period_days - b.period_days);
      if (pro.length) {
        passes = pro;
        if (!passes.some(p => p.id === pick)) pick = (passes.find(p => p.period_days === 30) || passes[0]).id;
        const m = passes.find(p => p.period_days === 30);
        if (m && m.prices.XOF) $("#pro-from", el).textContent = fcfa(m.prices.XOF);
        drawPasses();
      }
    }).catch(e => console.warn("Offres :", e.message));
    const onRegion = () => { drawRegion(); drawPasses(); };
    document.addEventListener("meche:region", onRegion);
    return () => document.removeEventListener("meche:region", onRegion);
  };

  // Compatibilité : ancienne aide « fonction réservée aux abonnés »
  M.premium = async function (perk) {
    if (!M.Access || M.Access.pro()) return true;
    return M.Access.gate(perk);
  };
})();
