/* Académie, suite : le desk Vega en pratique, chocs macro, exécution, portefeuille, crises financières,
   outils techniques avancés. Même format que courses.js. */
window.M = window.M || {};

Object.assign(M.GLOSSARY, {
  taker: { t: "Taker (preneur de prix)", d: "Celui qui accepte le prix affiché par un autre : il paie le spread en échange de l'exécution immédiate. L'inverse du teneur de marché (maker)." },
  "cost-mid": { t: "Coût vs mid", d: "L'écart entre le prix obtenu et le milieu entre l'achat et la vente (le « mid »). C'est ce que l'exécution t'a réellement coûté." },
  "pnl-attribution": { t: "Attribution du P&L", d: "Découper un résultat selon sa source : direction (delta), mouvements (gamma), volatilité (vega), temps (theta), couverture. Montre si le gain vient d'une compétence ou du hasard." },
  correlation: { t: "Corrélation", d: "À quel point deux actifs bougent ensemble, de −1 (sens opposés) à +1 (même sens). En crise, beaucoup de corrélations montent vers 1 : tout baisse ensemble." },
  diversification: { t: "Diversification", d: "Répartir son argent sur des actifs qui ne réagissent pas tous de la même façon, pour que la perte de l'un ne ruine pas tout le portefeuille." },
  allocation: { t: "Allocation d'actifs", d: "La répartition de ton capital entre grandes familles : actions, obligations, liquidités, or, crypto… Elle explique l'essentiel du risque et du rendement d'un portefeuille." },
  reequilibrage: { t: "Rééquilibrage", d: "Revenir régulièrement à l'allocation prévue en vendant ce qui a monté et en rachetant ce qui a baissé. Une discipline qui force à « acheter bas, vendre haut »." },
  "bank-run": { t: "Panique bancaire (bank run)", d: "Quand les clients retirent leur argent en masse par peur d'une faillite, la banque doit vendre ses actifs à perte… ce qui peut provoquer la faillite redoutée." },
  contagion: { t: "Contagion", d: "La propagation d'une crise d'un acteur ou d'un marché à d'autres, via les dettes, les ventes forcées ou la perte de confiance." },
  fibonacci: { t: "Retracements de Fibonacci", d: "Niveaux (38,2 %, 50 %, 61,8 %) tracés sur un mouvement pour repérer où une correction pourrait s'arrêter. Très suivis, donc parfois auto-réalisateurs." },
  pivot: { t: "Points pivots", d: "Niveaux calculés à partir du plus haut, du plus bas et de la clôture de la veille. Utilisés comme supports et résistances du jour par les traders intraday." },
  "profil-volume": { t: "Profil de volume", d: "Le volume échangé à chaque niveau de prix (et non dans le temps). Les zones de gros volume servent souvent de supports ou de résistances." },
  ichimoku: { t: "Ichimoku", d: "Indicateur japonais tout-en-un : un « nuage » qui montre la tendance, des lignes de signal et des zones de support/résistance projetées dans le futur." },
  "priced-in": { t: "Déjà dans le prix (priced in)", d: "Une information que tout le monde connaît ou attend est déjà intégrée dans le cours. Seule la surprise par rapport aux attentes fait bouger le prix." }
});

