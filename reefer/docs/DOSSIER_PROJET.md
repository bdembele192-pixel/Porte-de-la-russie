# Optimisation du transfert des reefers — dossier de projet

**Équipe :** Hawa Gniré Berté (manager, leader) · Mamadou Diallo (analyste, responsable technique) · Boubacar Dembélé (coordinateur stratégique)
**Client :** FESCO — Igor Levik, chef du secteur des ventes maritimes
**Concours :** International Transport Project Competition

---

## 1. Problème

| | |
|---|---|
| **Qui ?** | Le chef du secteur des ventes maritimes de FESCO (Igor Levik) |
| **Que veut-il ?** | Optimiser le transfert des conteneurs frigorifiques (reefers) du port vers le rail |
| **Ce qui bloque** | Manque de coordination et de communication entre services, aucune visibilité en temps réel, risque de perte de la température requise |
| **Pourquoi les solutions actuelles ne suffisent pas** | 1C collecte l'information, puis elle est ressaisie à la main dans Excel et envoyée par e-mail entre services. Déjà essayés : 1C, ERP, tableaux en ligne |
| **Cause racine (5 pourquoi)** | Retard du transfert ← mauvaise coordination ← dépendance au facteur humain ← transmission non automatisée ← saisie manuelle 1C → Excel, liée au volume de données et aux restrictions sur les logiciels étrangers |

## 2. Solution retenue

Un **plomb à QR code** fixé sur chaque reefer (une face QR, une face numéro du conteneur) et un **jumeau numérique** partagé :

