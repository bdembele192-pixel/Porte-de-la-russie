/* Infobulles façon logiciel pro : survole un élément (ou appui long sur mobile)
   pour voir ce qu'il fait. data-tip="clé du glossaire" ou data-tip-text="texte libre". */
window.M = window.M || {};

(function () {
  const tip = document.createElement("div");
  tip.className = "tooltip";
  tip.setAttribute("role", "tooltip");
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(tip));

  let timer = null, current = null, lastXY = { x: 0, y: 0 };
  const DELAY = 280;

  function enabled() { return !M.state || M.state.settings.tips !== false; }

  function content(el) {
    const key = el.getAttribute("data-tip");
    if (key && M.GLOSSARY[key]) {
      const g = M.GLOSSARY[key];
      return `<b>${g.t}</b><span>${g.d}</span>`;
    }
    const txt = el.getAttribute("data-tip-text");
    if (txt) {
      const title = el.getAttribute("data-tip-title");
      const kbd = el.getAttribute("data-tip-kbd");
      return (title ? `<b>${title}</b>` : "") + `<span>${txt}</span>` + (kbd ? `<kbd>${kbd}</kbd>` : "");
    }
    return null;
  }

  function place() {
    const pad = 14;
    const r = tip.getBoundingClientRect();
    let x = lastXY.x + pad, y = lastXY.y + pad + 6;
    if (x + r.width > window.innerWidth - 8) x = Math.max(8, lastXY.x - r.width - pad);
    if (y + r.height > window.innerHeight - 8) y = Math.max(8, lastXY.y - r.height - pad);
    tip.style.transform = `translate(${x}px, ${y}px)`;
  }

  function show(el) {
    const html = content(el);
    if (!html) return;
    tip.innerHTML = html;
    tip.classList.add("on");
    place();
  }
  function hide() {
    clearTimeout(timer); timer = null; current = null;
    tip.classList.remove("on");
  }

  document.addEventListener("mouseover", e => {
    if (!enabled()) return;
    const el = e.target.closest("[data-tip],[data-tip-text]");
    if (el === current) return;
    hide();
    if (!el) return;
    current = el;
    lastXY = { x: e.clientX, y: e.clientY };
    const d = M.state && M.state.settings.tipDelay != null ? M.state.settings.tipDelay : DELAY;
    timer = setTimeout(() => show(el), el.classList.contains("term") ? Math.min(120, d) : d);
  });
  document.addEventListener("mousemove", e => {
    lastXY = { x: e.clientX, y: e.clientY };
    if (tip.classList.contains("on")) place();
  });
  document.addEventListener("mousedown", hide);
  document.addEventListener("scroll", hide, true);

  // Mobile : appui sur un terme = infobulle ; appui long sur un bouton = infobulle
  let press = null;
  document.addEventListener("touchstart", e => {
    if (!enabled()) return;
    const el = e.target.closest("[data-tip],[data-tip-text]");
    hide();
    if (!el) return;
    const t = e.touches[0];
    lastXY = { x: t.clientX, y: t.clientY };
    if (el.classList.contains("term")) { current = el; show(el); return; }
    press = setTimeout(() => { current = el; show(el); }, 450);
  }, { passive: true });
  document.addEventListener("touchend", () => { clearTimeout(press); setTimeout(() => { if (current && !current.classList.contains("term")) hide(); }, 1600); }, { passive: true });
  document.addEventListener("touchmove", () => clearTimeout(press), { passive: true });

  /* Transforme [[clé]] et [[clé|texte]] en termes survolables. */
  M.linkTerms = function (html) {
    return html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, key, label) => {
      const g = M.GLOSSARY[key];
      const text = label || (g ? g.t.replace(/\s*\(.*\)$/, "") : key);
      return g ? `<span class="term" data-tip="${key}" tabindex="0">${text}</span>` : text;
    });
  };
  M.hideTip = hide;
})();
