# Mèche OS : le poste de travail des traders et des analystes

Mèche OS est une distribution Linux basée sur **Ubuntu 24.04 LTS**, prête à l'emploi pour suivre les marchés, analyser des données et tester des stratégies. Elle démarre depuis une clé USB (mode « live ») sur n'importe quel PC 64 bits, en BIOS comme en UEFI.

Elle n'écrit pas un nouveau noyau : elle s'appuie sur Linux et Ubuntu, comme la plupart des distributions (Linux Mint, Pop!_OS…). Vous bénéficiez ainsi des pilotes, de la sécurité et des mises à jour d'Ubuntu, et Mèche OS ajoute tout ce qui est propre au métier.

## Ce qui est inclus

| Domaine | Contenu |
|---|---|
| **Commande `marche`** | Cours, graphique dans le terminal, analyse technique, backtest, corrélations, taille de position, communiqués officiels, alertes de prix, rapport quotidien, export CSV (détail plus bas). |
| **Bureau** | XFCE (léger et rapide), thème sombre Mèche, en français. Raccourcis dans le dock et le menu Applications : *Tableau de bord marché*, *Rapport du jour*, *Jupyter*, *Mèche (simulateur)*, *Bienvenue*. |
| **Alertes** | Vérifiées toutes les 5 minutes en arrière-plan, avec une notification de bureau quand un seuil est franchi. |
| **Analyse** | Python 3 avec pandas, NumPy, SciPy, matplotlib, statsmodels et scikit-learn, Jupyter Notebook (carnet d'exemple dans `~/Analyses`), R avec quantmod, xts et TTR, gnuplot. |
| **Données** | LibreOffice Calc, SQLite et DB Browser, csvkit, VisiData, jq. |
| **Application Mèche** | Le simulateur de trading du dossier `trading/`, embarqué et utilisable hors ligne. |
| **Outils** | Navigateur (Firefox ou Epiphany), git, tmux, htop, Mousepad. |

Les cours couvrent les indices, actions US, matières premières, devises, taux et BRVM (79 actifs). Ils viennent de CNBC, TradingView et brvm.org, avec quelques minutes de différé, et sont collectés toutes les 5 minutes par les robots de ce dépôt (`.github/workflows/quotes.yml`). Hors ligne, la dernière copie téléchargée est utilisée.

## La commande `marche`

```text
marche cours                         tableau des cours (--tout, --type forex, --tri variation)
marche cours AAPL GOLD SNTS          sélection (symbole ou nom ; BRVM sans préfixe)
marche graph CAC --jours 250         graphique dans le terminal
marche analyse NVDA                  MM20/50, RSI, MACD, Bollinger, volatilité, Sharpe, drawdown, VaR, signaux
marche backtest GOLD                 4 stratégies contre l'achat-conservation, frais inclus
marche correlation SPX CAC GOLD      matrice de corrélation des rendements
marche risque --capital 10000 --entree 100 --stop 95 --objectif 115
marche actus --recherche inflation   communiqués : Fed, BCE, FMI, SEC, BLS…
marche alerte ajouter GOLD '>' 4200  puis : liste, supprimer N, verifier
marche rapport --ouvrir              rapport Markdown + HTML dans ~/Rapports
marche export EURUSD                 historique en CSV (séparateur ;)
```

Le backtest ne regarde pas l'avenir : la décision est prise à la clôture et exécutée à la clôture suivante. Ces outils aident à l'analyse ; ils ne constituent pas un conseil en investissement.

La commande fonctionne aussi sur n'importe quel Linux ou macOS équipé de Python 3 :

```bash
sudo install -m 755 os/rootfs/usr/local/bin/marche /usr/local/bin/marche
marche cours
```

## Obtenir l'image ISO

**Depuis GitHub (le plus simple)** : onglet **Actions**, workflow **« Mèche OS »**, bouton **« Run workflow »** (vous pouvez choisir le clavier et le fuseau horaire). L'ISO est disponible au bout d'environ 30 minutes dans les *Artifacts* de l'exécution. Une étiquette `os-v1.0` publie l'ISO dans une *Release*.

**Sur votre machine** (Ubuntu ou Debian, environ 15 Go libres) :

```bash
sudo apt-get install debootstrap squashfs-tools xorriso grub-pc-bin grub-efi-amd64-bin grub-common mtools dosfstools
sudo ./os/build.sh                        # résultat dans os/out/
sudo KEYMAP=us TIMEZONE=Europe/Paris ./os/build.sh
```

## Démarrer depuis un disque dur externe (recommandé : Ventoy)

Un disque dur ou SSD externe fonctionne comme une clé USB, en plus rapide et plus spacieux. Avec **[Ventoy](https://www.ventoy.net/fr/)**, vous ne gravez pas l'ISO : vous la copiez comme un simple fichier, et le reste du disque reste utilisable pour vos fichiers.

> ⚠️ L'installation de Ventoy **efface tout le disque une seule fois**. Sauvegardez son contenu avant, puis recopiez-le après : ensuite le disque s'utilise normalement.

1. Téléchargez Ventoy (Windows : `Ventoy2Disk.exe`, Linux : `VentoyGUI`), choisissez le disque externe (**vérifiez bien la lettre ou le nom**), puis cliquez sur *Installer*.
2. Le disque réapparaît avec une partition nommée `Ventoy`. Copiez-y `meche-os-1.0-amd64.iso`, ainsi que vos fichiers personnels si vous voulez.
3. Pour **conserver vos fichiers et réglages** d'une session à l'autre, créez un fichier de persistance :
   - téléchargez `ventoy_persistence` depuis la page *Plugins → Persistence* du site Ventoy, et créez un fichier `persistence.dat` de 8 à 32 Go, avec l'étiquette `casper-rw` ;
   - créez sur la partition `Ventoy` un fichier `ventoy/ventoy.json` :
     ```json
     { "persistence": [ { "image": "/meche-os-1.0-amd64.iso", "backend": "/persistence.dat" } ] }
     ```
4. Branchez le disque, allumez le PC et ouvrez le menu de démarrage (F12, F10, F9 ou Échap selon la marque ; sur Mac, maintenez la touche Option). Choisissez le disque externe, puis Mèche OS dans le menu Ventoy.

## Démarrer depuis une clé USB

1. Copiez l'ISO sur une clé USB (8 Go ou plus) avec [balenaEtcher](https://etcher.balena.io), Rufus (mode DD) ou `sudo dd if=meche-os-1.0-amd64.iso of=/dev/sdX bs=4M status=progress`.
2. Démarrez le PC sur la clé (touche F12, F10 ou Échap selon le fabricant). Désactivez *Secure Boot* si la clé n'apparaît pas.
3. Vous arrivez directement sur le bureau. L'utilisateur est `trader`, sans mot de passe.

Pour essayer sans clé USB : `qemu-system-x86_64 -enable-kvm -m 4096 -cdrom os/out/meche-os-1.0-amd64.iso`, ou VirtualBox (type *Ubuntu 64 bits*, 4 Go de RAM).

En session live, vos fichiers disparaissent à l'extinction. L'entrée « avec persistance » du menu de démarrage les conserve si la clé contient une partition nommée `casper-rw`.

## Structure

```text
os/
├── build.sh                  construction de l'ISO (debootstrap → squashfs → GRUB BIOS+UEFI)
├── VERSION
├── config/
│   ├── packages.txt          liste des logiciels installés
│   └── grub.cfg              menu de démarrage
├── rootfs/                   fichiers copiés tels quels dans le système
│   ├── usr/local/bin/        marche, marche-tableau, marche-veille, meche-bienvenue
│   ├── usr/share/applications/   raccourcis du menu et du bureau
│   ├── usr/share/meche/      page d'accueil
│   ├── etc/skel/Analyses/    carnet Jupyter d'exemple
│   └── etc/xdg/…             thème, autostart, réglages XFCE
└── tests/test_marche.py      tests (python3 -m unittest discover -s os/tests)
```

Pour ajouter un logiciel, ajoutez son nom de paquet Ubuntu dans `config/packages.txt`. Pour ajouter un fichier au système, placez-le dans `rootfs/` au chemin voulu.

## Limites de la version 1.0

- Système live uniquement : il n'y a pas encore d'installateur sur disque dur (prévu : Calamares).
- *Secure Boot* n'est pas pris en charge, car le chargeur GRUB n'est pas signé.
- Les cours sont différés de quelques minutes. Ce n'est pas un flux de cotation temps réel pour exécuter des ordres.
