/* Banque de questions du parcours Quiz (façon Duolingo).
   Types : mcq (choix), tf (vrai/faux), fill (mot manquant), num (calcul).
   "gen" liste les exercices pratiques générés à la volée (voir quiz.js). */
window.M = window.M || {};

M.QUIZ_UNITS = [
  {
    id: "u1", e: "🧭", t: "Les bases du marché", sub: "Bid, ask, spread, long, short", gen: ["candleRead"],
    q: [
      { t: "mcq", q: "Le meilleur prix auquel quelqu'un accepte de vendre s'appelle…", o: ["Le bid", "L'ask", "Le spread"], a: 1, e: "L'ask est le prix vendeur ; le bid est le prix acheteur." },
      { t: "mcq", q: "Bid 99,90 / Ask 100,10. Quel est le spread ?", o: ["0,10", "0,20", "100"], a: 1, e: "100,10 − 99,90 = 0,20." },
      { t: "tf", q: "Être « short », c'est parier sur la baisse.", a: true, e: "On vend d'abord pour racheter plus bas." },
      { t: "fill", q: "Le prix monte quand les ___ sont plus pressés que les vendeurs.", o: ["acheteurs", "régulateurs", "banques centrales"], a: 0, e: "Des acheteurs qui « prennent » l'ask font monter le prix." },
      { t: "tf", q: "Un gain latent est définitivement acquis.", a: false, e: "Il ne compte qu'une fois la position fermée." },
      { t: "mcq", q: "Une bougie verte signifie que…", o: ["La clôture est au-dessus de l'ouverture", "Le volume a augmenté", "Le prix a atteint un record"], a: 0, e: "Verte = clôture > ouverture sur la période." },
      { t: "mcq", q: "Que représentent les mèches d'une bougie ?", o: ["L'ouverture et la clôture", "Le plus haut et le plus bas", "Le volume"], a: 1, e: "Les mèches montrent les extrêmes atteints." },
      { t: "tf", q: "Le spread est un coût que tu paies à chaque aller-retour.", a: true, e: "Tu achètes à l'ask et revends au bid." }
    ]
  },
  {
    id: "u2", e: "🎛️", t: "Ordres & exécution", sub: "Marché, limite, stop, slippage", gen: ["slTpPrice"],
    q: [
      { t: "mcq", q: "Quel ordre garantit l'exécution immédiate mais pas le prix ?", o: ["Ordre limite", "Ordre au marché", "Take-profit"], a: 1, e: "L'ordre au marché s'exécute tout de suite au meilleur prix disponible." },
      { t: "mcq", q: "Tu veux acheter seulement si le prix redescend à 95. Tu utilises…", o: ["Un ordre limite à 95", "Un ordre au marché", "Un stop à 95"], a: 0, e: "L'ordre limite fixe ton prix maximum d'achat." },
      { t: "tf", q: "Un stop-loss est toujours exécuté exactement à son prix.", a: false, e: "En cas de gap ou de marché rapide, il y a du slippage." },
      { t: "fill", q: "La différence entre le prix attendu et le prix obtenu s'appelle le ___.", o: ["slippage", "funding", "pip"], a: 0, e: "Le slippage augmente quand la liquidité est faible." },
      { t: "mcq", q: "Un stop suiveur (trailing stop)…", o: ["Recule quand le prix baisse", "Monte avec le prix et ne redescend jamais", "Ferme au bout d'une heure"], a: 1, e: "Il verrouille les gains au fil de la hausse." },
      { t: "mcq", q: "Mettre son stop « au point mort », c'est le placer…", o: ["Au prix d'entrée", "Au plus bas du jour", "Nulle part"], a: 0, e: "Le trade ne peut plus être perdant (hors frais et gaps)." },
      { t: "tf", q: "Sur un actif peu liquide, l'ordre limite est souvent plus prudent.", a: true, e: "Il évite d'acheter beaucoup plus cher que prévu." },
      { t: "mcq", q: "Le take-profit sert à…", o: ["Limiter la perte", "Encaisser automatiquement le gain visé", "Augmenter le levier"], a: 1, e: "Il ferme la position quand l'objectif est atteint." }
    ]
  },
  {
    id: "u3", e: "🧰", t: "Les instruments", sub: "Actions, ETF, obligations, dérivés", gen: [],
    q: [
      { t: "mcq", q: "Un ETF S&P 500, c'est…", o: ["Une seule action américaine", "Un fonds qui réplique 500 entreprises", "Une crypto"], a: 1, e: "Diversification instantanée à frais bas." },
      { t: "tf", q: "Quand les taux montent, le prix des obligations existantes baisse.", a: true, e: "Leur coupon fixe devient moins attractif que celui des nouvelles." },
      { t: "mcq", q: "Quel produit donne le droit, sans obligation, d'acheter ?", o: ["Un put", "Un call", "Un future"], a: 1, e: "Le call est une option d'achat." },
      { t: "mcq", q: "Un perpétuel crypto est maintenu proche du prix spot grâce au…", o: ["Funding rate", "Dividende", "Coupon"], a: 0, e: "Longs et shorts se paient mutuellement selon l'écart." },
      { t: "fill", q: "Un ___ est un prêt à un État ou une entreprise, rémunéré par un coupon.", o: ["obligation", "ETF", "CFD"], a: 0, e: "L'obligation = prêter plutôt que posséder." },
      { t: "tf", q: "Avec un CFD, tu possèdes réellement l'action.", a: false, e: "Un CFD est un contrat sur la variation de prix, sans propriété." },
      { t: "mcq", q: "Le dividende est…", o: ["Une part du bénéfice versée aux actionnaires", "Une commission du courtier", "Un impôt"], a: 0, e: "Le cours baisse d'environ le même montant le jour du détachement." },
      { t: "mcq", q: "Un stablecoin comme l'USDC vise à valoir…", o: ["1 Bitcoin", "1 dollar", "1 gramme d'or"], a: 1, e: "C'est le « cash » de l'écosystème crypto." }
    ]
  },
  {
    id: "u4", e: "📈", t: "Lire un graphique", sub: "Tendances, supports, cassures", gen: ["chartTrend", "chartTrend"],
    q: [
      { t: "mcq", q: "Une tendance haussière, c'est…", o: ["Des plus hauts et plus bas de plus en plus hauts", "Une seule grosse bougie verte", "Un RSI au-dessus de 50"], a: 0, e: "La structure des sommets et des creux définit la tendance." },
      { t: "tf", q: "Un support est une ligne précise au centime près.", a: false, e: "C'est une zone, pas une ligne exacte." },
      { t: "mcq", q: "Une résistance cassée avec force devient souvent…", o: ["Un support", "Inutile", "Une résistance plus forte"], a: 0, e: "C'est le « flip » de niveau." },
      { t: "fill", q: "Une cassure qui échoue et revient dans la zone est un ___.", o: ["faux breakout", "halving", "dividende"], a: 0, e: "Le piège préféré du marché, d'où l'utilité du stop." },
      { t: "mcq", q: "Quel filtre rend une cassure plus crédible ?", o: ["Une clôture au-delà du niveau avec du volume", "Une mèche qui touche le niveau", "Un tweet"], a: 0, e: "Clôture + volume = confirmation." },
      { t: "mcq", q: "Un marteau (longue mèche basse) après une baisse suggère…", o: ["Un rejet des vendeurs", "Une accélération de la baisse", "Rien du tout"], a: 0, e: "À confirmer par la bougie suivante." },
      { t: "tf", q: "Les chiffres ronds (100 000 $ pour le BTC) agissent souvent comme des niveaux psychologiques.", a: true, e: "Beaucoup d'ordres s'y accumulent." },
      { t: "mcq", q: "Avant d'acheter sur le 1h, il est sage de vérifier…", o: ["La tendance du 4h et du daily", "La météo", "Le nombre de followers du coin"], a: 0, e: "On trade dans le sens du timeframe supérieur." }
    ]
  },
  {
    id: "u5", e: "🎚️", t: "Les indicateurs", sub: "EMA, RSI, MACD, Bollinger, ATR", gen: ["chartRsi"],
    q: [
      { t: "mcq", q: "Un RSI au-dessus de 70 indique une zone…", o: ["Survendue", "Surachetée", "Neutre"], a: 1, e: "Mais en tendance forte, il peut y rester longtemps." },
      { t: "tf", q: "RSI > 70 = il faut immédiatement vendre.", a: false, e: "C'est une indication de momentum fort, pas un signal de vente seul." },
      { t: "mcq", q: "L'ATR mesure…", o: ["La direction", "L'amplitude moyenne des bougies", "Le volume"], a: 1, e: "Idéal pour placer un stop hors du bruit." },
      { t: "fill", q: "Quand les bandes de ___ se resserrent, un gros mouvement se prépare souvent.", o: ["Bollinger", "Donchian", "Fibonacci"], a: 0, e: "C'est le « squeeze » de volatilité." },
      { t: "mcq", q: "L'EMA par rapport à la SMA…", o: ["Réagit plus vite aux prix récents", "Réagit plus lentement", "Est identique"], a: 0, e: "Elle donne plus de poids aux dernières bougies." },
      { t: "mcq", q: "Le prix fait un nouveau plus haut mais le RSI non. C'est…", o: ["Une divergence", "Un gap", "Un breakout"], a: 0, e: "Le momentum s'essouffle." },
      { t: "mcq", q: "Le VWAP est utilisé par les institutionnels pour…", o: ["Juger la qualité de leur prix d'achat", "Calculer les impôts", "Choisir une crypto"], a: 0, e: "Acheter sous le VWAP = « bien acheté » sur la séance." },
      { t: "tf", q: "Empiler 8 indicateurs améliore toujours les décisions.", a: false, e: "2-3 indicateurs complémentaires suffisent." }
    ]
  },
  {
    id: "u6", e: "🛡️", t: "Gestion du risque", sub: "Taille de position, levier, drawdown", gen: ["sizing", "liq", "recover", "breakeven", "levPnl"],
    q: [
      { t: "mcq", q: "Risque maximum conseillé par trade ?", o: ["1 à 2 % du capital", "10 %", "50 %"], a: 0, e: "Même 10 pertes d'affilée ne te sortent pas du jeu." },
      { t: "num", q: "Capital 10 000 $, risque 1 %. Combien de $ risques-tu par trade ?", a: 100, tol: 0.5, u: "$", e: "10 000 × 1 % = 100 $." },
      { t: "tf", q: "Le levier augmente ta probabilité d'avoir raison.", a: false, e: "Il augmente seulement la vitesse à laquelle tu gagnes… ou perds." },
      { t: "mcq", q: "La taille de position se calcule à partir…", o: ["De ton humeur", "De la distance au stop", "Du prix de l'action"], a: 1, e: "Taille = risque en $ ÷ distance au stop." },
      { t: "num", q: "Ton compte perd 50 %. Quel gain en % faut-il pour revenir à l'équilibre ?", a: 100, tol: 0.5, u: "%", e: "De 50 à 100, il faut doubler : +100 %." },
      { t: "fill", q: "La chute maximale du capital depuis un sommet s'appelle le ___.", o: ["drawdown", "spread", "theta"], a: 0, e: "Le drawdown mesure la douleur maximale." },
      { t: "mcq", q: "Avec un R:R de 1:3, quel taux de réussite minimum pour être à l'équilibre (hors frais) ?", o: ["25 %", "50 %", "75 %"], a: 0, e: "1 ÷ (1 + 3) = 25 %." },
      { t: "tf", q: "Une limite de perte journalière aide à éviter le revenge trading.", a: true, e: "Elle impose une pause quand les émotions prennent le dessus." }
    ]
  },
  {
    id: "u7", e: "🧠", t: "Psychologie", sub: "FOMO, revenge, biais", gen: [],
    q: [
      { t: "mcq", q: "Acheter après +40 % parce que « tout le monde gagne », c'est…", o: ["Du FOMO", "Du DCA", "Du hedging"], a: 0, e: "Fear Of Missing Out." },
      { t: "mcq", q: "Doubler sa taille juste après une perte pour se refaire, c'est…", o: ["Du revenge trading", "De la discipline", "Du scalping"], a: 0, e: "Le moyen le plus rapide de vider un compte." },
      { t: "tf", q: "Une perte fait environ deux fois plus mal qu'un gain équivalent ne fait plaisir.", a: true, e: "C'est l'aversion à la perte." },
      { t: "fill", q: "Ne voir que ceux qui ont réussi, c'est le biais du ___.", o: ["survivant", "spread", "volume"], a: 0, e: "On ne voit pas les milliers qui ont tout perdu." },
      { t: "mcq", q: "Le plus gros drapeau rouge chez un « coach trading » ?", o: ["Il parle de stop-loss", "Il promet des gains garantis", "Il montre ses pertes"], a: 1, e: "Aucun rendement n'est garanti sur les marchés." },
      { t: "tf", q: "Ne rien faire peut être la meilleure décision de trading.", a: true, e: "Pas de setup clair = pas de trade." },
      { t: "mcq", q: "Erreur classique de débutant…", o: ["Couper les gains tôt et laisser courir les pertes", "Utiliser un stop", "Tenir un journal"], a: 0, e: "Il faut faire exactement l'inverse." },
      { t: "mcq", q: "Après 2 pertes d'affilée, le plus sage est souvent…", o: ["Faire une pause", "Augmenter le levier", "Changer de stratégie au hasard"], a: 0, e: "La pause casse la spirale émotionnelle." }
    ]
  },
  {
    id: "u8", e: "🤖", t: "Stratégies & algos", sub: "Trend, breakout, mean reversion, pairs", gen: ["expectancy"],
    q: [
      { t: "mcq", q: "Quel algo achète quand une EMA rapide croise au-dessus d'une EMA lente ?", o: ["Trend following", "Mean reversion", "Pairs trading"], a: 0, e: "Il suit le momentum." },
      { t: "mcq", q: "La méthode des Turtles est basée sur…", o: ["Le canal de Donchian", "Le RSI 2", "Les dividendes"], a: 0, e: "Achat sur cassure du plus haut des N dernières bougies." },
      { t: "tf", q: "Le mean reversion marche très bien dans les tendances fortes.", a: false, e: "Il souffre en tendance, brille en range." },
      { t: "mcq", q: "Quelle stratégie peut gagner que le marché monte ou baisse ?", o: ["Pairs trading", "Trend long-only", "Buy & hold"], a: 0, e: "Elle parie sur l'écart entre deux actifs." },
      { t: "fill", q: "Régler une stratégie si finement sur le passé qu'elle échoue sur le futur, c'est l'___.", o: ["overfitting", "halving", "arbitrage"], a: 0, e: "Teste sur une période, valide sur une autre." },
      { t: "tf", q: "Un backtest sans frais ni slippage est réaliste.", a: false, e: "Les coûts peuvent transformer une stratégie gagnante en perdante." },
      { t: "mcq", q: "Un bot Telegram promet +2 % par jour garanti. C'est…", o: ["Une arnaque", "Un bon placement", "Un ETF"], a: 0, e: "+2 %/jour ≈ +137 000 % par an : impossible." },
      { t: "mcq", q: "Pour comparer deux stratégies, le meilleur indicateur rendement/risque est…", o: ["Le ratio de Sharpe", "Le nombre de trades", "Le prix de l'actif"], a: 0, e: "Il rapporte le rendement à la volatilité." }
    ]
  },
  {
    id: "u9", e: "🌍", t: "Macro & actualité", sub: "Taux, inflation, événements", gen: [],
    q: [
      { t: "mcq", q: "La Fed monte ses taux par surprise. Réaction typique de la tech ?", o: ["Hausse", "Baisse", "Aucune"], a: 1, e: "L'argent plus cher pèse sur les valorisations de croissance." },
      { t: "mcq", q: "Le CPI mesure…", o: ["L'inflation", "L'emploi", "Le PIB"], a: 0, e: "Indice des prix à la consommation." },
      { t: "tf", q: "Les ETF Bitcoin spot ont été autorisés aux États-Unis en janvier 2024.", a: true, e: "Et le BTC a d'abord baissé : sell the news." },
      { t: "mcq", q: "Le halving Bitcoin…", o: ["Divise par deux la récompense des mineurs", "Divise le prix par deux", "Double le nombre de BTC"], a: 0, e: "Il réduit la nouvelle offre tous les ~4 ans." },
      { t: "fill", q: "Emprunter en yen à taux bas pour placer ailleurs s'appelle le ___.", o: ["carry trade", "scalping", "staking"], a: 0, e: "Son débouclage a secoué les marchés le 5 août 2024." },
      { t: "mcq", q: "En avril 2025, quel événement a provoqué une chute brutale des marchés ?", o: ["L'annonce de droits de douane massifs aux USA", "Le halving", "Une fusion de banques"], a: 0, e: "Puis une pause de 90 jours a déclenché un rebond historique." },
      { t: "tf", q: "Le NFP (emplois US) est publié en général le premier vendredi du mois.", a: true, e: "Volatilité garantie ce jour-là." },
      { t: "mcq", q: "Le règlement européen qui encadre les crypto-actifs s'appelle…", o: ["MiCA", "MiFID Crypto", "Bâle IV"], a: 0, e: "Pleinement applicable depuis fin 2024." }
    ]
  },
  {
    id: "u10", e: "🇲🇱", t: "Afrique de l'Ouest & BRVM", sub: "UEMOA, FCFA, SGI, mobile money", gen: ["fcfa"],
    q: [
      { t: "mcq", q: "Combien de pays partagent la BRVM ?", o: ["5", "8", "15"], a: 1, e: "Les 8 pays de l'UEMOA, dont le Mali." },
      { t: "mcq", q: "Pour acheter une action à la BRVM, il faut passer par…", o: ["Une SGI agréée", "Un agent mobile money", "La BCEAO"], a: 0, e: "La SGI est le courtier agréé par l'AMF-UMOA." },
      { t: "num", q: "1 € = combien de FCFA ? (parité fixe, arrondie à l'unité)", a: 656, tol: 1, u: "FCFA", e: "1 € = 655,957 FCFA." },
      { t: "tf", q: "Le FCFA flotte librement face à l'euro.", a: false, e: "Il est arrimé à l'euro par une parité fixe." },
      { t: "mcq", q: "Quelle institution fixe les taux directeurs de l'UEMOA ?", o: ["La BCEAO", "La BRVM", "Le FMI"], a: 0, e: "Banque centrale des États de l'Afrique de l'Ouest." },
      { t: "mcq", q: "Quelqu'un te propose sur WhatsApp de doubler tes 50 000 FCFA envoyés par Orange Money en 7 jours. C'est…", o: ["Une arnaque", "Un placement BRVM", "Une obligation d'État"], a: 0, e: "Rendement irréaliste + paiement à un particulier = arnaque." },
      { t: "fill", q: "Le gendarme des marchés financiers de l'UMOA s'appelle l'___.", o: ["AMF-UMOA", "AMF France", "SEC"], a: 0, e: "Anciennement CREPMF." },
      { t: "tf", q: "Si tu achètes du Bitcoin depuis le Mali, tu es aussi exposé au cours du dollar.", a: true, e: "Le BTC est coté en dollars : le change FCFA/USD s'ajoute au risque." }
    ]
  },
  {
    id: "u11", e: "🔐", t: "Sécurité & passage en réel", sub: "Brokers, arnaques, crypto", gen: [],
    q: [
      { t: "mcq", q: "Premier critère pour choisir un courtier ?", o: ["Sa régulation", "Son levier max", "Ses pubs"], a: 0, e: "Sans régulation, ton argent n'est pas protégé." },
      { t: "tf", q: "Un support officiel peut te demander ta seed phrase.", a: false, e: "Jamais. Quiconque la demande veut te voler." },
      { t: "mcq", q: "La double authentification la plus sûre passe par…", o: ["Une application d'authentification", "Un SMS", "Un e-mail"], a: 0, e: "Les SMS peuvent être détournés (SIM swap)." },
      { t: "fill", q: "Une plateforme qui ne demande aucun ___ est un drapeau rouge.", o: ["KYC", "tweet", "dividende"], a: 0, e: "Les acteurs régulés vérifient l'identité." },
      { t: "mcq", q: "Combien miser lors de ton premier trade réel ?", o: ["Une somme que tu peux perdre sans conséquence", "Toute ton épargne", "L'argent du loyer"], a: 0, e: "Le but est de tester ta discipline, pas de devenir riche." },
      { t: "tf", q: "Dans un schéma de Ponzi, les premiers gains viennent des dépôts des nouveaux.", a: true, e: "Jusqu'à l'effondrement." },
      { t: "mcq", q: "Avant de déposer, teste…", o: ["Un petit retrait", "Le levier ×100", "Un memecoin"], a: 0, e: "Pouvoir retirer facilement est essentiel." },
      { t: "mcq", q: "Ce qu'il faut constituer AVANT de trader ?", o: ["Une épargne de précaution", "Un compte prop firm", "Une collection de NFT"], a: 0, e: "Pour ne jamais trader sous la pression d'un imprévu." }
    ]
  }
];

M.QUIZ_COUNT = M.QUIZ_UNITS.reduce((s, u) => s + u.q.length, 0);
