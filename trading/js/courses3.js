/* Académie, niveau pro : options et volatilité, métier de teneur de marché, options de change.
   Contenus repris du simulateur FX du grand frère, réécrits pour débutants. Même format que courses.js. */
window.M = window.M || {};

Object.assign(M.GLOSSARY, {
  vega: { t: "Vega", d: "De combien le prix d'une option bouge quand la volatilité attendue monte d'un point (ex. de 20 % à 21 %)." },
  gamma: { t: "Gamma", d: "La vitesse à laquelle le delta change quand le prix bouge. Gamma positif : les grands mouvements t'aident ; négatif : ils te font mal." },
  "vol-implicite": { t: "Volatilité implicite", d: "L'amplitude de mouvement que le marché anticipe, déduite du prix des options. Plus elle est haute, plus les options sont chères." },
  "vol-realisee": { t: "Volatilité réalisée", d: "L'amplitude de mouvement réellement observée sur une période passée. On la compare à la volatilité implicite pour savoir si les options sont chères." },
  smile: { t: "Smile de volatilité", d: "Les options loin du prix actuel ont souvent une volatilité implicite plus haute que celles au prix actuel : la courbe forme un sourire ou une pente (skew)." },
  "risk-reversal": { t: "Risk reversal", d: "Différence de volatilité entre un call et un put à même distance du prix. Négatif : le marché paie plus cher la protection contre la baisse." },
  "delta-hedge": { t: "Couverture delta (delta hedging)", d: "Acheter ou vendre l'actif pour annuler le delta de ses options, afin de ne plus dépendre de la direction du marché." },
  rfq: { t: "RFQ (demande de prix)", d: "Request for quote : un client demande un prix à plusieurs banques ou teneurs de marché, et traite avec le meilleur." },
  "selection-adverse": { t: "Sélection adverse", d: "Le risque de traiter surtout avec ceux qui en savent plus que toi : tes clients les mieux informés choisissent tes prix quand ils sont faux." },
  forward: { t: "Change à terme (forward)", d: "Un accord pour échanger deux devises à une date future, à un taux fixé aujourd'hui. Il dépend de l'écart de taux d'intérêt entre les deux devises." }
});

