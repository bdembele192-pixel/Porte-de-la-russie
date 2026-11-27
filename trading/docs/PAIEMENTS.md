# Abonnements et paiements

Écran : `#/abonnement` (`js/subscribe.js`). Serveur : `supabase/functions/checkout` et `supabase/functions/payment-webhook`.

## Comment ça marche
1. L'utilisateur connecté choisit une offre et un moyen de paiement.
2. L'app appelle la fonction **`checkout`** avec seulement `plan_id` et `provider`. Le serveur lit **le prix dans la table `plans`**
   (jamais dans le navigateur), enregistre un paiement « en attente » et renvoie l'adresse de la page de paiement du prestataire.
   L'app n'accepte que des adresses `checkout.stripe.com`, `*.cinetpay.com`, `yoomoney.ru` / `yookassa.ru`.
3. L'utilisateur paie chez le prestataire (Mèche ne voit jamais la carte ni le code mobile money).
4. Le prestataire prévient la fonction **`payment-webhook`**, qui **ne croit rien sur parole** :
   - Stripe : signature `Stripe-Signature` vérifiée (HMAC-SHA256, horodatage de moins de 5 minutes) ;
   - CinetPay et YooKassa : le paiement est revérifié en interrogeant directement leur API.
5. Si le montant et la devise correspondent au paiement enregistré, le paiement passe à « payé » (une seule fois, même si la
   notification arrive plusieurs fois) et `grant_subscription()` prolonge l'abonnement de la durée de l'offre.

Pas de prélèvement automatique : chaque paiement couvre une période (30 jours, 1 an…). Un nouveau paiement prolonge la période en cours.

## Fixer les prix
Tant qu'un prix vaut `null`, l'offre affiche « Prix à fixer » et ses boutons de paiement sont désactivés.
Supabase → **Table Editor → plans** → colonne `prices`, par exemple :

```json
{"XOF": 2500, "EUR": 3.99, "RUB": 349}
```

- `XOF` (CinetPay) : nombre entier, **multiple de 5**.
- `EUR` (Stripe) : ou une autre devise si tu mets le secret `STRIPE_CURRENCY` (ex. `USD`) et la même clé dans `prices`.
- `RUB` (YooKassa).
- Tu peux aussi modifier `name`, `description`, `features` (textes affichés), `period_days`, `active`, `sort`.
- `perks` = droits techniques : `ia`, `coach`, `reel`. Pour réserver une fonction aux abonnés, ajoute-la dans
  `premiumGates` de `config.js` (vide par défaut : tout reste ouvert tant que les prix ne sont pas fixés).

## Brancher chaque prestataire
Ajoute les secrets dans GitHub (**Settings → Secrets and variables → Actions**) puis relance le robot
« Comptes et paiements Mèche (Supabase) ». Un moyen de paiement sans secrets répond simplement « pas encore configuré ».
Retire de `payments` (config.js) ceux que tu n'utilises pas.

### CinetPay — Orange Money, Moov, Wave, MTN, cartes (UEMOA, FCFA)
1. Compte marchand sur cinetpay.com (pièces de l'entreprise demandées).
2. Tableau de bord → Intégration : **API Key** et **Site ID** → secrets `CINETPAY_APIKEY`, `CINETPAY_SITE_ID`.
3. Rien d'autre : l'adresse de notification est envoyée automatiquement à chaque paiement.

### Stripe — cartes internationales, Apple Pay, Google Pay
1. Compte sur stripe.com. ⚠️ Stripe n'ouvre pas de compte marchand à une entreprise établie au Mali ou en Russie :
   il faut une société dans un pays pris en charge (France, Canada, Émirats…). À défaut, retire `stripe` de `payments`.
2. **Developers → API keys** : clé secrète `sk_live_…` (ou `sk_test_…` pour tester) → secret `STRIPE_SECRET_KEY`.
3. **Developers → Webhooks → Add endpoint** :
   `https://<REF>.supabase.co/functions/v1/payment-webhook?provider=stripe`,
   événements `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`,
   `checkout.session.expired`. Copie le *Signing secret* `whsec_…` → secret `STRIPE_WEBHOOK_SECRET`.

### YooKassa — Russie (cartes Mir, SBP, YooMoney, roubles)
1. Contrat sur yookassa.ru (entreprise ou auto-entrepreneur russe, ИП / самозанятый).
2. **Интеграция → Ключи API** : `shopId` et clé secrète → secrets `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`.
3. **Интеграция → HTTP-уведомления** : `https://<REF>.supabase.co/functions/v1/payment-webhook?provider=yookassa`,
   événements `payment.succeeded` et `payment.canceled`.
4. Reçus fiscaux (54-ФЗ) : si tu vends à des particuliers en Russie, active les reçus dans YooKassa (« Чеки от ЮKassa ») et
   demande l'avis d'un comptable.

## Tester
- Stripe : clés `sk_test_…` + carte `4242 4242 4242 4242`.
- CinetPay et YooKassa proposent un mode test dans leur tableau de bord.
- Tests automatiques du serveur (prix imposé par la base, signatures, double notification, montant falsifié) :
  `deno test -A trading/supabase/tests/functions_test.ts`.

## Obligations à vérifier avant d'encaisser
Conditions de vente (partie 7 de `legal.html`), facturation et TVA selon le pays de l'entreprise, déclaration des revenus,
et — pour la Russie — la loi 152-FZ sur la localisation des données personnelles.
