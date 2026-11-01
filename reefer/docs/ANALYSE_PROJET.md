# Analyse complète du projet « Optimisation du transfert des reefers »

## 1. Le problème : vrai ou pas ?
**Vrai, et important.**
- Un reefer débranché se réchauffe. Les pertes de cargaison (poisson, viande, fruits, médicaments) coûtent cher et abîment la relation client.
- Le besoin a été exprimé par un responsable de FESCO, pas inventé par l'équipe.
- La cause est claire : la même information est saisie plusieurs fois (1C, puis Excel, puis e-mail) entre des services qui ne partagent pas d'outil.
- FESCO développe ses trains de reefers et a agrandi son parc (plus de 5 300 reefers en 2026) : le volume augmente, donc le problème aussi.

**Limite :** on ne connaît ni le délai actuel, ni les pertes, ni le temps passé à ressaisir. Sans ces chiffres, on ne peut pas prouver la valeur.

## 2. Ce qui existe déjà (concurrence)
| Solution | Ce qu'elle couvre | Ce qu'elle ne couvre pas |
|---|---|---|
| Vision par machine au port de Vladivostok (FESCO) | Lecture automatique du numéro et des plombs au déchargement | Les étapes après le quai : douane, navette, rail |
| Logiciels de gestion de terminal (Solvo.TOS, Navis N4) avec surveillance des reefers | Branchement et température *dans un terminal* | Le passage d'une entité à l'autre (port → rail) |
| Télémétrie des groupes froids (modems sur les reefers) | Température en continu | L'étape, les responsabilités, la coordination |
| 1C / ERP / tableaux en ligne (déjà essayés par FESCO) | Gestion et facturation | Le temps réel sur le terrain |

**Conclusion :** les briques existent, mais elles sont isolées. Le projet a une place s'il se présente comme **la couche commune entre services**, qui reprend les données existantes et ajoute le scan là où rien n'existe. Présenté comme « un nouveau système de suivi », il perd face aux solutions déjà installées.

## 3. Plan technique
**Points forts**
- Technique simple et mûre : le QR se lit avec n'importe quel téléphone et coûte presque rien.
- Le prototype fonctionne : scan, étapes, alertes, courbe de température, exports, schéma SQL.
- Pas de dépendance à un fournisseur étranger. Les bibliothèques sont libres et intégrées, et le logiciel peut être hébergé en Russie.

**Points faibles**
- Le prototype stocke les données dans le navigateur. Il faut un serveur, une base et des comptes avant tout pilote.
- Aucune intégration réelle avec 1C, les caméras du port ou la télémétrie : pour l'instant, ce sont des exports.
- Un QR sur un conteneur s'abîme (sel, givre, chocs). Il faut prévoir la face numéro en secours et tester les matériaux.
- Un QR se copie facilement. Pour la sûreté, il faut un identifiant unique vérifié par le serveur, et non un simple numéro.

**Travail restant** (ordre de grandeur, pour une petite équipe) : API et base serveur, authentification par rôle, application mobile utilisable hors ligne, connecteur 1C, connecteur télémétrie.

## 4. Plan opérationnel et humain
- **Atout :** à chaque étape, quelqu'un s'occupe déjà du conteneur. Le scan prend sa place dans un geste qui existe déjà et remplace une ressaisie.
- **Risque :** les agents peuvent oublier ou refuser de scanner. Parades :
  - le scan est obligatoire pour passer à l'étape suivante ;
  - une alerte se déclenche quand un conteneur ne progresse plus ;
  - le tableau de bord montre à chaque service ce qu'il gagne.
- **Conditions de terrain :** froid, gants, nuit, réseau faible. Il faut de gros boutons, un mode hors ligne et des terminaux durcis si nécessaire.
- **Formation :** courte (une demi-journée), car l'action se limite à « scanner, choisir l'opération, valider ».

## 5. Plan juridique et réglementaire
- **Plombs douaniers :** les plombs de sécurité doivent respecter la norme ISO 17712. Le plomb QR doit être présenté comme une étiquette d'identification ajoutée au plomb réglementaire, jamais comme un remplaçant.
- **Douane :** le scan douanier du prototype est un statut interne. Il ne remplace pas les procédures officielles du Service fédéral des douanes.
- **Données personnelles :** le nom des opérateurs est une donnée personnelle (loi russe 152-ФЗ). Les données doivent être stockées en Russie, les accès limités et les agents informés.
- **Logiciels :** les grandes entreprises russes favorisent les logiciels inscrits au registre des logiciels russes. Une solution libre hébergée en Russie va dans ce sens. Pour un déploiement à grande échelle, l'inscription au registre serait un argument.

