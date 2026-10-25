/* Académie, suite : modules supplémentaires (Afrique/UEMOA, fondamentale, options, crypto avancé,
   forex, plan de trading, finances perso). Même format que courses.js. */
window.M = window.M || {};

Object.assign(M.GLOSSARY, {
  brvm: { t: "BRVM", d: "Bourse Régionale des Valeurs Mobilières, basée à Abidjan. La bourse commune aux 8 pays de l'UEMOA, dont le Mali." },
  uemoa: { t: "UEMOA", d: "Union économique et monétaire ouest-africaine : Bénin, Burkina Faso, Côte d'Ivoire, Guinée-Bissau, Mali, Niger, Sénégal, Togo. Monnaie commune : le franc CFA." },
  bceao: { t: "BCEAO", d: "Banque centrale des États de l'Afrique de l'Ouest. Elle fixe les taux directeurs de la zone UEMOA et encadre banques, monnaie électronique et paiements." },
  fcfa: { t: "Franc CFA (XOF)", d: "La monnaie de l'UEMOA, arrimée à l'euro à un taux fixe : 1 € = 655,957 FCFA." },
  sgi: { t: "SGI", d: "Société de gestion et d'intermédiation : le courtier agréé qui passe tes ordres à la BRVM et tient ton compte-titres." },
  "amf-umoa": { t: "AMF-UMOA", d: "Autorité des marchés financiers de l'Union monétaire ouest-africaine : le gendarme de la bourse régionale (ex-CREPMF)." },
  strike: { t: "Strike (prix d'exercice)", d: "Le prix auquel une option te permet d'acheter (call) ou de vendre (put) l'actif." },
  prime: { t: "Prime", d: "Le prix payé pour acheter une option. C'est la perte maximale de l'acheteur." },
  delta: { t: "Delta", d: "De combien le prix de l'option bouge quand l'actif bouge de 1. Un delta de 0,5 = l'option gagne ~0,5 € quand l'action gagne 1 €." },
  theta: { t: "Theta", d: "La valeur que perd une option chaque jour qui passe. Le temps joue contre l'acheteur d'option." },
  "valeur-temps": { t: "Valeur temps", d: "La partie de la prime qui paie l'espoir d'un mouvement avant l'échéance. Elle fond jusqu'à zéro à l'expiration." },
  seed: { t: "Phrase de récupération (seed)", d: "12 ou 24 mots qui donnent un accès total à un wallet crypto. Quiconque les connaît peut tout vider. Ne la donne JAMAIS." },
  defi: { t: "DeFi", d: "Finance décentralisée : prêts, échanges, rendements gérés par des smart contracts, sans banque. Innovant, mais bugs et piratages fréquents." },
  "self-custody": { t: "Auto-conservation", d: "Garder tes cryptos dans ton propre wallet (tu détiens les clés) plutôt que sur une plateforme." },
  lot: { t: "Lot", d: "Unité de taille au forex. 1 lot standard = 100 000 unités de la devise de base ; 0,01 lot (micro-lot) = 1 000." },
  "interets-composes": { t: "Intérêts composés", d: "Les gains produisent eux-mêmes des gains. Sur le long terme, c'est la force la plus puissante de l'investissement." },
  "epargne-precaution": { t: "Épargne de précaution", d: "Une réserve d'argent disponible immédiatement (3 à 6 mois de dépenses) pour les imprévus. À constituer AVANT d'investir." },
  "flux-tresorerie": { t: "Flux de trésorerie (cash-flow)", d: "L'argent réellement encaissé par une entreprise. Plus difficile à maquiller que le bénéfice comptable." }
});

