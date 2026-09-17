# Struttura delle Directory e dei Moduli - RailPulse / WebOne

Questo documento descrive l'organizzazione delle cartelle e dei moduli del repository **RailPulse**, con l'architettura dei micro-moduli e la persistenza dei dati.

---

## 1. Struttura Generale del Workspace

```
c:\Software\RailPulse\
├── WebOne/
│   ├── backend_webbone/              # Backend centrale Node.js + Express 5 (Porta 5000)
│   │   ├── prisma/                   # Schema relazionale Prisma e seed script
│   │   ├── public/taipei/            # Applicazione statica D3 per Taipei Metro
│   │   ├── src/
│   │   │   ├── controllers/          # Logica di business (Auth, TGM, Files, MNT, RP)
│   │   │   ├── routes/               # Endpoints REST (auth, tgm, files, maintenance, taipei, ecc.)
│   │   │   └── app.js                # Inizializzazione Express e mount dinamico rotte
│   │   └── server.js                 # Server HTTP e schedulatore polling email IMAP
│   └── frontend_webbone/             # Frontend SPA React 19 + Vite 6 (Porta 5173)
│       └── src/
│           ├── components/           # Componenti condivisi (Sidebar, Layout, Skeletons)
│           ├── pages/                # Viste di pagina (Dashboard, TGM, CFG, MNT, Visualizer, RP, Taipei)
│           └── App.jsx               # Routing principale dell'applicazione
├── general-configuration_web/        # Microservizio configurazioni comuni (Porta 5002)
│   ├── server.js                     # Server Express per GIS, linee, operatori, task types
│   └── package.json
├── TQI/                              # Modulo autonomo Track Quality Index
│   ├── backend/                      # Engine analitico TQI (formule, sigma, soglie, CSV parser)
│   │   ├── routes/tqi.routes.js      # Rotte TQI montate dal backend principale in /api/tqi
│   │   └── utils/tqi.js              # Algoritmi matematici TQI (7 parametri su 200m)
│   └── frontend/                     # Componenti visuali TQI
│       ├── components/               # TqiTrendChart, TqiHeatmap, TqiAlertTable, TqiSigmaBreakdown
│       └── views/TqiDashboard.jsx    # Dashboard integrata in WebOne (/projects/tqi)
├── maintenance-web/                  # Risorse e documentazione specifica del modulo manutenzione
│   └── database/                     # Backup locale schema manutenzione
├── TaipeiScaffold/                   # Risorse e documentazione della topologia Taipei Metro
├── track_web-main/                   # Sorgenti e configurazioni TGM (track geometry)
│   └── backend/configuration/        # config.json con parametri email e sistema TGM
├── start_server/                     # Orchestratore desktop multipiattaforma
│   ├── start_server_manager.py       # GUI Python/Tkinter per gestione processi e porte
│   ├── start_server_manager.exe      # Eseguibile compilato standalone
│   └── ss_specifiche.md              # Specifiche tecniche del server manager
├── DATABASE/                         # Hub dati centralizzato condiviso
│   ├── config_db.json                # Configurazione globale e preferenze di sistema
│   ├── lines.json                    # Anagrafica globale linee e binari
│   ├── station.json                  # Registro unificato stazioni e scambi
│   ├── maintenance_db.json           # Registro interventi di manutenzione
│   ├── GIS/                          # File cartografici KML, XML, Shapefile
│   ├── Taipei/stations.json          # Singola source of truth topologia metro Taipei
│   ├── TGM/                          # Directory sessioni geometriche e log di importazione
│   └── RP/railprofile.db             # Database SQLite usura profilo rotaia
├── Specifiche/                       # Specifiche tecniche, requisiti e piani di test
├── docs/                             # Normative (es. EN 13231-3), guide e documentazione
├── rules.md                          # Regole di condotta AI, protocolli e requisiti vincolanti
├── .agent_specs_log.md               # Log permanente delle modifiche tecniche e architetturali
└── start_servers_adts.bat / start_servers_rmt_home.bat # Script di avvio rapido
```

---

## 2. Struttura dei Moduli Filesystem Speculare

La cartella di archiviazione file del backend (`uploads/`) adotta un partizionamento speculare alla multi-tenancy:

```
uploads/
├── {clientFolder}/
│   └── {projectSlug}/
│       └── {systemSlug}/
│           └── {moduleCode}/
│               ├── config/           # Configurazioni e tolleranze per il modulo
│               ├── manuals/          # Manuali d'uso e guide
│               └── upload/           # Dati effettivi caricati
└── maintenance/                      # Allegati e documenti degli interventi di manutenzione
```

I percorsi fisici non sono mai iniettati arbitrariamente dal client ma verificati e risolti rigorosamente lato server a partire dal profilo autenticato.
