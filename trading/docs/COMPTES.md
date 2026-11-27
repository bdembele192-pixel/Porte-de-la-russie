# Activer les comptes utilisateurs (≈ 20 minutes)

Mèche utilise [Supabase](https://supabase.com) pour les comptes : base de données PostgreSQL protégée ligne par ligne,
authentification, et fonctions serveur pour les paiements. Tant que `js/config.js` n'est pas rempli, l'app reste en
mode local (aucun compte, rien ne quitte l'appareil).

> **« Se connecter avec Claude » n'existe pas** pour les applications grand public : Anthropic ne propose pas de
> connexion d'utilisateurs finaux par leur compte Claude. Mèche propose donc e-mail (code ou mot de passe),
> téléphone (SMS), Google et Apple.

## Ce qui est en place

| Élément | Où |
|---|---|
| Tables `profiles`, `progress`, `plans`, `subscriptions`, `payments`, `real_orders` + règles de sécurité (RLS) | `supabase/migrations/20261127000000_meche.sql` (copie lisible : `supabase/schema.sql`) |
| Fonctions de paiement `checkout` et `payment-webhook` | `supabase/functions/` (voir `PAIEMENTS.md`) |
| Écran de connexion / création de compte | `js/account.js` → `#/account` |
| Déploiement automatique | `.github/workflows/supabase.yml` |

Règles de sécurité de la base, vérifiées par des tests :
- chaque utilisateur ne lit et ne modifie que **ses** lignes (progression, profil, journal d'ordres) ;
- `subscriptions` et `payments` sont **en lecture seule** pour l'utilisateur : seul le serveur (après un paiement vérifié) peut les modifier ;
- `plans` (les offres) est lisible par tous, modifiable seulement depuis le tableau de bord Supabase ;
- la fonction `delete_my_account()` efface le compte et toutes ses données.

## 1. Créer le projet Supabase
1. Crée un compte sur supabase.com puis un **nouveau projet** (région proche des utilisateurs : Europe, par exemple Francfort).
   Note le **mot de passe de la base** choisi à la création.
2. **Project Settings → General** : copie le **Reference ID**.
3. **Account → Access Tokens** (supabase.com/dashboard/account/tokens) : crée un jeton.

## 2. Laisser le robot GitHub tout installer
Dans le dépôt GitHub : **Settings → Secrets and variables → Actions → New repository secret** :

| Secret | Valeur |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | le jeton de l'étape 1.3 |
| `SUPABASE_PROJECT_REF` | le Reference ID |
| `SUPABASE_DB_PASSWORD` | le mot de passe de la base |

Puis **Actions → « Comptes et paiements Mèche (Supabase) » → Run workflow**. Le robot :
crée les tables et les règles, déploie les fonctions de paiement, règle la sécurité des connexions
(adresse du site, mots de passe de 10 caractères minimum avec lettres et chiffres, double authentification),
puis écrit `supabaseUrl` et la clé publique dans `js/config.js`. Les comptes sont actifs dès que GitHub Pages a republié le site.

La clé écrite dans `config.js` est la clé **publique** (anon / publishable) : elle est faite pour être visible,
la sécurité repose sur les règles de la base. Ne mets **jamais** la clé `service_role` / `sb_secret_…` dans l'app ou le dépôt.

## 3. Méthodes de connexion
- **E-mail + code** : actif par défaut. **Authentication → Email Templates → Magic Link** : ajoute `{{ .Token }}` dans le message
  pour que l'utilisateur reçoive le code à 6 chiffres.
- **E-mail + mot de passe** : actif par défaut, avec confirmation de l'adresse par e-mail et « mot de passe oublié ».
  L'app refuse aussi les mots de passe présents dans une fuite connue (Have I Been Pwned, k-anonymat).
- **Envoi des e-mails** : l'envoi intégré de Supabase est très limité (quelques e-mails par heure). Avant le lancement, branche
  un serveur SMTP (**Project Settings → Authentication → SMTP Settings**) : Resend, Brevo, Postmark, Amazon SES…
- **Téléphone (SMS)** : **Authentication → Sign In / Providers → Phone**, choisis un fournisseur SMS (Twilio, Vonage, MessageBird…)
  et vérifie qu'il couvre le Mali, le Sénégal, la Côte d'Ivoire, la Russie… Les SMS sont payants. Sinon mets `phoneLogin: false` dans `config.js`.
- **Google** : crée un « ID client OAuth » (type application Web) dans Google Cloud Console, avec comme URI de redirection
  `https://<REF>.supabase.co/auth/v1/callback`. Ajoute les secrets `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`, relance le robot.
- **Apple** : nécessite un compte Apple Developer (payant). Crée un *Services ID* et une clé « Sign in with Apple », génère le secret
  (voir la documentation Supabase « Login with Apple »), puis ajoute `APPLE_CLIENT_ID` et `APPLE_SECRET`. Le secret Apple expire
  tous les 6 mois : pense à le renouveler.
- Garde dans `oauthProviders` (config.js) uniquement les réseaux réellement activés.

## 4. Anti-robots (recommandé avant d'ouvrir au public)
1. Cloudflare → **Turnstile** → *Add site* avec le domaine `bdembele192-pixel.github.io`.
2. Clé de site (publique) → `turnstileSiteKey` dans `config.js`.
3. Clé secrète → secret GitHub `TURNSTILE_SECRET_KEY`, puis relance le robot (il active le captcha dans Supabase).

## 5. Recommandations
- Garde des **limites d'envoi** raisonnables (Authentication → Rate Limits) pour éviter les abus et les factures de SMS.
- Active **« Leaked password protection »** si ton offre Supabase la propose (double protection avec la vérification de l'app).
- Sauvegardes : l'offre gratuite de Supabase n'a pas de sauvegarde à un instant précis ; passe à l'offre Pro avant d'encaisser de vrais paiements.
- La **politique de confidentialité** est dans `legal.html` : relis-la et déclare le traitement auprès de l'autorité de protection
  des données de chaque pays visé (Mali : APDP ; Union européenne : RGPD ; Russie : Roskomnadzor, loi 152-FZ — attention, la loi
  russe impose de stocker en Russie les données des citoyens russes : demande l'avis d'un juriste avant de viser ce marché).
- Ce qui est synchronisé : progression (XP, badges, portefeuille virtuel, réglages), pseudo, abonnement, journal des ordres réels.
  Jamais la clé API Claude, jamais les clés de plateforme de trading.

## Tester en local
`python3 -m http.server 8765` dans `trading/`, puis `http://localhost:8765/` (adresse déjà autorisée par le robot).
