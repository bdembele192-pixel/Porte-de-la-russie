/* Abonnements (#/abonnement) : offres lues dans la base (table plans), paiement par CinetPay (mobile money UEMOA,
   FCFA), Stripe (cartes, EUR) ou YooKassa (Russie, RUB). Le navigateur ne fixe jamais le prix : il demande à la
   fonction serveur « checkout » une page de paiement, et l'abonnement n'est prolongé qu'après vérification du
   paiement par la fonction « payment-webhook ». Guide : docs/PAIEMENTS.md */
window.M = window.M || {};

(function () {
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const C = () => M.CONFIG || {};

  const PROVIDERS = {
    cinetpay: { cur: "XOF", name: "Mobile money", sub: "Orange Money, Moov, Wave, MTN… · FCFA", ic: "phone", hosts: ["cinetpay.com"] },
    stripe: { cur: "EUR", name: "Carte bancaire", sub: "Visa, Mastercard, Apple Pay, Google Pay", ic: "wallet", hosts: ["checkout.stripe.com"] },
    yookassa: { cur: "RUB", name: "Russie", sub: "Cartes Mir, SBP, YooMoney · roubles", ic: "bank", hosts: ["yoomoney.ru", "yookassa.ru"] }
  };
  // Offres par défaut, affichées quand la base n'est pas encore reliée (identiques au contenu initial de la table plans)
  const DEFAULT = [
    { id: "gratuit", name: "Gratuit", description: "Tout pour apprendre, sans payer.", features: ["Trading live en argent virtuel", "Académie, quiz et glossaire", "Missions Time Machine", "Coach et copilote (règles de risque)"], perks: [], period_days: 3650, prices: { XOF: 0, EUR: 0, RUB: 0 } },
    { id: "premium", name: "Premium", description: "Pour progresser plus vite.", features: ["Tout le gratuit", "Mèche IA (Claude) sans limite", "Analyses du coach détaillées", "Synchronisation sur tous tes appareils", "Sans publicité, pour toujours"], perks: ["ia", "coach"], period_days: 30, prices: { XOF: null, EUR: null, RUB: null } },
    { id: "premium-an", name: "Premium · 1 an", description: "Premium payé une fois pour l'année.", features: ["Tout le Premium", "12 mois pour le prix fixé à l'année"], perks: ["ia", "coach"], period_days: 365, prices: { XOF: null, EUR: null, RUB: null } },
    { id: "pro", name: "Pro", description: "Pour passer au réel avec méthode.", features: ["Tout le Premium", "Trading réel connecté à ton compte Binance", "Journal des ordres réels synchronisé", "Vega Desk : sessions sauvegardées"], perks: ["ia", "coach", "reel"], period_days: 30, prices: { XOF: null, EUR: null, RUB: null } }
  ];
  const fmt = (v, cur) => v == null ? null : v === 0 ? "0" : new Intl.NumberFormat("fr-FR", { style: "currency", currency: cur, maximumFractionDigits: cur === "XOF" ? 0 : 2 }).format(v);
  const period = d => d >= 3000 ? "" : d >= 360 ? " / an" : d >= 28 && d <= 31 ? " / mois" : ` / ${d} jours`;
  const safeUrl = (u, p) => { try { const x = new URL(u); return x.protocol === "https:" && p.hosts.some(h => x.hostname === h || x.hostname.endsWith("." + h)); } catch { return false; } };

  M.views.abonnement = function (el, [ret]) {
    const A = M.Account, on = A && A.enabled();
    const pays = (C().payments || []).filter(p => PROVIDERS[p]);
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">${M.icon("crown")} <span>Abonnement</span></p>
        <h1>Choisis ton <span class="grad">offre</span></h1>
        <p class="lede">L'essentiel de Mèche reste gratuit. Les offres payantes ajoutent l'IA sans limite, le coach détaillé et le trading réel encadré. Sans engagement : chaque paiement couvre une période, rien n'est prélevé automatiquement.</p></div></div>
      <div id="sub-ret"></div>
      <div id="sub-me"></div>
      <div class="plans" id="plans"><div class="glass pad">Chargement des offres…</div></div>
      <div class="glass pad sub-pay">
        <h4>${M.icon("shield")} Paiement sécurisé</h4>
        <div class="pay-list">${Object.entries(PROVIDERS).map(([k, p]) => `<div class="pay-i ${pays.includes(k) ? "" : "off"}">${M.icon(p.ic)}<div><b>${p.name}</b><small>${p.sub}</small></div></div>`).join("")}</div>
        <p class="small muted">Tu paies sur la page sécurisée du prestataire (CinetPay, Stripe ou YooKassa) : Mèche ne voit ni ne stocke jamais ton numéro de carte ni ton code mobile money. Le montant est fixé par le serveur et l'abonnement n'est activé qu'après confirmation du paiement par le prestataire. Les prix s'entendent toutes taxes comprises. Voir les <a href="legal.html#paiements" target="_blank" rel="noopener">conditions de vente</a>.</p>
      </div>`;

    if (ret === "ok" || ret === "retour") $("#sub-ret", el).innerHTML = `<div class="glass pad sub-note win">${M.icon("check")} <b>Merci !</b> Ton paiement est en cours de vérification. L'abonnement s'active dès que le prestataire le confirme (en général moins d'une minute). <button class="btn ghost sm" id="sub-refresh">${M.icon("refresh")} Actualiser</button></div>`;
    if (ret === "annule") $("#sub-ret", el).innerHTML = `<div class="glass pad sub-note">Paiement annulé : rien n'a été débité.</div>`;
    const rf = $("#sub-refresh", el);
    if (rf) rf.onclick = () => drawMe(true);

    let plans = DEFAULT;
    async function drawMe(force) {
      const box = $("#sub-me", el);
      if (!on) { box.innerHTML = `<div class="glass pad sub-note">${M.icon("lock")} Les abonnements seront disponibles dès que les comptes seront activés. En attendant, tout ce qui est gratuit reste accessible.</div>`; return; }
      await A.client();
      if (!A.session()) { box.innerHTML = `<div class="glass pad sub-note">${M.icon("profile")} <a href="#/account">Crée ton compte ou connecte-toi</a> pour t'abonner : ton abonnement suivra ton compte sur tous tes appareils.</div>`; return; }
      const s = await A.subscription(force).catch(() => null);
      box.innerHTML = s && s.active
        ? `<div class="glass pad sub-note win">${M.icon("crown")} Abonnement <b>${esc(s.plans ? s.plans.name : s.plan_id)}</b> actif jusqu'au <b>${new Date(s.current_period_end).toLocaleDateString("fr-FR")}</b>. Un nouveau paiement prolonge la période en cours.</div>`
        : `<div class="glass pad sub-note">${M.icon("profile")} Tu es sur l'offre gratuite.${s && !s.active ? ` Ton abonnement ${esc(s.plans ? s.plans.name : "")} a expiré le ${new Date(s.current_period_end).toLocaleDateString("fr-FR")}.` : ""}</div>`;
    }
    function drawPlans() {
      $("#plans", el).innerHTML = plans.map(p => {
        const free = Object.values(p.prices || {}).every(v => v === 0);
        const prices = pays.map(k => [k, fmt((p.prices || {})[PROVIDERS[k].cur], PROVIDERS[k].cur)]);
        const anyPrice = prices.some(([, v]) => v);
        return `<div class="glass pad plan ${p.id === "premium" ? "hot" : ""}">
          ${p.id === "premium" ? `<span class="plan-tag">Le plus choisi</span>` : ""}
          <h3>${esc(p.name)}</h3><p class="muted small">${esc(p.description || "")}</p>
          <div class="plan-price">${free ? `<b>Gratuit</b><span>pour toujours</span>` : anyPrice ? prices.filter(([, v]) => v).map(([k, v]) => `<b>${v}</b><span>${period(p.period_days)}</span>`).slice(0, 1).join("") : `<b class="tbd">Prix à fixer</b><span>bientôt disponible</span>`}</div>
          ${!free && anyPrice ? `<p class="small muted">${prices.filter(([, v]) => v).map(([, v]) => v).join(" · ")}</p>` : ""}
          <ul class="plan-f">${(p.features || []).map(f => `<li>${M.icon("check")} ${esc(f)}</li>`).join("")}</ul>
          ${free ? `<button class="btn ghost" disabled>Offre actuelle de base</button>` : `<div class="plan-pay">${pays.map(k => {
            const v = (p.prices || {})[PROVIDERS[k].cur];
            return `<button class="btn ${v ? "primary" : "ghost"} sm" data-plan="${esc(p.id)}" data-prov="${k}" ${v ? "" : "disabled"} title="${v ? "" : "Prix pas encore fixé"}">${M.icon(PROVIDERS[k].ic)} ${PROVIDERS[k].name}${v ? " · " + fmt(v, PROVIDERS[k].cur) : ""}</button>`;
          }).join("")}</div>`}
        </div>`;
      }).join("");
      $$("[data-plan]", el).forEach(b => b.onclick = () => buy(b.dataset.plan, b.dataset.prov, b));
    }
    async function buy(plan, prov, btn) {
      if (!on) return M.toast("Les comptes ne sont pas encore activés.", "err");
      await A.client();
      if (!A.session()) { M.toast("Connecte-toi d'abord pour t'abonner"); return M.go("#/account"); }
      const p = plans.find(x => x.id === plan), P = PROVIDERS[prov];
      const md = M.modal(`<h2>${M.icon("crown")} ${esc(p.name)}</h2>
        <p>Montant : <b>${fmt(p.prices[P.cur], P.cur)}</b> pour ${p.period_days >= 360 ? "1 an" : p.period_days + " jours"}, payé par <b>${P.name}</b>.</p>
        <p class="small muted">Tu vas être redirigé vers la page sécurisée du prestataire. Paiement unique : aucun prélèvement automatique ensuite.</p>
        <div class="cta"><button class="btn primary" id="go-pay">Continuer vers le paiement</button><button class="btn ghost" data-close>Annuler</button></div>`);
      $("#go-pay", md.el).onclick = async () => {
        const go = $("#go-pay", md.el); go.disabled = true; go.textContent = "Préparation…"; btn.disabled = true;
        try {
          const { data, error } = await A.sb().functions.invoke("checkout", { body: { plan_id: plan, provider: prov } });
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

    drawPlans();
    drawMe();
    if (on) A.plans().then(d => { if (d && d.length) { plans = d; drawPlans(); } }).catch(e => console.warn("Offres :", e.message));
  };

  // Fonction réservée aux abonnés si l'administrateur l'a décidé (config.premiumGates). Renvoie true si accès autorisé.
  M.premium = async function (perk) {
    if (!(C().premiumGates || []).includes(perk)) return true;
    if (M.Account && await M.Account.hasPerk(perk)) return true;
    M.modal(`<h2>${M.icon("crown")} Réservé aux abonnés</h2><p>Cette fonction fait partie des offres payantes de Mèche.</p>
      <div class="cta"><a class="btn primary" href="#/abonnement" data-close>Voir les offres</a><button class="btn ghost" data-close>Plus tard</button></div>`);
    return false;
  };
})();
