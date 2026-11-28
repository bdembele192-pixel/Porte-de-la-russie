/* Parcours Quiz, suite : desk d'options (Vega), chocs macro et exécution, portefeuille et crises,
   outils techniques avancés. Même format que quizbank.js. */
window.M = window.M || {};

M.QUIZ_UNITS.push(
  {
    id: "u13", e: "🏦", t: "Le desk Vega", sub: "RFQ, book, grecques, couverture", gen: [],
    q: [
      { t: "mcq", q: "Sur un desk d'options, le teneur de marché cherche surtout à gagner…", o: ["Le spread", "La direction de l'EUR/USD", "Les dividendes"], a: 0, e: "Il cote achat et vente et gagne l'écart, en couvrant son risque." },
      { t: "tf", q: "Gagner presque toutes les demandes de prix est le signe d'excellents prix.", a: false, e: "C'est plutôt le signe que tes prix sont trop bas (sélection adverse)." },
      { t: "mcq", q: "Ton delta net est très positif. Pour le neutraliser, tu…", o: ["Vends de l'EUR/USD au comptant", "Achètes de l'EUR/USD", "Ne fais rien"], a: 0, e: "La couverture delta ramène l'exposition directionnelle vers zéro." },
      { t: "fill", q: "Découper son résultat entre delta, gamma, vega et theta s'appelle l'___ du P&L.", o: ["attribution", "allocation", "arbitrage"], a: 0, e: "Elle montre si le gain vient d'une compétence ou du hasard." },
      { t: "mcq", q: "Tu as vendu beaucoup d'options. Ton book est…", o: ["Short gamma", "Long gamma", "Sans gamma"], a: 0, e: "Les grands mouvements te coûtent ; le theta te rapporte." },
      { t: "mcq", q: "Avant un gros trade, le test de stress classique est…", o: ["Spot −1 % et vol +1 point", "Spot +50 %", "Aucun test"], a: 0, e: "Il montre la perte si le marché bouge et que la peur monte en même temps." },
      { t: "tf", q: "Un trade qui réduit ton exposition peut justifier un prix plus attractif.", a: true, e: "C'est le biais d'inventaire." },
      { t: "mcq", q: "Dans l'onglet My RFQ, tu es…", o: ["Le client qui demande des prix", "Le régulateur", "La banque centrale"], a: 0, e: "Tu compares les prix des banques au juste prix (coût vs mid)." }
    ]
  },
  {
    id: "u14", e: "⚡", t: "Chocs macro & exécution", sub: "Surprises, régimes, coût vs mid", gen: [],
    q: [
      { t: "mcq", q: "Une décision de banque centrale exactement conforme aux attentes…", o: ["Fait peu bouger le marché", "Provoque toujours un krach", "Double la volatilité"], a: 0, e: "Elle est déjà dans le prix : seule la surprise compte." },
      { t: "mcq", q: "Un CPI américain bien plus élevé que prévu fait d'abord bondir…", o: ["La volatilité courte", "Le prix de l'or à coup sûr", "Les dividendes"], a: 0, e: "Les anticipations de taux se réajustent brutalement." },
      { t: "tf", q: "En crise, le skew des options devient souvent plus négatif.", a: true, e: "Tout le monde achète des puts pour se protéger." },
      { t: "fill", q: "Une information déjà connue de tous est ___ dans le prix.", o: ["déjà", "jamais", "rarement"], a: 0, e: "On dit aussi « priced in »." },
      { t: "mcq", q: "Bid 1,0848, ask 1,0852, tu achètes à 1,0853. Coût vs mid ?", o: ["3 pips", "1 pip", "5 pips"], a: 0, e: "Mid 1,0850 ; 1,0853 − 1,0850 = 3 pips." },
      { t: "mcq", q: "Le taker…", o: ["Paie le spread pour être exécuté tout de suite", "Gagne le spread", "Ne paie jamais de frais"], a: 0, e: "Le maker affiche un prix, le taker le prend." },
      { t: "mcq", q: "Pour acheter un gros montant d'un actif peu liquide, le mieux est de…", o: ["Découper l'ordre en plusieurs ordres limites", "Tout acheter au marché", "Utiliser un levier ×20"], a: 0, e: "On évite de « manger » le carnet." },
      { t: "tf", q: "Une longue période calme est le moment idéal pour vendre toujours plus d'options.", a: false, e: "C'est la position qui souffre le plus au premier choc." }
    ]
  },
  {
    id: "u15", e: "🧺", t: "Portefeuille & crises", sub: "Allocation, corrélation, contagion", gen: [],
    q: [
      { t: "mcq", q: "Ce qui explique l'essentiel du risque d'un portefeuille, c'est…", o: ["L'allocation entre grandes familles d'actifs", "Le choix d'une action précise", "L'heure d'achat"], a: 0, e: "La répartition actions/obligations/liquidités pèse le plus." },
      { t: "tf", q: "Posséder 10 cryptos différentes, c'est être bien diversifié.", a: false, e: "Elles sont très corrélées entre elles." },
      { t: "mcq", q: "Une corrélation de −1 entre deux actifs signifie qu'ils…", o: ["Bougent toujours en sens opposé", "Bougent toujours ensemble", "N'ont aucun lien"], a: 0, e: "+1 = même sens, 0 = aucun lien, −1 = sens opposés." },
      { t: "fill", q: "Revenir régulièrement à son allocation cible s'appelle le ___.", o: ["rééquilibrage", "scalping", "halving"], a: 0, e: "On vend ce qui a monté, on rachète ce qui a baissé." },
      { t: "mcq", q: "Une panique bancaire, c'est…", o: ["Des retraits massifs qui forcent la banque à vendre à perte", "Une hausse de taux", "Un piratage"], a: 0, e: "SVB en 2023 est tombée en deux jours." },
      { t: "mcq", q: "Une cascade de liquidations s'arrête quand…", o: ["Il n'y a plus de levier à purger", "Le prix touche un chiffre rond", "Le régulateur publie un tweet"], a: 0, e: "La vente forcée s'épuise d'elle-même." },
      { t: "num", q: "Veille : plus haut 110, plus bas 90, clôture 100. Point pivot ?", a: 100, tol: 0.01, u: "", e: "(110 + 90 + 100) ÷ 3 = 100." },
      { t: "mcq", q: "Le retracement de Fibonacci le plus suivi est…", o: ["61,8 %", "12 %", "99 %"], a: 0, e: "Avec 38,2 % et 50 %, ce sont les niveaux classiques." }
    ]
  }
);

M.QUIZ_COUNT = M.QUIZ_UNITS.reduce((s, u) => s + u.q.length, 0);