M.COURSES.push(
  {
    id: "volatilite",
    emoji: "📊",
    title: "Options niveau 2 : la volatilité",
    sub: "Implicite contre réalisée, smile, surface : ce qui fait vraiment le prix d'une option.",
    level: "Pro",
    mins: 12,
    lessons: [
      {
        h: "La volatilité, c'est le vrai prix d'une option",
        body: `<p>Sur une option, tout est connu (prix de l'actif, [[strike]], échéance, taux) sauf une chose : <b>de combien le marché va bouger</b>. C'est la [[vol-implicite|volatilité implicite]]. Les pros ne disent pas « ce call coûte 2 € », ils disent « il se traite à 8 % de vol ».</p>
<p>Exemple : EUR/USD à 1,0850. Un call à 1 mois coûte environ 0,6 centime avec 7 % de vol, et presque le double avec 14 %. Même option, même jour : seule l'anticipation a changé.</p>`
      },
      {
        h: "Implicite contre réalisée : les options sont-elles chères ?",
        body: `<p>La [[vol-realisee|volatilité réalisée]] mesure ce que le marché a vraiment bougé. Si la vol implicite est à 10 % et que le marché ne bouge qu'à 6 %, les acheteurs d'options surpaient : le temps ([[theta]]) les ronge plus vite que les mouvements ne les paient.</p>
<p>Le ratio réalisée / implicite est l'indicateur favori des desks : sous 85 %, les options sont plutôt chères ; au-dessus de 110 %, plutôt bon marché. Avant une annonce (banque centrale, résultats), la vol implicite monte ; après, elle s'effondre même si le prix bouge : c'est le « vol crush ».</p>`
      },
      {
        h: "Le smile et le skew : la peur a un prix",
        body: `<p>Si le marché était parfaitement calme, toutes les options auraient la même volatilité. En réalité, les puts éloignés (protection contre un krach) coûtent plus cher : on dessine un [[smile]] ou une pente (skew).</p>
<ul>
<li>Le <b>[[risk-reversal|risk reversal]]</b> mesure la pente : vol du call moins vol du put à même distance. Négatif = le marché craint la baisse.</li>
<li>Le <b>butterfly</b> mesure la courbure : de combien les options éloignées (des deux côtés) sont plus chères que celle au prix actuel. Élevé = le marché craint un grand mouvement, peu importe le sens.</li>
</ul>`
      },
      {
        h: "La surface de vol et la structure par terme",
        body: `<p>Pour chaque échéance (1 semaine, 1 mois, 3 mois, 1 an…) et chaque strike, il y a une volatilité : c'est la <b>surface de volatilité</b>. Sa coupe par échéance, au prix actuel, s'appelle la structure par terme.</p>
<p>En temps calme, la vol longue est un peu plus haute que la vol courte. En crise, c'est l'inverse : la vol à 1 semaine explose, parce que tout le monde veut se protéger tout de suite. Une structure inversée est un signal de stress à surveiller.</p>`
      },
      {
        h: "Gamma et vega : les deux risques d'un vendeur d'options",
        body: `<ul>
<li><b>[[gamma|Gamma]]</b> : celui qui vend des options est « short gamma ». Chaque grand mouvement le fait perdre, et son [[delta]] change vite. Il encaisse le theta en échange.</li>
<li><b>[[vega|Vega]]</b> : si la volatilité implicite monte d'un point, combien tu gagnes ou perds. Les vendeurs d'options perdent quand la peur monte.</li>
<li><b>Vanna et volga</b> (niveau desk) : comment le delta change avec la vol, et comment le vega change avec la vol. Ce sont eux qui font souffrir les books pendant les krachs.</li>
</ul>
<p>Règle : on ne vend pas d'options sans savoir combien on perd si le marché bouge de 5 % <i>et</i> que la vol double. Teste-le dans le Labo options.</p>`
      }
    ],
    key: ["Le prix d'une option dépend surtout de la volatilité attendue", "Compare implicite et réalisée pour savoir si c'est cher", "Skew négatif = le marché paie pour se protéger de la baisse", "Vendre des options = short gamma : les grands mouvements font mal"],
    quiz: [
      { q: "La vol implicite est à 12 %, la vol réalisée à 6 %. Les options sont plutôt…", o: ["Chères", "Bon marché", "Au juste prix"], a: 0, why: "Le marché bouge deux fois moins que ce que les prix d'options anticipent : l'acheteur surpaie." },
      { q: "Un risk reversal à 25 delta de −1 % signifie que…", o: ["Les puts sont plus chers que les calls", "Les calls sont plus chers que les puts", "Le marché est calme"], a: 0, why: "Vol du call moins vol du put négative : la protection contre la baisse coûte plus cher." },
      { q: "Après la décision de la banque centrale, la vol implicite chute. Ton call…", o: ["Perd de la valeur même si le prix ne bouge pas", "Gagne de la valeur", "Ne change pas"], a: 0, why: "C'est le vol crush : ta position est long vega." }
    ],
    try: "options"
  },

  {
    id: "market-making",
    emoji: "🏦",
    title: "Dans la peau d'un teneur de marché",
    sub: "Demandes de prix, spread, sélection adverse, couverture, journal : le métier d'un desk d'options.",
    level: "Pro",
    mins: 12,
    lessons: [
      {
        h: "Le métier : donner un prix, pas parier",
        body: `<p>Un [[market-maker|teneur de marché]] ne cherche pas à deviner la direction. Il donne en permanence un prix d'achat ([[bid]]) et un prix de vente ([[ask]]), et gagne l'écart ([[spread]]) sur des milliers d'opérations. Son ennemi n'est pas la baisse ou la hausse : c'est le risque qu'il garde après avoir traité.</p>
<p>Sur les options, les clients (fonds, entreprises, gérants) envoient des [[rfq|demandes de prix]] à plusieurs banques. Le meilleur prix gagne. Trop cher : tu ne traites jamais. Trop bon marché : tu traites, mais tu perds.</p>`
      },
      {
        h: "Construire son prix",
        body: `<ol>
<li><b>Valeur théorique</b> : le prix du modèle avec la volatilité du marché (Black-Scholes, ou Garman-Kohlhagen pour le change).</li>
<li><b>Spread</b> : plus large si le produit est complexe, le montant gros ou le marché agité.</li>
<li><b>Biais d'inventaire</b> : si ton book est déjà très exposé à la hausse, tu proposes un prix d'achat moins généreux pour ne pas en reprendre, et un prix de vente plus attractif pour t'en débarrasser.</li>
</ol>
<p>Avant de répondre, un bon trader regarde : « si je gagne ce trade, à quoi ressemble mon book ? » Delta, gamma, vega après le trade, et la couverture à faire tout de suite.</p>`
      },
      {
        h: "La sélection adverse : quand tu gagnes, méfie-toi",
        body: `<p>Tous les clients ne se valent pas. Un fonds macro très informé ne traite avec toi que si ton prix est faux en sa faveur. C'est la [[selection-adverse|sélection adverse]] : tu gagnes surtout les trades que tu aurais dû perdre.</p>
<p>Les desks classent donc leurs clients : ils élargissent le spread pour les mieux informés et le resserrent pour les clients « naturels » (une entreprise qui couvre ses importations). Si tu gagnes toutes tes demandes de prix, ce n'est pas une bonne nouvelle : tes prix sont probablement trop bas.</p>`
      },
      {
        h: "Couvrir : delta hedging et gamma scalping",
        body: `<p>Après un trade, on neutralise la direction par une [[delta-hedge|couverture delta]] : si le book gagne 300 000 € quand l'euro monte d'un cran, on vend l'équivalent en euros au comptant.</p>
<p>Un book <b>long gamma</b> (acheteur d'options) peut « scalper » : à chaque grand mouvement, il recouvre son delta et encaisse un petit gain. Il doit gagner plus que ce que le temps lui coûte. Le mouvement minimum pour rentrer dans ses frais se calcule : √(2 × |theta| ÷ gamma). Un book <b>short gamma</b> encaisse le theta mais doit recouvrir plus souvent quand le marché s'emballe.</p>`
      },
      {
        h: "Mesurer, tester, écrire",
        body: `<ul>
<li><b>Attribution du P&L</b> : chaque soir, le desk découpe son résultat (delta, gamma, vega, theta, couverture). Un gain qui vient du hasard de la direction n'est pas une compétence.</li>
<li><b>Limites et stress tests</b> : chaque book a des limites de delta, vega, gamma. On rejoue des scénarios (krach éclair, surprise de la banque centrale) : « et si l'euro perd 3 % et que la vol double ? ». C'est le bouton « Et si ? » de ta position live.</li>
<li><b>Journal</b> : noter pourquoi on a coté tel prix et ce qui s'est passé. Au bout d'un mois, tu sais quels clients et quels produits te font gagner.</li>
</ul>`
      }
    ],
    key: ["Un teneur de marché gagne le spread, pas la direction", "Avant de coter, regarde ton book après le trade", "Gagner toutes les demandes = prix trop bas", "Couvrir, stress-tester, écrire son journal"],
    quiz: [
      { q: "Ton book est déjà très long delta. Un client veut te vendre encore de la hausse. Tu…", o: ["Proposes un prix d'achat moins généreux", "Proposes un prix plus généreux", "Ne changes rien"], a: 0, why: "C'est le biais d'inventaire : tu évites d'alourdir une exposition déjà grosse." },
      { q: "Tu gagnes 95 % des demandes de prix. Le plus probable ?", o: ["Tes prix sont trop bas", "Tu es le meilleur trader", "Les clients t'aiment"], a: 0, why: "La sélection adverse : les clients choisissent les prix faux en leur faveur." },
      { q: "Gamma de 2 000 € par point², theta de −400 € par jour. Mouvement minimum pour rentrer dans tes frais ?", o: ["√(2 × 400 ÷ 2 000) ≈ 0,63 point", "400 ÷ 2 000 = 0,2 point", "2 000 ÷ 400 = 5 points"], a: 0, why: "0,5 × gamma × mouvement² = |theta|, donc mouvement = √(2 × |theta| ÷ gamma)." }
    ],
    try: "live"
  },

  {
    id: "options-change",
    emoji: "💱",
    title: "Options de change : se couvrir contre le dollar",
    sub: "Change à terme, options de change, et le cas d'un importateur malien.",
    level: "Avancé",
    mins: 9,
    lessons: [
      {
        h: "Le FCFA, l'euro et le dollar",
        body: `<p>Le [[fcfa|franc CFA]] est arrimé à l'euro (1 € = 655,957 FCFA). Mais beaucoup d'achats se font en dollars : carburant, riz, machines, téléphones. Quand le dollar monte face à l'euro, ils coûtent plus cher en FCFA. Pour une entreprise malienne qui importe, le cours EUR/USD est donc un vrai risque.</p>
<p>Exemple : un importateur doit payer 100 000 $ dans 3 mois. À 1,10 dollar pour un euro, cela fait environ 59,6 millions de FCFA. Si l'euro tombe à 1,00 dollar, la même facture coûte 65,6 millions : 6 millions de plus, sans rien avoir fait de mal.</p>`
      },
      {
        h: "Le change à terme : figer son taux",
        body: `<p>Avec un [[forward|change à terme]], la banque fixe aujourd'hui le taux de la date future. Ce taux n'est pas le cours du jour : il est ajusté par l'écart de taux d'intérêt entre les deux devises (les « points de terme »). Si les taux en dollars sont plus hauts qu'en euros, le dollar à terme coûte un peu moins cher.</p>
<p>Avantage : plus aucune surprise. Inconvénient : si le marché part dans ton sens, tu n'en profites pas.</p>`
      },
      {
        h: "L'option de change : une assurance",
        body: `<p>Avec une option, l'importateur achète le droit d'acheter ses dollars à un taux plafond. Si le dollar monte, l'option le protège. S'il baisse, il laisse l'option expirer et achète moins cher au marché. Le coût : la [[prime]], payée dès le départ.</p>
<p>Le prix se calcule avec le modèle de Garman-Kohlhagen, une version de Black-Scholes qui tient compte des deux taux d'intérêt. Les desks qui vendent ces options gèrent ensuite leur risque comme dans le module « teneur de marché ».</p>`
      },
      {
        h: "Choisir entre les deux",
        body: `<ul>
<li><b>Montant et date certains</b> (une facture signée) : le change à terme est simple et sans prime.</li>
<li><b>Montant incertain</b> (un appel d'offres pas encore gagné) : l'option, car on n'est pas obligé de l'exercer.</li>
<li><b>Budget serré</b> : couvrir une partie (50 à 70 %) au terme et garder le reste ouvert.</li>
</ul>
<p>Au Mali et dans l'UEMOA, ces produits passent par les banques commerciales et sont encadrés par la [[bceao|BCEAO]]. Ils servent à couvrir une activité réelle, pas à spéculer.</p>`
      }
    ],
    key: ["Le FCFA suit l'euro : le risque, c'est EUR/USD", "Change à terme = taux figé, pas de prime", "Option = protection + possibilité de profiter, contre une prime", "Couvrir une partie est souvent le bon compromis"],
    quiz: [
      { q: "Un importateur malien paie en dollars dans 3 mois. Quel mouvement lui fait mal ?", o: ["L'euro baisse face au dollar", "L'euro monte face au dollar", "Le FCFA reste fixe face à l'euro"], a: 0, why: "Le FCFA suit l'euro : si l'euro baisse, il faut plus de FCFA pour payer les mêmes dollars." },
      { q: "Le contrat n'est pas encore signé. Le meilleur outil ?", o: ["L'option de change", "Le change à terme", "Ne rien faire"], a: 0, why: "Avec l'option, il n'est pas obligé d'acheter les dollars si le contrat tombe à l'eau." }
    ],
    try: "options"
  }
);
