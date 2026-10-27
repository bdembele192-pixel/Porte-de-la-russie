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
  supabaseUrl: "",
  supabaseAnonKey: "",
  // Réseaux activés dans Supabase → Authentication → Providers
  oauthProviders: ["google", "apple", "github", "facebook"],
  // Connexion par SMS : nécessite un fournisseur SMS configuré dans Supabase
  phoneLogin: true
};