M.COURSES.push(
  {
    id: "afrique",
    emoji: "🌍",
    title: "Investir depuis l'Afrique de l'Ouest : BRVM & UEMOA",
    sub: "La bourse d'Abidjan, les SGI, le FCFA, les obligations d'État — et les arnaques locales.",
    level: "Essentiel",
    mins: 10,
    lessons: [
      {
        h: "La BRVM, ta bourse régionale",
        body: `<p>La [[brvm|BRVM]] est la bourse commune aux 8 pays de l'[[uemoa|UEMOA]] — Bénin, Burkina Faso, Côte d'Ivoire, Guinée-Bissau, <b>Mali</b>, Niger, Sénégal, Togo. Elle est basée à Abidjan et cote des actions et des obligations, en [[fcfa|FCFA]].</p>
<p>On y trouve des entreprises que tu connais : opérateurs télécoms, banques, distributeurs, agro-industrie… Les indices de référence sont le <b>BRVM Composite</b> (toutes les actions), le <b>BRVM 30</b> (les plus échangées) et le <b>BRVM Prestige</b>.</p>
<p>Particularités : le marché est beaucoup moins [[liquidite|liquide]] que Paris ou New York (certaines actions s'échangent peu), mais les entreprises cotées versent souvent des [[dividende|dividendes]] élevés.</p>`
      },
      {
        h: "Comment acheter une action BRVM depuis le Mali",
        body: `<ol>
<li>Ouvrir un compte-titres auprès d'une [[sgi|SGI]] agréée par l'[[amf-umoa|AMF-UMOA]] (vérifie la liste officielle sur le site de l'autorité).</li>
<li>Fournir les pièces d'identité ([[kyc|KYC]]) et alimenter le compte (virement bancaire, parfois mobile money selon la SGI).</li>
<li>Passer un ordre (souvent un [[ordre-limite|ordre limite]] vu la faible liquidité).</li>
<li>Les titres sont conservés par le dépositaire central régional ; tu touches les dividendes sur ton compte.</li>
</ol>
<p>Compare les frais de chaque SGI : commission de courtage, droits de garde, frais de tenue de compte. Sur de petits montants, ils pèsent lourd.</p>`
      },
      {
        h: "Obligations d'État et emprunts régionaux",
        body: `<p>Les États de l'UEMOA empruntent régulièrement sur le marché régional : emprunts obligataires par appel public à l'épargne (ouverts aux particuliers via les SGI et banques) et titres publics adjugés par enchères (surtout pour les banques).</p>
<p>Ces [[obligation|obligations]] paient un coupon fixe en FCFA. Le risque principal n'est pas le change (pas de devise étrangère), mais le <b>risque de l'émetteur</b> et la difficulté à revendre avant l'échéance.</p>
<p>La [[bceao|BCEAO]] fixe les taux directeurs de la zone : quand elle les monte, les nouvelles obligations rapportent plus.</p>`
      },
      {
        h: "Le FCFA et le risque de change",
        body: `<p>Le FCFA est arrimé à l'euro (1 € = 655,957 FCFA). Conséquence : face à l'euro, ton épargne ne bouge pas ; face au <b>dollar</b>, elle suit l'EUR/USD.</p>
<p>Si tu achètes du Bitcoin ou des actions américaines en dollars, tu prends deux risques : celui de l'actif ET celui du dollar contre le FCFA. Dans l'app, tu peux afficher ton portefeuille en FCFA (Paramètres → Langue & devise).</p>`
      },
      {
        h: "Les arnaques qui ciblent les jeunes d'Afrique de l'Ouest",
        body: `<ul>
<li><b>Les « traders » WhatsApp/Telegram</b> qui promettent de doubler ton dépôt en mobile money en une semaine.</li>
<li><b>Les plateformes Ponzi</b> : tu gagnes au début grâce aux dépôts des nouveaux, puis le site disparaît avec tout.</li>
<li><b>Le « parrainage »</b> : on te paie surtout pour recruter d'autres personnes = schéma pyramidal.</li>
<li><b>Les faux comptes de célébrités</b> ou de « coachs » qui demandent un transfert Wave / Orange Money.</li>
</ul>
<p>Règle simple : si on te demande d'envoyer du mobile money à un particulier pour « investir », c'est une arnaque. Une vraie SGI ou banque a des bureaux, un agrément vérifiable, des contrats écrits.</p>`
      }
    ],
    key: ["La BRVM est la bourse commune des 8 pays UEMOA, dont le Mali", "On y accède via une SGI agréée par l'AMF-UMOA", "Faible liquidité : ordres limites et patience", "Mobile money envoyé à un particulier pour « investir » = arnaque"],
    quiz: [
      { q: "Où est basée la BRVM ?", o: ["Bamako", "Dakar", "Abidjan"], a: 2, why: "La BRVM a son siège à Abidjan, en Côte d'Ivoire, et sert les 8 pays de l'UEMOA." },
      { q: "Pour acheter une action cotée à la BRVM, tu passes par…", o: ["Une SGI agréée", "Un agent mobile money", "La BCEAO directement"], a: 0, why: "La SGI est l'intermédiaire agréé qui transmet tes ordres et tient ton compte-titres." },
      { q: "1 € vaut combien de FCFA ?", o: ["600", "655,957", "Ça change tous les jours"], a: 1, why: "La parité est fixe : 1 € = 655,957 FCFA." }
    ],
    try: "quiz"
  },

  {
    id: "fondamentale",
    emoji: "🔬",
    title: "Analyse fondamentale : lire une entreprise",
    sub: "Chiffre d'affaires, marges, dette, cash, PER : savoir si une action vaut son prix.",
    level: "Intermédiaire",
    mins: 10,
    lessons: [
      {
        h: "Les 3 documents qui disent tout",
        body: `<ul>
<li><b>Le compte de résultat</b> : chiffre d'affaires → marges → bénéfice net. L'entreprise gagne-t-elle de l'argent ?</li>
<li><b>Le bilan</b> : ce qu'elle possède (actifs) et ce qu'elle doit (dettes). Est-elle solide ?</li>
<li><b>Le tableau des [[flux-tresorerie|flux de trésorerie]]</b> : l'argent réellement encaissé. Le bénéfice peut être maquillé, le cash beaucoup moins.</li>
</ul>
<p>Ces documents sont publiés chaque année (et souvent chaque trimestre : les [[earnings|résultats]]).</p>`
      },
      {
        h: "Les ratios essentiels",
        body: `<ul>
<li><b>Croissance du chiffre d'affaires</b> : l'entreprise vend-elle plus chaque année ?</li>
<li><b>Marge nette</b> = bénéfice ÷ chiffre d'affaires. 20 % = elle garde 20 centimes par euro vendu.</li>
<li><b>Dette nette / résultat d'exploitation</b> : au-delà de 3-4 années de résultat, la dette devient lourde.</li>
<li><b>[[per|PER]]</b> : prix ÷ bénéfice par action. Un PER de 15 = tu paies 15 ans de bénéfices actuels.</li>
<li><b>Rendement du dividende</b> = dividende ÷ cours.</li>
</ul>
<p>Un ratio seul ne veut rien dire : compare-le aux concurrents et à l'historique de l'entreprise.</p>`
      },
      {
        h: "Cher ou pas cher ?",
        body: `<p>Une action à PER 40 n'est pas forcément chère si les bénéfices doublent tous les deux ans. Une action à PER 6 n'est pas forcément une affaire si l'entreprise est en déclin (« value trap »).</p>
<p>La vraie question : <b>le prix actuel reflète-t-il déjà la croissance future ?</b> Les investisseurs professionnels estiment les flux de trésorerie futurs et les ramènent à aujourd'hui (méthode DCF). Plus les [[taux-directeur|taux]] sont élevés, plus les flux lointains valent peu — c'est pour ça que la tech souffre quand les taux montent.</p>`
      },
      {
        h: "L'avantage compétitif (le « moat »)",
        body: `<p>Les meilleures entreprises ont un fossé qui protège leurs profits : une marque forte, un réseau que tout le monde utilise (effet réseau), des coûts plus bas que tous les concurrents, ou des clients qui ne peuvent pas partir facilement.</p>
<p>Un opérateur télécom dominant dans son pays, par exemple, profite d'infrastructures très coûteuses à copier. Pose-toi toujours la question : <b>pourquoi un concurrent ne pourrait-il pas faire pareil demain ?</b></p>`
      }
    ],
    key: ["Compte de résultat, bilan, flux de trésorerie", "Le cash est plus fiable que le bénéfice", "Un PER se compare, il ne se juge pas seul", "Cherche l'avantage compétitif durable"],
    quiz: [
      { q: "Quel document montre l'argent réellement encaissé ?", o: ["Le bilan", "Le tableau des flux de trésorerie", "Le rapport de l'AG"], a: 1, why: "Les flux de trésorerie retracent les entrées et sorties de cash réelles." },
      { q: "Une action à PER très bas est forcément une bonne affaire.", o: ["Vrai", "Faux"], a: 1, why: "Un PER bas peut refléter une entreprise en déclin : c'est le piège du « value trap »." }
    ],
    try: "quiz"
  },

  {
    id: "options",
    emoji: "🎟️",
    title: "Les options sans prise de tête",
    sub: "Call, put, prime, strike, échéance, grecs : comprendre avant de toucher.",
    level: "Avancé",
    mins: 10,
    lessons: [
      {
        h: "Une option = un ticket avec date limite",
        body: `<p>Un [[call]] te donne le droit d'acheter un actif à un prix fixé (le [[strike]]) jusqu'à une date (l'échéance). Un [[put]], le droit de vendre. Pour ce droit, tu paies une [[prime]].</p>
<p>Exemple : action à 100 €. Tu achètes un call strike 105, échéance 1 mois, pour 2 €. Si l'action finit à 115 €, ton call vaut 10 € (115 − 105) : +400 %. Si elle finit sous 105 €, il vaut 0 : tu perds tes 2 €.</p>`
      },
      {
        h: "Pourquoi la plupart des options achetées finissent à zéro",
        body: `<p>La prime contient de la [[valeur-temps|valeur temps]] : tu paies l'espoir d'un mouvement. Chaque jour, cette valeur fond (c'est le [[theta]]), et elle accélère à l'approche de l'échéance.</p>
<p>Pour gagner en achetant une option, il faut avoir raison sur <b>la direction</b>, <b>l'ampleur</b> ET <b>le timing</b>. Trois conditions à la fois. C'est pour ça que les vendeurs d'options (souvent des pros) gagnent une petite prime la plupart du temps… et prennent parfois une énorme perte.</p>`
      },
      {
        h: "Les grecs en une phrase",
        body: `<ul>
<li><b>[[delta|Delta]]</b> : sensibilité au prix de l'actif.</li>
<li><b>[[theta|Theta]]</b> : perte de valeur par jour qui passe.</li>
<li><b>Vega</b> : sensibilité à la [[volatilite|volatilité]] attendue. Après une annonce, la volatilité retombe et les options perdent de la valeur même si l'action bouge (« volatility crush »).</li>
<li><b>Gamma</b> : vitesse à laquelle le delta change.</li>
</ul>`
      },
      {
        h: "3 usages raisonnables",
        body: `<ul>
<li><b>Le put de protection</b> : tu possèdes une action, tu achètes un put pour limiter ta perte, comme une assurance.</li>
<li><b>Le covered call</b> : tu possèdes l'action et vends un call au-dessus du cours pour encaisser une prime (tu plafonnes ton gain).</li>
<li><b>Le call à la place de l'action</b> : exposition à la hausse avec une perte limitée à la prime.</li>
</ul>
<p>⚠️ Les [[0dte|options 0DTE]] (expiration le jour même) sont devenues virales : c'est du pari ultra court terme. Taille minuscule ou pas du tout.</p>`
      }
    ],
    key: ["Call = droit d'acheter, put = droit de vendre", "La prime est la perte max de l'acheteur", "Le temps joue contre l'acheteur (theta)", "Usage sain : protection, pas loterie"],
    quiz: [
      { q: "Tu achètes un call strike 50 pour une prime de 3. À l'échéance l'action vaut 58. Ton gain net par option ?", o: ["8", "5", "3"], a: 1, why: "Valeur à l'échéance 58 − 50 = 8, moins la prime de 3 = 5." },
      { q: "Le theta mesure…", o: ["La perte de valeur liée au temps", "La sensibilité au prix", "Le volume"], a: 0, why: "Le theta, c'est l'érosion quotidienne de la valeur temps." }
    ],
    try: "quiz"
  },

  {
    id: "crypto2",
    emoji: "🔐",
    title: "Crypto avancé : wallets, DeFi, sécurité",
    sub: "Garder ses cryptos en sécurité, comprendre la DeFi, lire l'on-chain.",
    level: "Intermédiaire",
    mins: 9,
    lessons: [
      {
        h: "Plateforme ou wallet perso ?",
        body: `<p>Sur une plateforme, c'est elle qui détient les clés : pratique, mais si elle fait faillite (FTX !) ou bloque ton compte, tu dépends d'elle. En [[self-custody|auto-conservation]], tu détiens tes clés : personne ne peut bloquer tes fonds… mais personne ne peut les récupérer si tu perds ta [[seed|phrase de récupération]].</p>
<p>Compromis courant : petites sommes de trading sur une plateforme régulée, épargne long terme dans un wallet perso (idéalement matériel).</p>`
      },
      {
        h: "Les 5 règles de sécurité",
        body: `<ol>
<li>Ta seed phrase : sur papier, jamais en photo, jamais dans le cloud, jamais donnée à personne (aucun « support » ne te la demandera).</li>
<li>Double authentification par application, pas par SMS.</li>
<li>Vérifie l'adresse des sites (les faux sites copient tout).</li>
<li>Ne signe pas une transaction que tu ne comprends pas : certaines autorisent un contrat à vider ton wallet.</li>
<li>Méfie-toi des airdrops et NFT gratuits reçus sans raison.</li>
</ol>`
      },
      {
        h: "La DeFi en clair",
        body: `<p>La [[defi|DeFi]] permet d'échanger, prêter ou emprunter via des programmes (smart contracts), sans banque. Les rendements affichés peuvent être élevés… parce que les risques le sont : bug du contrat, piratage, effondrement du token de récompense, [[rug|rug pull]].</p>
<p>Un rendement « stable » de 20 % par an sur un [[stablecoin]] doit te poser la question : <b>d'où vient cet argent ?</b> (C'était exactement le cas de Terra/Luna.)</p>`
      },
      {
        h: "Lire l'on-chain",
        body: `<p>Sur une blockchain publique, tout est visible : les gros transferts des [[whale|baleines]], les entrées sur les plateformes (souvent pour vendre), les sorties (souvent pour garder), le [[funding|funding rate]] des perpétuels, les positions liquidées.</p>
<p>Ces données aident à mesurer le sentiment, mais ne prédisent rien seules. Elles complètent l'analyse technique et la macro.</p>`
      }
    ],
    key: ["Plateforme = pratique mais risque de contrepartie", "Seed phrase = accès total, jamais partagée", "Rendement élevé = risque élevé, demande d'où il vient", "L'on-chain mesure le sentiment, ne prédit pas"],
    quiz: [
      { q: "Un « agent du support » te demande ta seed phrase pour débloquer ton compte. Tu…", o: ["La donnes", "Refuses : c'est une arnaque", "Donnes la moitié"], a: 1, why: "Aucun support légitime ne demande jamais la phrase de récupération." },
      { q: "Pourquoi la faillite d'une plateforme est-elle un risque pour toi ?", o: ["Elle détient les clés de tes cryptos", "Elle change le prix du Bitcoin", "Ce n'est pas un risque"], a: 0, why: "Sur une plateforme, tes cryptos sont sous sa garde : en cas de faillite, tu peux tout perdre." }
    ],
    try: "quiz"
  },

  {
    id: "forex",
    emoji: "💱",
    title: "Forex en détail",
    sub: "Sessions, paires, pips, lots, spreads : le plus gros marché du monde.",
    level: "Intermédiaire",
    mins: 8,
    lessons: [
      {
        h: "Paires majeures, mineures, exotiques",
        body: `<p><b>Majeures</b> : contiennent le dollar et une grande devise (EUR/USD, USD/JPY, GBP/USD…). Spreads minuscules, liquidité énorme.<br><b>Mineures</b> : sans dollar (EUR/GBP, EUR/JPY).<br><b>Exotiques</b> : une devise émergente (USD/ZAR, EUR/TRY). Spreads larges, mouvements brutaux.</p>
<p>Lire une paire : EUR/USD = 1,16 signifie qu'1 euro vaut 1,16 dollar. Si tu achètes EUR/USD, tu paries que l'euro va monter face au dollar.</p>`
      },
      {
        h: "Pips, lots et valeur d'un mouvement",
        body: `<p>Un [[pip]] = 0,0001 sur la plupart des paires (0,01 sur les paires en yen). La taille se mesure en [[lot|lots]] : 1 lot = 100 000 unités, 0,1 lot (mini) = 10 000, 0,01 (micro) = 1 000.</p>
<pre>Sur EUR/USD :
1 lot     → 1 pip ≈ 10 $
0,1 lot   → 1 pip ≈ 1 $
0,01 lot  → 1 pip ≈ 0,10 $</pre>
<p>Un stop de 30 pips avec 1 lot = environ 300 $ de risque. Calcule-le TOUJOURS avant d'entrer.</p>`
      },
      {
        h: "Les sessions : quand le marché bouge",
        body: `<p>Le forex tourne 24h/24 en semaine, mais l'activité suit le soleil :</p>
<ul><li><b>Asie (Tokyo)</b> : calme, sauf sur le yen.</li><li><b>Londres</b> : la session la plus active (heure GMT, donc celle du Mali).</li><li><b>New York</b> : forte volatilité, surtout pendant le chevauchement avec Londres et lors des chiffres US ([[nfp|NFP]], [[cpi|CPI]]).</li></ul>
<p>Le spread s'élargit souvent la nuit et autour des annonces.</p>`
      },
      {
        h: "Ce qui fait bouger une devise",
        body: `<p>Les écarts de [[taux-directeur|taux]] entre banques centrales (l'argent va là où il est mieux rémunéré — c'est le [[carry-trade|carry trade]]), l'inflation, la croissance, et le sentiment de risque (en panique, le dollar, le yen et le franc suisse montent souvent).</p>`
      }
    ],
    key: ["Majeures = spreads faibles, exotiques = danger", "1 lot EUR/USD ≈ 10 $ par pip", "Londres + New York = les heures les plus actives", "Les taux d'intérêt pilotent les devises"],
    quiz: [
      { q: "Tu trades 0,1 lot d'EUR/USD avec un stop de 40 pips. Risque approximatif ?", o: ["4 $", "40 $", "400 $"], a: 1, why: "0,1 lot ≈ 1 $ par pip × 40 pips = 40 $." },
      { q: "Quelle session est la plus active ?", o: ["Tokyo", "Londres", "Sydney"], a: 1, why: "Londres concentre la plus grosse part des volumes forex mondiaux." }
    ],
    try: "quiz"
  },

  {
    id: "plan",
    emoji: "📝",
    title: "Construire ton plan de trading",
    sub: "Le document qui sépare les traders des parieurs.",
    level: "Essentiel",
    mins: 7,
    lessons: [
      {
        h: "Le plan tient sur une page",
        body: `<ol>
<li><b>Marchés & horaires</b> : quoi et quand je trade.</li>
<li><b>Setup</b> : la ou les 1-2 stratégies que j'applique, avec des règles d'entrée précises.</li>
<li><b>Risque</b> : % max par trade ([[regle-1pc|1 %]]), perte max par jour et par semaine, [[levier]] max.</li>
<li><b>Sorties</b> : où va le [[stop-loss]], quand je prends mes gains.</li>
<li><b>Interdits</b> : pas de trade sur une émotion, pas de trade avant une grosse annonce, pas de trade après 2 pertes de suite.</li>
</ol>`
      },
      {
        h: "Le journal : ton meilleur coach",
        body: `<p>Pour chaque trade : date, actif, setup, entrée, stop, objectif, taille, résultat, <b>émotion</b>, plan respecté oui/non, capture du graphique.</p>
<p>Chaque semaine : relis. Tu découvriras que tes pertes viennent souvent des mêmes erreurs (heure de la journée, actif, fatigue, FOMO). C'est là que le progrès se fait.</p>`
      },
      {
        h: "Le chemin vers le réel",
        body: `<ol>
<li>[[backtest|Backtest]] de ta stratégie (Algo Lab ou à la main sur l'historique).</li>
<li>[[paper-trading|Paper trading]] : 50+ trades en respectant le plan (Live + Missions ici).</li>
<li>Réel avec un tout petit montant : l'objectif est de respecter le plan, pas de gagner.</li>
<li>Augmenter la taille progressivement, seulement si les statistiques restent bonnes.</li>
</ol>`
      },
      {
        h: "Les chiffres à suivre",
        body: `<ul><li>[[win-rate|Taux de réussite]] et gain moyen / perte moyenne (→ espérance).</li><li>[[profit-factor|Profit factor]].</li><li>[[drawdown|Drawdown]] maximum.</li><li>% de trades où le plan a été respecté (le plus important au début).</li></ul>`
      }
    ],
    key: ["Plan écrit AVANT de trader", "Journal = progression", "Backtest → paper → petit réel → taille", "Mesure le respect du plan, pas seulement le PnL"],
    quiz: [
      { q: "Quelle est la priorité au début du trading réel ?", o: ["Gagner un maximum", "Respecter son plan", "Trader beaucoup"], a: 1, why: "Le respect du plan construit les habitudes ; les gains viennent ensuite." },
      { q: "Un journal de trading doit noter ton émotion au moment du trade.", o: ["Vrai", "Faux"], a: 0, why: "Les émotions expliquent une grande partie des erreurs répétées." }
    ],
    try: "live"
  },

  {
    id: "argent",
    emoji: "🌱",
    title: "L'argent et toi : la base avant de trader",
    sub: "Budget, épargne de précaution, intérêts composés, inflation.",
    level: "Débutant",
    mins: 7,
    lessons: [
      {
        h: "L'ordre des étapes",
        body: `<ol>
<li>Un budget (même simple) : savoir où part ton argent.</li>
<li>Rembourser les dettes chères.</li>
<li>Une [[epargne-precaution|épargne de précaution]] : 3 à 6 mois de dépenses, disponible tout de suite.</li>
<li>Investir régulièrement sur le long terme ([[dca|DCA]]).</li>
<li>Seulement ensuite : une petite partie pour le trading actif.</li>
</ol>
<p>Trader avec l'argent du loyer, c'est la garantie de prendre de mauvaises décisions sous la pression.</p>`
      },
      {
        h: "La règle 50/30/20",
        body: `<p>Un point de départ simple : <b>50 %</b> des revenus pour les besoins (logement, nourriture, transport), <b>30 %</b> pour les envies, <b>20 %</b> pour l'épargne et l'investissement. Adapte selon ta situation, mais garde l'idée : <b>tu te paies en premier</b>, l'épargne part dès que l'argent arrive.</p>`
      },
      {
        h: "La magie des intérêts composés",
        body: `<p>Avec les [[interets-composes|intérêts composés]], tes gains produisent eux-mêmes des gains. La <b>règle de 72</b> : 72 ÷ rendement annuel = nombre d'années pour doubler. À 8 % par an, ton capital double en ~9 ans.</p>
<pre>50 000 FCFA par mois pendant 20 ans, à 8 %/an
→ 12 millions versés
→ environ 29 millions à l'arrivée</pre>
<p>Le meilleur atout que tu as, c'est ton âge : chaque année de plus compte énormément.</p>`
      },
      {
        h: "L'inflation, l'ennemi silencieux",
        body: `<p>L'[[inflation]] grignote le pouvoir d'achat de l'argent qui dort. Avec 3 % d'inflation par an, 100 000 FCFA ne valent plus qu'environ 74 000 en pouvoir d'achat après 10 ans.</p>
<p>D'où l'intérêt d'investir une partie de son épargne de long terme… sans jamais oublier que tout placement qui rapporte plus comporte plus de risque.</p>`
      }
    ],
    key: ["Budget → dettes → épargne de précaution → investir → trader", "Paie-toi en premier", "Règle de 72 : 72 ÷ taux = années pour doubler", "L'argent qui dort perd de la valeur"],
    quiz: [
      { q: "Avec un rendement de 6 % par an, combien d'années pour doubler (règle de 72) ?", o: ["6 ans", "12 ans", "20 ans"], a: 1, why: "72 ÷ 6 = 12 ans." },
      { q: "Que faut-il constituer AVANT de commencer à trader ?", o: ["Une épargne de précaution", "Un compte à levier", "Une collection de NFT"], a: 0, why: "L'épargne de précaution évite de devoir vendre ou trader sous la pression d'un imprévu." }
    ],
    try: "quiz"
  }
);