1. Chaque service (port, douane, logistique, rail) **scanne le plomb** à chaque opération avec un téléphone ou un terminal.
2. Le scan crée un événement horodaté (étape, lieu, température, opérateur), **visible immédiatement par tous** : fini les e-mails et la ressaisie Excel.
3. Le jumeau numérique reconstitue en continu l'état de chaque reefer : étape, position sur le terminal, courbe de température.
4. Des **alertes automatiques** signalent : température hors tolérance, reefer débranché trop longtemps, conteneur bloqué à une étape, plomb différent de celui enregistré (sûreté).
5. Les données alimentent **SQL Server → cube SSAS / Power BI** pour le pilotage (délais, goulots d'étranglement, chaîne du froid).

### Pourquoi c'est meilleur que les solutions essayées
- **Saisie à la source, une seule fois** : le scan remplace la ressaisie manuelle (erreurs, délais).
- **Un seul référentiel partagé** entre les quatre services (coordination).
- **Peu coûteux** : un plomb imprimé (3D ou étiquette) + des téléphones existants.
- **Compatible 1C** : exports CSV / SQL, pas de remplacement du système en place.
- **Hébergement possible en Russie, briques libres** : réponse au problème de sécurité et aux restrictions sur les logiciels étrangers.

## 3. Exigences

**Fonctionnelles** (toutes présentes dans le prototype `reefer/`)

| # | Exigence | Prototype |
|---|---|---|
| F1 | Enregistrer un conteneur (n° ISO 6346 vérifié, consigne, tolérance, client) et générer son plomb QR | Onglet *Plombs QR* |
| F2 | Scanner le plomb (caméra) ou saisir le numéro | Onglet *Scanner* |
| F3 | Enregistrer une opération selon le service (droits par profil) | Profil « Je suis », formulaire |
| F4 | Suivi en temps réel : étape, lieu, température, historique | *Jumeau numérique* |
| F5 | Alertes automatiques (température, débranchement, stagnation, plomb) | *Tableau de bord* |
| F6 | Indicateurs : délai moyen, conteneurs par étape, activité | *Tableau de bord* |
| F7 | Export vers Power BI / SQL / 1C | Onglet *Données* |

**Non fonctionnelles** : utilisable sur téléphone, en gants (gros boutons), fonctionnement hors ligne au terminal (bibliothèques intégrées, pas de CDN), données hébergées en Russie, traçabilité de chaque action (qui, quand, où), accès par rôle (service de sécurité).

## 4. Architecture cible (production)

```
 Plomb QR ──scan──▶ Application mobile / web (PWA)
                         │  HTTPS
                         ▼
                    API (Node.js ou .NET) ──▶ PostgreSQL / SQL Server  (schéma ops)
                         │                         │
         Capteurs reefer ┘ (télémétrie T°)         ├──▶ vues dw ──▶ cube SSAS / Power BI
                                                   └──▶ échange 1C (CSV / OData)
```
Le prototype remplace l'API et la base par le stockage du navigateur ; le schéma SQL (`sql/01_schema.sql`) est déjà celui de la cible.

## 5. Parties prenantes

| Partie prenante | Rôle dans la solution | Bénéfice |
|---|---|---|
| Ventes maritimes | Consulte le tableau de bord | Information immédiate pour planifier les chargements |
| Port | Scanne au déchargement et au branchement | Transmission instantanée aux autres services |
| Douane | Scanne la validation | Contrôle accéléré grâce au QR |
| Logistique | Pilote les flux, gère les alertes | Vision claire et en temps réel |
| Département ferroviaire | Scanne chargement wagon et départ | Moins de retards, coordination avec le port |
| Clients | Reçoivent le statut et la courbe de T° | Information en temps réel, moins de pertes |
| Service informatique | Héberge, intègre 1C, support | Plateforme unique, données sécurisées |
| Service sécurité | Gère les droits d'accès, contrôle des plombs | Sûreté des données et des marchandises |
| Finances | Suit coûts et économies | Moins de pertes liées aux retards |
| Direction générale | Valide et finance | Performance et satisfaction client |

## 6. Plan de réalisation

| Phase | Durée | Livrables | Responsable |
|---|---|---|---|
| 0. Cadrage | 2 sem. | Cartographie du processus réel, mesure du délai actuel (point de référence) | Coordinateur stratégique |
| 1. Prototype (fait) | — | Application `reefer/`, plombs imprimés en 3D, schéma SQL | Responsable technique |
| 2. Pilote | 6 sem. | 50 reefers sur un terminal, 4 services formés, tableau Power BI | Manager + FESCO |
| 3. Industrialisation | 3 mois | API + base serveur, comptes par rôle, échange 1C, télémétrie des groupes froids | Service informatique / prestataire |
| 4. Déploiement | 3 mois | Tous les terminaux, formation, support | FESCO |

**Prochaine étape concrète :** obtenir de M. Levik l'accès à un terminal pour mesurer le délai actuel déchargement → départ, puis lancer le pilote.

## 7. Indicateurs de réussite (à mesurer pendant le pilote)

| Indicateur | Comment on le mesure |
|---|---|
| Délai déchargement → départ du train | Moyenne `DECHARGE → DEPART` (vue `dw.FactStageDuration`) |
| Temps de débranchement | Délai `DECHARGE → BRANCHE` |
| Relevés hors tolérance | `Taux hors tolérance` (Power BI) |
| Ressaisies manuelles / e-mails | Nombre avant / après (enquête auprès des services) |
| Taux de scan | Étapes enregistrées / étapes attendues |

Les objectifs chiffrés sont à fixer avec FESCO une fois le point de référence mesuré en phase 0.

## 8. Budget du pilote (ordre de grandeur, à valider)

| Poste | Hypothèse |
|---|---|
| Plombs QR | Impression 3D ou étiquettes plastifiées : quelques dizaines de roubles l'unité |
| Terminaux | Téléphones existants des agents ; sinon terminaux durcis avec lecteur |
| Hébergement | Un serveur virtuel chez un hébergeur russe |
| Développement | Équipe projet (prototype) puis prestataire ou service informatique interne |
| Formation | ½ journée par service |

Prix exacts : à demander aux fournisseurs et au service informatique de FESCO.

## 9. Risques

| Risque | Parade |
|---|---|
| Les agents oublient de scanner | Scan rendu obligatoire pour passer à l'étape suivante ; alerte « aucune progression » |
| QR abîmé (sel, froid, chocs) | Face numéro lisible en secours ; matériau résistant ; saisie manuelle prévue |
| Restrictions sur les logiciels étrangers | Briques libres, hébergement en Russie, aucune dépendance à un cloud étranger |
| Résistance au changement | Pilote sur un terminal, gains montrés au tableau de bord |
| Double saisie avec 1C | Export / échange automatique vers 1C dès la phase 3 |
| Sécurité des données | Comptes par rôle, journal de toutes les actions, plomb vérifié à chaque scan |

## 10. Démonstration (3 minutes devant le jury)
1. *Tableau de bord* : 10 reefers en transit, alertes déjà détectées.
2. Cliquer sur l'alerte température → jumeau numérique (courbe, position, historique partagé).
3. Profil **Port** → *Scanner* → saisir/scanner un plomb → enregistrer « Branché en zone reefer ».
4. Revenir au tableau de bord : l'alerte « débranché » a disparu, sans e-mail ni Excel.
5. *Plombs QR* : créer un conteneur, montrer les deux faces du plomb (comme le prototype imprimé).
6. *Données* : export CSV → Power BI.
