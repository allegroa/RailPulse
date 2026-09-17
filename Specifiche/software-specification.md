# Specifiche del Software - RailPulse (WebOne Platform)

Questo documento descrive le specifiche tecniche, l'architettura dei moduli e il flusso dei dati dell'intera piattaforma integrata **RailPulse / WebOne**.

---

## 1. Architettura di Sistema di Alto Livello

RailPulse adotta un'architettura **modulare orientata ai servizi (Service-Oriented Modular Architecture)**, composta da un'applicazione centrale (WebOne) affiancata da microservizi di configurazione e moduli di diagnostica ferroviaria specialistica (TGM, TQI, RailProfile, Taipei Scaffold, Maintenance).

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT (BROWSER)                                 |
|               React 19 + Vite 6 Single Page Application (Porta 5173)              |
|        UI: Dashboard, Projects, Visualizer, RailProfile, TGM, TQI, CFG, MNT       |
+-----------------------------------------------------------------------------------+
             |                                              |
      REST / JSON (Porta 5000)                       REST / JSON (Porta 5002)
             |                                              |
             v                                              v
+-----------------------------+               +-------------------------------------+
|    WebOne Backend (Express) |               | GenConfig Service (Express)         |
|-----------------------------|               |-------------------------------------|
| - Auth & Multi-tenant Admin |               | - Sistema Preferenze / i18n         |
| - TGM Module (Port 5000)    |               | - Linee & Binari (lines.json)       |
| - TQI Engine (/api/tqi)     |               | - Import GIS (KML / XML / Shp)      |
| - Maintenance API           |               | - Operatori & Tipologie Intervento  |
| - Taipei Scaffold API       |               +-------------------------------------+
| - RailProfile API           |                                 |
| - IMAP Email Polling Service|                                 |
+-----------------------------+                                 |
             |                                                  |
             +--------------------+-----------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------------------+