M.COURSES.push(
  {
    id: "vega-desk",
    emoji: "🏦",
    title: "Vega Desk : ta première session de trader d'options",
    sub: "Prendre en main le simulateur : coter, couvrir, lire son book et sa note.",
    level: "Avancé",
    mins: 12,
    lessons: [
      {
        h: "Le décor : un desk d'options EUR/USD",
        body: `<p>Dans <b>Vega Desk</b>, tu es trader d'options de change dans une banque. Le marché EUR/USD bouge en continu, des clients t'envoient des [[rfq|demandes de prix]], et tu accumules un book de positions. Ton but n'est pas de deviner la direction : c'est de gagner le [[spread]] en gardant tes risques sous contrôle.</p>
<p>En haut de l'écran, tu vois le cours spot, le régime de marché (CALM, SHOCK…), la volatilité à 1 mois, le [[risk-reversal|risk reversal]], ton P&L total et ton delta net. Commence avec la simulation en vitesse ×1 : tu auras le temps de comprendre chaque chiffre.</p>`
      },
      {
        h: "Répondre à une demande de prix (Client RFQ)",
        body: `<ol>
<li>Lis le produit : call, put ou stratégie, échéance, strike, montant, sens demandé par le client.</li>
<li>Regarde la valeur théorique proposée par le pricer. C'est ton point de départ, pas ton prix final.</li>
<li>Ajoute un spread : plus large si le montant est gros, l'échéance courte, le marché agité ou le client très bien informé ([[selection-adverse|sélection adverse]]).</li>
<li>Penche ton prix selon ton book : si tu es déjà très exposé dans le sens du client, rends ton prix moins attractif.</li>
</ol>
<p>Si tu gagnes presque toutes les RFQ, ne te félicite pas : tes prix sont sans doute trop bas.</p>`
      },
      {
        h: "Lire son book et ses grecques",
        body: `<p>L'onglet <b>Book</b> liste tes positions ; <b>Greeks</b> les agrège par échéance et par strike. Quatre chiffres à surveiller en permanence :</p>
<ul>
<li><b>[[delta|Delta]]</b> : ce que tu gagnes ou perds si l'EUR/USD bouge un peu. Un desk le ramène près de zéro.</li>
<li><b>[[gamma|Gamma]]</b> : à quelle vitesse ton delta change. Short gamma = les grands mouvements te coûtent.</li>
<li><b>[[vega|Vega]]</b> : ton exposition à la volatilité. Long vega = tu gagnes si la peur monte.</li>
<li><b>[[theta|Theta]]</b> : ce que le temps te rapporte (vendeur) ou te coûte (acheteur) chaque jour.</li>
</ul>
<p>Un book sain a des grecques que tu peux expliquer en une phrase. Si tu ne sais pas pourquoi ton vega est énorme, c'est le moment de couvrir.</p>`
      },
      {
        h: "Couvrir et tester des scénarios",
        body: `<p>Dans <b>Hedging</b>, tu fais une [[delta-hedge|couverture delta]] en achetant ou vendant de l'EUR/USD au comptant. Tu peux aussi lancer un « What-if » : choc de spot, choc de volatilité, ou un scénario prêt à l'emploi (banque centrale surprise, flash crash, crise bancaire…).</p>
<p>Règle de desk : avant de prendre un gros trade, regarde ce que deviendrait ton P&L avec « spot −1 % et vol +1 point ». Si le chiffre te fait peur, réduis la taille ou couvre tout de suite.</p>`
      },
      {
        h: "Comprendre ta note de session",
        body: `<p>L'onglet <b>Training</b> te note comme un chef de desk : prix proposés, gestion du risque, qualité de tes couvertures, et, côté client (<b>My RFQ</b>), le coût de tes exécutions par rapport au juste prix ([[cost-mid|coût vs mid]]).</p>
<p><b>PnL Attribution</b> découpe ton résultat ([[pnl-attribution|attribution du P&L]]) : un gain qui vient surtout du delta, c'est-à-dire d'un pari sur la direction, n'est pas une compétence de teneur de marché. Le bon résultat vient du spread et d'un theta/gamma maîtrisé.</p>`
      }
    ],
    key: ["Un desk gagne le spread, pas la direction", "Prix = valeur théorique + spread + biais d'inventaire", "Surveille delta, gamma, vega, theta en continu", "Teste « spot −1 % et vol +1 » avant tout gros trade"],
    quiz: [
      { q: "Tu viens de vendre beaucoup de calls à des clients. Ton book est plutôt…", o: ["Short gamma et short vega", "Long gamma et long vega", "Sans risque"], a: 0, why: "Le vendeur d'options perd sur les grands mouvements (gamma) et quand la volatilité monte (vega)." },
      { q: "Ton P&L de la journée vient presque entièrement du delta. Ça veut dire…", o: ["Tu as surtout parié sur la direction", "Tu as bien géré ton spread", "Ta couverture était parfaite"], a: 0, why: "L'attribution montre la source : un P&L delta, c'est un pari directionnel, pas une compétence de market making." },
      { q: "Un client te propose un trade qui réduit ton exposition (il prend le risque que tu as en trop). Ton prix peut être…", o: ["Plus attractif", "Moins attractif", "Identique de toute façon"], a: 0, why: "C'est le biais d'inventaire : un trade qui allège ton book t'arrange, tu peux être plus généreux pour le gagner." }
    ],
    try: "vega"
  },

  {
    id: "chocs-macro",
    emoji: "⚡",
    title: "Chocs macro : comment réagissent prix, volatilité et skew",
    sub: "Banques centrales, chiffres surprises, crises : les 12 scénarios du desk décryptés.",
    level: "Avancé",
    mins: 11,
    lessons: [
      {
        h: "Surprise de banque centrale",
        body: `<p>Une décision attendue est [[priced-in|déjà dans le prix]]. Seule la <b>surprise</b> fait bouger le marché :</p>
<ul>
<li><b>La [[bce|BCE]] baisse ses taux par surprise</b> : l'euro chute, la volatilité courte bondit.</li>
<li><b>La BCE monte par surprise</b> : l'euro grimpe, la volatilité courte monte aussi.</li>
<li><b>La [[fed|Fed]] baisse en urgence</b> : le dollar recule, l'EUR/USD fait un gap à la hausse.</li>
<li><b>La Fed monte par surprise</b> : le dollar est acheté, l'EUR/USD chute.</li>
</ul>
<p>Dans tous les cas, la volatilité monte d'abord sur les échéances courtes : c'est là que l'incertitude est la plus forte.</p>`
      },
      {
        h: "Les chiffres qui font trembler : NFP et CPI",
        body: `<p>Le [[nfp|NFP]] (emploi américain) et le [[cpi|CPI]] (inflation) sont publiés à heure fixe. Le marché compare le chiffre au <b>consensus</b> des économistes :</p>
<ul>
<li>Un NFP très inférieur aux attentes affaiblit le dollar (la Fed devra soutenir l'économie).</li>
<li>Un CPI plus élevé que prévu fait remonter les anticipations de taux : la volatilité courte explose.</li>
</ul>
<p>Sur un desk, on réduit souvent sa position short gamma <i>avant</i> ces publications, et on élargit ses prix pendant les minutes qui suivent.</p>`
      },
      {
        h: "Les crises : banque, flash crash, énergie",
        body: `<ul>
<li><b>Crise bancaire</b> : peur de faillites en chaîne ([[contagion]]). Le dollar sert de refuge, la volatilité grimpe sur toutes les échéances, la courbe se déforme.</li>
<li><b>Flash crash</b> : la [[liquidite|liquidité]] disparaît d'un coup, le prix chute en quelques secondes et la volatilité peut tripler. Les ordres stop s'exécutent loin de leur niveau.</li>
<li><b>Choc énergétique</b> : un problème d'approvisionnement en pétrole ou en gaz frappe plus l'Europe. L'euro est vendu et le skew des puts EUR s'envole.</li>
</ul>
<p>Point commun : en crise, le skew ([[smile|smile de volatilité]]) devient plus négatif, car tout le monde veut se protéger contre la baisse en même temps.</p>`
      },
      {
        h: "Les régimes : risk-on, risk-off, calme",
        body: `<p>Entre deux chocs, le marché vit des <b>régimes</b> :</p>
<ul>
<li><b>Risk-on</b> : appétit pour le risque, actions en hausse, euro soutenu, volatilité offerte (les vendeurs d'options gagnent).</li>
<li><b>Risk-off</b> : ventes d'actions, achats de dollars, volatilité demandée, skew qui se creuse.</li>
<li><b>Calme</b> : lente dérive, volatilité basse. Le theta rapporte… jusqu'au prochain choc.</li>
</ul>
<p>Le piège classique : vendre de plus en plus d'options en période calme parce que « ça marche ». C'est exactement la position qui souffre le plus au premier choc.</p>`
      }
    ],
    key: ["Seule la surprise par rapport au consensus fait bouger le marché", "Les chocs frappent d'abord la volatilité courte", "En crise, le skew se creuse : tout le monde achète des puts", "Le calme prolongé pousse à prendre trop de risque"],
    quiz: [
      { q: "La BCE baisse ses taux exactement comme prévu par tous les économistes. L'euro…", o: ["Bouge peu : c'était déjà dans le prix", "S'effondre forcément", "Monte forcément"], a: 0, why: "Une décision attendue est déjà intégrée dans le cours : seule la surprise crée un mouvement." },
      { q: "Pendant un flash crash, la volatilité implicite à 1 semaine…", o: ["Explose", "Baisse", "Ne bouge pas"], a: 0, why: "L'incertitude immédiate se paie sur les échéances courtes." },
      { q: "Le marché est calme depuis des mois. La position la plus dangereuse au prochain choc ?", o: ["Un gros short gamma accumulé", "Un petit long gamma", "Pas de position"], a: 0, why: "Le vendeur d'options gagne un peu chaque jour au calme et perd beaucoup au premier grand mouvement." }
    ],
    try: "vega"
  },

  {
    id: "execution",
    emoji: "🎯",
    title: "Exécuter comme un pro : coûts cachés et choix du prix",
    sub: "Taker ou maker, coût vs mid, slippage, découpage des ordres.",
    level: "Intermédiaire",
    mins: 8,
    lessons: [
      {
        h: "Taker ou maker",
        body: `<p>Le <b>[[market-maker|maker]]</b> affiche un prix et attend qu'on vienne le chercher. Le <b>[[taker]]</b> accepte un prix existant pour être exécuté tout de suite. Le taker paie le [[spread]] ; le maker le gagne, mais prend le risque de ne pas être exécuté… ou de l'être au mauvais moment.</p>
<p>Un [[ordre-limite|ordre limite]] te place côté maker, un [[ordre-marche|ordre au marché]] côté taker. Sur beaucoup de plateformes, les frais du maker sont plus bas.</p>`
      },
      {
        h: "Mesurer ce que l'exécution t'a coûté",
        body: `<p>Le bon réflexe des pros : comparer le prix obtenu au <b>mid</b> (milieu entre achat et vente) au moment de l'ordre. C'est le [[cost-mid|coût vs mid]].</p>
<pre>Bid 1,0848 · Ask 1,0852 → mid 1,0850
Tu achètes à 1,0853
Coût = 1,0853 − 1,0850 = 3 pips
Sur 1 million d'euros : environ 300 $</pre>
<p>Ajoute les [[frais]] et le [[slippage]] : sur des centaines de trades par an, l'exécution peut peser plus lourd que ta stratégie.</p>`
      },
      {
        h: "Demander des prix à plusieurs contreparties",
        body: `<p>Dans <b>My RFQ</b> de Vega Desk, tu es le client : tu demandes un prix à plusieurs banques et tu choisis le meilleur. Interroger plus de contreparties améliore souvent le prix… mais révèle aussi ton intention : si tout le monde sait que tu achètes gros, le marché peut monter avant ton ordre.</p>
<p>Le bon compromis des pros : 3 à 5 contreparties, et des montants qui ne dévoilent pas toute ta position d'un coup.</p>`
      },
      {
        h: "Découper les gros ordres",
        body: `<p>Un gros ordre au marché « mange » le carnet et fait bouger le prix contre toi. Les institutionnels le découpent avec des algorithmes [[twap|TWAP ou VWAP]] : de petits morceaux, étalés dans le temps, calés sur le volume du marché.</p>
<p>Pour toi, la leçon est simple : sur un actif peu [[liquidite|liquide]] (petite crypto, action BRVM), entre en plusieurs fois avec des ordres limites.</p>`
      }
    ],
    key: ["Le taker paie le spread, le maker le gagne", "Mesure ton coût d'exécution par rapport au mid", "Trop de contreparties = trop d'information révélée", "Découpe les gros ordres sur les marchés peu liquides"],
    quiz: [
      { q: "Bid 99,90, ask 100,10, tu achètes à 100,15. Ton coût vs mid ?", o: ["0,15", "0,25", "0,05"], a: 0, why: "Mid = 100,00 ; 100,15 − 100,00 = 0,15." },
      { q: "Pourquoi découper un gros ordre ?", o: ["Pour ne pas faire bouger le prix contre soi", "Pour payer plus de frais", "C'est obligatoire"], a: 0, why: "Un seul gros ordre consomme le carnet et dégrade le prix moyen obtenu." }
    ],
    try: "vega"
  },

  {
    id: "portefeuille",
    emoji: "🧺",
    title: "Construire un portefeuille qui tient",
    sub: "Allocation, diversification, corrélation, rééquilibrage.",
    level: "Débutant",
    mins: 9,
    lessons: [
      {
        h: "L'allocation fait l'essentiel",
        body: `<p>La façon dont tu répartis ton argent entre grandes familles ([[allocation]]) compte bien plus que le choix d'une action précise. Un portefeuille 100 % crypto peut perdre 70 % en un an ; un portefeuille mêlant [[etf|ETF]] actions, [[obligation|obligations]] et liquidités traverse les crises avec beaucoup moins de dégâts.</p>
<p>Question à te poser : <b>quelle baisse de mon portefeuille suis-je capable de supporter sans tout vendre ?</b> Ta réponse fixe ta part d'actifs risqués.</p>`
      },
      {
        h: "Diversifier, pour de vrai",
        body: `<p>Posséder 10 cryptos, ce n'est pas être diversifié : elles montent et baissent presque toutes ensemble. La vraie [[diversification]] mélange des actifs dont la [[correlation|corrélation]] est faible : actions de différentes régions, obligations, or, liquidités.</p>
<p>Attention : en crise, beaucoup de corrélations montent brusquement. En mars 2020, actions, crypto et même l'or ont baissé en même temps pendant quelques jours. Les liquidités restent la seule vraie protection immédiate.</p>`
      },
      {
        h: "Le rééquilibrage : acheter bas, vendre haut, automatiquement",
        body: `<p>Tu fixes une cible, par exemple 60 % actions, 30 % obligations, 10 % or. Après une forte hausse des actions, elles pèsent 70 % : tu en vends pour revenir à 60 %. Après une baisse, tu en rachètes. C'est le [[reequilibrage|rééquilibrage]].</p>
<p>Une ou deux fois par an suffit. Avantage : la règle décide à ta place, et elle te force à faire l'inverse de la foule.</p>`
      },
      {
        h: "Les pièges du portefeuille",
        body: `<ul>
<li><b>La concentration</b> : 50 % sur un seul actif « parce qu'il monte ». Si ça tourne mal, rien ne compense.</li>
<li><b>Le biais domestique</b> : n'investir que dans son pays. Ta richesse dépend déjà beaucoup de son économie.</li>
<li><b>Le risque de change</b> : un actif en dollars ajoute le risque EUR/USD (et donc FCFA/USD) à ton portefeuille.</li>
<li><b>Les frais</b> : 2 % de frais par an, sur 30 ans, coûtent une part énorme du résultat final.</li>
</ul>`
      }
    ],
    key: ["L'allocation explique l'essentiel du risque", "Diversifier = actifs peu corrélés, pas 10 cryptos", "Rééquilibre une à deux fois par an", "Méfie-toi de la concentration et des frais"],
    quiz: [
      { q: "Tu possèdes BTC, ETH, SOL et DOGE. Ton portefeuille est…", o: ["Peu diversifié : ces actifs sont très corrélés", "Parfaitement diversifié", "Sans risque"], a: 0, why: "Les cryptos montent et baissent généralement ensemble." },
      { q: "Cible 60/40. Après une hausse, les actions pèsent 70 %. Le rééquilibrage consiste à…", o: ["Vendre des actions pour revenir à 60 %", "Acheter encore des actions", "Ne rien faire"], a: 0, why: "On revient à la cible en vendant ce qui a monté." }
    ],
    try: "lab"
  },

  {
    id: "crises",
    emoji: "🌪️",
    title: "Anatomie des crises financières",
    sub: "Bulles, paniques bancaires, contagion, cascades de liquidation.",
    level: "Intermédiaire",
    mins: 10,
    lessons: [
      {
        h: "Le cycle d'une bulle",
        body: `<p>Presque toutes les bulles suivent le même scénario : une innovation réelle, puis l'argent facile, puis l'euphorie (« cette fois c'est différent »), puis la panique quand le dernier acheteur est entré. Les ICO de 2017, les memecoins, les actions internet de 2000 : même histoire, décors différents.</p>
<p>Les signes d'euphorie : des gens qui n'ont jamais investi te donnent des conseils, l'actif est partout dans les médias, on achète avec de l'argent emprunté.</p>`
      },
      {
        h: "La panique bancaire",
        body: `<p>Une banque prête à long terme l'argent que ses clients peuvent retirer demain. Si trop de clients veulent récupérer leur argent en même temps, elle doit vendre ses actifs à perte : c'est le [[bank-run|bank run]].</p>
<p>En mars 2023, Silicon Valley Bank s'effondre ainsi en deux jours, accélérée par les réseaux sociaux. En crypto, Celsius ou FTX ont connu la même mécanique : promettre des retraits immédiats avec de l'argent placé ailleurs.</p>`
      },
      {
        h: "La contagion",
        body: `<p>Une crise se propage par trois canaux ([[contagion]]) : les <b>dettes</b> (ceux qui avaient prêté à l'acteur en faillite perdent à leur tour), les <b>ventes forcées</b> (ceux qui doivent vendre font chuter les prix pour tous) et la <b>confiance</b> (on retire son argent partout « au cas où »).</p>
<p>En 2022, l'effondrement de Terra/Luna a mis en difficulté des prêteurs et des fonds, qui ont entraîné d'autres plateformes… jusqu'à FTX. Rejoue cette séquence dans les missions Time Machine.</p>`
      },
      {
        h: "Les cascades de liquidation",
        body: `<p>Quand beaucoup de traders utilisent du [[levier]], une baisse déclenche des [[liquidation|liquidations]], qui sont des ventes au marché, qui font encore baisser le prix, qui déclenchent d'autres liquidations… La cascade s'arrête quand il n'y a plus de levier à purger.</p>
<p>Ces cascades expliquent les chutes de 10 à 20 % en quelques minutes, souvent suivies d'un rebond rapide. Le 10 octobre 2025 en a été l'exemple le plus massif de l'histoire de la crypto.</p>`
      }
    ],
    key: ["Les bulles suivent toujours le même scénario", "Une banque ou une plateforme peut tomber en deux jours", "La contagion passe par les dettes, les ventes forcées et la confiance", "Le levier transforme une baisse en cascade"],
    quiz: [
      { q: "Pourquoi une panique bancaire peut-elle faire tomber une banque saine ?", o: ["Elle doit vendre ses actifs à perte pour rembourser tout le monde en même temps", "Les clients volent l'argent", "La banque centrale l'interdit"], a: 0, why: "Les dépôts sont retirables tout de suite, les prêts ne le sont pas." },
      { q: "Qu'est-ce qui arrête une cascade de liquidations ?", o: ["L'épuisement du levier à purger", "Un tweet", "La fermeture du marché le week-end"], a: 0, why: "Quand les positions à levier ont été liquidées, la vente forcée s'arrête." }
    ],
    try: "missions"
  },

  {
    id: "outils-avances",
    emoji: "📐",
    title: "Outils techniques avancés",
    sub: "Fibonacci, points pivots, profil de volume, Ichimoku : utiles, mais sans magie.",
    level: "Intermédiaire",
    mins: 9,
    lessons: [
      {
        h: "Les retracements de Fibonacci",
        body: `<p>Après un fort mouvement, on trace des niveaux à 38,2 %, 50 % et 61,8 % de son amplitude : ce sont les [[fibonacci|retracements de Fibonacci]]. Ils indiquent où une correction pourrait s'arrêter.</p>
<p>Il n'y a rien de mystique là-dedans : ces niveaux marchent parfois parce que des milliers de traders les regardent et y placent leurs ordres. Utilise-les comme des <b>zones</b>, combinées à un [[support]] ou à une moyenne mobile, jamais seules.</p>`
      },
      {
        h: "Les points pivots",
        body: `<p>Les [[pivot|points pivots]] se calculent à partir du plus haut, du plus bas et de la clôture de la veille :</p>
<pre>Pivot = (plus haut + plus bas + clôture) ÷ 3
R1 = 2 × pivot − plus bas
S1 = 2 × pivot − plus haut</pre>
<p>Les traders intraday s'en servent comme repères du jour : au-dessus du pivot, biais acheteur ; en dessous, biais vendeur ; R1 et S1 comme premiers objectifs.</p>`
      },
      {
        h: "Le profil de volume",
        body: `<p>Le [[profil-volume|profil de volume]] montre combien s'est échangé à chaque niveau de prix. Les zones de très gros volume sont celles où beaucoup d'acheteurs et de vendeurs se sont mis d'accord : le prix y revient souvent et elles servent de supports ou de résistances.</p>
<p>À l'inverse, une zone de faible volume est un « trou d'air » : le prix la traverse souvent rapidement.</p>`
      },
      {
        h: "Ichimoku en bref",
        body: `<p>L'[[ichimoku|Ichimoku]] affiche un nuage coloré : prix au-dessus du nuage = tendance haussière, en dessous = baissière, dans le nuage = indécision. Le nuage projeté dans le futur dessine des zones de support et de résistance à venir.</p>
<p>C'est un outil complet mais chargé. Comme pour tous les indicateurs : teste-le sur l'historique avant de lui faire confiance, et ne l'ajoute pas à cinq autres indicateurs qui disent la même chose.</p>`
      }
    ],
    key: ["Fibonacci = zones suivies par la foule, pas une loi", "Pivots = repères du jour pour l'intraday", "Les zones de gros volume attirent le prix", "Un indicateur de plus n'est utile que s'il apporte une information nouvelle"],
    quiz: [
      { q: "Veille : plus haut 110, plus bas 90, clôture 100. Le point pivot vaut…", o: ["100", "110", "95"], a: 0, why: "(110 + 90 + 100) ÷ 3 = 100." },
      { q: "Une zone de prix où très peu de volume s'est échangé…", o: ["Est souvent traversée rapidement", "Est un support très solide", "N'existe pas"], a: 0, why: "Peu d'ordres y ont été laissés : rien ne retient le prix." }
    ],
    try: "live"
  }
);
