/* Vega — FX Options Desk, intégré à Mèche.
   Le simulateur de teneur de marché sur options EUR/USD (vega/index.html, habillage Mèche) s'ouvre dans la page,
   avec le thème de l'app, un guide des onglets et le lien vers les cours qui l'accompagnent. */
window.M = window.M || {};

(function () {
  const TABS = [
    ["Pricer", "Calcule le prix d'une option (call, put, stratégies) avec le modèle de Garman-Kohlhagen et la volatilité du marché."],
    ["Client RFQ", "Les clients te demandent des prix. Tu cotes un achat et une vente : trop cher, tu ne traites pas ; trop bon marché, tu perds."],
    ["My RFQ", "Toi, côté client : tu demandes des prix à plusieurs banques et tu compares au juste prix (« cost vs mid »)."],
    ["Book", "Toutes tes positions d'options, avec leur delta, gamma, vega et theta."],
    ["Greeks", "Les risques du book par échéance et par strike : où tu es exposé si le marché bouge ou si la volatilité change."],
    ["Hedging", "Couvre ton delta au comptant et teste les scénarios « Et si ? » : choc de banque centrale, flash crash, crise bancaire…"],
    ["Vol Surface", "La surface de volatilité : smile, skew (risk reversal), butterfly et structure par terme."],
    ["Market", "Le cours EUR/USD simulé, ses bougies, le RSI et les annonces qui font bouger le marché."],
    ["PnL Attribution", "D'où vient ton résultat : delta, gamma, vega, theta, couverture. Un gain de hasard n'est pas une compétence."],
    ["Training", "Ta note de session, les retours du coach (teneur de marché et client) et les notions à revoir."]
  ];

  M.views.vega = function (el) {
    const theme = (M.state.settings && M.state.settings.theme) || "ornoir";
    const src = `vega/index.html?embed=1&theme=${encodeURIComponent(theme)}`;
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">Vega · FX Options Desk</p><h1>Dans la peau d'un trader d'options</h1>
      <p class="lede">Le simulateur du grand frère : tu tiens un desk d'options EUR/USD dans une banque. Des clients demandent des prix, le marché bouge, la volatilité s'emballe. À toi de coter, de couvrir et de garder ton book sous contrôle.</p></div>
      <div class="cta"><a class="btn gold-btn" href="${src}" target="_blank" rel="noopener" data-tip-text="Ouvre Vega dans un nouvel onglet, sur tout l'écran.">${M.icon("arrow")} Plein écran</a>
      <a class="btn line-btn" href="#/course/market-making" data-tip-text="Les cours qui expliquent ce que tu fais dans Vega.">${M.icon("academy")} Les cours du desk</a></div></div>
      <details class="glass pad vega-guide">
        <summary><b>Guide des onglets</b> <small class="muted">— à lire avant ta première session</small></summary>
        <div class="vega-tabs">${TABS.map(([t, d]) => `<div><b>${t}</b><p>${d}</p></div>`).join("")}</div>
        <p class="muted small">L'interface de Vega est en anglais, comme sur un vrai desk. Les termes (delta, vega, skew, RFQ…) sont expliqués dans le glossaire de Mèche et dans les modules « Options niveau 2 », « Teneur de marché », « Chocs macro » et « Vega Desk ». Ta session est enregistrée dans ce navigateur.</p>
      </details>
      <div class="vega-frame glass"><iframe src="${src}" title="Vega FX Options Desk" loading="lazy" allow="fullscreen"></iframe></div>
      ${M.disclaimer()}`;
    // Le thème de Mèche change : Vega suit
    return () => {};
  };
})();
