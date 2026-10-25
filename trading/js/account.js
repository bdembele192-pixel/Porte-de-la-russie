/* Comptes utilisateurs (Supabase) : connexion sans mot de passe par code e-mail ou SMS, ou via un réseau
   (Google, Apple, GitHub, Facebook), double authentification TOTP, synchronisation de la progression.
   Sans configuration (config.js), l'app reste en mode local. Guide : docs/COMPTES.md */
window.M = window.M || {};

(function () {
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const C = () => M.CONFIG || {};
  const enabled = () => !!(C().supabaseUrl && C().supabaseAnonKey);
  const PROVIDERS = { google: "Google", apple: "Apple", github: "GitHub", facebook: "Facebook", twitter: "X (Twitter)", discord: "Discord", azure: "Microsoft" };

  let sb = null, session = null, pushT = null, needMfa = false;

  async function client() {
    if (!enabled()) return null;
    if (sb) return sb;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    // PKCE : le retour des réseaux sociaux arrive en ?code=… et ne perturbe pas la navigation par #
    sb = createClient(C().supabaseUrl, C().supabaseAnonKey, { auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    const { data } = await sb.auth.getSession();
    session = data.session;
    sb.auth.onAuthStateChange((ev, s) => {
      session = s;
      if (ev === "SIGNED_IN") setTimeout(afterLogin, 0);
      if (location.hash.startsWith("#/account")) M.go("#/account");
    });
    if (/[?&]code=/.test(location.search)) {
      const back = sessionStorage.getItem("meche:after") || "#/account";
      sessionStorage.removeItem("meche:after");
      history.replaceState(null, "", location.pathname + back);
    }
    return sb;
  }

  // ---------- Synchronisation ----------
  function exportState() {
    const s = JSON.parse(JSON.stringify(M.state));
    if (s.ai) { s.ai.chat = (s.ai.chat || []).slice(-20); if (s.ai.cfg) s.ai.cfg.claudeKey = ""; } // la clé API ne quitte jamais l'appareil
    return s;
  }
  async function push() {
    if (!session || needMfa) return false;
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
  // Toute sauvegarde locale déclenche une synchronisation différée quand on est connecté
  const origSave = M.save;
  M.save = function (now) { origSave(now); schedulePush(); };

  async function afterLogin() {
    if (!session) return;
    const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") { needMfa = true; return mfaPrompt(); }
    needMfa = false;
    let remote = null;
    try { remote = await pull(); } catch (e) { M.toast("Synchronisation impossible : " + e.message, "err"); return; }
    if (!remote) { await push(); M.toast("Compte créé, progression sauvegardée dans le cloud ☁️", "win"); return; }
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

  // ---------- Vue Compte ----------
  M.views.account = function (el) {
    const SEC = `<div class="glass pad sec-list"><h4>${M.icon("shield")} Pourquoi c'est plus sûr</h4><ul>
      <li><b>Aucun mot de passe</b> : connexion par code à usage unique ou via un réseau. Pas de mot de passe stocké, donc rien à voler en cas de fuite.</li>
      <li><b>Double authentification</b> (application TOTP comme Google Authenticator ou Authy) en option.</li>
      <li><b>Cloisonnement</b> : chaque utilisateur ne peut lire que ses propres données (sécurité au niveau des lignes de la base).</li>
      <li><b>Données minimales</b> : seulement ta progression. Ta clé API Claude et tes données de navigation ne quittent jamais ton appareil.</li>
      <li>Connexions chiffrées (HTTPS) et données chiffrées au repos chez l'hébergeur.</li></ul></div>`;
    if (!enabled()) {
      el.innerHTML = `
        <div class="page-head"><div><p class="eyebrow">${M.icon("profile")} <span>Compte</span></p><h1>Ton compte <span class="grad">Mèche</span></h1>
        <p class="lede">Pour l'instant l'app fonctionne en <b>mode local</b> : ta progression est enregistrée uniquement dans ce navigateur. Tu peux l'exporter dans Paramètres → Données.</p></div></div>
        <div class="glass pad"><h3>Activer les comptes</h3><p class="muted">L'administrateur de l'app doit relier un projet Supabase (gratuit pour démarrer) en remplissant <code>js/config.js</code>. Le guide pas à pas est dans <code>trading/docs/COMPTES.md</code>. Ensuite, connexion par e-mail, téléphone, Google, Apple, GitHub ou Facebook.</p></div>
        ${SEC}`;
      return;
    }
    el.innerHTML = `<div class="page-head"><div><p class="eyebrow">${M.icon("profile")} <span>Compte</span></p><h1>Ton compte <span class="grad">Mèche</span></h1></div></div><div id="acc" class="glass pad">Chargement…</div>${SEC}`;
    client().then(() => draw()).catch(e => { $("#acc", el).innerHTML = `Service de comptes injoignable (${esc(e.message)}).`; });

    async function draw() {
      const box = $("#acc", el);
      if (!session) {
        const prov = (C().oauthProviders || []).filter(p => PROVIDERS[p]);
        box.innerHTML = `
          <div class="tabs acc-tabs"><a class="on" data-t="mail">E-mail</a>${C().phoneLogin ? `<a data-t="phone">Téléphone</a>` : ""}${prov.length ? `<a data-t="social">Réseaux</a>` : ""}</div>
          <div id="acc-f"></div>`;
        const forms = {
          mail: `<p class="muted">On t'envoie un code à 6 chiffres. Pas de mot de passe.</p>
            <div class="acc-row"><span class="inp"><input id="a-mail" type="email" placeholder="toi@exemple.com" autocomplete="email"></span><button class="btn primary" id="a-send">Recevoir un code</button></div>
            <div class="acc-row" id="a-step2" hidden><span class="inp"><input id="a-code" inputmode="numeric" maxlength="8" placeholder="Code reçu" autocomplete="one-time-code"></span><button class="btn primary" id="a-ok">Se connecter</button></div>`,
          phone: `<p class="muted">Numéro au format international, par exemple +223 70 00 00 00. Un SMS avec un code te sera envoyé.</p>
            <div class="acc-row"><span class="inp"><input id="a-tel" type="tel" placeholder="+223…" autocomplete="tel"></span><button class="btn primary" id="a-send">Recevoir un SMS</button></div>
            <div class="acc-row" id="a-step2" hidden><span class="inp"><input id="a-code" inputmode="numeric" maxlength="8" placeholder="Code reçu" autocomplete="one-time-code"></span><button class="btn primary" id="a-ok">Se connecter</button></div>`,
          social: `<p class="muted">Connexion via un compte que tu as déjà. Mèche ne voit jamais ton mot de passe.</p>
            <div class="acc-social">${prov.map(p => `<button class="btn ghost" data-p="${p}">Continuer avec ${PROVIDERS[p]}</button>`).join("")}</div>`
        };
        const show = t => {
          $$(".acc-tabs a", box).forEach(a => a.classList.toggle("on", a.dataset.t === t));
          $("#acc-f", box).innerHTML = forms[t];
          const send = $("#a-send", box);
          if (send) send.onclick = async () => {
            const isMail = t === "mail";
            const id = (isMail ? $("#a-mail", box).value : $("#a-tel", box).value.replace(/\s+/g, "")).trim();
            if (isMail ? !/^\S+@\S+\.\S+$/.test(id) : !/^\+\d{8,15}$/.test(id)) return M.toast(isMail ? "Adresse e-mail invalide" : "Numéro invalide (format +223…)", "err");
            send.disabled = true;
            const { error } = await sb.auth.signInWithOtp(isMail ? { email: id } : { phone: id });
            send.disabled = false;
            if (error) return M.toast(error.message, "err");
            $("#a-step2", box).hidden = false; $("#a-code", box).focus();
            M.toast(isMail ? "Code envoyé par e-mail ✉️" : "SMS envoyé 📱");
            $("#a-ok", box).onclick = async () => {
              const token = $("#a-code", box).value.trim();
              const { error: e2 } = await sb.auth.verifyOtp(isMail ? { email: id, token, type: "email" } : { phone: id, token, type: "sms" });
              if (e2) return M.toast("Code incorrect ou expiré.", "err");
              M.toast("Connecté ✓", "win");
            };
          };
          $$("[data-p]", box).forEach(b => b.onclick = async () => {
            sessionStorage.setItem("meche:after", "#/account");
            const { error } = await sb.auth.signInWithOAuth({ provider: b.dataset.p, options: { redirectTo: location.origin + location.pathname } });
            if (error) M.toast(error.message, "err");
          });
        };
        $$(".acc-tabs a", box).forEach(a => a.onclick = () => show(a.dataset.t));
        show("mail");
        return;
      }
      const u = session.user;
      const { data: f } = await sb.auth.mfa.listFactors();
      const totp = (f && f.totp || []).filter(x => x.status === "verified");
      box.innerHTML = `
        <div class="acc-user"><span class="av" style="width:56px;height:56px;font-size:26px">${M.state.photo ? `<img src="${M.state.photo}" alt="">` : M.icon("profile")}</span>
          <div><b>${esc(M.state.name || "Trader")}</b><small class="muted">${esc(u.email || u.phone || "")} · connecté via ${esc((u.app_metadata && u.app_metadata.provider) || "code")}</small>
          <small class="muted">${M.state.cloudSyncedAt ? "Synchronisé " + new Date(M.state.cloudSyncedAt).toLocaleString("fr-FR") : "Pas encore synchronisé"}</small></div></div>
        <div class="set-ctl" style="margin:14px 0"><button class="btn primary sm" id="a-sync">${M.icon("refresh")} Synchroniser maintenant</button><button class="btn ghost sm" id="a-out">Se déconnecter</button></div>
        <div class="set-row"><div><b>Double authentification (2FA)</b><small>${totp.length ? "✅ Activée" : "Recommandée : protège ton compte même si ton e-mail ou ton numéro est compromis."}</small></div>
          <div class="set-ctl">${totp.length ? `<button class="btn ghost sm" id="a-2fa-off">Désactiver</button>` : `<button class="btn primary sm" id="a-2fa">Activer</button>`}</div></div>
        <div id="a-2fa-box"></div>
        <div class="set-row"><div><b>Supprimer mes données du cloud</b><small>Efface la progression enregistrée dans ton compte (cet appareil garde sa copie locale).</small></div>
          <div class="set-ctl"><button class="btn danger sm" id="a-del">Supprimer</button></div></div>`;
      $("#a-sync", box).onclick = async () => M.toast(await push() ? "Synchronisé ☁️" : "Échec de la synchronisation", "win");
      $("#a-out", box).onclick = async () => { await push(); await sb.auth.signOut(); M.toast("Déconnecté"); };
      $("#a-del", box).onclick = async () => {
        if (!confirm("Supprimer la progression enregistrée dans ton compte ?")) return;
        const { error } = await sb.from("progress").delete().eq("user_id", u.id);
        M.toast(error ? error.message : "Données du cloud supprimées", error ? "err" : "win");
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
        const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp" });
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
  };

  M.Account = { enabled, client, push, session: () => session };

  document.addEventListener("DOMContentLoaded", () => {
    // Initialise tôt pour traiter le retour d'une connexion par réseau social (?code=…)
    if (enabled()) client().catch(e => console.warn("Comptes indisponibles :", e.message));
  });
})();
