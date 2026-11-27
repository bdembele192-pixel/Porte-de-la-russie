# Relais Mèche (Cloudflare Workers, gratuit)

Le relais est un petit programme hébergé gratuitement chez Cloudflare. Il fournit à l'app ce que le
navigateur ne peut pas obtenir seul :

| Adresse | Rôle | Fraîcheur |
|---|---|---|
| `/brvm` | Cours des 48 actions et des indices de la BRVM (brvm.org) | 1 min pendant la séance |
| `/news` | Communiqués officiels (Fed, BCE, FMI, Banque mondiale, BAD…) | 4 min |
| `/ai` | Réponses de Mèche IA par Claude, avec recherche web, **sans clé pour l'utilisateur** | à la demande |

Sans relais, l'app fonctionne quand même : les cryptos et les bourses mondiales sont lues en direct par
le téléphone, la BRVM et les actus viennent du robot GitHub (mis à jour plusieurs fois par jour
seulement), et l'IA répond avec ses connaissances locales.

## Installation sans rien installer (recommandé, 5 minutes)

Le workflow GitHub **« Relais Mèche (Cloudflare) »** (`.github/workflows/relay.yml`) déploie le relais et
inscrit tout seul son adresse dans `trading/js/config.js`.

1. Crée un compte gratuit sur [dash.cloudflare.com](https://dash.cloudflare.com/sign-up).
2. Cloudflare → **My Profile → API Tokens → Create Token** → modèle **« Edit Cloudflare Workers »** → copie le jeton.
3. Cloudflare → **Workers & Pages** : copie l'**Account ID** (colonne de droite).
4. GitHub, dans ce dépôt → **Settings → Secrets and variables → Actions → New repository secret** :
   - `CLOUDFLARE_API_TOKEN` : le jeton de l'étape 2 ;
   - `CLOUDFLARE_ACCOUNT_ID` : l'identifiant de l'étape 3 ;
   - `ANTHROPIC_API_KEY` (facultatif) : ta clé Claude, pour Mèche IA (voir plus bas, et fixe d'abord une limite de dépense).
5. Onglet **Actions → « Relais Mèche (Cloudflare) » → Run workflow**. Au bout d'une minute, le relais est en ligne
   et l'app l'utilise (le robot a modifié `relayUrl`).

Le relais n'accepte que les requêtes venant du site GitHub Pages, de Mèche OS et de `localhost`
(`ALLOWED_ORIGINS` dans `wrangler.toml`). Si tu publies l'app sur un autre domaine, ajoute-le.

## Installation depuis ton ordinateur (10 minutes)

Il faut un ordinateur avec [Node.js](https://nodejs.org) (version 20 ou plus).

1. Crée un compte gratuit sur [dash.cloudflare.com](https://dash.cloudflare.com/sign-up).
2. Dans un terminal, depuis ce dossier `relay/` :
   ```bash
   npm install
   npx wrangler login        # ouvre le navigateur pour relier ton compte Cloudflare
   npx wrangler deploy       # publie le relais
   ```
   La dernière commande affiche l'adresse du relais, par exemple
   `https://meche-relais.ton-compte.workers.dev`.
3. Ouvre cette adresse dans le navigateur : tu dois voir `{"ok":true,"service":"Relais Mèche",...}`.
4. Dans `trading/js/config.js`, colle l'adresse dans `relayUrl`, puis publie l'app.

C'est tout pour la BRVM et les actus en direct.

## Activer Mèche IA (Claude) pour tous les utilisateurs

1. Crée une clé API sur [console.anthropic.com](https://console.anthropic.com) (paiement à l'usage).
2. **Fixe une limite de dépense mensuelle** dans la console (Settings → Limits) : c'est ta protection
   si l'app devient très utilisée.
3. Enregistre la clé comme secret du relais (elle n'est jamais visible dans l'app ni dans le code) :
   ```bash
   npx wrangler secret put ANTHROPIC_API_KEY
   ```
4. Vérifie : l'adresse du relais doit maintenant afficher `"ai":true`.

### Réglages (`wrangler.toml`, puis `npx wrangler deploy`)

| Variable | Par défaut | Rôle |
|---|---|---|
| `MODEL` | `claude-opus-5-5` | Modèle utilisé. `claude-sonnet-5-5` est plus rapide, `claude-haiku-5-5` beaucoup moins cher. |
| `EFFORT` | `medium` | Profondeur de réflexion : `low` (plus rapide et moins cher), `medium`, `high`. |
| `AI_PER_MINUTE` | `6` | Nombre maximal de questions par minute et par adresse IP. |
| `ALLOWED_ORIGINS` | site GitHub Pages, `null`, `localhost` | Sites autorisés à utiliser le relais. `*` = tous. Ajoute ton domaine si tu publies l'app ailleurs. |

### Combien ça coûte ?

Cloudflare : gratuit jusqu'à 100 000 requêtes par jour.

Claude : payé à la question, ordre de grandeur (une question avec le contexte de l'app ; plus si la
recherche web est utilisée, environ 1 centime de dollar par recherche en plus) :

| Modèle | Coût approximatif par question |
|---|---|
| Claude Opus 5.5 (par défaut, le plus précis) | 2 à 8 centimes de dollar |
| Claude Sonnet 5.5 | 1 à 4 centimes |
| Claude Haiku 5.5 | moins d'1 centime à 2 centimes |

Pour 1 000 questions par jour avec Opus 5.5, compte de l'ordre de 20 à 80 $ par jour : c'est pourquoi
l'IA illimitée est un bon argument pour l'abonnement payant (et Haiku 5.5 pour l'offre gratuite).
Vérifie les tarifs à jour sur [anthropic.com/pricing](https://www.anthropic.com/pricing).

### Repli automatique

Avec Opus 5.5 (ou Sonnet 5.5), le relais active le repli côté serveur (`fallbacks: "default"`) : si le
modèle refuse une question pour des raisons de sécurité, l'API la repasse automatiquement à un autre
modèle. Pour le désactiver, retire les lignes `betas` et `fallbacks` dans `src/worker.js`.

## Vérifier que tout marche

```bash
curl https://meche-relais.ton-compte.workers.dev/brvm | head -c 300
curl https://meche-relais.ton-compte.workers.dev/news | head -c 300
curl -X POST https://meche-relais.ton-compte.workers.dev/ai -H 'content-type: application/json' \
  -d '{"q":"C'"'"'est quoi la BRVM ?"}'
```

Les journaux du relais : `npx wrangler tail`.