|                               PERSISTENZA IBRIDA                                  |
|-----------------------------------------------------------------------------------|
| 1. DATABASE/ Relazionale: Prisma ORM (Client, User, Product, Group, GroupUser)    |
| 2. DATABASE/ Centralizzato JSON: config_db.json, lines.json, station.json,        |
|    maintenance_db.json, Taipei/stations.json, TGM/ (Sessioni CSV & log)           |
| 3. DATABASE/ SQLite: DATABASE/RP/railprofile.db (Sessioni usura rotaia)           |
| 4. Filesystem: uploads/ (Archiviazione file gerarchica multi-tenant)              |
+-----------------------------------------------------------------------------------+
```

### Servizi e Stack Tecnologico a Runtime

| Servizio | Stack Tecnologico | Porta | Ruolo |
| :--- | :--- | :--- | :--- |
| **WebOne Frontend** | React 19, Vite 6, React Router 7, TailwindCSS, Chart.js, Leaflet, D3 / xyflow | `5173` | Interfaccia utente unificata per tutti i moduli diagnostici e operativi. |
| **WebOne Backend** | Node.js (v20+), Express 5, Prisma Client, Multer, Better-SQLite3, IMAP | `5000` | REST API centrale, autenticazione JWT, business logic dei moduli TGM, TQI, MNT, Taipei, RP. |
| **GenConfig Backend** | Node.js (v20+), Express 4 (ES Modules), XML2JS, Multer | `5002` | Microservizio per la gestione centralizzata di linee ferroviarie, file GIS, anagrafiche operatori. |
| **Start Server Manager** | Python / Tkinter GUI & C++ orchestrator (`start_server/`) | Desktop GUI | Gestore del ciclo di vita dei processi su Windows, previene processi orfani o conflitti di porta. |

---

## 2. Moduli Funzionali e Rotte Applicative

### 2.1 Core Platform & Multi-Tenancy
- **Autenticazione e Ruoli**: Autenticazione JWT con ruoli gerarchici (`superadmin`, `admin`, `cliente`).
- **File Manager Multi-Tenant**: Navigazione e caricamento gerarchico speculare a database:
  `/uploads/{clientFolder}/{projectSlug}/{systemSlug}/{moduleCode}/`
  con suddivisione per cartelle standard `config/`, `manuals/`, `upload/`.
- **Rotte WebOne Backend**:
  - `POST /api/auth/login`, `GET /api/auth/profile`
  - `/api/admin/users`, `/api/admin/groups`, `/api/admin/clients`, `/api/admin/settings`
  - `/api/products` (CRUD prodotti e sistemi)
  - `/api/files` (Browser e download file con rispetto delle autorizzazioni)

### 2.2 TGM (Track Geometry Measurement)
- **Scopo**: Acquisizione, importazione e analisi interattiva della geometria del binario (scartamento, allineamento, livello longitudinale, sghembo, sopraelevazione).
- **Importazione Sessioni**:
  - Drag & drop multi-cartella o file compressi `.zip` e `.rar`.
  - Elaborazione sequenziale con rilevamento duplicati a livello di filesystem in `DATABASE/TGM/`.
  - Estrazione automatica chilometraggi e codice stazione; popolamento automatico di `DATABASE/station.json` e associazione con `DATABASE/lines.json`.
  - **Servizio Email Background**: Polling IMAP schedulato configurabile per il download automatico e decompressione degli archivi di rilievo allegati alle email.
- **Rotte Backend (Montate sotto `/api`)**:
  - `GET /api/tgm/sessions` ?" Elenco sessioni TGM caricate
  - `POST /api/tgm/import` ?" Upload e importazione archivio/cartella sessione
  - `GET /api/tgm/stations` ?" Elenco stazioni rilevate con coordinate chilometriche
  - `POST /api/tgm/stations` ?" Aggiornamento metadati stazione (nome, kmStart, kmEnd, linea, colore)
  - `DELETE /api/tgm/stations/:code` ?" Rimozione stazione

### 2.3 TQI (Track Quality Index)
- **Scopo**: Calcolo dell'indice di qualità del binario basato su deviazione standard ($\sigma$) secondo la formulazione standard:
  $$TQI = \sum_{k=1}^{7} \sigma_k$$
  calcolato su finestre spaziali da 200 metri a passo 0.25m sui 7 parametri geometrici (Allineamento Sinistro/Destro, Livello Longitudinale Sinistro/Destro, Scartamento, Sghembo, Sopraelevazione).
- **Soglie e Alerting**:
  - Soglia fissa rettilineo/curva (10.75).
  - Soglia statistica adattiva ($\bar{x} + 3\sigma$).
  - Identificazione sezioni critiche chilometriche (es. Beitou-Fuxinggang 111k+239m).
- **Integrazione**:
  - Backend in `TQI/backend/routes/tqi.routes.js`, montato dinamicamente sotto `/api/tqi`.
  - Frontend dedicato in `TQI/frontend/views/TqiDashboard.jsx` accessibile alla rotta `/projects/tqi` con grafici di trend (`TqiTrendChart`), mappe termiche (`TqiHeatmap`), tabella anomalie (`TqiAlertTable`) e scomposizione $\sigma$ (`TqiSigmaBreakdown`).

### 2.4 General Configuration (`general-configuration_web`)
- **Scopo**: Gestione e distribuzione centralizzata delle configurazioni comuni a tutti i moduli.
- **FunzionalitA**:
  - Lingua attiva e supporto i18n (Italiano, Inglese, Cinese Tradizionale, Cinese Semplificato).
  - Linee Ferroviarie & Binari (CRUD linee con codice, colore, intervallo chilometrico con precisione 3 decimali `00.000` e binari).
  - Import e gestione file GIS (Shapefile, KML, XML infrastrutturali salvati in `DATABASE/GIS/`).
  - Anagrafica globale Ditte / Appaltatori / Operatori di manutenzione.
  - Tipologie di intervento manutentivo con associazione codici colore HEX e simboli standard.
- **Rotte GenConfig (Porta 5002)**:
  - `GET /api/config`, `POST /api/config`
  - `GET /api/lines`, `POST /api/lines`, `DELETE /api/lines/:id`
  - `POST /api/gis/upload`
  - `GET /api/operators`, `POST /api/operators`
  - `GET /api/task-types`, `POST /api/task-types`

### 2.5 Manutenzione Ferroviaria (`maintenance-web` / `/maintenance`)
- **Scopo**: Registro storico e pianificazione degli interventi di manutenzione dell'infrastruttura (rincalzatura, molatura, sostituzione rotaia, ecc.).
- **Persistenza**: File JSON globale `DATABASE/maintenance_db.json`.
- **FunzionalitA**:
  - Inserimento interventi con validazione chilometrica (`startKm <= endKm`).
  - Filtri per linea, binario, tipologia intervento, data e intersezione chilometrica.
  - Caricamento allegati e report di intervento in `/uploads/maintenance/`.
  - Predisposizione per la sovrapposizione visiva degli interventi (simbologie e colori) sui grafici dei parametri geometrici.
- **Rotte WebOne Backend**:
  - `GET /api/maintenance`, `POST /api/maintenance`
  - `POST /api/maintenance/upload` (Multer disk storage)

### 2.6 Taipei Metro Scaffold (`TaipeiScaffold` / `/taipei`)
- **Scopo**: Visualizzazione e modifica interattiva della topologia della rete metropolitana di Taipei (Linee R, G, BL, O, BR, nodi stazione e scambi).
- **Architettura**: Decoupling totale client-server basato su D3.js.
- **Persistenza**: Singola fonte di veritA `DATABASE/Taipei/stations.json`.
- **Rotte WebOne Backend**:
  - `GET /api/taipei/stations` ?" Restituisce i nodi e le coordinate ufficiali
  - `POST /api/taipei/save-station` ?" Persiste spostamenti X/Y e variazioni metadati

### 2.7 RailProfile (`/railprofile`)
- **Scopo**: Analisi dell'usura del profilo della rotaia a confronto con profili teorici e tolleranze conformi alla normativa EN 13231-3.
- **Persistenza**: Database SQLite locale `DATABASE/RP/railprofile.db`.

### 2.8 Database View (`/files`)
- **Scopo**: Vista aggregata multi-sistema che raggruppa le acquisizioni (RP e TGM) identificando automaticamente le sessioni che condividono la stessa tratta (stessa stazione iniziale e stessa direzione Up/Down).
- Include preview topologica a grafo della rete ferroviaria.

---

## 3. Strato Dati e Persistenza

La piattaforma combina tre livelli di persistenza armonizzati:

1. **Database Relazionale (MySQL / Prisma ORM)**:
   - Modelli: `User`, `Client`, `Product`, `Group`, `GroupUser`.
   - Utilizzato per il controllo accessi, l'anagrafica clienti e la profilazione multi-tenant.
2. **Database Centralizzato JSON (`DATABASE/`)**:
   - `DATABASE/config_db.json`: Preferenze di sistema, lingua attiva, data storage location.
   - `DATABASE/lines.json`: Mappatura anagrafica linee e binari.
   - `DATABASE/station.json`: Registro stazioni e scambi (codice, nome, kmStart, kmEnd, linea, colore).
   - `DATABASE/maintenance_db.json`: Archivio cronologico degli interventi di manutenzione.
   - `DATABASE/Taipei/stations.json`: Coordinate e metadati topologici nodi Taipei Metro.
   - `DATABASE/TGM/`: Directory dati delle sessioni geometriche importate.
   - `DATABASE/GIS/`: File cartografici KML/XML/Shapefile.
3. **Database SQLite**:
   - `DATABASE/RP/railprofile.db`: Metadati e campioni di usura profilo rotaia.

---

## 4. ModalitA di Avvio e Controllo Processi

L'infrastruttura puA essere avviata tramite due modalitA:

1. **Start Server Manager GUI**:
   - Eseguibile standalone `start_server/start_server_manager.exe` (o script Python `start_server_manager.py`).
   - Monitora e gestisce in tempo reale le porte 5000 (Backend), 5002 (GenConfig), 5173 (Frontend).
   - Gestisce profili di esecuzione (ADTS e RMT Home).
2. **Script Batch Diretti**:
   - `start_servers_adts.bat`: Avvia backend (5000), gen-config (5002) e frontend (5173) in finestre separate.
   - `start_servers_rmt_home.bat`: Ottimizzato per ambiente locale con comando `npm.cmd`.