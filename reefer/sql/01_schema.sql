/* =====================================================================
   Reefer Twin — base opérationnelle (OLTP) + entrepôt (étoile) + KPI
   SQL Server 2016+ (T-SQL). Ordre d'exécution :
     1. ce fichier
     2. reefer_data.sql exporté depuis l'onglet « Données » de l'application
   Schémas : ops = saisie des scans (alimentée par l'API / l'application)
             dw  = vues en étoile pour SSAS (cube) et Power BI
   ===================================================================== */

IF DB_ID('ReeferTwin') IS NULL CREATE DATABASE ReeferTwin;
GO
USE ReeferTwin;
GO
IF SCHEMA_ID('ops') IS NULL EXEC('CREATE SCHEMA ops');
GO
IF SCHEMA_ID('dw') IS NULL EXEC('CREATE SCHEMA dw');
GO

/* ---------- Référentiels ---------- */

CREATE TABLE ops.Department (
    DepartmentCode VARCHAR(20)  NOT NULL PRIMARY KEY,
    DepartmentName NVARCHAR(60) NOT NULL
);
INSERT INTO ops.Department VALUES
 ('LOGISTICS', N'Département logistique'),
 ('PORT',      N'Port (terminal)'),
 ('CUSTOMS',   N'Douane'),
 ('RAIL',      N'Département ferroviaire'),
 ('SALES',     N'Ventes maritimes'),
 ('CLIENT',    N'Client'),
 ('SENSOR',    N'Capteur (télémétrie)');

CREATE TABLE ops.EventType (
    EventTypeCode VARCHAR(20)  NOT NULL PRIMARY KEY,
    EventTypeName NVARCHAR(60) NOT NULL,
    StageOrder    TINYINT      NULL,          -- NULL = opération hors progression (contrôle, incident)
    OwnerDept     VARCHAR(20)  NULL REFERENCES ops.Department(DepartmentCode)
);
INSERT INTO ops.EventType VALUES
 ('ANNONCE',   N'Pré-avis navire',            0, 'LOGISTICS'),
 ('DECHARGE',  N'Déchargé du navire',         1, 'PORT'),
 ('BRANCHE',   N'Branché en zone reefer',     2, 'PORT'),
 ('DOUANE',    N'Dédouané',                   3, 'CUSTOMS'),
 ('TRANSFERT', N'Transféré au terminal rail', 4, 'LOGISTICS'),
 ('WAGON',     N'Chargé sur wagon',           5, 'RAIL'),
 ('DEPART',    N'Train parti',                6, 'RAIL'),
 ('LIVRE',     N'Livré au client',            7, 'CLIENT'),
 ('CONTROLE',  N'Contrôle de température', NULL, NULL),
 ('INCIDENT',  N'Incident signalé',        NULL, NULL);

CREATE TABLE ops.Location (
    LocationCode VARCHAR(20)  NOT NULL PRIMARY KEY,
    LocationName NVARCHAR(60) NOT NULL,
    IsPowered    BIT          NOT NULL        -- 1 = le reefer peut y être branché
);
INSERT INTO ops.Location VALUES
 ('QUAI',     N'Quai — navire',             0),
 ('REEFER',   N'Zone reefer (prises)',      1),
 ('DOUANE',   N'Zone douane / inspection',  1),
 ('NAVETTE',  N'Navette port → rail',       0),
 ('RAILTERM', N'Terminal ferroviaire',      1),
 ('ROUTE',    N'En route (wagon)',          1),
 ('CLIENT',   N'Chez le client',            1);

/* ---------- Données opérationnelles ---------- */

CREATE TABLE ops.Container (
    ContainerId  CHAR(11)      NOT NULL PRIMARY KEY,      -- ISO 6346, ex. FESU4123007
    SealId       VARCHAR(20)   NOT NULL UNIQUE,           -- n° du plomb QR
    Client       NVARCHAR(100) NOT NULL,
    Cargo        NVARCHAR(100) NOT NULL,
    SetpointC    DECIMAL(4,1)  NOT NULL,
    ToleranceC   DECIMAL(3,1)  NOT NULL CHECK (ToleranceC > 0),
    Vessel       NVARCHAR(100) NULL,
    Destination  NVARCHAR(100) NOT NULL,
    CreatedAt    DATETIME2(0)  NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Container_Iso CHECK (ContainerId LIKE '[A-Z][A-Z][A-Z][UJZ][0-9][0-9][0-9][0-9][0-9][0-9][0-9]')
);

