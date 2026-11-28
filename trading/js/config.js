/* Configuration de déploiement. Voir docs/COMPTES.md pour activer les comptes. */
window.M = window.M || {};

M.CONFIG = {
  // Actualités : fichier mis à jour par le robot GitHub (.github/workflows/news.yml). GitHub lance ce robot
  // quand ses serveurs le permettent (souvent toutes les quelques heures) : le relais (relayUrl) est plus frais.
  newsUrls: [
    "https://raw.githubusercontent.com/bdembele192-pixel/Porte-de-la-russie/main/trading/data/news.json",
    "data/news.json"
  ],

  // Copie de secours des cours (bourses mondiales, matières premières, devises, BRVM) écrite par le robot GitHub
  // (.github/workflows/quotes.yml). En temps normal l'app lit les cours en direct (js/quotes.js).
  quotesUrls: [
    "https://raw.githubusercontent.com/bdembele192-pixel/Porte-de-la-russie/main/trading/data/quotes.json",
    "data/quotes.json"
  ],
  historyUrls: [
    "https://raw.githubusercontent.com/bdembele192-pixel/Porte-de-la-russie/main/trading/data/history.json",
    "data/history.json"
  ],

  // Relais Cloudflare (gratuit, voir relay/README.md) : BRVM et actualités en direct, et Mèche IA par Claude
  // pour tous les utilisateurs. Exemple : "https://meche-relais.<ton-compte>.workers.dev". Vide = sans relais.
  relayUrl: "",

  // Comptes utilisateurs (Supabase). Laisse vide pour rester en mode local (sans compte).
  // Rempli automatiquement par le robot .github/workflows/supabase.yml (la clé « anon » est publique par nature :
  // la sécurité repose sur les règles de la base, pas sur ce secret).
  supabaseUrl: "",
  supabaseAnonKey: "",
  // Réseaux activés dans Supabase → Authentication → Providers
  oauthProviders: ["google", "apple"],
  // Connexion par SMS : nécessite un fournisseur SMS configuré dans Supabase (Twilio, Vonage, MessageBird…)
  phoneLogin: true,
  // Captcha Cloudflare Turnstile (clé de site publique). À activer aussi dans Supabase → Authentication → Attack Protection.
  turnstileSiteKey: "",

  // Abonnements (pilote Afrique de l'Ouest) : Gratuit limité + Pro en pass prépayés. Voir docs/PAIEMENTS.md.
  // "auto" = les limites du Gratuit s'activent dès que les comptes sont en service (supabaseUrl rempli) ;
  // false = tout reste ouvert (utile tant que CinetPay n'est pas configuré).
  freemium: "auto",
  // Moyens de paiement : cinetpay = Orange Money, Wave, Moov, MTN, Free et cartes, en FCFA. (stripe : après le pilote)
  payments: ["cinetpay"],
  // Paiement de test (simulation, aucun argent réel) pour essayer tout le parcours avant d'avoir un compte marchand.
  // Le serveur ne l'accepte que si le secret TEST_PAYMENTS vaut 1. Passer à false à l'ouverture du vrai paiement.
  testPayments: true,
  // Pays où l'abonnement est ouvert pendant le pilote (le serveur applique la même liste : secret PILOT_COUNTRIES)
  pilotCountries: ["ML", "SN", "CI", "BF", "BJ", "TG"],

  // Trading réel (docs/TRADING-REEL.md). Les clés restent chiffrées sur l'appareil de l'utilisateur.
  real: {
    exchanges: ["binance"],
    // Plafonds de sécurité appliqués par l'app, en USDT (l'utilisateur peut les baisser, pas les dépasser)
    maxOrder: 1000,
    maxDaily: 3000
  },
  // Courtiers et SGI partenaires (agréés). Ne mettre que des partenaires réels, avec leur autorité de contrôle.
  // Exemple : { name: "…", region: "UEMOA", regulator: "AMF-UMOA", url: "https://…", note: "Actions BRVM" }
  partners: []
};
