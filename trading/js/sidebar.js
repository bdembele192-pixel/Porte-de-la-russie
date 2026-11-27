/* Menu latéral repliable (inspiré de l'app Claude).
   Ordinateur : menu complet ↔ rail d'icônes, choix mémorisé. Mobile : tiroir qui glisse depuis la gauche.
   Raccourci : Ctrl + . (ou ⌘ + .). Échap ferme le tiroir. */
window.M = window.M || {};

(function () {
  const KEY = "meche:side";
  const mobile = window.matchMedia("(max-width: 900px)");
  let side, scrim, btn, x, lastFocus = null;

  const prefRail = () => {
    const v = localStorage.getItem(KEY);
    return v ? v === "rail" : window.innerWidth < 1180;
  };
  const isOpen = () => mobile.matches ? document.body.classList.contains("side-open") : !document.body.classList.contains("side-rail");

  function sync() {
    const open = isOpen();
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    x.setAttribute("aria-label", mobile.matches ? "Fermer le menu" : open ? "Replier le menu" : "Déplier le menu");
    x.innerHTML = M.icon(!mobile.matches && !open ? "panel" : "panelclose");
    // Tiroir fermé sur mobile : retiré du parcours clavier et des lecteurs d'écran
    if (mobile.matches && !open) side.setAttribute("inert", ""); else side.removeAttribute("inert");
  }

  function drawer(open, restoreFocus = true) {
    document.body.classList.toggle("side-open", open);
    scrim.hidden = !open;
    document.documentElement.style.overflow = open ? "hidden" : "";
    sync();
    if (open) {
      lastFocus = document.activeElement;
      const target = side.querySelector(".nav a.on") || side.querySelector(".nav a");
      setTimeout(() => target && target.focus({ preventScroll: true }), 60);
    } else if (restoreFocus && lastFocus && lastFocus.focus) {
      lastFocus.focus({ preventScroll: true });
      lastFocus = null;
    }
  }

  function toggle() {
    if (mobile.matches) return drawer(!isOpen());
    const rail = !document.body.classList.contains("side-rail");
    document.body.classList.toggle("side-rail", rail);
    localStorage.setItem(KEY, rail ? "rail" : "open");
    sync();
  }

  function layout() {
    if (mobile.matches) { document.body.classList.remove("side-rail"); drawer(false, false); }
    else { document.body.classList.remove("side-open"); scrim.hidden = true; document.documentElement.style.overflow = ""; document.body.classList.toggle("side-rail", prefRail()); sync(); }
  }

  function init() {
    side = document.getElementById("sidebar");
    scrim = document.getElementById("side-scrim");
    btn = document.getElementById("tb-side");
    x = document.getElementById("side-x");
    if (!side || !scrim || !btn || !x) return;

    btn.addEventListener("click", toggle);
    x.addEventListener("click", () => mobile.matches ? drawer(false) : toggle());
    scrim.addEventListener("click", () => drawer(false));
    side.addEventListener("click", e => { if (mobile.matches && e.target.closest("a[href]")) drawer(false, false); });
    window.addEventListener("hashchange", () => { if (mobile.matches && isOpen()) drawer(false, false); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && mobile.matches && isOpen()) { e.stopPropagation(); drawer(false); }
      if ((e.ctrlKey || e.metaKey) && e.key === ".") { e.preventDefault(); toggle(); }
    }, true);
    // Glisser vers la gauche pour fermer le tiroir
    let x0 = null, y0 = 0;
    side.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    side.addEventListener("touchend", e => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = Math.abs(e.changedTouches[0].clientY - y0);
      if (dx < -60 && dy < 50) drawer(false);
      x0 = null;
    }, { passive: true });
    if (mobile.addEventListener) mobile.addEventListener("change", layout); else mobile.addListener(layout);
    layout();
  }

  M.sidebar = { open: () => mobile.matches ? drawer(true) : (document.body.classList.remove("side-rail"), sync()), close: () => drawer(false), toggle };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
