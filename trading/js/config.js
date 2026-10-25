/* Configuration de déploiement. Voir docs/COMPTES.md pour activer les comptes. */
window.M = window.M || {};

M.CONFIG = {
  // Actualités : fichier mis à jour toutes les 5 min par le robot GitHub (.github/workflows/news.yml).
  // La copie « raw » de GitHub est servie en premier (rafraîchie en ~5 min), le fichier du site en secours.
  newsUrls: [
    "https://raw.githubusercontent.com/bdembele192-pixel/Porte-de-la-russie/main/trading/data/news.json",
    "data/news.json"
  ],

  // Cours gratuits (bourses mondiales, matières premières, devises, BRVM), différés de quelques minutes :
  // collectés toutes les 5 min par le robot GitHub (.github/workflows/quotes.yml).
  quotesUrls: [
    "https://raw.githubusercontent.com/bdembele192-pixel/Porte-de-la-russie/main/trading/data/quotes.json",
    "data/quotes.json"
  ],
  historyUrls: [
    "https://raw.githubusercontent.com/bdembele192-pixel/Porte-de-la-russie/main/trading/data/history.json",
    "data/history.json"
  ],

  // Comptes utilisateurs (Supabase). Laisse vide pour rester en mode local (sans compte).
  supabaseUrl: "",
  supabaseAnonKey: "",
  // Réseaux activés dans Supabase → Authentication → Providers
  oauthProviders: ["google", "apple", "github", "facebook"],
  // Connexion par SMS : nécessite un fournisseur SMS configuré dans Supabase
  phoneLogin: true
};
