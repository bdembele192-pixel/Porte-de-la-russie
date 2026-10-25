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
| 🎓 **Académie** | 11 modules / 49 chapitres + quiz : marché, instruments, styles de trading, analyse technique, indicateurs, stratégies, algos, risque, psychologie, macro 2024-2026, passer en réel sans arnaque. |
| 💬 **Infobulles** | Survole n'importe quel bouton ou terme souligné (appui long sur mobile) : ~110 définitions du glossaire. |
| 🏆 **Progression** | XP, 8 niveaux, 16 badges, série de jours, coach qui note la discipline (stop, taille, levier, revenge trading, surtrading). |

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
