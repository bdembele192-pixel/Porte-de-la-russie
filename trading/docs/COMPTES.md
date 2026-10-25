# Activer les comptes utilisateurs (≈ 15 minutes)

Mèche utilise [Supabase](https://supabase.com) pour les comptes : authentification sans mot de passe,
connexion par réseaux sociaux, double authentification et base de données protégée ligne par ligne.
Tant que `js/config.js` n'est pas rempli, l'app reste en mode local (aucun compte, rien ne quitte l'appareil).

## 1. Créer le projet
1. Crée un compte sur supabase.com puis un nouveau projet (région la plus proche de tes utilisateurs, par exemple Europe).
2. **Project Settings → API** : copie l'**URL du projet** et la clé **anon public**.
3. Colle-les dans `trading/js/config.js` (`supabaseUrl`, `supabaseAnonKey`).
   La clé *anon* est faite pour être publique : la sécurité vient des règles de la base (étape 2).
   Ne mets **jamais** la clé `service_role` dans l'app.

## 2. Créer la table
**SQL Editor** → colle le contenu de `trading/supabase/schema.sql` → *Run*.

## 3. Autoriser l'adresse du site
**Authentication → URL Configuration** :
- *Site URL* : `https://bdembele192-pixel.github.io/Porte-de-la-russie/trading/`
- *Redirect URLs* : la même adresse (et `http://localhost:8765/` pour les tests).

## 4. Méthodes de connexion
- **E-mail (code à 6 chiffres)** : activé par défaut. Dans **Authentication → Email Templates → Magic Link**,
  ajoute `{{ .Token }}` dans le message pour que l'utilisateur reçoive le code.
  Pour un vrai lancement, configure ton propre serveur d'envoi (SMTP) : l'envoi intégré de Supabase est limité.
- **Téléphone (SMS)** : **Authentication → Providers → Phone**, choisis un fournisseur SMS (Twilio, Vonage, MessageBird…)
  et vérifie qu'il couvre le Mali et les pays visés. Les SMS sont payants. Mets `phoneLogin: false` dans `config.js` pour masquer cette option.
- **Réseaux sociaux** : **Authentication → Providers**, active Google, Apple, GitHub, Facebook… (chacun demande de créer une
  application chez le réseau concerné et d'y coller l'URL de rappel fournie par Supabase). Ne garde dans `oauthProviders`
  que ceux que tu as activés.
- **Double authentification (TOTP)** : active **Authentication → Multi-Factor** si ce n'est pas déjà fait.

## 5. Recommandations de sécurité
- Active une **protection anti-robots** (CAPTCHA hCaptcha ou Cloudflare Turnstile) dans **Authentication → Attack Protection**.
- Garde des **limites d'envoi** raisonnables (codes e-mail / SMS) pour éviter les abus et les coûts.
- Publie une **politique de confidentialité** (données collectées : identifiant de connexion + progression) et déclare
  le traitement auprès de l'autorité de protection des données de chaque pays visé (au Mali : l'APDP ; en Europe : RGPD).
- Ce qui est synchronisé : la progression (XP, badges, portefeuille virtuel, réglages). Jamais la clé API Claude.