## 6. Plan économique
**Coûts** (à chiffrer avec des devis) : plombs ou étiquettes, terminaux (téléphones existants ou durcis), serveur, développement, intégration 1C, formation, maintenance.

**Gains possibles** (à mesurer pendant le pilote) :
- pertes de cargaison évitées : nombre d'incidents de température × valeur moyenne de la cargaison ;
- heures de ressaisie supprimées : nombre de saisies par conteneur × minutes × coût horaire × nombre de conteneurs ;
- immobilisation réduite : heures gagnées entre le déchargement et le départ × coût d'une heure au terminal (stockage, électricité, place) ;
- réclamations clients et pénalités évitées.

**Formule pour convaincre FESCO :** gains annuels mesurés pendant le pilote, comparés au coût du déploiement, donnent le délai de retour sur investissement. Comme la solution est peu coûteuse, il suffit de quelques incidents évités pour qu'elle soit rentable. Ce raisonnement est à confirmer avec les vrais chiffres.

**Modèle d'affaires possible** si vous voulez aller plus loin : abonnement par terminal ou par conteneur suivi, ou vente d'une licence avec installation et maintenance.

## 7. Plan stratégique (pour FESCO)
- Cohérent avec la stratégie de FESCO : croissance des trains de reefers, numérisation (vision par machine), logiciels russes.
- Visibilité pour le client final : il peut suivre son conteneur et sa température. C'est un argument commercial pour le service des ventes, donc pour M. Levik.
- Le projet est petit et réversible. Un pilote sur un terminal ne met rien en danger.

## 8. Plan « extension à d'autres sociétés »
- Le cœur est générique : objets identifiés, étapes, services, alertes, historique partagé.
- Cibles : opérateurs ferroviaires de conteneurs, ports secs, entrepôts frigorifiques, pharmacie, agroalimentaire, location de matériel.
- **Condition :** rendre les étapes, les services et les seuils configurables depuis une page d'administration. Aujourd'hui, ils se modifient dans le code.

## 9. Plan équipe
- **Atouts :** rôles clairs (manager, analyste technique, coordinateur), contact direct avec le client, prototype physique et logiciel.
- **Manques :** expérience terrain dans un terminal, compétences juridiques et douanières, développement serveur. Il faut trouver un tuteur chez FESCO ou à l'université.

## 10. Analyse SWOT
| **Forces** | **Faiblesses** |
|---|---|
| Vrai client, vrai besoin | Pas de chiffres de référence |
| Solution peu coûteuse et simple | Prototype sans serveur ni intégration |
| Prototype qui fonctionne | Dépend encore d'un geste humain |
| Compatible avec 1C et les logiciels russes | Le QR seul n'est pas une technologie nouvelle |
| **Opportunités** | **Menaces** |
| Croissance des trains de reefers | Systèmes existants (Solvo, vision du port) déjà installés |
| Politique de logiciels russes | Le service informatique de FESCO peut préférer étendre ses outils |
| Extension à d'autres sociétés | Résistance au changement dans les services |
| Relier les systèmes isolés existants | Durée des décisions dans un grand groupe |

## 11. Note globale
| Critère | Note /5 | Commentaire |
|---|---|---|
| Pertinence du problème | 5 | Besoin réel exprimé par le client |
| Originalité | 2,5 | Briques connues ; l'originalité est dans la coordination entre services |
| Faisabilité technique | 4 | Technique simple, prototype fonctionnel |
| Faisabilité organisationnelle | 3 | Dépend de l'adhésion des services |
| Valeur économique démontrée | 2 | À prouver par un pilote |
| Possibilité d'extension | 4 | Modèle générique |

**Verdict :** c'est un bon projet, réaliste et utile, à condition de le présenter comme **la couche de coordination entre les systèmes qui existent déjà**, et de prouver sa valeur par un pilote mesuré.

## 12. Recommandations, par ordre de priorité
1. Obtenir les chiffres actuels auprès de FESCO : délai, pertes, nombre de ressaisies.
2. Demander quels systèmes chaque service utilise déjà et s'ils sont reliés entre eux.
3. Repositionner le projet : « couche commune entre services ».
4. Proposer un pilote de 6 semaines sur un terminal ferroviaire ou une navette, là où rien n'existe.
5. Développer le serveur, les comptes par rôle et l'import des données existantes (caméras, télémétrie, 1C).
6. Ajouter une page d'administration pour adapter les étapes à d'autres sociétés.
