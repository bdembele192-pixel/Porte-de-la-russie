/* Comptes utilisateurs (Supabase) :
   · création de compte et connexion par code e-mail, e-mail + mot de passe, SMS, Google ou Apple ;
   · protections : captcha Cloudflare Turnstile (option), mots de passe solides vérifiés contre les fuites connues
     (Have I Been Pwned, sans jamais envoyer le mot de passe), double authentification TOTP, sécurité au niveau
     des lignes de la base (chacun ne lit que ses données) ;
   · synchronisation de la progression, profil, abonnement (M.Account.subscription / hasPerk).
   Sans configuration (config.js), l'app reste en mode local. Guide : docs/COMPTES.md */
window.M = window.M || {};

(function () {
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const C = () => M.CONFIG || {};
  const enabled = () => !!(C().supabaseUrl && C().supabaseAnonKey);
  const PROVIDERS = { google: "Google", apple: "Apple", github: "GitHub", facebook: "Facebook", azure: "Microsoft", discord: "Discord" };
  const SDK = "js/vendor/supabase-2.119.2.js";

  let sb = null, session = null, pushT = null, needMfa = false, subCache = null;

  const loading = {};
  function loadScript(src) {
    return loading[src] = loading[src] || new Promise((ok, ko) => {
      const s = document.createElement("script");
      s.src = src; s.async = true; s.onload = ok; s.onerror = () => { delete loading[src]; ko(new Error("chargement de " + src)); };
      document.head.appendChild(s);
    });
  }

  // Une seule initialisation, même si plusieurs écrans demandent le client en même temps
  let init = null;
  function client() {
    if (!enabled()) return Promise.resolve(null);
    if (sb) return Promise.resolve(sb);
    return init = init || initClient().catch(e => { init = null; throw e; });
  }
  async function initClient() {
    // Bibliothèque Supabase copiée dans le dépôt (pas de code tiers chargé à la volée)
    if (!window.supabase) await loadScript(SDK);
    // PKCE : le retour des réseaux sociaux arrive en ?code=… et ne perturbe pas la navigation par #
    const c = window.supabase.createClient(C().supabaseUrl, C().supabaseAnonKey, {
      auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "meche-auth" }
    });
    // Abonnement aux événements AVANT la lecture de session : le retour d'une connexion Google/Apple ou d'un lien
    // e-mail (échange du ?code=…) déclenche SIGNED_IN pendant cette initialisation
    c.auth.onAuthStateChange((ev, s) => {
      session = s; subCache = null;
      if (ev === "SIGNED_IN") setTimeout(() => client().then(afterLogin), 0);
      if (ev === "PASSWORD_RECOVERY") setTimeout(() => client().then(() => recoveryPrompt()), 0);
      if (ev === "SIGNED_OUT") doneFor = null;
      document.dispatchEvent(new CustomEvent("meche:auth", { detail: { event: ev } }));
      if (location.hash.startsWith("#/account")) M.go("#/account");
    });
    const { data } = await c.auth.getSession();
    session = data.session;
    sb = c;
    if (/[?&]code=/.test(location.search)) {
      const back = sessionStorage.getItem("meche:after") || "#/account";
      sessionStorage.removeItem("meche:after");
      history.replaceState(null, "", location.pathname + back);
    }
    return sb;
  }

  // ---------- Captcha (Cloudflare Turnstile) : bloque les robots qui créent des comptes en masse ----------
  let tsReady = null;
  async function captcha(box) {
    const key = C().turnstileSiteKey;
    if (!key) return undefined;
    tsReady = tsReady || loadScript("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit");
    await tsReady;
    let slot = $(".acc-captcha", box);
    if (!slot) { slot = document.createElement("div"); slot.className = "acc-captcha"; box.appendChild(slot); }
    slot.innerHTML = "";
    return new Promise((ok, ko) => {
      window.turnstile.render(slot, {
        sitekey: key, theme: document.documentElement.dataset.mode === "light" ? "light" : "dark",
        callback: t => ok(t), "error-callback": () => ko(new Error("Vérification anti-robot échouée")), "expired-callback": () => ko(new Error("Vérification expirée"))
      });
    });
  }

  // ---------- Mots de passe ----------
  const policy = p => p.length >= 10 && /[a-zA-Z]/.test(p) && /\d/.test(p);
  // Vérifie si le mot de passe apparaît dans une fuite connue. Seuls les 5 premiers caractères de son empreinte SHA-1
  // sont envoyés (k-anonymat) : le mot de passe lui-même ne quitte jamais l'appareil.
  async function pwned(p) {
    try {
      const h = [...new Uint8Array(await crypto.subtle.digest("SHA-1", new TextEncoder().encode(p)))].map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
      const r = await fetch("https://api.pwnedpasswords.com/range/" + h.slice(0, 5), { headers: { "Add-Padding": "true" } });
      if (!r.ok) return 0;
      const line = (await r.text()).split("\n").find(l => l.startsWith(h.slice(5)));
      return line ? Number(line.split(":")[1]) || 0 : 0;
    } catch { return 0; }
  }
  async function checkNew(p, p2) {
    if (!policy(p)) return "Au moins 10 caractères, avec des lettres et des chiffres.";
    if (p2 != null && p !== p2) return "Les deux mots de passe sont différents.";
    const n = await pwned(p);
    if (n > 0) return `Ce mot de passe apparaît dans ${n.toLocaleString("fr-FR")} fuites de données connues. Choisis-en un autre.`;
    return "";
  }
  const strength = p => {
    let s = 0;
    if (p.length >= 10) s++; if (p.length >= 14) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^\w]/.test(p)) s++;
    return Math.min(4, s);
  };
  // Messages volontairement vagues : ne révèlent pas si une adresse a un compte
  const authErr = e => {
    const m = (e && e.message) || "";
    if (/rate|too many|security purposes/i.test(m)) return "Trop de tentatives. Patiente quelques minutes.";
    if (/captcha/i.test(m)) return "Vérification anti-robot requise ou expirée.";
    if (/invalid login|credentials|not confirmed/i.test(m)) return "E-mail ou mot de passe incorrect (ou adresse pas encore confirmée).";
    if (/weak|pwned|leaked/i.test(m)) return "Mot de passe trop faible ou déjà divulgué.";
    return m || "Erreur inconnue";
  };

  // ---------- Synchronisation ----------
  function exportState() {
    const s = JSON.parse(JSON.stringify(M.state));
    if (s.ai) { s.ai.chat = (s.ai.chat || []).slice(-20); if (s.ai.cfg) s.ai.cfg.claudeKey = ""; } // la clé API ne quitte jamais l'appareil
    delete s.real; // rien du trading réel (coffre chiffré, journal local) n'est envoyé avec la progression
    return s;
  }
  const canSync = () => !M.Access || M.Access.pro();   // synchronisation réservée au Pro
  async function push() {
    if (!session || needMfa || !canSync()) return false;
    const { error } = await sb.from("progress").upsert({ user_id: session.user.id, data: exportState(), updated_at: new Date().toISOString() });
    if (error) { console.warn(error); return false; }
    M.state.cloudSyncedAt = Date.now();
    localStorage.setItem("meche:v1", JSON.stringify(M.state));
    return true;
  }
  async function pull() {
    const { data, error } = await sb.from("progress").select("data, updated_at").eq("user_id", session.user.id).maybeSingle();
    if (error) throw error;
    return data;
  }
  function schedulePush() {
    if (!session) return;
    clearTimeout(pushT);
    pushT = setTimeout(push, 20000);
  }
  const origSave = M.save;
  M.save = function (now) { origSave(now); schedulePush(); };

  async function syncProfile() {
    const name = (M.state.name || "").trim().slice(0, 40);
    if (session && name) await sb.from("profiles").update({ display_name: name, updated_at: new Date().toISOString() }).eq("id", session.user.id);
  }

  // SIGNED_IN est aussi émis au retour sur l'onglet : la synchronisation de connexion ne tourne qu'une fois
  let doneFor = null;
  async function afterLogin() {
    if (!session || doneFor === session.user.id) return;
    doneFor = session.user.id;
    const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") { needMfa = true; doneFor = null; return mfaPrompt(); }
    needMfa = false;
    syncProfile().catch(() => {});
    if (M.Access) await M.Access.refresh();
    if (!canSync()) return;
    let remote = null;
    try { remote = await pull(); } catch (e) { M.toast("Synchronisation impossible : " + e.message, "err"); return; }
    if (!remote) { await push(); M.toast("Compte prêt, progression sauvegardée dans le cloud ☁️", "win"); return; }
    if (M.state.cloudSyncedAt && Date.parse(remote.updated_at) <= M.state.cloudSyncedAt) { await push(); return; }
    const r = remote.data || {};
    const md = M.modal(`
      <h2>Progression trouvée dans ton compte</h2>
      <p>Ton compte contient une progression enregistrée le ${new Date(remote.updated_at).toLocaleString("fr-FR")}.</p>
      <div class="stats">${M.stat("Compte (cloud)", (r.xp || 0) + " XP", "Progression enregistrée dans ton compte.")}${M.stat("Cet appareil", M.state.xp + " XP", "Progression de ce navigateur.")}</div>
      <div class="cta"><button class="btn primary" id="use-cloud">Utiliser celle du compte</button><button class="btn ghost" id="use-local">Garder celle de cet appareil</button></div>`);
    $("#use-cloud", md.el).onclick = () => {
      const key = M.state.ai && M.state.ai.cfg && M.state.ai.cfg.claudeKey;
      if (key && r.ai && r.ai.cfg) r.ai.cfg.claudeKey = key;
      if (M.state.real) r.real = M.state.real; // le coffre local reste sur l'appareil
      r.cloudSyncedAt = Date.now();
      localStorage.setItem("meche:v1", JSON.stringify(r));
      location.reload();
    };
    $("#use-local", md.el).onclick = async () => { md.close(); await push(); M.toast("Progression de cet appareil enregistrée ☁️", "win"); };
  }

  function mfaPrompt() {
    const md = M.modal(`
      <h2>${M.icon("shield")} Double authentification</h2>
      <p>Entre le code à 6 chiffres affiché par ton application d'authentification.</p>
      <span class="inp"><input id="mfa-code" inputmode="numeric" maxlength="6" placeholder="123456" autocomplete="one-time-code"></span>
      <div class="cta"><button class="btn primary" id="mfa-ok">Valider</button><button class="btn ghost" id="mfa-out">Se déconnecter</button></div>`);
    setTimeout(() => $("#mfa-code", md.el).focus(), 100);
    $("#mfa-ok", md.el).onclick = async () => {
      const { data: f } = await sb.auth.mfa.listFactors();
      const factor = f && f.totp && f.totp.find(x => x.status === "verified");
      if (!factor) return M.toast("Aucun facteur 2FA trouvé.", "err");
      const { data: ch, error: e1 } = await sb.auth.mfa.challenge({ factorId: factor.id });
      if (e1) return M.toast(e1.message, "err");
      const { error } = await sb.auth.mfa.verify({ factorId: factor.id, challengeId: ch.id, code: $("#mfa-code", md.el).value.trim() });
      if (error) return M.toast("Code incorrect.", "err");
      md.close(); needMfa = false; M.toast("Connexion sécurisée ✓", "win"); afterLogin();
    };
    $("#mfa-out", md.el).onclick = async () => { md.close(); await sb.auth.signOut(); };
  }

  // Nouveau mot de passe (lien « mot de passe oublié » reçu par e-mail, ou changement depuis le compte)
  function recoveryPrompt(change) {
    const md = M.modal(`
      <h2>${M.icon("key")} ${change ? "Changer de mot de passe" : "Choisis un nouveau mot de passe"}</h2>
      <p class="muted">Au moins 10 caractères, avec des lettres et des chiffres. Il est vérifié contre les fuites de données connues.</p>
      <span class="inp"><input id="np1" type="password" autocomplete="new-password" placeholder="Nouveau mot de passe"></span>
      <span class="inp" style="margin-top:8px"><input id="np2" type="password" autocomplete="new-password" placeholder="Confirme-le"></span>
      <div class="pw-meter"><i></i></div>
      <div class="cta"><button class="btn primary" id="np-ok">Enregistrer</button></div>`);
    const meter = $(".pw-meter i", md.el);
    $("#np1", md.el).oninput = e => { meter.style.width = strength(e.target.value) * 25 + "%"; meter.dataset.s = strength(e.target.value); };
    $("#np-ok", md.el).onclick = async () => {
      const p = $("#np1", md.el).value, why = await checkNew(p, $("#np2", md.el).value);
      if (why) return M.toast(why, "err");
      const { error } = await sb.auth.updateUser({ password: p });
      if (error) return M.toast(authErr(error), "err");
      md.close(); M.toast("Mot de passe enregistré 🔐", "win");
    };
  }

  // ---------- Abonnement ----------
  async function subscription(force) {
    if (!enabled()) return null;
    await client();
    if (!session) return null;
    if (subCache && !force && Date.now() - subCache.t < 60000) return subCache.v;
    const { data } = await sb.from("subscriptions").select("plan_id, status, current_period_end, plans(name, perks, period_days)").eq("user_id", session.user.id).maybeSingle();
    const v = data ? { ...data, active: data.status === "active" && Date.parse(data.current_period_end) > Date.now() } : null;
    subCache = { t: Date.now(), v };
    return v;
  }
  async function hasPerk(perk) {
    const s = await subscription().catch(() => null);
    return !!(s && s.active && s.plans && (s.plans.perks || []).includes(perk));
  }
  async function plans() {
    await client();
    const { data, error } = await sb.from("plans").select("*").eq("active", true).order("sort");
    if (error) throw error;
    return data;
  }

  // ---------- Vue Compte ----------
  const SEC = () => `<div class="glass pad sec-list"><h4>${M.icon("shield")} Comment ton compte est protégé</h4><ul>
      <li><b>Au choix, sans mot de passe</b> : code à usage unique par e-mail ou SMS, ou Google / Apple. Rien à voler en cas de fuite.</li>
      <li><b>Mots de passe solides</b> : 10 caractères minimum, vérifiés contre les fuites connues (seule une empreinte partielle est envoyée), stockés chiffrés (bcrypt) par Supabase, jamais par Mèche.</li>
      <li><b>Double authentification</b> (application TOTP comme Google Authenticator ou Authy) en option.</li>
      <li><b>Cloisonnement</b> : chaque utilisateur ne peut lire que ses propres données (sécurité au niveau des lignes de la base). Les abonnements ne peuvent être modifiés que par le serveur après un paiement vérifié.</li>
      <li><b>Données minimales</b> : progression, profil, abonnement. Ta clé API Claude et tes clés de plateforme de trading ne quittent jamais ton appareil.</li>
      <li>Connexions chiffrées (HTTPS), données chiffrées au repos, protection anti-robots${C().turnstileSiteKey ? " (Cloudflare Turnstile)" : ""} et limitation des tentatives.</li></ul></div>`;

  M.views.account = function (el) {
    if (!enabled()) {
      el.innerHTML = `
        <div class="page-head"><div><p class="eyebrow">${M.icon("profile")} <span>Compte</span></p><h1>Ton compte <span class="grad">Mèche</span></h1>
        <p class="lede">Pour l'instant l'app fonctionne en <b>mode local</b> : ta progression est enregistrée uniquement dans ce navigateur. Tu peux l'exporter dans Paramètres → Données.</p></div></div>
        <div class="glass pad"><h3>Activer les comptes</h3><p class="muted">L'administrateur de l'app doit relier un projet Supabase (gratuit pour démarrer). Le robot GitHub <code>supabase.yml</code> crée la base, déploie les fonctions de paiement et remplit <code>js/config.js</code>. Guide pas à pas : <code>trading/docs/COMPTES.md</code>. Ensuite : e-mail (code ou mot de passe), téléphone, Google et Apple.</p></div>
        ${SEC()}`;
      return;
    }
    el.innerHTML = `<div class="page-head"><div><p class="eyebrow">${M.icon("profile")} <span>Compte</span></p><h1>Ton compte <span class="grad">Mèche</span></h1></div></div><div id="acc" class="glass pad">Chargement…</div>${SEC()}`;
    client().then(() => draw()).catch(e => { $("#acc", el).innerHTML = `Service de comptes injoignable (${esc(e.message)}).`; });

    async function draw() {
      const box = $("#acc", el);
      if (!box) return;
      if (!session) return drawLogin(box);
      const u = session.user;
      const [{ data: f }, sub] = await Promise.all([sb.auth.mfa.listFactors(), subscription(true).catch(() => null)]);
      const totp = (f && f.totp || []).filter(x => x.status === "verified");
      const hasPw = (u.identities || []).some(i => i.provider === "email") || (u.app_metadata && (u.app_metadata.providers || []).includes("email"));
      const subTxt = sub && sub.active
        ? `✅ <b>${esc(sub.plans ? sub.plans.name : sub.plan_id)}</b> jusqu'au ${new Date(sub.current_period_end).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}`
        : "Gratuit";
      box.innerHTML = `
        <div class="acc-user"><span class="av" style="width:56px;height:56px;font-size:26px">${M.state.photo ? `<img src="${M.state.photo}" alt="">` : M.icon("profile")}</span>
          <div><b>${esc(M.state.name || "Trader")}</b><small class="muted">${esc(u.email || u.phone || "")} · connecté via ${esc((u.app_metadata && u.app_metadata.provider) || "code")}</small>
          <small class="muted">${M.state.cloudSyncedAt ? "Synchronisé " + new Date(M.state.cloudSyncedAt).toLocaleString("fr-FR") : "Pas encore synchronisé"}</small></div></div>
        <div class="set-ctl" style="margin:14px 0"><button class="btn primary sm" id="a-sync">${M.icon("refresh")} Synchroniser maintenant</button><button class="btn ghost sm" id="a-out">Se déconnecter</button></div>
        <div class="set-row"><div><b>Région</b><small>${M.Region && M.Region.get() ? esc(M.Region.get().name) + (M.Region.open() ? " · abonnements ouverts" : " · abonnements bientôt disponibles") : "Pas encore choisie"} · modifiable une fois par mois</small></div>
          <div class="set-ctl"><button class="btn ghost sm" id="a-region">${M.icon("globe")} ${M.Region && M.Region.get() ? "Changer" : "Choisir"}</button></div></div>
        <div class="set-row"><div><b>Abonnement</b><small>${subTxt}</small></div>
          <div class="set-ctl"><a class="btn ${sub && sub.active ? "ghost" : "primary"} sm" href="#/abonnement">${M.icon("crown")} ${sub && sub.active ? "Gérer" : "Voir les offres"}</a></div></div>
        ${u.email ? `<div class="set-row"><div><b>Mot de passe</b><small>${hasPw ? "Tu peux aussi te connecter avec ton e-mail et ton mot de passe." : "Facultatif : ajoute un mot de passe pour te connecter sans attendre de code."}</small></div>
          <div class="set-ctl"><button class="btn ghost sm" id="a-pw">${hasPw ? "Changer" : "Ajouter"}</button></div></div>` : ""}
        <div class="set-row"><div><b>Double authentification (2FA)</b><small>${totp.length ? "✅ Activée" : "Recommandée : protège ton compte même si ton e-mail, ton mot de passe ou ton numéro est compromis."}</small></div>
          <div class="set-ctl">${totp.length ? `<button class="btn ghost sm" id="a-2fa-off">Désactiver</button>` : `<button class="btn primary sm" id="a-2fa">Activer</button>`}</div></div>
        <div id="a-2fa-box"></div>
        <div class="set-row"><div><b>Se déconnecter partout</b><small>Ferme la session sur tous tes appareils (en cas de perte ou de doute).</small></div>
          <div class="set-ctl"><button class="btn ghost sm" id="a-all">Partout</button></div></div>
        <div class="set-row"><div><b>Supprimer mes données du cloud</b><small>Efface la progression enregistrée dans ton compte (cet appareil garde sa copie locale).</small></div>
          <div class="set-ctl"><button class="btn danger sm" id="a-del">Supprimer</button></div></div>
        <div class="set-row"><div><b>Supprimer mon compte</b><small>Efface définitivement ton compte, ton profil, ta progression, ton journal d'ordres et ton historique d'abonnement.</small></div>
          <div class="set-ctl"><button class="btn danger sm" id="a-kill">Supprimer le compte</button></div></div>`;
      $("#a-sync", box).onclick = async () => { if (!canSync()) return M.Access.gate("sync"); M.toast(await push() ? "Synchronisé ☁️" : "Échec de la synchronisation", "win"); };
      const rg = $("#a-region", box);
      if (rg) rg.onclick = async () => { await M.Region.pick(); draw(); };
      $("#a-out", box).onclick = async () => { await push(); await sb.auth.signOut(); M.toast("Déconnecté"); };
      $("#a-all", box).onclick = async () => { await push(); await sb.auth.signOut({ scope: "global" }); M.toast("Déconnecté de tous les appareils"); };
      const pw = $("#a-pw", box);
      if (pw) pw.onclick = () => recoveryPrompt(true);
      $("#a-del", box).onclick = async () => {
        if (!confirm("Supprimer la progression enregistrée dans ton compte ?")) return;
        const { error } = await sb.from("progress").delete().eq("user_id", u.id);
        M.toast(error ? error.message : "Données du cloud supprimées", error ? "err" : "win");
      };
      $("#a-kill", box).onclick = async () => {
        if (!confirm("Supprimer définitivement ton compte Mèche ? Cette action est irréversible. Un abonnement en cours ne sera pas remboursé.")) return;
        const { error } = await sb.rpc("delete_my_account");
        if (error) { M.toast("Suppression impossible : " + error.message, "err"); return; }
        await sb.auth.signOut().catch(() => {});
        M.toast("Compte supprimé", "win");
      };
      const off = $("#a-2fa-off", box);
      if (off) off.onclick = async () => {
        if (!confirm("Désactiver la double authentification ?")) return;
        const { error } = await sb.auth.mfa.unenroll({ factorId: totp[0].id });
        M.toast(error ? error.message : "2FA désactivée", error ? "err" : "");
        draw();
      };
      const on = $("#a-2fa", box);
      if (on) on.onclick = async () => {
        const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: "Mèche " + new Date().toISOString().slice(0, 10) });
        if (error) return M.toast(error.message, "err");
        $("#a-2fa-box", box).innerHTML = `<div class="glass pad mfa">
          <p>1. Scanne ce QR code avec Google Authenticator, Authy ou 1Password.</p>
          <img src="${esc(data.totp.qr_code)}" alt="QR code 2FA" width="180" height="180">
          <p class="small muted">Ou entre ce code secret : <code>${esc(data.totp.secret)}</code></p>
          <p>2. Entre le code à 6 chiffres affiché :</p>
          <div class="acc-row"><span class="inp"><input id="a-2fa-code" inputmode="numeric" maxlength="6"></span><button class="btn primary" id="a-2fa-ok">Valider</button></div></div>`;
        $("#a-2fa-ok", box).onclick = async () => {
          const { data: ch, error: e1 } = await sb.auth.mfa.challenge({ factorId: data.id });
          if (e1) return M.toast(e1.message, "err");
          const { error: e2 } = await sb.auth.mfa.verify({ factorId: data.id, challengeId: ch.id, code: $("#a-2fa-code", box).value.trim() });
          if (e2) return M.toast("Code incorrect.", "err");
          M.toast("Double authentification activée 🔐", "win");
          draw();
        };
      };
    }

    function drawLogin(box) {
      const prov = (C().oauthProviders || []).filter(p => PROVIDERS[p]);
      const tabs = [["code", "Code e-mail"], ["pass", "Mot de passe"]];
      if (C().phoneLogin) tabs.push(["phone", "Téléphone"]);
      if (prov.length) tabs.push(["social", prov.slice(0, 2).map(p => PROVIDERS[p]).join(" / ")]);
      box.innerHTML = `
        <h3 style="margin-top:0">Crée ton compte ou connecte-toi</h3>
        <p class="muted small">${M.Access && M.Access.on() ? "<b>3 jours de Pro offerts</b> à la création du compte, sans moyen de paiement. Ensuite, le Gratuit reste gratuit." : "Un compte garde ta progression sur tous tes appareils et permet de t'abonner. C'est gratuit."}</p>
        <div class="tabs acc-tabs">${tabs.map(([k, t], i) => `<a class="${i ? "" : "on"}" data-t="${k}">${t}</a>`).join("")}</div>
        <div id="acc-f"></div>
        <p class="small muted" style="margin-top:14px">En créant un compte, tu acceptes les <a href="legal.html" target="_blank" rel="noopener">conditions et la politique de confidentialité</a>.</p>`;
      const otpForm = (kind) => `
        <p class="muted">${kind === "mail" ? "On t'envoie un code à 6 chiffres. Si tu n'as pas encore de compte, il est créé automatiquement." : "Numéro au format international, par exemple +223 70 00 00 00. Un SMS avec un code te sera envoyé."}</p>
        <div class="acc-row"><span class="inp">${kind === "mail" ? `<input id="a-id" type="email" placeholder="toi@exemple.com" autocomplete="email">` : `<input id="a-id" type="tel" placeholder="+223…" autocomplete="tel">`}</span><button class="btn primary" id="a-send">${kind === "mail" ? "Recevoir un code" : "Recevoir un SMS"}</button></div>
        <div class="acc-row" id="a-step2" hidden><span class="inp"><input id="a-code" inputmode="numeric" maxlength="8" placeholder="Code reçu" autocomplete="one-time-code"></span><button class="btn primary" id="a-ok">Se connecter</button></div>`;
      const forms = {
        code: otpForm("mail"),
        phone: otpForm("phone"),
        pass: `<div class="seg pw-mode"><button class="on" data-m="in">J'ai un compte</button><button data-m="up">Créer un compte</button></div>
          <form id="pw-form" autocomplete="on">
            <div class="acc-row"><span class="inp"><input id="p-mail" type="email" placeholder="toi@exemple.com" autocomplete="username" required></span></div>
            <div class="acc-row"><span class="inp"><input id="p-pass" type="password" placeholder="Mot de passe" autocomplete="current-password" required></span></div>
            <div class="acc-row" id="p-conf" hidden><span class="inp"><input id="p-pass2" type="password" placeholder="Confirme le mot de passe" autocomplete="new-password"></span></div>
            <div class="pw-meter" id="p-meter" hidden><i></i></div>
            <p class="small muted" id="p-hint" hidden>Au moins 10 caractères, avec des lettres et des chiffres. Vérifié contre les fuites connues.</p>
            <div class="acc-row"><button class="btn primary" id="p-go" type="submit">Se connecter</button><button class="btn ghost" id="p-forgot" type="button">Mot de passe oublié ?</button></div>
          </form>`,
        social: `<p class="muted">Connexion via un compte que tu as déjà. Mèche ne voit jamais ton mot de passe.</p>
          <div class="acc-social">${prov.map(p => `<button class="btn ghost" data-p="${p}">Continuer avec ${PROVIDERS[p]}</button>`).join("")}</div>`
      };
      const show = t => {
        $$(".acc-tabs a", box).forEach(a => a.classList.toggle("on", a.dataset.t === t));
        const f = $("#acc-f", box);
        f.innerHTML = forms[t];
        if (t === "code" || t === "phone") bindOtp(f, t === "code");
        if (t === "pass") bindPass(f);
        $$("[data-p]", f).forEach(b => b.onclick = async () => {
          sessionStorage.setItem("meche:after", "#/account");
          const { error } = await sb.auth.signInWithOAuth({ provider: b.dataset.p, options: { redirectTo: location.origin + location.pathname } });
          if (error) M.toast(authErr(error), "err");
        });
      };
      $$(".acc-tabs a", box).forEach(a => a.onclick = () => show(a.dataset.t));
      show("code");
    }

    function bindOtp(f, isMail) {
      const send = $("#a-send", f);
      send.onclick = async () => {
        const id = (isMail ? $("#a-id", f).value : $("#a-id", f).value.replace(/[\s.-]+/g, "")).trim();
        if (isMail ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id) : !/^\+\d{8,15}$/.test(id)) return M.toast(isMail ? "Adresse e-mail invalide" : "Numéro invalide (format +223…)", "err");
        send.disabled = true;
        try {
          const captchaToken = await captcha(f);
          const { error } = await sb.auth.signInWithOtp(isMail
            ? { email: id, options: { captchaToken, emailRedirectTo: location.origin + location.pathname } }
            : { phone: id, options: { captchaToken } });
          if (error) throw error;
          $("#a-step2", f).hidden = false; $("#a-code", f).focus();
          M.toast(isMail ? "Code envoyé par e-mail ✉️" : "SMS envoyé 📱");
          // Le bouton reste bloqué 60 s pour éviter d'envoyer des codes en rafale
          let n = 60; const t = setInterval(() => { send.textContent = `Renvoyer (${--n})`; if (n <= 0) { clearInterval(t); send.disabled = false; send.textContent = "Renvoyer"; } }, 1000);
        } catch (e) { send.disabled = false; return M.toast(authErr(e), "err"); }
        $("#a-ok", f).onclick = async () => {
          const token = $("#a-code", f).value.trim();
          const { error: e2 } = await sb.auth.verifyOtp(isMail ? { email: id, token, type: "email" } : { phone: id, token, type: "sms" });
          if (e2) return M.toast("Code incorrect ou expiré.", "err");
          M.toast("Connecté ✓", "win");
        };
      };
    }

    function bindPass(f) {
      let mode = "in";
      const meter = $("#p-meter i", f);
      $("#pw-form", f).onsubmit = e => e.preventDefault();
      $$(".pw-mode button", f).forEach(b => b.onclick = () => {
        mode = b.dataset.m;
        $$(".pw-mode button", f).forEach(x => x.classList.toggle("on", x === b));
        const up = mode === "up";
        $("#p-conf", f).hidden = !up; $("#p-meter", f).hidden = !up; $("#p-hint", f).hidden = !up; $("#p-forgot", f).hidden = up;
        $("#p-pass", f).autocomplete = up ? "new-password" : "current-password";
        $("#p-go", f).textContent = up ? "Créer mon compte" : "Se connecter";
      });
      $("#p-pass", f).oninput = e => { const s = strength(e.target.value); meter.style.width = s * 25 + "%"; meter.dataset.s = s; };
      $("#p-go", f).onclick = async () => {
        const email = $("#p-mail", f).value.trim(), password = $("#p-pass", f).value;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return M.toast("Adresse e-mail invalide", "err");
        const go = $("#p-go", f); go.disabled = true;
        try {
          if (mode === "up") {
            const why = await checkNew(password, $("#p-pass2", f).value);
            if (why) throw new Error(why);
          } else if (!password) throw new Error("Entre ton mot de passe.");
          const captchaToken = await captcha(f);
          if (mode === "up") {
            const { data, error } = await sb.auth.signUp({ email, password, options: { captchaToken, emailRedirectTo: location.origin + location.pathname, data: { display_name: (M.state.name || "").slice(0, 40) } } });
            if (error) throw error;
            if (!data.session) M.modal(`<h2>${M.icon("mail")} Vérifie ta boîte mail</h2><p>Si cette adresse peut être utilisée, un lien de confirmation vient d'être envoyé à <b>${esc(email)}</b>. Clique dessus pour activer ton compte, puis reviens te connecter.</p><p class="small muted">Pense à regarder dans les courriers indésirables.</p><div class="cta"><button class="btn primary" data-close>OK</button></div>`);
          } else {
            const { error } = await sb.auth.signInWithPassword({ email, password, options: { captchaToken } });
            if (error) throw error;
            M.toast("Connecté ✓", "win");
          }
        } catch (e) { M.toast(authErr(e), "err"); }
        go.disabled = false;
      };
      $("#p-forgot", f).onclick = async () => {
        const email = $("#p-mail", f).value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return M.toast("Entre d'abord ton adresse e-mail", "err");
        try {
          const captchaToken = await captcha(f);
          const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname, captchaToken });
          if (error) throw error;
          M.toast("Si un compte existe, un lien de réinitialisation a été envoyé ✉️");
        } catch (e) { M.toast(authErr(e), "err"); }
      };
    }
  };

  M.Account = { enabled, client, push, session: () => session, subscription, hasPerk, plans, sb: () => sb };

  document.addEventListener("DOMContentLoaded", () => {
    // Initialise tôt pour traiter le retour d'une connexion par réseau social ou d'un lien e-mail (?code=…)
    if (enabled()) client().catch(e => console.warn("Comptes indisponibles :", e.message));
  });
})();
