/* Time Machine : de vrais moments de marché rejoués bougie par bougie.
   Les bougies viennent de l'historique réel de Binance ; "sim" sert de reconstitution si hors ligne. */
window.M = window.M || {};

M.MISSIONS = [
  {
    id: "covid", emoji: "🦠", title: "Le jeudi noir du Covid", year: "Mars 2020",
    sym: "BTCUSDT", tf: "1h", start: "2020-03-08T00:00:00Z", ctx: 72, play: 96, diff: "Extrême",
    teaser: "Le monde découvre une pandémie. Les bourses vacillent. Le Bitcoin, « or numérique », va-t-il servir de refuge ?",
    story: "Le 12 mars 2020, la panique mondiale atteint son pic : les bourses s'effondrent et le Bitcoin perd environ 40 % en 24 heures, passant brièvement sous 4 000 $. Des centaines de millions de dollars de positions à levier sont liquidées. Ceux qui avaient un stop ont limité la casse ; ceux qui ont acheté la panique avec une petite taille ont vu le BTC… dépasser 60 000 $ un an plus tard.",
    lesson: "En crise de liquidité, tout se vend — même les « valeurs refuges ». Taille réduite et stop obligatoire.",
    sim: { start: 8900, regimes: [{ n: 72, drift: -0.001, vol: 0.011 }, { n: 20, drift: -0.006, vol: 0.022 }, { n: 12, drift: -0.025, vol: 0.045 }, { n: 14, drift: 0.012, vol: 0.035 }, { n: 50, drift: 0.0005, vol: 0.02 }] }
  },
  {
    id: "doge", emoji: "🐕", title: "Elon, le SNL et le Dogecoin", year: "Mai 2021",
    sym: "DOGEUSDT", tf: "1h", start: "2021-05-05T00:00:00Z", ctx: 60, play: 72, diff: "Difficile",
    teaser: "Un milliardaire très actif sur Twitter va présenter une émission culte à la télé US. Internet est en feu. Le memecoin préféré du web est au plus haut.",
    story: "Le 8 mai 2021, Elon Musk anime le Saturday Night Live et y appelle le Dogecoin… « une arnaque » (en blague). Le DOGE, qui avait multiplié par plus de 10 depuis le début de l'année, chute d'environ 30 % pendant et après l'émission. Un cas d'école de « buy the rumor, sell the news » et de FOMO collectif.",
    lesson: "Quand tout ton feed parle d'un actif, tu es souvent la liquidité de sortie de quelqu'un.",
    sim: { start: 0.55, regimes: [{ n: 50, drift: 0.004, vol: 0.03 }, { n: 16, drift: 0.006, vol: 0.035 }, { n: 10, drift: -0.025, vol: 0.05 }, { n: 56, drift: -0.002, vol: 0.03 }] }
  },
  {
    id: "luna", emoji: "🌕", title: "L'effondrement de Terra/Luna", year: "Mai 2022",
    sym: "BTCUSDT", tf: "1h", start: "2022-05-05T00:00:00Z", ctx: 72, play: 120, diff: "Difficile",
    teaser: "Un stablecoin algorithmique géant promet 20 % de rendement. Ses réserves sont en Bitcoin. Quelque chose commence à craquer…",
    story: "En mai 2022, le stablecoin UST perd son ancrage au dollar. Pour le défendre, la Luna Foundation Guard vend ses bitcoins, puis l'écosystème Terra (plus de 40 milliards de dollars) s'évapore en une semaine. Le BTC passe d'environ 36 000 $ à près de 26 000 $. C'est le début d'une chaîne de faillites (Celsius, 3AC… puis FTX).",
    lesson: "Un rendement « garanti » élevé cache toujours un risque. Et la contagion se propage plus vite que tu ne le crois.",
    sim: { start: 37000, regimes: [{ n: 72, drift: -0.0012, vol: 0.008 }, { n: 40, drift: -0.003, vol: 0.013 }, { n: 30, drift: -0.004, vol: 0.02 }, { n: 50, drift: 0.0015, vol: 0.015 }] }
  },
  {
    id: "merge", emoji: "🔀", title: "Ethereum : The Merge", year: "Septembre 2022",
    sym: "ETHUSDT", tf: "1h", start: "2022-09-12T00:00:00Z", ctx: 72, play: 96, diff: "Moyen",
    teaser: "La plus grosse mise à jour de l'histoire d'Ethereum arrive : fin du minage, consommation d'énergie divisée par ~99,9 %. Tout le monde l'attend depuis des années.",
    story: "Le 15 septembre 2022, Ethereum passe à la preuve d'enjeu (« The Merge ») sans incident technique. Et pourtant l'ETH baisse d'environ 15 à 20 % dans les jours suivants : l'événement était attendu, les acheteurs étaient déjà positionnés, et un chiffre d'inflation US plus élevé que prévu pèse sur tout le marché.",
    lesson: "Une bonne nouvelle déjà connue est souvent déjà dans le prix. Sell the news.",
    sim: { start: 1720, regimes: [{ n: 50, drift: 0.0008, vol: 0.01 }, { n: 22, drift: -0.002, vol: 0.014 }, { n: 30, drift: -0.003, vol: 0.016 }, { n: 66, drift: -0.0012, vol: 0.012 }] }
  },
  {
    id: "ftx", emoji: "💥", title: "La chute de FTX", year: "Novembre 2022",
    sym: "BTCUSDT", tf: "1h", start: "2022-11-04T00:00:00Z", ctx: 96, play: 96, diff: "Extrême",
    teaser: "La 2e plus grosse plateforme crypto du monde, sponsor de stades et de célébrités. Un article sur son bilan vient de sortir. Les retraits s'accélèrent…",
    story: "Début novembre 2022, des révélations sur le bilan d'Alameda, le fonds lié à FTX, déclenchent une ruée sur les retraits. En quelques jours, FTX gèle les retraits puis fait faillite ; son fondateur sera condamné pour fraude. Le BTC chute d'environ 21 000 $ à moins de 16 000 $. Des millions d'utilisateurs perdent l'accès à leurs fonds.",
    lesson: "« Not your keys, not your coins. » Le risque de contrepartie (la plateforme elle-même) est un vrai risque.",
    sim: { start: 20300, regimes: [{ n: 96, drift: 0.0004, vol: 0.006 }, { n: 20, drift: -0.006, vol: 0.02 }, { n: 16, drift: -0.008, vol: 0.03 }, { n: 60, drift: 0.0002, vol: 0.012 }] }
  },
  {
    id: "etf", emoji: "🏦", title: "Les ETF Bitcoin débarquent", year: "Janvier 2024",
    sym: "BTCUSDT", tf: "4h", start: "2023-12-28T00:00:00Z", ctx: 78, play: 84, diff: "Moyen",
    teaser: "Après 10 ans de refus, le gendarme boursier américain s'apprête à autoriser les ETF Bitcoin spot. BlackRock est dans la course. Tout le monde attend la décision.",
    story: "Le 10 janvier 2024, la SEC autorise 11 ETF Bitcoin spot. Des milliards de dollars affluent dans les semaines suivantes… mais le BTC, qui avait fortement monté en anticipation, perd environ 20 % en deux semaines (une partie des ventes venant de sorties d'anciens fonds). Il repartira ensuite pour dépasser ses records en mars.",
    lesson: "Le marché anticipe. Le jour J de l'événement est souvent le moment où les premiers acheteurs encaissent.",
    sim: { start: 42500, regimes: [{ n: 60, drift: 0.0008, vol: 0.012 }, { n: 18, drift: 0.002, vol: 0.016 }, { n: 6, drift: -0.004, vol: 0.02 }, { n: 50, drift: -0.003, vol: 0.013 }, { n: 28, drift: 0.002, vol: 0.012 }] }
  },
  {
    id: "yen", emoji: "🇯🇵", title: "Le lundi noir du yen", year: "Août 2024",
    sym: "BTCUSDT", tf: "1h", start: "2024-07-31T00:00:00Z", ctx: 72, play: 96, diff: "Difficile",
    teaser: "La Banque du Japon vient de remonter ses taux. Un chiffre de l'emploi US déçoit. Des milliards empruntés en yen financent des positions partout dans le monde…",
    story: "Le 5 août 2024, le débouclage massif du « carry trade » sur le yen provoque une chute de plus de 12 % du Nikkei, sa pire séance depuis 1987. La panique se propage à tous les actifs risqués : le BTC passe d'environ 62 000 $ à moins de 50 000 $ en quelques heures, avant de rebondir en partie.",
    lesson: "Les marchés sont interconnectés : une décision de banque centrale à Tokyo peut liquider ton long BTC à Paris.",
    sim: { start: 66000, regimes: [{ n: 72, drift: -0.0008, vol: 0.007 }, { n: 30, drift: -0.002, vol: 0.012 }, { n: 12, drift: -0.012, vol: 0.025 }, { n: 54, drift: 0.0015, vol: 0.014 }] }
  },
  {
    id: "election", emoji: "🗳️", title: "La nuit électorale US", year: "Novembre 2024",
    sym: "BTCUSDT", tf: "4h", start: "2024-10-22T00:00:00Z", ctx: 84, play: 84, diff: "Moyen",
    teaser: "L'élection présidentielle américaine est demain. L'un des candidats promet de faire des USA « la capitale mondiale de la crypto ».",
    story: "Le 6 novembre 2024, la victoire de Donald Trump propulse le BTC au-dessus de son record de 73 000 $. En deux semaines, il approche des 95 000 $, et dépasse les 100 000 $ début décembre. Ceux qui ont suivi la tendance avec un stop suiveur ont capté une énorme partie du mouvement.",
    lesson: "Quand une vraie tendance démarre, la meilleure stratégie est souvent la plus simple : la suivre et laisser courir.",
    sim: { start: 67500, regimes: [{ n: 84, drift: 0.0002, vol: 0.01 }, { n: 6, drift: 0.008, vol: 0.016 }, { n: 50, drift: 0.004, vol: 0.013 }, { n: 28, drift: 0.0005, vol: 0.012 }] }
  },
  {
    id: "tariffs", emoji: "🧾", title: "Liberation Day : le choc des tarifs", year: "Avril 2025",
    sym: "BTCUSDT", tf: "4h", start: "2025-03-24T00:00:00Z", ctx: 54, play: 60, diff: "Extrême",
    teaser: "La Maison-Blanche s'apprête à annoncer de nouveaux droits de douane « réciproques » sur le monde entier. Personne ne connaît leur ampleur.",
    story: "Le 2 avril 2025, les États-Unis annoncent des tarifs douaniers bien plus élevés qu'attendu. Les bourses mondiales s'effondrent pendant plusieurs jours, et le BTC tombe sous 75 000 $. Le 9 avril, l'annonce d'une pause de 90 jours déclenche l'un des plus gros rebonds de l'histoire du Nasdaq — et le BTC remonte vers 85 000 $.",
    lesson: "Les chocs politiques créent des mouvements violents dans les deux sens. Shorter le fond ou acheter la panique sans stop = roulette russe.",
    sim: { start: 86000, regimes: [{ n: 54, drift: 0.0004, vol: 0.01 }, { n: 8, drift: -0.006, vol: 0.016 }, { n: 22, drift: -0.003, vol: 0.017 }, { n: 4, drift: 0.02, vol: 0.02 }, { n: 26, drift: 0.001, vol: 0.011 }] }
  },
  {
    id: "gold", emoji: "🥇", title: "La ruée vers l'or", year: "2025",
    sym: "PAXGUSDT", tf: "1d", start: "2025-05-01T00:00:00Z", ctx: 90, play: 120, diff: "Facile",
    teaser: "Banques centrales qui achètent, dollar qui faiblit, tensions géopolitiques. La plus vieille valeur refuge du monde est-elle trop chère ?",
    story: "En 2025, l'or enchaîne les records historiques et franchit les 4 000 $ l'once à l'automne, soutenu par les achats des banques centrales, la baisse attendue des taux américains et la quête de valeurs refuges. Une tendance de fond parfaite… ponctuée de corrections brutales qui ont éjecté les traders trop levierisés.",
    lesson: "Une tendance de fond se trade avec patience : entrer sur les replis, stop sous les plus bas, et ne pas sortir au premier frisson.",
    sim: { start: 3250, regimes: [{ n: 90, drift: 0.0006, vol: 0.011 }, { n: 60, drift: 0.0025, vol: 0.011 }, { n: 10, drift: -0.006, vol: 0.02 }, { n: 50, drift: 0.0008, vol: 0.013 }] }
  }
];
