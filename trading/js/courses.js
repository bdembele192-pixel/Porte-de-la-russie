/* Académie : modules de cours.
   Dans le texte, [[clé]] ou [[clé|texte]] devient un terme avec infobulle (voir glossary.js).
   "try" pointe vers une section de l'app pour mettre en pratique. */
window.M = window.M || {};

M.COURSES = [
  {
    id: "bases",
    emoji: "🧭",
    title: "Le marché, comment ça marche",
    sub: "Qui achète, qui vend, et pourquoi le prix bouge.",
    level: "Débutant",
    mins: 8,
    lessons: [
      {
        h: "Un marché = des enchères permanentes",
        body: `<p>Un marché, ce n'est pas un magasin avec un prix affiché. C'est une <b>enchère qui ne s'arrête jamais</b> : des acheteurs annoncent ce qu'ils sont prêts à payer, des vendeurs ce qu'ils acceptent de recevoir. Tout ça est rangé dans le [[carnet|carnet d'ordres]].</p>
<p>Le meilleur prix acheteur s'appelle le [[bid]], le meilleur prix vendeur l'[[ask]]. L'écart entre les deux, c'est le [[spread]] — un coût que tu paies à chaque trade sans le voir.</p>
<p>Le prix bouge quand un camp est plus pressé que l'autre. Beaucoup d'acheteurs qui « prennent » l'ask ? Le prix monte. C'est tout. Pas de magie, juste de l'offre et de la demande en temps réel.</p>`
      },
      {
        h: "Les types d'ordres à connaître",
        body: `<ul>
<li><b>[[ordre-marche|Ordre au marché]]</b> : exécution immédiate, prix non garanti. À utiliser sur les actifs très [[liquidite|liquides]].</li>
<li><b>[[ordre-limite|Ordre limite]]</b> : tu fixes ton prix. Idéal pour entrer calmement, sans courir après le prix.</li>
<li><b>[[stop-loss|Stop-loss]]</b> : ta sortie de secours si tu as tort. Non négociable.</li>
<li><b>[[take-profit|Take-profit]]</b> : encaisse automatiquement à ton objectif.</li>
<li><b>[[trailing-stop|Stop suiveur]]</b> : laisse courir les gains en protégeant ce qui est acquis.</li>
</ul>
<p>Attention : un stop-loss devient un ordre au marché quand il est touché. Si le marché fait un [[gap]], il peut être exécuté bien plus loin (c'est le [[slippage]]).</p>`
      },
      {
        h: "Long, short, et le PnL",
        body: `<p>Être [[long]], c'est parier sur la hausse. Être [[short]], c'est parier sur la baisse : tu vends d'abord, tu rachètes plus tard (plus bas, si tout va bien).</p>
<p>Ton [[pnl|PnL]] est « latent » tant que la position est ouverte : il ne compte pas tant que tu n'as pas fermé. Beaucoup de débutants regardent un PnL latent vert s'évaporer parce qu'ils n'avaient pas de plan de sortie.</p>
<p>Et la valeur réelle de ton compte à l'instant T, c'est ton [[equity]] = cash + positions ouvertes.</p>`
      },
      {
        h: "Les bougies : la langue du marché",
        body: `<p>Chaque [[chandelier|bougie]] résume une période (le [[timeframe]]) avec 4 prix : ouverture, plus haut, plus bas, clôture. Le corps = de l'ouverture à la clôture. Les [[meche|mèches]] = les extrêmes atteints.</p>
<p>Une longue mèche basse ? Les vendeurs ont poussé fort, mais les acheteurs ont tout racheté. Une grosse bougie verte avec beaucoup de [[volume]] ? Les acheteurs ont pris le contrôle.</p>
<p>👉 Va dans <b>Live</b> et survole les bougies : tu verras leurs 4 prix s'afficher.</p>`
      }
    ],
    key: ["Le prix = la rencontre permanente entre acheteurs et vendeurs", "Le spread et les frais sont des coûts invisibles mais réels", "Toujours un stop-loss, même en paper trading", "Une bougie = 4 prix : open, high, low, close"],
    quiz: [
      { q: "Tu achètes au marché. Quel prix paies-tu ?", o: ["Le bid", "L'ask", "La moyenne des deux"], a: 1, why: "Un achat au marché « prend » l'offre du vendeur le moins cher : l'ask." },
      { q: "Ton stop est à 100 €. Le marché ouvre directement à 92 €. Tu sors à…", o: ["100 €, c'est garanti", "Autour de 92 €", "Tu ne sors pas"], a: 1, why: "Un stop devient un ordre au marché : en cas de gap, il est exécuté au premier prix disponible." },
      { q: "Une bougie avec une très longue mèche basse et un petit corps en haut signifie plutôt…", o: ["Les vendeurs ont gagné la séance", "Les acheteurs ont rejeté la baisse", "Rien, c'est du bruit"], a: 1, why: "Le prix est descendu loin mais a été racheté : rejet de la baisse (à confirmer par la bougie suivante)." }
    ],
    try: "live"
  },

  {
    id: "instruments",
    emoji: "🧰",
    title: "Les instruments",
    sub: "Actions, ETF, forex, crypto, futures, options, CFD… ce que tu trades vraiment.",
    level: "Débutant",
    mins: 12,
    lessons: [
      {
        h: "Actions & ETF : posséder un bout du monde",
        body: `<p>Une [[action]], c'est une part d'entreprise. Tu gagnes si elle prend de la valeur et via les [[dividende|dividendes]]. Pour juger si elle est chère, on regarde la [[capitalisation]] et le [[per|PER]].</p>
<p>Un [[etf|ETF]] réplique un [[indice]] entier (S&P 500, MSCI World, Nasdaq 100…) : tu achètes 500 entreprises en un clic, avec des frais minuscules. C'est le produit qui a explosé chez les jeunes investisseurs européens depuis 2020 — et pour de bonnes raisons.</p>
<p>⚡ <b>À retenir</b> : sur le long terme, la majorité des gérants professionnels font moins bien qu'un simple ETF indiciel.</p>`
      },
      {
        h: "Obligations : prêter au lieu de posséder",
        body: `<p>Une [[obligation]], c'est un prêt. L'État ou l'entreprise te verse un coupon fixe, puis te rembourse à l'échéance.</p>
<p>La règle d'or : <b>quand les [[taux-directeur|taux]] montent, le prix des obligations existantes baisse</b> (personne ne veut d'un vieux coupon à 1 % quand le neuf paie 4 %). C'est exactement ce qui s'est passé en 2022 : pire année de l'histoire moderne pour les obligations.</p>`
      },
      {
        h: "Forex & matières premières",
        body: `<p>Le [[forex]] est le plus gros marché du monde, ouvert 24h/24 en semaine. On trade des paires : EUR/USD = combien de dollars vaut 1 euro. Les mouvements sont petits (mesurés en [[pip|pips]]), donc on y utilise souvent du levier.</p>
<p>Les [[matieres-premieres|matières premières]] (or, pétrole, gaz, blé) réagissent à la géopolitique et au dollar. L'or reste la valeur refuge historique : il a enchaîné les records en 2024-2025, porté notamment par les achats massifs des banques centrales.</p>
<p>Dans l'app, tu peux trader l'or via <b>PAXG</b> (un token adossé à de l'or physique) et l'euro via <b>EUR/USDT</b>.</p>`
      },
      {
        h: "Crypto : le marché qui ne dort jamais",
        body: `<p>Les [[crypto|cryptos]] se tradent 24/7, avec une volatilité 3 à 5 fois supérieure aux actions. Bitcoin a sa propre « politique monétaire » codée : le [[halving]] réduit la nouvelle offre tous les ~4 ans.</p>
<p>Depuis janvier 2024, des ETF Bitcoin spot sont autorisés aux États-Unis : Wall Street est entrée dans la crypto. En Europe, le règlement [[mica|MiCA]] encadre désormais les plateformes. Les [[stablecoin|stablecoins]] (USDT, USDC) servent de dollar numérique.</p>
<p>⚠️ Côté obscur : [[pump-dump|pump & dumps]], [[rug|rug pulls]], memecoins créés en 30 secondes. Si un token n'a ni utilité ni [[liquidite|liquidité]], tu n'investis pas, tu joues au casino.</p>`
      },
      {
        h: "Les dérivés : futures, perps, options, CFD",
        body: `<p>Un dérivé est un <b>contrat dont la valeur dépend d'un autre actif</b>. Tu ne possèdes rien, tu paries sur un prix.</p>
<ul>
<li><b>[[futures|Futures]]</b> : achat/vente à terme, avec [[marge]] et [[levier]].</li>
<li><b>[[perpetuel|Perpétuels]]</b> : futures crypto sans échéance, maintenus près du spot par le [[funding|funding rate]]. C'est là que se produisent les cascades de [[liquidation|liquidations]].</li>
<li><b>[[option|Options]]</b> : le droit d'acheter ([[call]]) ou de vendre ([[put]]). Perte limitée à la prime pour l'acheteur. Les [[0dte|0DTE]] (expiration le jour même) représentent désormais une part énorme des volumes d'options sur le S&P 500.</li>
<li><b>[[cfd|CFD]]</b> : très vendus aux particuliers via des pubs agressives. Les brokers européens doivent afficher le % de clients perdants : souvent 70 à 80 %.</li>
</ul>`
      }
    ],
    key: ["ETF indiciel = la base la plus solide pour investir", "Taux ↑ = obligations ↓", "Crypto = 24/7, très volatil, vérifie la régulation de la plateforme", "Dérivés = levier = risque démultiplié"],
    quiz: [
      { q: "La BCE monte ses taux de 1 point. Ton obligation existante à coupon fixe…", o: ["Prend de la valeur", "Perd de la valeur", "Ne bouge pas"], a: 1, why: "Les nouvelles obligations paient plus, la tienne devient moins attractive : son prix baisse." },
      { q: "Quel instrument te donne le DROIT mais pas l'obligation d'acheter ?", o: ["Un future", "Un call", "Un CFD"], a: 1, why: "Le call est une option d'achat : tu paies une prime pour avoir le choix." },
      { q: "Funding rate très positif sur les perpétuels BTC. Ça veut dire…", o: ["Beaucoup de traders sont long, marché surchauffé", "Le marché est en panique", "Le BTC est bon marché"], a: 0, why: "Les longs paient les shorts : le camp acheteur est surchargé, souvent signe d'euphorie." },
      { q: "Pourquoi les ETF indiciels sont-ils si populaires ?", o: ["Ils garantissent un gain", "Diversification et frais très bas", "Ils utilisent du levier"], a: 1, why: "Un seul achat = des centaines d'entreprises, pour des frais souvent < 0,3 % par an. Aucune garantie de gain cependant." }
    ],
    try: "live"
  },

  {
    id: "styles",
    emoji: "⏱️",
    title: "Les façons de trader",
    sub: "Scalping, day trading, swing, position, DCA, algo : trouve ton style.",
    level: "Débutant",
    mins: 7,
    lessons: [
      {
        h: "Le temps est ta première décision",
        body: `<p>Avant de choisir une stratégie, choisis ton <b>horizon</b>. Il dépend de ton emploi du temps, de ton caractère et de ton capital.</p>
<div class="styletable">
<div><b>⚡ [[scalping|Scalping]]</b><span>Secondes → minutes · 20-200 trades/jour</span><em>Exige une attention totale et des frais quasi nuls. 99 % des particuliers y perdent face aux algos [[hft|HFT]].</em></div>
<div><b>☀️ [[day-trading|Day trading]]</b><span>Minutes → heures · 1-10 trades/jour</span><em>Pas de risque la nuit, mais c'est un job à plein temps. Taux d'échec très élevé dans les études académiques.</em></div>
<div><b>🌊 [[swing|Swing trading]]</b><span>Jours → semaines · quelques trades/mois</span><em>Le meilleur compromis pour étudiants et salariés : on analyse le soir, on pose ses ordres, on vit sa vie.</em></div>
<div><b>🏔️ [[position-trading|Position trading]]</b><span>Mois → années</span><em>Basé sur la macro et les grandes tendances. Peu de trades, beaucoup de patience.</em></div>
<div><b>🐢 [[dca|DCA / investissement]]</b><span>Années · automatique</span><em>Le même montant chaque mois dans un ETF. Ennuyeux. Et pourtant c'est ce qui enrichit le plus de monde.</em></div>
<div><b>🤖 Algorithmique</b><span>Toutes durées</span><em>Des règles codées, testées, exécutées sans émotion. Voir le module « Les 4 algos ».</em></div>
</div>`
      },
      {
        h: "Analyse technique vs fondamentale",
        body: `<p><b>Technique</b> : on lit le graphique ([[tendance|tendances]], [[support|supports]], indicateurs). Hypothèse : le prix intègre déjà toute l'information, et les comportements humains se répètent.</p>
<p><b>Fondamentale</b> : on évalue la valeur réelle (bénéfices, [[per|PER]], croissance, [[taux-directeur|taux]]). Hypothèse : le prix finit par rejoindre la valeur.</p>
<p><b>Quantitative</b> : on cherche des régularités statistiques et on les teste ([[backtest|backtests]]).</p>
<p>Les pros combinent : la fondamentale dit <i>quoi</i> acheter, la technique dit <i>quand</i>, le risk management dit <i>combien</i>.</p>`
      },
      {
        h: "Le bon style pour toi",
        body: `<ul>
<li>Tu as cours/boulot toute la journée → <b>swing</b> ou <b>DCA</b>.</li>
<li>Tu stresses en regardant un PnL → horizons longs, petites tailles.</li>
<li>Tu aimes coder → <b>algo</b>, mais commence par backtester dans l'Algo Lab.</li>
<li>Tu as moins de 1 000 € → les frais et le spread vont manger le scalping. Swing ou investissement.</li>
</ul>
<p>Aucun style n'est « le meilleur ». Le meilleur est celui que tu peux appliquer <b>avec discipline</b> pendant des années.</p>`
      }
    ],
    key: ["Choisis d'abord ton horizon de temps", "Plus le timeframe est court, plus les frais et le bruit pèsent", "Swing et DCA sont les plus compatibles avec une vie normale"],
    quiz: [
      { q: "Étudiant, 2h libres le soir, 500 € de capital. Le style le plus adapté ?", o: ["Scalping", "Swing trading ou DCA", "Day trading avec levier ×20"], a: 1, why: "Le swing s'analyse le soir et les frais pèsent peu ; le DCA est automatique." },
      { q: "Pourquoi le scalping est-il si dur pour un particulier ?", o: ["C'est interdit", "Frais, spread et concurrence des algos HFT", "Il n'y a pas assez de volatilité"], a: 1, why: "Sur des gains de quelques pips, les coûts fixes et la vitesse des pros font la différence." }
    ],
    try: "swipe"
  },

  {
    id: "technique",
    emoji: "📈",
    title: "Lire un graphique",
    sub: "Tendances, supports, résistances, cassures et pièges.",
    level: "Intermédiaire",
    mins: 10,
    lessons: [
      {
        h: "La tendance avant tout",
        body: `<p>Une [[tendance]] haussière = une succession de plus hauts et de plus bas <b>de plus en plus hauts</b>. Tant que cette structure tient, la tendance est vivante.</p>
<p>Règle n°1 : trader dans le sens de la tendance du timeframe supérieur. Tu veux acheter sur le graphique 1h ? Vérifie que le 4h et le daily ne sont pas en chute libre.</p>`
      },
      {
        h: "Supports & résistances",
        body: `<p>Un [[support]] est une zone où les acheteurs sont déjà intervenus. Une [[resistance|résistance]], là où les vendeurs ont bloqué. Ce sont des <b>zones</b>, pas des lignes au centime près.</p>
<p>Plus une zone a été testée, plus sa cassure est significative. Et une résistance cassée devient souvent un support (on parle de « flip »).</p>
<p>Les chiffres ronds (100 000 $ pour le BTC, 2 000 $ pour l'ETH) agissent souvent comme des aimants psychologiques.</p>`
      },
      {
        h: "Breakouts… et faux breakouts",
        body: `<p>Un [[breakout]] est la sortie d'une zone avec force et [[volume]]. Mais beaucoup de cassures échouent : c'est le [[faux-breakout|faux breakout]], qui piège les acheteurs trop pressés.</p>
<p>Filtres utiles : attendre la <b>clôture</b> de la bougie au-delà du niveau, exiger un volume supérieur à la moyenne, ou attendre le retest. Et toujours un stop sous le niveau cassé.</p>`
      },
      {
        h: "Figures de bougies utiles",
        body: `<ul>
<li><b>Marteau</b> : petite tête, longue [[meche|mèche]] basse, après une baisse. Rejet des vendeurs.</li>
<li><b>Avalement haussier</b> : une bougie verte englobe entièrement la rouge précédente.</li>
<li><b>Étoile du soir</b> : grande verte, petite indécise, grande rouge. Retournement possible.</li>
<li><b>Doji</b> : ouverture ≈ clôture. Indécision.</li>
</ul>
<p>Une figure seule ne vaut presque rien. Elle compte quand elle apparaît <b>sur un niveau clé</b>, dans un contexte cohérent, et qu'elle est confirmée par la bougie suivante.</p>`
      }
    ],
    key: ["Structure de plus hauts/plus bas = la tendance", "Supports/résistances = des zones, pas des lignes", "Une cassure se confirme à la clôture et avec du volume", "Pas de figure sans contexte"],
    quiz: [
      { q: "Le prix casse une résistance puis revient dessous à la clôture. C'est…", o: ["Un breakout validé", "Un faux breakout", "Un gap"], a: 1, why: "La cassure n'a pas tenu à la clôture : c'est un faux breakout classique." },
      { q: "Une résistance cassée avec force devient souvent…", o: ["Un support", "Une résistance plus forte", "Inutile"], a: 0, why: "C'est le principe du « flip » : les anciens vendeurs deviennent des acheteurs au retest." }
    ],
    try: "missions"
  },

  {
    id: "indicateurs",
    emoji: "🎛️",
    title: "Les indicateurs qui comptent",
    sub: "SMA/EMA, RSI, MACD, Bollinger, ATR, VWAP : à quoi ils servent vraiment.",
    level: "Intermédiaire",
    mins: 10,
    lessons: [
      {
        h: "Moyennes mobiles",
        body: `<p>La [[sma|SMA]] fait la moyenne des N dernières clôtures. L'[[ema|EMA]] réagit plus vite. Les classiques : 20 (court terme), 50 (moyen), 200 (la frontière bull/bear sur le daily).</p>
<p>Usage : filtre de tendance (prix au-dessus de la MM 200 = on ne cherche que des achats) et signal (croisement de deux moyennes = base de l'algo « Trend Following »).</p>`
      },
      {
        h: "RSI & MACD : le momentum",
        body: `<p>Le [[rsi|RSI]] oscille entre 0 et 100. Au-dessus de 70 = suracheté, sous 30 = survendu. Erreur de débutant : shorter dès que le RSI dépasse 70. En tendance forte, il peut y rester des semaines.</p>
<p>Le [[macd|MACD]] mesure l'accélération. Croisement au-dessus de sa ligne de signal = momentum haussier qui accélère.</p>
<p>Le signal le plus intéressant des deux : la [[divergence]]. Nouveau plus haut sur le prix, mais pas sur le RSI → le moteur s'essouffle.</p>`
      },
      {
        h: "Volatilité : Bollinger & ATR",
        body: `<p>Les [[bollinger|bandes de Bollinger]] s'écartent quand la volatilité monte. Quand elles se resserrent fortement (« squeeze »), un gros mouvement se prépare souvent — sans dire dans quel sens.</p>
<p>L'[[atr|ATR]] est l'outil le plus sous-estimé : il te dit de combien le prix bouge « normalement ». Un stop à 1,5–2 ATR évite de te faire sortir par le simple bruit.</p>`
      },
      {
        h: "VWAP & volume : l'œil des institutionnels",
        body: `<p>Le [[vwap|VWAP]] est le prix moyen pondéré par les volumes. Les fonds l'utilisent pour juger leur exécution : acheter sous le VWAP = « bien acheté ». En intraday, il agit souvent comme un aimant ou un support dynamique.</p>
<p>Le [[volume]] valide tout le reste : une cassure sans volume est suspecte.</p>
<p>⚠️ Plus tu empiles d'indicateurs, moins tu vois le prix. 2-3 indicateurs complémentaires (tendance + momentum + volatilité) suffisent.</p>`
      }
    ],
    key: ["MM 200 = filtre de tendance de fond", "RSI > 70 ne veut pas dire « vendre »", "ATR = la bonne distance pour un stop", "2-3 indicateurs max, complémentaires"],
    quiz: [
      { q: "RSI à 78 en pleine tendance haussière forte. Le plus raisonnable ?", o: ["Shorter immédiatement", "Ne pas shorter juste pour ça", "Acheter avec levier ×10"], a: 1, why: "En tendance forte, le RSI peut rester suracheté longtemps : ce n'est pas un signal de vente seul." },
      { q: "À quoi sert principalement l'ATR ?", o: ["Prédire la direction", "Mesurer la volatilité pour placer les stops", "Mesurer le volume"], a: 1, why: "L'ATR mesure l'amplitude moyenne : idéal pour dimensionner stop et position." },
      { q: "Les bandes de Bollinger se resserrent fortement. Ça annonce…", o: ["Une hausse certaine", "Un mouvement fort probable, direction inconnue", "Un marché mort pour toujours"], a: 1, why: "Le squeeze annonce une expansion de volatilité, pas sa direction." }
    ],
    try: "live"
  },

  {
    id: "strategies",
    emoji: "♟️",
    title: "Stratégies de trading",
    sub: "Suivi de tendance, pullback, range, breakout, news : des plans complets.",
    level: "Intermédiaire",
    mins: 12,
    lessons: [
      {
        h: "Une stratégie = 4 réponses",
        body: `<p>Si tu ne peux pas répondre aux 4 questions suivantes AVANT d'entrer, tu n'as pas de stratégie, tu as une intuition :</p>
<ol><li><b>Quand j'entre ?</b> (signal précis)</li><li><b>Où je sors si j'ai tort ?</b> ([[stop-loss]])</li><li><b>Où je sors si j'ai raison ?</b> ([[take-profit]] ou [[trailing-stop|stop suiveur]])</li><li><b>Combien je mise ?</b> ([[sizing|position sizing]])</li></ol>`
      },
      {
        h: "1. Pullback dans la tendance",
        body: `<p><b>Idée</b> : dans une tendance haussière, attendre une respiration vers la [[ema|EMA]] 20 ou un ancien niveau, puis acheter la reprise.</p>
<p><b>Entrée</b> : bougie de reprise (marteau, avalement) sur l'EMA 20, prix au-dessus de l'EMA 50.<br><b>Stop</b> : sous le dernier plus bas.<br><b>Objectif</b> : ancien plus haut, ou [[rr|R:R]] de 1:2 minimum.</p>
<p>C'est la stratégie la plus « propre » pour débuter : tu suis le courant au lieu de nager contre.</p>`
      },
      {
        h: "2. Range trading",
        body: `<p><b>Idée</b> : en [[range]], acheter le bas, vendre le haut. C'est du [[mean-reversion|retour à la moyenne]].</p>
<p><b>Entrée</b> : rejet du support (mèche basse, [[rsi|RSI]] < 35).<br><b>Stop</b> : juste sous le range.<br><b>Objectif</b> : milieu ou haut du range.</p>
<p>Danger : le jour où le range casse, cette stratégie prend une perte. D'où le stop obligatoire.</p>`
      },
      {
        h: "3. Breakout avec confirmation",
        body: `<p><b>Idée</b> : entrer quand le prix sort d'une consolidation, car les mouvements qui suivent une compression sont souvent puissants.</p>
<p><b>Entrée</b> : clôture au-dessus de la résistance + volume > moyenne. Option prudente : attendre le retest.<br><b>Stop</b> : sous le niveau cassé.<br><b>Objectif</b> : hauteur du range projetée, ou stop suiveur.</p>
<p>Taux de réussite souvent faible (35-45 %), mais les gagnants sont gros. C'est l'esprit du [[donchian|canal de Donchian]].</p>`
      },
      {
        h: "4. News trading (à manier avec prudence)",
        body: `<p>Les annonces [[cpi|CPI]], [[nfp|NFP]], décisions de la [[fed|Fed]]/[[bce|BCE]], [[earnings|résultats]] créent des mouvements violents. Le spread s'élargit, le [[slippage]] explose.</p>
<p>L'approche la plus saine : <b>ne pas avoir de position ouverte</b> juste avant l'annonce, puis trader la structure qui se forme ensuite. « Buy the rumor, sell the news » : un événement très attendu provoque souvent l'inverse de ce que tout le monde prévoit (cf. mission « ETF Bitcoin »).</p>`
      }
    ],
    key: ["Entrée, stop, objectif, taille : décidés AVANT d'entrer", "Pullback = la stratégie la plus simple pour débuter", "Range ≠ tendance : ne pas utiliser les mêmes outils", "Les news : souvent mieux vaut regarder que participer"],
    quiz: [
      { q: "Il te manque une réponse pour trader. Laquelle est la plus grave ?", o: ["L'objectif de gain", "Le stop-loss", "Le nom de la stratégie"], a: 1, why: "Sans stop, une seule erreur peut détruire des mois de gains." },
      { q: "Une stratégie breakout gagne 38 % du temps avec un R:R moyen de 1:3. Elle est…", o: ["Perdante", "Gagnante", "Impossible à savoir"], a: 1, why: "0,38 × 3 − 0,62 × 1 = +0,52 R par trade en moyenne : gagnante (hors frais)." }
    ],
    try: "missions"
  },

  {
    id: "algos",
    emoji: "🤖",
    title: "Trading algo : les 4 algos qui ont fait leurs preuves",
    sub: "Trend following, breakout, mean reversion, pairs trading — et comment les tester.",
    level: "Avancé",
    mins: 15,
    lessons: [
      {
        h: "Pourquoi l'algo ?",
        body: `<p>Un algorithme applique des règles <b>sans émotion</b>, 24/7, et peut être testé sur des années de données en quelques secondes ([[backtest]]). Aujourd'hui, la majorité des volumes sur les grands marchés actions sont générés par des algorithmes.</p>
<p>Mais attention : il n'existe <b>aucun algo qui gagne dans tous les marchés</b>. Chaque stratégie a son « régime » : les algos de tendance adorent les marchés directionnels et souffrent en range, et inversement pour le [[mean-reversion|mean reversion]]. Les 4 ci-dessous sont parmi les plus étudiés et utilisés par les pros.</p>`
      },
      {
        h: "Algo 1 — Trend Following (croisement d'EMA + stop ATR)",
        body: `<p><b>Logique</b> : le [[momentum]] de série temporelle — ce qui monte a tendance à continuer. C'est la base des fonds « CTA / managed futures », qui l'appliquent depuis les années 80.</p>
<pre>SI EMA(rapide) croise AU-DESSUS EMA(lente) → ACHAT
SI EMA(rapide) croise EN DESSOUS          → SORTIE
Stop suiveur = plus haut depuis l'entrée − 3 × ATR</pre>
<p><b>Profil</b> : 30-40 % de trades gagnants, mais des gains énormes quand une tendance s'installe. Souffre dans les marchés hachés.</p>`
      },
      {
        h: "Algo 2 — Breakout Donchian (la méthode des Turtles)",
        body: `<p>En 1983, Richard Dennis apprend à des débutants (« les Turtles ») un système simple basé sur le [[donchian|canal de Donchian]]. Plusieurs deviennent millionnaires. Les règles ont depuis été publiées.</p>
<pre>SI clôture > plus haut des 20 dernières bougies → ACHAT
SI clôture < plus bas des 10 dernières bougies  → SORTIE</pre>
<p><b>Profil</b> : peu de trades, longues périodes de petites pertes, puis un gros gain qui paie tout. Exige une discipline de fer.</p>`
      },
      {
        h: "Algo 3 — Mean Reversion (Bollinger + RSI)",
        body: `<p><b>Logique</b> : à court terme, les excès ont tendance à se corriger. On achète la panique, on revend le retour au calme.</p>
<pre>SI clôture < bande basse de Bollinger ET RSI(14) < 30 → ACHAT
SI clôture > moyenne centrale (SMA 20)              → SORTIE
Stop = entrée − 2 × ATR</pre>
<p><b>Profil</b> : 60-70 % de trades gagnants, petits gains réguliers… et parfois une grosse perte quand le marché part en tendance (attraper un couteau qui tombe). Le stop est vital.</p>`
      },
      {
        h: "Algo 4 — Pairs Trading (arbitrage statistique)",
        body: `<p><b>Logique</b> : deux actifs liés (Coca/Pepsi, ETH/BTC) évoluent ensemble. Quand leur écart devient anormal, on parie qu'il se referme. C'est une stratégie « market neutral » : on peut gagner que le marché monte ou baisse.</p>
<pre>ratio = log(ETH) − log(BTC)
z = (ratio − moyenne(N)) / écart-type(N)
SI z > +2 → vendre ETH / acheter BTC
SI z < −2 → acheter ETH / vendre BTC
SI |z| < 0,5 → tout fermer</pre>
<p>Le [[z-score]] mesure l'anomalie. Risque principal : la relation se casse définitivement (le ratio part en tendance).</p>`
      },
      {
        h: "Les pièges du backtest",
        body: `<ul>
<li><b>[[overfitting|Overfitting]]</b> : tester 500 réglages et garder le meilleur = tu as trouvé le passé, pas le futur. Teste sur une période, valide sur une autre.</li>
<li><b>[[look-ahead|Biais d'anticipation]]</b> : utiliser la clôture d'une bougie pour entrer… à l'ouverture de cette même bougie.</li>
<li><b>Frais & slippage oubliés</b> : une stratégie à 300 trades/an avec 0,1 % de frais paie 60 % de frais aller-retour. L'Algo Lab les inclut.</li>
<li><b>Biais du survivant</b> : tester sur les cryptos qui existent encore aujourd'hui oublie toutes celles qui sont mortes.</li>
</ul>
<p>Mesure la qualité avec le [[sharpe|Sharpe]], le [[drawdown]], le [[profit-factor|profit factor]], pas seulement le rendement. Et compare toujours au simple « acheter et garder ».</p>
<p>🧪 Direction <b>Algo Lab</b> : teste ces 4 algos sur de vraies données de marché.</p>`
      },
      {
        h: "Les algos des pros que tu ne verras pas",
        body: `<p>Pour ta culture : les [[market-maker|market makers]] et le [[hft|HFT]] gagnent des fractions de centimes des millions de fois par jour, grâce à la vitesse. Les algos d'exécution ([[twap|TWAP/VWAP]]) découpent les gros ordres des fonds. Les fonds quant utilisent du machine learning sur des données alternatives (images satellites, transactions bancaires…).</p>
<p>Et les « bots IA qui garantissent 2 % par jour » vendus sur Telegram ou TikTok ? <b>Arnaque à 100 %</b>. Si un algo rapportait vraiment ça, personne ne te le vendrait 99 €.</p>`
      }
    ],
    key: ["Aucun algo ne marche dans tous les régimes de marché", "Trend & breakout : peu de gagnants, gros gains", "Mean reversion : beaucoup de gagnants, risque de grosse perte", "Toujours compter frais, slippage et comparer au buy & hold"],
    quiz: [
      { q: "Ton algo de mean reversion a 68 % de trades gagnants mais perd de l'argent. Pourquoi c'est possible ?", o: ["C'est impossible", "Les pertes sont bien plus grosses que les gains", "Le RSI est cassé"], a: 1, why: "Le taux de réussite ne suffit pas : quelques grosses pertes peuvent effacer beaucoup de petits gains." },
      { q: "Tu testes 1 000 combinaisons de paramètres et gardes la meilleure. Le risque ?", o: ["L'overfitting", "Le slippage", "Le funding"], a: 0, why: "Tu as optimisé sur le bruit du passé : les performances futures seront très inférieures." },
      { q: "Quel algo peut gagner que le marché monte ou baisse ?", o: ["Trend following long-only", "Pairs trading", "DCA"], a: 1, why: "Le pairs trading est « market neutral » : il parie sur l'écart entre deux actifs, pas sur la direction." },
      { q: "Un bot Telegram promet +2 %/jour garanti pour 99 €. Tu…", o: ["Achètes, c'est donné", "Fuis : c'est une arnaque", "Testes avec 1 000 €"], a: 1, why: "+2 %/jour = +137 000 % par an. Aucune stratégie réelle ne fait ça, et personne ne la vendrait." }
    ],
    try: "lab"
  },

  {
    id: "risque",
    emoji: "🛡️",
    title: "Gestion du risque",
    sub: "Le seul vrai secret des traders qui durent.",
    level: "Essentiel",
    mins: 9,
    lessons: [
      {
        h: "Les maths de la ruine",
        body: `<p>Perdre 10 % demande +11 % pour revenir. Perdre 50 % demande <b>+100 %</b>. Perdre 90 % demande +900 %. Le [[drawdown]] est asymétrique : protéger le capital passe avant tout.</p>
<p>C'est pour ça que la [[regle-1pc|règle des 1 %]] existe : en risquant 1 % par trade, même 10 pertes d'affilée ne te coûtent qu'environ 10 %.</p>`
      },
      {
        h: "Calculer sa taille de position",
        body: `<p>La taille ne se choisit pas « au feeling ». Elle se <b>calcule</b> à partir du stop :</p>
<pre>Taille = (Capital × Risque %) ÷ Distance au stop

Ex : 10 000 $ × 1 % = 100 $ de risque
Achat BTC à 100 000 $, stop à 98 000 $ (−2 000 $)
Taille = 100 ÷ 2 000 = 0,05 BTC (5 000 $ de position)</pre>
<p>Dans le ticket d'ordre de l'app, le montant risqué jusqu'au stop est affiché en temps réel : utilise-le.</p>`
      },
      {
        h: "Le levier n'est pas ton ami",
        body: `<p>Le [[levier]] ne change pas ta probabilité d'avoir raison. Il change seulement <b>la vitesse à laquelle tu perds quand tu as tort</b>.</p>
<p>Avec ×10, une baisse d'environ 10 % = [[liquidation]]. Le Bitcoin fait régulièrement des mouvements de 10 % en quelques heures. Lors des grands krachs crypto, des milliards de dollars de positions à levier sont liquidés en une seule journée.</p>
<p>Si tu utilises du levier, calcule-le comme une <b>conséquence</b> de ton sizing, jamais comme un objectif.</p>`
      },
      {
        h: "Espérance & journal",
        body: `<p>L'espérance de ta stratégie = (taux de gain × gain moyen) − (taux de perte × perte moyenne). Si elle est positive et que tu survis assez longtemps, les maths jouent pour toi.</p>
<p>Tiens un journal : pourquoi tu es entré, émotion du moment, respect du plan. Après 30 trades, tu verras tes vrais défauts. Le <b>Coach</b> de l'app fait une partie de ce travail pour toi après chaque session.</p>`
      }
    ],
    key: ["Risque par trade : 1-2 % max", "La taille se calcule à partir du stop", "−50 % demande +100 %", "Le levier accélère la ruine, pas le succès"],
    quiz: [
      { q: "Capital 5 000 $, risque 1 %, distance au stop 50 $. Combien d'unités ?", o: ["1", "10", "100"], a: 0, why: "5 000 × 1 % = 50 $ de risque ÷ 50 $ par unité = 1 unité." },
      { q: "Ton compte a perdu 50 %. Pour revenir à l'équilibre, il te faut…", o: ["+50 %", "+75 %", "+100 %"], a: 2, why: "De 50 à 100, il faut doubler : +100 %." },
      { q: "Avec un levier ×20, quelle baisse environ te liquide ?", o: ["~5 %", "~20 %", "~50 %"], a: 0, why: "1 ÷ 20 = 5 % de mouvement contre toi efface ta marge." }
    ],
    try: "live"
  },

  {
    id: "psycho",
    emoji: "🧠",
    title: "Psychologie & pièges",
    sub: "FOMO, revenge trading, finfluenceurs : ton cerveau est ton pire ennemi.",
    level: "Essentiel",
    mins: 8,
    lessons: [
      {
        h: "Ton cerveau n'est pas fait pour trader",
        body: `<p>L'aversion à la perte : une perte fait environ <b>deux fois plus mal</b> qu'un gain équivalent ne fait plaisir. Résultat : on coupe les gains trop tôt (« je sécurise ») et on garde les pertes trop longtemps (« ça va remonter »). Exactement l'inverse de ce qu'il faut faire.</p>`
      },
      {
        h: "FOMO, FUD et revenge trading",
        body: `<ul>
<li><b>[[fomo|FOMO]]</b> : tu achètes après +40 % parce que tout ton feed en parle. Tu achètes la liquidité de ceux qui vendent.</li>
<li><b>[[fud|FUD]]</b> : tu vends au pire moment sur une rumeur.</li>
<li><b>[[revenge|Revenge trading]]</b> : tu viens de perdre, tu reprends plus gros pour te refaire. Le Coach de l'app le détecte.</li>
</ul>
<p>Remède : un plan écrit avant d'entrer, une limite de perte quotidienne, et le droit de ne rien faire.</p>`
      },
      {
        h: "Finfluenceurs & signaux",
        body: `<p>Sur TikTok, Instagram ou Telegram, beaucoup de « traders » gagnent leur vie… en vendant des formations, des signaux ou des liens d'affiliation vers des brokers. Leur argent vient de toi, pas du marché.</p>
<p>En France, l'influence commerciale sur les produits financiers est encadrée par une loi de 2023 : les promotions doivent être claires et certains produits risqués ne peuvent pas être promus n'importe comment. Les drapeaux rouges : rendements « garantis », captures de gains sans historique vérifiable, urgence (« plus que 3 places »), Lamborghini en arrière-plan.</p>`
      },
      {
        h: "Le biais du survivant",
        body: `<p>Tu vois celui qui a fait ×100 sur un memecoin. Tu ne vois pas les milliers qui ont tout perdu sur les 10 000 autres. Les histoires de succès sont visibles parce qu'elles sont rares.</p>
<p>La vraie flex en trading, ce n'est pas un gros gain. C'est d'être encore là dans 5 ans.</p>`
      }
    ],
    key: ["Une perte fait 2× plus mal qu'un gain", "Plan écrit + limite quotidienne = anti-émotions", "Les finfluenceurs gagnent souvent sur toi, pas sur le marché", "Ne rien faire est aussi une position"],
    quiz: [
      { q: "Tu viens de perdre 300 $. Tu ressens l'envie de doubler ta taille pour te refaire. C'est…", o: ["Du revenge trading", "Une bonne gestion", "Du DCA"], a: 0, why: "Augmenter la taille sous le coup de l'émotion après une perte : revenge trading pur." },
      { q: "Le drapeau rouge le plus évident chez un « coach trading » ?", o: ["Il parle de gestion du risque", "Il promet des rendements garantis", "Il montre ses pertes"], a: 1, why: "Aucun rendement n'est garanti sur les marchés. Promettre l'inverse est trompeur." }
    ],
    try: "swipe"
  },

  {
    id: "macro",
    emoji: "🌍",
    title: "Macro & actu des marchés",
    sub: "Taux, inflation, IA, tarifs douaniers, ETF crypto : ce qui fait bouger les marchés.",
    level: "Intermédiaire",
    mins: 11,
    lessons: [
      {
        h: "Les taux : la gravité des marchés",
        body: `<p>Quand la [[fed|Fed]] ou la [[bce|BCE]] montent leur [[taux-directeur|taux directeur]], l'argent devient cher : les actifs risqués (tech, crypto) souffrent, les obligations neuves deviennent attractives. Quand elles baissent, l'inverse.</p>
<p>2022 : hausse des taux la plus rapide depuis les années 80 pour combattre l'[[inflation]] post-Covid → actions tech et crypto en [[bear|bear market]]. À partir de 2024, les grandes banques centrales ont commencé à baisser leurs taux. Chaque réunion reste un événement de marché majeur.</p>
<p>Les chiffres à surveiller : [[cpi|CPI]] (inflation), [[nfp|NFP]] (emploi), et les conférences de presse des banquiers centraux.</p>`
      },
      {
        h: "L'ère de l'IA en bourse",
        body: `<p>Depuis ChatGPT (fin 2022), l'intelligence artificielle est LE thème des marchés actions. Les fabricants de puces et les géants du cloud ont vu leur [[capitalisation]] exploser, et une poignée de méga-capitalisations pèse désormais une part record du S&P 500.</p>
<p>Conséquence pour toi : acheter « le marché » via un [[etf|ETF]] S&P 500, c'est aussi être très concentré sur quelques valeurs tech. Et chaque publication de [[earnings|résultats]] de ces géants fait bouger tout l'indice.</p>`
      },
      {
        h: "Géopolitique & tarifs douaniers",
        body: `<p>Début avril 2025, l'annonce de droits de douane massifs par les États-Unis provoque l'une des chutes les plus brutales des marchés depuis 2020. Quelques jours plus tard, l'annonce d'une pause déclenche un rebond historique.</p>
<p>Leçon : les marchés détestent l'incertitude, réagissent en quelques minutes, et surréagissent souvent dans les deux sens. Avoir un stop et une taille raisonnable est ce qui te permet de survivre à ces journées (rejoue-la dans les <b>Missions</b>).</p>
<p>Autre exemple : le 5 août 2024, le débouclage du [[carry-trade|carry trade]] sur le yen a fait chuter le Nikkei japonais de plus de 12 % en une séance, emportant crypto et actions mondiales.</p>`
      },
      {
        h: "Crypto : de l'underground à Wall Street",
        body: `<p>Jalons récents :</p>
<ul>
<li><b>Janvier 2024</b> : premiers ETF Bitcoin spot aux États-Unis. Des milliards affluent… mais le BTC baisse de ~20 % dans les deux semaines suivantes (« sell the news »).</li>
<li><b>Avril 2024</b> : quatrième [[halving]].</li>
<li><b>Fin 2024</b> : le BTC dépasse 100 000 $ pour la première fois.</li>
<li><b>Europe</b> : [[mica|MiCA]] s'applique pleinement, les plateformes doivent être agréées.</li>
<li><b>2025</b> : les États-Unis adoptent un cadre légal pour les [[stablecoin|stablecoins]] ; la [[rwa|tokenisation]] d'actifs réels (bons du Trésor, fonds) s'accélère.</li>
</ul>
<p>Le marché crypto est devenu plus institutionnel — donc plus sensible à la macro (taux, dollar) qu'avant.</p>`
      },
      {
        h: "Nouvelles tendances chez les jeunes traders",
        body: `<ul>
<li><b>[[0dte|Options 0DTE]]</b> : énorme succès, énorme risque.</li>
<li><b>[[prop-firm|Prop firms]]</b> : « on te finance 100 000 $ ». Lis les conditions : la plupart des challenges sont perdus, et ce sont les frais d'inscription qui financent le modèle.</li>
<li><b>Marchés de prédiction</b> : parier sur des événements (élections, taux). Réglementation très variable selon les pays.</li>
<li><b>Copy trading</b> : copier un trader. Vérifie son drawdown max, pas seulement son rendement.</li>
<li><b>Investissement programmé</b> : DCA automatique sur ETF dès quelques euros par mois. Moins sexy, mais c'est souvent la meilleure décision financière de la vingtaine.</li>
</ul>`
      }
    ],
    key: ["Les taux directeurs pilotent la valorisation de tous les actifs", "L'IA concentre le marché actions sur quelques géants", "Les chocs géopolitiques = volatilité extrême dans les deux sens", "La crypto est désormais corrélée à la macro"],
    quiz: [
      { q: "La Fed annonce une hausse de taux surprise. Réaction typique des actions tech ?", o: ["Hausse", "Baisse", "Aucune"], a: 1, why: "Taux plus élevés = flux futurs moins valorisés et argent plus cher : la tech à forte croissance baisse." },
      { q: "Après l'approbation des ETF Bitcoin spot en janvier 2024, le BTC…", o: ["A immédiatement doublé", "A d'abord chuté (« sell the news »)", "N'a pas bougé"], a: 1, why: "L'événement était attendu et anticipé : beaucoup ont vendu la nouvelle." },
      { q: "Un ETF S&P 500 en 2026, c'est…", o: ["Parfaitement équipondéré", "Fortement concentré sur quelques géants tech", "Uniquement des banques"], a: 1, why: "L'indice est pondéré par la capitalisation : les méga-caps tech y pèsent très lourd." }
    ],
    try: "missions"
  },

  {
    id: "reel",
    emoji: "🔐",
    title: "Passer en réel sans se faire avoir",
    sub: "Choisir un broker, éviter les arnaques, comprendre la fiscalité.",
    level: "Essentiel",
    mins: 7,
    lessons: [
      {
        h: "Checklist avant de déposer 1 €",
        body: `<ol>
<li>La plateforme est-elle régulée ? En France : vérifie les registres de l'[[amf|AMF]] et de l'ACPR (REGAFI), et les listes noires de l'AMF.</li>
<li>Pour la crypto : agrément [[mica|MiCA]] (CASP) dans un pays de l'UE.</li>
<li>Demande-t-elle un [[kyc|KYC]] ? Si non → fuis.</li>
<li>Peux-tu retirer facilement ? Teste avec un petit montant.</li>
<li>Frais : commission, [[spread]], frais de change, frais de garde, frais de retrait.</li>
</ol>`
      },
      {
        h: "Les arnaques les plus courantes",
        body: `<ul>
<li><b>Le faux conseiller</b> qui te contacte sur WhatsApp/Instagram après un « like ». Il te fait gagner un peu au début… puis bloque les retraits.</li>
<li><b>La romance crypto</b> (« pig butchering ») : relation en ligne, puis « opportunité » sur une fausse plateforme.</li>
<li><b>Le [[pump-dump|pump & dump]]</b> sur des groupes Telegram.</li>
<li><b>Le faux bot IA</b> à rendement garanti.</li>
<li><b>Le [[rug|rug pull]]</b> sur un nouveau token.</li>
</ul>
<p>Règle d'or : <b>personne de sérieux ne te contacte en premier pour te faire gagner de l'argent.</b></p>`
      },
      {
        h: "Fiscalité (France) : les bases",
        body: `<p>En France, les plus-values sur titres en compte-titres sont en principe soumises au prélèvement forfaitaire unique (« flat tax »). Le [[pea|PEA]] offre une fiscalité très avantageuse après 5 ans. Les plus-values crypto ont leur propre régime, et les comptes ouverts à l'étranger doivent être déclarés.</p>
<p>⚠️ Les taux et règles évoluent régulièrement avec les lois de finances : vérifie toujours sur impots.gouv.fr ou auprès d'un professionnel avant de déclarer.</p>`
      },
      {
        h: "Ta feuille de route",
        body: `<ol>
<li>Paper trading ici jusqu'à avoir un plan écrit et 50+ trades journalisés.</li>
<li>Un score Coach stable au-dessus de 70.</li>
<li>Passage en réel avec un montant que tu peux perdre à 100 % sans que ça change ta vie.</li>
<li>Même règles, même taille de risque. L'argent réel ajoute des émotions : c'est normal d'être moins bon au début.</li>
</ol>
<p>Et en parallèle : une épargne de précaution, puis un investissement long terme régulier. Le trading actif, c'est la cerise, pas le gâteau.</p>`
      }
    ],
    key: ["Vérifie la régulation AMF/ACPR/MiCA avant tout dépôt", "Personne de sérieux ne te démarche pour te faire gagner", "Commence petit en réel, mêmes règles qu'en paper", "Renseigne-toi sur la fiscalité en vigueur"],
    quiz: [
      { q: "Quelqu'un te contacte sur Instagram avec une plateforme qui « rapporte 30 %/mois ». Tu…", o: ["Testes avec 100 €", "Vérifies la liste noire AMF et ne réponds pas", "Partages à tes potes"], a: 1, why: "Démarchage + rendement irréaliste = arnaque quasi certaine." },
      { q: "Le premier critère pour choisir un broker ?", o: ["La pub la plus cool", "La régulation", "Le levier maximal"], a: 1, why: "Sans régulation, ton argent n'est pas protégé." }
    ],
    try: "profil"
  }
];