CREATE TABLE ops.ContainerEvent (
    EventId        BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ContainerId    CHAR(11)      NOT NULL REFERENCES ops.Container(ContainerId),
    EventTs        DATETIME2(0)  NOT NULL,                -- UTC
    DepartmentCode VARCHAR(20)   NOT NULL REFERENCES ops.Department(DepartmentCode),
    EventTypeCode  VARCHAR(20)   NOT NULL REFERENCES ops.EventType(EventTypeCode),
    LocationCode   VARCHAR(20)   NULL     REFERENCES ops.Location(LocationCode),
    TemperatureC   DECIMAL(4,1)  NULL,
    SealRead       VARCHAR(20)   NULL,                    -- plomb effectivement scanné
    Operator       NVARCHAR(60)  NULL,
    Note           NVARCHAR(200) NULL
);
CREATE INDEX IX_Event_Container_Ts ON ops.ContainerEvent (ContainerId, EventTs);
CREATE INDEX IX_Event_Ts ON ops.ContainerEvent (EventTs) INCLUDE (EventTypeCode, TemperatureC);
GO

/* ---------- Entrepôt (vues en étoile pour SSAS / Power BI) ---------- */

CREATE VIEW dw.DimContainer AS
SELECT ContainerId, SealId, Client, Cargo, SetpointC, ToleranceC,
       SetpointC - ToleranceC AS MinC, SetpointC + ToleranceC AS MaxC,
       CASE WHEN SetpointC < 0 THEN N'Congelé' WHEN SetpointC < 10 THEN N'Réfrigéré' ELSE N'Tempéré' END AS RegimeFroid,
       Vessel, Destination, CreatedAt
FROM ops.Container;
GO
CREATE VIEW dw.DimDepartment AS SELECT DepartmentCode, DepartmentName FROM ops.Department;
GO
CREATE VIEW dw.DimEventType AS
SELECT EventTypeCode, EventTypeName, StageOrder,
       CASE WHEN StageOrder IS NULL THEN N'Contrôle' ELSE N'Étape du transfert' END AS Famille
FROM ops.EventType;
GO
CREATE VIEW dw.DimLocation AS SELECT LocationCode, LocationName, IsPowered FROM ops.Location;
GO
-- Calendrier : de la première à la dernière date d'événement
CREATE VIEW dw.DimDate AS
WITH b AS (SELECT CAST(MIN(EventTs) AS DATE) d0, CAST(MAX(EventTs) AS DATE) d1 FROM ops.ContainerEvent),
n AS (SELECT TOP (3660) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1 AS k FROM sys.all_objects a CROSS JOIN sys.all_objects c)
SELECT CONVERT(INT, FORMAT(DATEADD(DAY, n.k, b.d0), 'yyyyMMdd')) AS DateKey,
       DATEADD(DAY, n.k, b.d0) AS [Date],
       YEAR(DATEADD(DAY, n.k, b.d0)) AS Annee,
       DATEPART(QUARTER, DATEADD(DAY, n.k, b.d0)) AS Trimestre,
       MONTH(DATEADD(DAY, n.k, b.d0)) AS Mois,
       DATEPART(ISO_WEEK, DATEADD(DAY, n.k, b.d0)) AS SemaineIso,
       DAY(DATEADD(DAY, n.k, b.d0)) AS Jour
FROM b CROSS JOIN n
WHERE DATEADD(DAY, n.k, b.d0) <= b.d1;
GO
-- Fait 1 : chaque scan / relevé
CREATE VIEW dw.FactEvent AS
SELECT e.EventId, e.ContainerId,
       CONVERT(INT, FORMAT(e.EventTs, 'yyyyMMdd')) AS DateKey,
       e.EventTs, e.DepartmentCode, e.EventTypeCode, e.LocationCode,
       e.TemperatureC,
       CASE WHEN e.TemperatureC IS NULL THEN NULL
            WHEN e.TemperatureC < c.SetpointC - c.ToleranceC OR e.TemperatureC > c.SetpointC + c.ToleranceC THEN 1 ELSE 0 END AS HorsTolerance,
       CASE WHEN e.SealRead IS NOT NULL AND e.SealRead <> c.SealId THEN 1 ELSE 0 END AS PlombNonConforme,
       1 AS NbEvenements
