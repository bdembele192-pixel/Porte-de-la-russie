/* Mode hors ligne : enregistre le service worker (sw.js), signale les mises à jour et l'état de la connexion,
   et propose l'installation de l'app (bouton dans Paramètres → Aide & tutoriel, et M.installApp()). */
window.M = window.M || {};

(function () {
  const ok = "serviceWorker" in navigator && /^https?:$/.test(location.protocol);
  let deferred = null;

  if (ok) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then(reg => {
        // Nouvelle version téléchargée alors que l'app tournait déjà : on le dit, sans recharger de force
        reg.addEventListener("updatefound", () => {
          const w = reg.installing;
          if (!w) return;
          w.addEventListener("statechange", () => {
            if (w.state === "activated" && navigator.serviceWorker.controller) bar("Nouvelle version de Mèche disponible.", "Recharger", () => location.reload());
          });
        });
      }).catch(() => { /* navigateur sans service worker : l'app marche en ligne */ });
    });
  }

  // Bandeau discret en bas de l'écran
  function bar(msg, action, fn) {
    let b = document.getElementById("net-bar");
    if (!b) { b = document.createElement("div"); b.id = "net-bar"; b.setAttribute("role", "status"); document.body.appendChild(b); }
    b.innerHTML = `<span></span>${action ? `<button type="button"></button>` : ""}<button type="button" class="x" aria-label="Fermer">×</button>`;
    b.querySelector("span").textContent = msg;
    if (action) { const a = b.querySelector("button:not(.x)"); a.textContent = action; a.onclick = fn; }
    b.querySelector(".x").onclick = () => b.classList.remove("on");
    b.classList.add("on");
  }
  M.netBar = bar;

  function net() {
    if (!navigator.onLine) bar("Hors ligne : cours, académie et quiz restent disponibles avec les dernières données enregistrées. Les prix en direct reviennent avec la connexion.");
    else { const b = document.getElementById("net-bar"); if (b && /Hors ligne/.test(b.textContent)) { b.classList.remove("on"); M.toast && M.toast("Connexion rétablie ✅"); } }
  }
  window.addEventListener("online", net);
  window.addEventListener("offline", net);
  if (!navigator.onLine) window.addEventListener("load", net);

  // Installation (Chrome, Edge, Android). Sur iPhone : Partager → « Sur l'écran d'accueil ».
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; });
  window.addEventListener("appinstalled", () => { deferred = null; M.toast && M.toast("Mèche est installée 🎉"); });
  M.canInstall = () => !!deferred;
  M.installApp = async function () {
    if (deferred) { deferred.prompt(); const r = await deferred.userChoice.catch(() => null); deferred = null; return r && r.outcome === "accepted"; }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    M.modal && M.modal(`<h2>Installer Mèche</h2>
      ${ios ? `<p>Sur iPhone ou iPad, dans Safari : touche <b>Partager</b> (le carré avec une flèche), puis <b>« Sur l'écran d'accueil »</b>.</p>`
        : `<p>Dans Chrome ou Edge : menu <b>⋮</b> → <b>« Installer Mèche »</b> (ou l'icône d'installation dans la barre d'adresse).</p>`}
      <p class="muted">Une fois installée, Mèche s'ouvre comme une application et fonctionne sans connexion avec les dernières données enregistrées.</p>
      <button class="btn primary" data-close>Compris</button>`);
    return false;
  };
})();
