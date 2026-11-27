# Politique de sécurité

Mèche est un simulateur de trading éducatif. Certaines parties touchent à des données sensibles (comptes,
paiements, clés de plateformes de trading) : la sécurité passe avant les nouvelles fonctions.

## Signaler une faille

**Ne publie pas de faille dans une issue publique.** Utilise le signalement privé de GitHub :
onglet **Security → Report a vulnerability** de ce dépôt.

Indique si possible : la page ou le fichier concerné, les étapes pour reproduire, l'impact possible
(par exemple accès aux données d'un autre utilisateur, activation d'un abonnement sans payer).

Nous nous engageons à :
- accuser réception sous 3 jours ouvrés ;
- te tenir informé de la correction ;
- te remercier publiquement si tu le souhaites, une fois la faille corrigée.

### Recherche de bonne foi
Si tu respectes les règles ci-dessous, nous ne prendrons aucune mesure contre toi :
- teste uniquement avec **tes propres comptes** et le **testnet** de Binance ; n'accède pas aux données d'autres personnes ;
- pas de déni de service, pas d'envoi massif d'e-mails ou de SMS, pas d'ingénierie sociale ;
- laisse-nous un délai raisonnable pour corriger avant toute publication.

### Dans le périmètre
- l'application `trading/` publiée sur GitHub Pages ;
- les règles de la base de données (`trading/supabase/migrations/`) et les fonctions de paiement (`trading/supabase/functions/`) ;
- le relais Cloudflare (`relay/`) et les robots GitHub Actions (`.github/workflows/`).

### Hors périmètre
- les services tiers eux-mêmes (Supabase, Stripe, CinetPay, Binance, Cloudflare, Anthropic) : signale-leur directement ;
- les résultats d'outils automatiques sans démonstration d'impact.

## Principes appliqués

| Principe | Mise en œuvre |
|---|---|
| Ne jamais détenir ce qu'on n'a pas besoin de détenir | Mèche ne garde ni argent, ni numéro de carte, ni mot de passe en clair, ni clé de plateforme de trading. |
| Secrets côté serveur uniquement | Clés de paiement dans les secrets Supabase/GitHub ; `config.js` ne contient que des clés publiques (vérifié par la CI). |
| Ne rien croire du navigateur | Prix lus dans la base, abonnements activés seulement après vérification du paiement auprès du prestataire. |
| Moindre privilège | Sécurité ligne par ligne sur chaque table ; robots GitHub avec permissions minimales ; clés Binance sans droit de retrait. |
| Défense en profondeur | Politique CSP, captcha, 2FA, mots de passe vérifiés contre les fuites, plafonds et confirmation des ordres réels. |
| Chaîne d'approvisionnement | Bibliothèques copiées dans le dépôt (pas de code chargé à la volée), actions GitHub épinglées par empreinte, Dependabot, CodeQL, gitleaks. |

## Réglages GitHub à activer (une fois)
**Settings → Code security** : *Private vulnerability reporting*, *Dependabot alerts*, *Secret scanning* et *Push protection*.
**Settings → Branches** : protéger `main` (pull request obligatoire, contrôles « Contrôles (tests et sécurité) » au vert).
