# Trading réel

Écran : `#/reel` (`js/real.js`). Deux voies, choisies pour que **Mèche ne détienne jamais l'argent des utilisateurs**
(sinon il faudrait un agrément de prestataire de services d'investissement ou de crypto-actifs) :

## 1. Ton propre compte Binance (crypto)
- L'utilisateur crée lui-même une clé API **sans droit de retrait** (lecture + trading Spot) chez Binance.
- La clé et le secret sont **chiffrés sur son appareil** (AES-256-GCM, clé dérivée de sa phrase secrète par PBKDF2-SHA256,
  310 000 itérations) dans `localStorage["meche:real"]`. Ils ne sont ni synchronisés, ni exportés, ni envoyés à Mèche.
  Déchiffrés, ils restent en mémoire 15 minutes d'inactivité au plus.
- Les ordres partent **du navigateur directement** vers l'API WebSocket de Binance (`wss://ws-api.binance.com`),
  signés sur place (HMAC-SHA256). L'API REST n'est pas utilisable depuis un navigateur (CORS), l'API WebSocket si.
- Garde-fous : conditions acceptées (18 ans et plus, risque de perte), testnet par défaut, ordre validé d'abord par
  `order.test`, fenêtre de confirmation (3 secondes d'attente en réel), plafonds par ordre et sur 24 h
  (`config.js → real.maxOrder / maxDaily`, l'utilisateur peut seulement les baisser), prix limite refusé à plus de 20 % du cours,
  stop de protection facultatif (STOP_LOSS_LIMIT) après un achat, journal exportable en CSV (copié dans le compte sans aucune clé).
- **Testnet** : clés gratuites sur testnet.binance.vision, argent fictif. C'est le mode par défaut.
- **Limites** : Binance n'est pas disponible partout (États-Unis : Binance.US ; Russie : pas de nouveaux comptes ; vérifie
  aussi le pays de chaque utilisateur). Si l'utilisateur restreint sa clé à une adresse IP fixe, la connexion doit venir de cette adresse.

## 2. Courtiers et SGI agréés (actions, BRVM, ETF)
`config.js → partners` (vide par défaut) :

```js
partners: [
  { name: "Nom de la SGI", region: "UEMOA", regulator: "AMF-UMOA", url: "https://…", note: "Actions et obligations BRVM" }
]
```

N'y mets que des intermédiaires **réellement agréés** avec qui tu as un accord (ou un lien d'affiliation officiel).
Les liens portent `rel="sponsored"`. Sans partenaire, l'écran explique comment vérifier un agrément
(AMF-UMOA, Banque de Russie, AMF/ESMA, OCRI/CIRO).

## Pour aller plus loin (plus tard)
- Autres plateformes avec API WebSocket signée côté navigateur (OKX, Bybit…) : même principe, un module par plateforme.
- Clés Ed25519 (recommandées par Binance) : la clé privée resterait aussi chiffrée sur l'appareil.
- Réserver le trading réel aux abonnés : ajoute `"reel"` dans `premiumGates` (config.js) et appelle `M.premium("reel")`.

## Tests
Test automatique avec un faux serveur Binance qui vérifie chaque signature HMAC : coffre chiffré (aucune clé en clair dans le
stockage), achat au marché + stop placé à −5 %, plafond refusé, annulation, verrouillage/mauvaise phrase, journal.