FROM ops.ContainerEvent e
JOIN ops.Container c ON c.ContainerId = e.ContainerId;
GO
-- Fait 2 : durée de chaque étape (temps entre une étape et la suivante)
CREATE VIEW dw.FactStageDuration AS
WITH s AS (
  SELECT e.ContainerId, t.StageOrder, e.EventTypeCode, MIN(e.EventTs) AS StartTs
  FROM ops.ContainerEvent e JOIN ops.EventType t ON t.EventTypeCode = e.EventTypeCode
  WHERE t.StageOrder IS NOT NULL
  GROUP BY e.ContainerId, t.StageOrder, e.EventTypeCode
)
SELECT s.ContainerId, s.EventTypeCode AS FromStage,
       LEAD(s.EventTypeCode) OVER (PARTITION BY s.ContainerId ORDER BY s.StageOrder) AS ToStage,
       CONVERT(INT, FORMAT(s.StartTs, 'yyyyMMdd')) AS DateKey,
       s.StartTs,
       DATEDIFF(MINUTE, s.StartTs, LEAD(s.StartTs) OVER (PARTITION BY s.ContainerId ORDER BY s.StageOrder)) AS DureeMinutes
FROM s;
GO

/* ---------- Requêtes KPI (prêtes à l'emploi) ---------- */

-- État courant de chaque conteneur (jumeau numérique côté base)
CREATE VIEW dw.ContainerCurrentState AS
SELECT c.ContainerId, c.Client, c.Cargo, c.SetpointC, c.ToleranceC,
       st.EventTypeName AS EtapeActuelle, st.StageOrder, st.StageTs,
       lt.TemperatureC AS DerniereTemperature, lt.EventTs AS DerniereTemperatureTs,
       CASE WHEN lt.TemperatureC NOT BETWEEN c.SetpointC - c.ToleranceC AND c.SetpointC + c.ToleranceC THEN 1 ELSE 0 END AS AlerteTemperature,
       DATEDIFF(MINUTE, st.StageTs, SYSUTCDATETIME()) AS MinutesDansEtape
FROM ops.Container c
OUTER APPLY (SELECT TOP 1 t.EventTypeName, t.StageOrder, e.EventTs AS StageTs
             FROM ops.ContainerEvent e JOIN ops.EventType t ON t.EventTypeCode = e.EventTypeCode
             WHERE e.ContainerId = c.ContainerId AND t.StageOrder IS NOT NULL
             ORDER BY t.StageOrder DESC, e.EventTs DESC) st
OUTER APPLY (SELECT TOP 1 e.TemperatureC, e.EventTs
             FROM ops.ContainerEvent e
             WHERE e.ContainerId = c.ContainerId AND e.TemperatureC IS NOT NULL
             ORDER BY e.EventTs DESC) lt;
GO

/* Exemples :
-- 1) Délai moyen déchargement → départ du train (heures)
SELECT AVG(DATEDIFF(MINUTE, d.EventTs, p.EventTs)) / 60.0 AS DelaiMoyenH
FROM ops.ContainerEvent d
JOIN ops.ContainerEvent p ON p.ContainerId = d.ContainerId AND p.EventTypeCode = 'DEPART'
WHERE d.EventTypeCode = 'DECHARGE';

-- 2) Étape la plus lente (goulot d'étranglement)
SELECT FromStage, AVG(DureeMinutes) / 60.0 AS MoyenneH, COUNT(*) AS Nb
FROM dw.FactStageDuration WHERE DureeMinutes IS NOT NULL
GROUP BY FromStage ORDER BY MoyenneH DESC;

-- 3) Taux de relevés hors tolérance par client
SELECT c.Client, AVG(CAST(f.HorsTolerance AS FLOAT)) AS TauxHorsTolerance
FROM dw.FactEvent f JOIN dw.DimContainer c ON c.ContainerId = f.ContainerId
WHERE f.HorsTolerance IS NOT NULL GROUP BY c.Client ORDER BY 2 DESC;

-- 4) Alertes en cours
SELECT * FROM dw.ContainerCurrentState
WHERE AlerteTemperature = 1 OR (StageOrder = 1 AND MinutesDansEtape > 60) OR (StageOrder < 6 AND MinutesDansEtape > 1440);
*/
