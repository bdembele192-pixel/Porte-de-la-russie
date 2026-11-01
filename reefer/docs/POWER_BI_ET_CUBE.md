# Power BI et cube SSAS — mode d'emploi

## 1. Préparer la base
1. Installer SQL Server (Developer ou Express) et SSMS.
2. Exécuter `sql/01_schema.sql` (crée la base `ReeferTwin`, les tables `ops.*` et les vues `dw.*`).
3. Dans l'application, onglet **Données → Script d'insertion SQL**, puis exécuter `reefer_data.sql` dans SSMS.

## 2. Rapport Power BI (le plus rapide)
*Obtenir les données → SQL Server → `ReeferTwin`* et cocher :
`dw.FactEvent`, `dw.FactStageDuration`, `dw.DimContainer`, `dw.DimDepartment`, `dw.DimEventType`, `dw.DimLocation`, `dw.DimDate`, `dw.ContainerCurrentState`.

Relations (vue Modèle) :

| Depuis | Vers | Clé |
|---|---|---|
| FactEvent | DimContainer | ContainerId |
| FactEvent | DimDepartment | DepartmentCode |
| FactEvent | DimEventType | EventTypeCode |
| FactEvent | DimLocation | LocationCode |
| FactEvent | DimDate | DateKey |
| FactStageDuration | DimContainer | ContainerId |
| FactStageDuration | DimDate | DateKey |

Sans SQL Server : importer directement `reefer_events.csv` et `reefer_containers.csv` (séparateur `;`, virgule décimale).

### Mesures DAX
```DAX
Nb scans = COUNTROWS ( FactEvent )

Nb conteneurs = DISTINCTCOUNT ( FactEvent[ContainerId] )

Temp moyenne = AVERAGE ( FactEvent[TemperatureC] )

Taux hors tolérance =
DIVIDE (
    CALCULATE ( COUNTROWS ( FactEvent ), FactEvent[HorsTolerance] = 1 ),
    CALCULATE ( COUNTROWS ( FactEvent ), NOT ISBLANK ( FactEvent[HorsTolerance] ) )
)

Plombs non conformes = CALCULATE ( COUNTROWS ( FactEvent ), FactEvent[PlombNonConforme] = 1 )

Durée moyenne étape (h) = DIVIDE ( AVERAGE ( FactStageDuration[DureeMinutes] ), 60 )

Délai déchargement → train (h) =
AVERAGEX (
    VALUES ( DimContainer[ContainerId] ),
    VAR d = CALCULATE ( MIN ( FactEvent[EventTs] ), FactEvent[EventTypeCode] = "DECHARGE" )
    VAR p = CALCULATE ( MIN ( FactEvent[EventTs] ), FactEvent[EventTypeCode] = "DEPART" )
    RETURN IF ( NOT ISBLANK ( d ) && NOT ISBLANK ( p ), DATEDIFF ( d, p, MINUTE ) / 60 )
)

Conteneurs en alerte = CALCULATE ( COUNTROWS ( ContainerCurrentState ), ContainerCurrentState[AlerteTemperature] = 1 )
```

### Pages conseillées
1. **Vue direction** : cartes (délai moyen, taux hors tolérance, conteneurs en alerte), courbe du délai par semaine.
2. **Goulots d'étranglement** : histogramme `Durée moyenne étape (h)` par `FromStage`.
3. **Chaîne du froid** : courbe `Temp moyenne` par heure, segment par conteneur et régime de froid.
4. **Services** : `Nb scans` par département et par jour (qui travaille, qui oublie de scanner).

## 3. Cube SSAS multidimensionnel (projets `ProjetMultidimensionnel1/2`)
Dans Visual Studio (extension *Analysis Services Projects*) :
1. **Sources de données** → nouvelle source → SQL Server, base `ReeferTwin`.
2. **Vues de source de données** → ajouter les 8 vues `dw.*`. Les vues n'ont pas de clé : définir la *clé logique* de chaque dimension (`ContainerId`, `DepartmentCode`, `EventTypeCode`, `LocationCode`, `DateKey`) et `EventId` pour `FactEvent`, puis tracer les relations du tableau ci-dessus.
3. **Dimensions** : Conteneur (hiérarchie *Régime de froid → Cargaison → Conteneur*, attribut Client), Département, Type d'événement (hiérarchie *Famille → Étape*, tri par `StageOrder`), Lieu, Date (hiérarchie *Année → Trimestre → Mois → Jour*).
4. **Cube** : groupes de mesures `FactEvent` (NbEvenements somme, TemperatureC moyenne via somme + nombre, HorsTolerance somme, PlombNonConforme somme) et `FactStageDuration` (DureeMinutes somme et nombre).
5. Membre calculé MDX :
   ```MDX
   CREATE MEMBER CURRENTCUBE.[Measures].[Duree moyenne (h)] AS
     IIF([Measures].[Fact Stage Duration Nombre] = 0, NULL,
         [Measures].[Duree Minutes] / [Measures].[Fact Stage Duration Nombre] / 60),
     FORMAT_STRING = "#,0.0";
   ```
6. Déployer, traiter, puis se connecter depuis Excel ou Power BI (*Analysis Services*, mode connexion directe).
