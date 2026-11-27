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

  // Abonnements : moyens de paiement proposés (chacun doit être configuré côté serveur, voir docs/PAIEMENTS.md).
  // cinetpay = Orange Money, Moov, Wave, MTN… en FCFA (UEMOA) · stripe = cartes Visa/Mastercard
  payments: ["cinetpay", "stripe"],
  // Fonctions réservées aux abonnés (laisser vide tant que les prix ne sont pas fixés) : ex. ["ia", "reel"]
  premiumGates: [],

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
