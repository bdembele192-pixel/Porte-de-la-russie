# Reefer Twin — optimisation du transfert des reefers (FESCO)

Prototype du projet « Optimisation du transfert des reefers » : plomb à QR code + jumeau numérique
partagé entre le port, la douane, la logistique et le département ferroviaire.

Ouvrir `index.html` dans un navigateur : aucune installation. Les bibliothèques QR sont dans
`vendor/`, donc l'application fonctionne aussi sans internet. Pour la caméra sur téléphone, la page
doit être servie en HTTPS (par ex. GitHub Pages : `…/reefer/`).

| Onglet | Rôle |
|---|---|
| Tableau de bord | Indicateurs, alertes, conteneurs par étape, liste filtrable |
| Jumeau numérique | Étape, position sur le terminal, courbe de température, historique partagé |
| Scanner | Lecture du plomb (caméra ou saisie), enregistrement de l'opération selon le service |
| Plombs QR | Création d'un conteneur (n° ISO 6346 vérifié) et des deux faces du plomb (impression ou SVG pour l'impression 3D) |
| Données | Exports CSV / SQL / JSON, simulation de capteurs, jeu de démonstration |

Contenu du dossier :

- `docs/DOSSIER_PROJET.md` — problème, solution, exigences, architecture, plan, KPI, budget, risques, scénario de démo
- `docs/POWER_BI_ET_CUBE.md` — modèle Power BI, mesures DAX, construction du cube SSAS
- `sql/01_schema.sql` — base SQL Server : tables opérationnelles, vues en étoile, requêtes KPI
- `vendor/` — qrcode-generator (MIT) et html5-qrcode (Apache 2.0)

Les données du prototype sont stockées dans le navigateur. En production, elles passent par une API
et la base décrite dans `sql/01_schema.sql`.
