# Stoa — FX Options Desk

Simulateur de teneur de marché sur options EUR/USD (le cadeau du grand frère), refait dans un style
sobre et concentré : barre latérale, palette obsidienne et laiton, textes plus lisibles, mode focus
(touche `F`), journal de trading non bloquant.

Ouvre `index.html` dans un navigateur : tout tient dans un seul fichier.

`original.html` est le code d'origine. `build.py` produit `index.html` à partir de lui :

```bash
python3 build.py original.html index.html
```

Corrections apportées : onglet actif (dépendait de l'objet global `event`), sens des ordres du
pricer (tout devenait « short »), panneau Market (boutons de timeframe et RSI manquants, balises
mal fermées), signe des nombres négatifs (`--2,937`), courbes de vol réduites à des points,
gamma ×10⁶ dans la table de déformation, couleur de canvas invalide, identifiant en double,
recalcul inutile du book dans `getLargestTenor`, `window.prompt` qui bloquait la simulation.
