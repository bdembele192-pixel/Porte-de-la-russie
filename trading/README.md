# Mèche — apprends à trader sans te brûler

Simulateur de trading pour la Gen Z : **vrais prix du marché**, argent virtuel, coach intégré.
Application web statique (HTML/CSS/JS, aucune dépendance, aucun build) : ouvre `index.html` ou publie le dossier sur GitHub Pages.

## Fonctionnalités

| Section | Ce que ça fait |
|---|---|
| ⚡ **Live** | Trading papier sur les prix réels (WebSocket public Binance) : BTC, ETH, SOL, BNB, XRP, DOGE, or (PAXG), EUR/USD. Long/short, levier ×1–20, stop-loss, objectif, liquidation, frais 0,1 %. Flux des **transactions réelles** en direct (🐋 = grosses transactions). Les stops restent surveillés même si tu changes d'actif, et sont rattrapés à la réouverture de l'app. |
| ⏳ **Time Machine** | 10 vrais moments de marché rejoués bougie par bougie avec l'historique réel : Covid 2020, Elon/Dogecoin, Terra/Luna, The Merge, FTX, ETF Bitcoin, lundi noir du yen, élection US 2024, choc des tarifs 2025, ruée vers l'or 2025. Débrief avec l'histoire vraie + note du coach. Défi du jour. |
| 👆 **Swipe** | Mini-jeu « haut ou bas ? » sur de vraies bougies tirées au hasard. |
| 🧪 **Algo Lab** | Backtest de 4 algos (Trend Following EMA+ATR, Breakout Donchian/Turtles, Mean Reversion Bollinger+RSI, Pairs Trading ETH/BTC) sur données réelles, frais inclus, sans biais d'anticipation. Comparateur des 4 algos. |
| 🎓 **Académie** | 18 modules / 78 chapitres + quiz : marché, instruments, styles, analyse technique et fondamentale, indicateurs, stratégies, algos, options, crypto avancé, forex, risque, psychologie, macro 2024-2026, BRVM & UEMOA, plan de trading, finances perso, passer en réel sans arnaque. |
| 🦉 **Quiz** | Parcours façon Duolingo : 11 unités, 88 questions + exercices pratiques générés à l'infini (calculs de risque, lecture de bougies, tendances, RSI), 3 vies, combos, étoiles. |
| ⚙️ **Paramètres** | 7 thèmes (dont clair et « Bamako »), couleur d'accent, police du texte et des titres, taille du texte, flou, arrondis, animations, fond d'écran perso, photo de profil, icône et nom de l'app, langue (FR, EN, 中文, Русский pour l'interface), devise (USD, EUR, FCFA, RUB, JPY, CNY), capital de départ et ajout de fonds, levier max, stop/objectif par défaut, limite de perte du jour, sons, vibrations, mode discret, export/import de la progression. |
| 🤖 **Mèche IA** | Modèle d'apprentissage (régression logistique) entraîné automatiquement sur les vraies bougies Binance (8 actifs, 1h et 4h) à chaque ouverture en ligne, validé honnêtement sur la période la plus récente, et affiné par les trades live des utilisateurs (pondérés par leur discipline). **Copilote** : analyse chaque ordre Live avant envoi (stop, risque, levier, liquidation, tendance, RSI, volatilité, revenge trading, historique perso, probabilité du modèle), bloque les ordres risqués et propose une version plus sûre ; alertes sur les positions ouvertes (notifications). N'intervient jamais dans les missions, le Swipe ni le quiz. **Chat** : glossaire + cours + base multi-domaines (économie, finance, politique, droit, écologie, géopolitique, psychologie, commerce, théorie) + apprentissage sur Wikipédia ; cerveau Claude optionnel (clé API Anthropic, recherche web). |
| 💬 **Infobulles** | Survole n'importe quel bouton ou terme souligné (appui long sur mobile) : ~125 définitions du glossaire. |
| 🏆 **Progression** | XP, 8 niveaux, 20 badges, série de jours, coach qui note la discipline (stop, taille, levier, revenge trading, surtrading). |

Si l'API de marché est injoignable (réseau d'entreprise, pays bloqué…), l'app bascule automatiquement sur des données simulées, signalées par un badge **DÉMO**.

## Structure

```
index.html            coquille + navigation
css/app.css           design
js/glossary.js        définitions (infobulles)
js/courses.js         contenu de l'Académie
js/missions.js        scénarios Time Machine
js/market.js          données Binance (REST + WebSocket) et repli simulé
js/indicators.js      SMA, EMA, RSI, Bollinger, ATR, MACD, Donchian, VWAP
js/chart.js           graphique chandeliers (canvas)
js/algos.js           4 algos + moteur de backtest
js/trader.js          moteur de paper trading + coach
js/tooltip.js         infobulles
js/settings.js        paramètres, thèmes, devise, langue, sons
js/quizbank.js        questions du parcours Quiz
js/quiz.js            parcours Quiz (façon Duolingo)
js/courses2.js        modules supplémentaires de l'Académie
js/icons.js           icônes vectorielles
js/i18n.js            traductions EN / 中文 / Русский
js/kb.js              base de connaissances du chat
js/ai.js              Mèche IA : modèle, copilote, alertes, chat
js/app.js             état, XP, badges, routeur, accueil, académie, profil
js/live.js            terminal live
js/play.js            missions + swipe
js/lab.js             Algo Lab
```

La progression est sauvegardée dans le `localStorage` du navigateur (clé `meche:v1`).

## Avant de commercialiser

- **Nom** : « Mèche » est un nom de travail — vérifier sa disponibilité (INPI / EUIPO) avant dépôt.
- **Argent réel** : l'app ne passe aucun ordre réel. Exécuter des ordres pour des clients demande un agrément (PSAN/CASP MiCA pour la crypto, PSI pour les titres) ou un partenariat avec un courtier régulé via son API.
- **Données** : l'API publique Binance est gratuite mais ses conditions d'utilisation doivent être vérifiées pour un usage commercial ; pour actions/indices, prévoir un fournisseur de données sous licence.
- **Contenu** : les cours restent éducatifs ; aucun conseil en investissement personnalisé (activité réglementée).
- **Comptes utilisateurs** : pour synchroniser la progression entre appareils, il faudra un backend (authentification + base de données) et une politique RGPD.

## Mèche IA : ce qu'elle fait vraiment

- Elle **n'invente pas de données** : elle ne s'entraîne que sur des bougies réelles (jamais sur les données simulées du mode démo).
- Sa précision est **mesurée sur des données qu'elle n'a pas vues** et affichée dans l'onglet Copilote. Si le modèle n'apporte rien sur la période récente, il n'est pas adopté et le copilote s'appuie sur les règles de gestion du risque.
- Elle ne peut **pas** garantir l'absence de pertes : son rôle est d'éviter les erreurs qui ruinent et d'orienter vers des trades au profil gain/risque favorable.
- Le cerveau Claude appelle l'API Anthropic directement depuis le navigateur avec la clé de l'utilisateur : pratique pour tester, mais pour une app publique il faut un serveur intermédiaire qui garde la clé secrète.
