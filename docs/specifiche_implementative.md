# Specifiche Implementative — Progetto WebOne / RAMSYS

> **Scopo**: Questo documento contiene TUTTE le specifiche implementative del progetto, estratte dall'analisi maniacale dell'intero codice sorgente (52 file) e delle 59 richieste utente. È sufficiente a **ricostruire il progetto da zero** su un qualsiasi PC.

> [!IMPORTANT]
> Versione del documento: 2026-06-09. Repository di riferimento: `https://github.com/ADTSolution/WebOne.git`
> Team: ADT Solution — Alberto Baqqari

---

## INDICE

1. [Visione e Obiettivi](#1-visione-e-obiettivi)
2. [Stack Tecnologico](#2-stack-tecnologico)
3. [Struttura Directory](#3-struttura-directory)
4. [Schema Database (Prisma)](#4-schema-database-prisma)
5. [Backend — Server e Configurazione](#5-backend--server-e-configurazione)
6. [Backend — API Endpoints Completi](#6-backend--api-endpoints-completi)
7. [Backend — Middleware](#7-backend--middleware)
8. [Backend — Controller: Logica di Business](#8-backend--controller-logica-di-business)
9. [Frontend — Configurazione Build](#9-frontend--configurazione-build)
10. [Frontend — Routing e Layout](#10-frontend--routing-e-layout)
11. [Frontend — Componenti Condivisi](#11-frontend--componenti-condivisi)
12. [Frontend — Hooks Personalizzati](#12-frontend--hooks-personalizzati)
13. [Frontend — Utility e API Client](#13-frontend--utility-e-api-client)
14. [Frontend — Pagine Admin](#14-frontend--pagine-admin)
15. [Frontend — Pagine Client (Files e Cartelle)](#15-frontend--pagine-client-files-e-cartelle)
16. [Frontend — Data Visualizer (il cuore del sistema)](#16-frontend--data-visualizer)
17. [Formato Binario .geo](#17-formato-binario-geo)
18. [Specifiche Grafici e Chart.js](#18-specifiche-grafici-e-chartjs)
19. [Singolarità Ferroviarie](#19-singolarità-ferroviarie)
20. [Tolleranze e Report Difetti (EN 13231-3)](#20-tolleranze-e-report-difetti-en-13231-3)
21. [Integrazione Google Maps](#21-integrazione-google-maps)
22. [Internazionalizzazione (i18n)](#22-internazionalizzazione-i18n)
23. [Upload Resumable (Chunked)](#23-upload-resumable-chunked)
24. [Docker e Deployment](#24-docker-e-deployment)
25. [Sicurezza e Requisiti Normativi](#25-sicurezza-e-requisiti-normativi)
26. [Bug Noti e Problemi di Sicurezza](#26-bug-noti-e-problemi-di-sicurezza)
27. [Regole di Sviluppo e Workflow](#27-regole-di-sviluppo-e-workflow)

---

## 1. Visione e Obiettivi

**WebOne** (nome progetto interno: **RAMSYS**, codice: **P2604**) è un'interfaccia web per la gestione, analisi e visualizzazione di dati di geometria ferroviaria. Serve sia per inserire dati verso il cliente (manuali, configurazioni) sia per consentire al cliente di caricare e analizzare i propri dati di rilievo.

### 1.1 Gerarchia Dati (CRITICA)

```
Company (Azienda/Cliente)
  └── Project (Progetto)
        └── System (Sistema) ← ogni sistema opera su una linea ferroviaria dedicata
              └── Files (dati .csv, .geo, manuali, configurazioni)
```

- Un **Cliente** può avere diversi **Progetti**
- Ogni **Progetto** può avere uno o più **Sistemi**
- Ogni **Sistema** ha il proprio set di file
- Ogni cliente e ogni sistema funzionano su una **linea ferroviaria dedicata**

### 1.2 Utenti Target
- **SuperAdmin**: gestione completa della piattaforma
- **Admin**: gestione utenti/gruppi all'interno della propria azienda
- **Cliente**: accesso ai propri file, visualizzazione grafici, analisi dati

---

## 2. Stack Tecnologico

### Backend

| Tecnologia | Versione | Scopo |
|------------|----------|-------|
| Node.js | 18+ | Runtime |
| Express | ^5.1.0 | Framework HTTP |
| Prisma | ^6.8.2 | ORM |
| MySQL | (da .env) | Database (schema `mysql`) |
| bcryptjs | ^3.0.3 | Hashing password |
| jsonwebtoken | ^9.0.2 | Autenticazione JWT |
| multer | ^2.0.2 | Upload file |
| cors | ^2.8.5 | Cross-Origin |
| dotenv | ^16.5.0 | Variabili ambiente |
| nodemon | ^3.1.10 | Dev auto-reload |

### Frontend

| Tecnologia | Versione | Scopo |
|------------|----------|-------|
| React | ^19.1.0 | UI framework |
| Vite | ^6.3.5 | Build tool |
| TailwindCSS | ^3.3.3 | Styling |
| React Router | ^7.6.1 | Routing |
| axios | ^1.9.0 | HTTP client |
| Chart.js | ^4.5.0 | Grafici |
| react-chartjs-2 | ^5.3.0 | React wrapper per Chart.js |
| chartjs-plugin-zoom | ^2.2.0 | Zoom sui grafici |
| chartjs-plugin-annotation | ^3.1.0 | Annotazioni (singolarità) |
| PapaParse | ^5.5.3 | Parser CSV |
| i18next | ^26.3.1 | Internazionalizzazione |
| react-i18next | ^17.0.8 | React binding per i18next |
| i18next-browser-languagedetector | ^8.2.1 | Rilevamento lingua |
| jwt-decode | ^4.0.0 | Decodifica JWT client-side |

### Infrastruttura

| Tecnologia | Versione | Scopo |
|------------|----------|-------|
| Docker | — | Containerizzazione |
| Docker Compose | — | Orchestrazione |
| PostgreSQL | 15 (docker) | Database in produzione |
| Portainer | — | GUI gestione container |

---

## 3. Struttura Directory

```
WebOne/
├── docker-compose.yml
├── README.md
├── package.json                    # root (minimale)
├── start_backend.bat
│
├── backend_webbone/
│   ├── .env                        # DATABASE_URL, PORT, JWT_SECRET, UPLOAD_DIR
│   ├── server.js                   # Entry point (9 righe)
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma           # 6 modelli: Client, User, Product, File, Group, GroupUser
│   │   └── seed.js                 # Crea superadmin + root client + admin
│   ├── src/
│   │   ├── app.js                  # Express config, CORS, route mounting
│   │   ├── controllers/
│   │   │   ├── auth.controller.js      # register, login, getProfile, getAllProducts
│   │   │   ├── client.controller.js    # create, list, delete
│   │   │   ├── file.controller.js      # 13 funzioni (il più grande: 502 righe)
│   │   │   ├── group.controller.js     # create, list, addMembers, removeMember
│   │   │   ├── metrics.controller.js   # getMetrics (dashboard counts)
│   │   │   ├── product.controller.js   # CRUD completo
│   │   │   ├── settings.controller.js  # getSettings, updateSettings (file JSON)
│   │   │   └── user.controller.js      # create, list, deleteUser, resetPassword, changeRole
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js       # verifyToken (JWT Bearer)
│   │   │   └── role.middleware.js       # requireRole(), restrictToOwnClient()
│   │   ├── routes/
│   │   │   ├── admin.routes.js         # 14 route protette
│   │   │   ├── auth.routes.js          # 3 route (register, login, me)
│   │   │   ├── files.routes.js         # 12 route con wildcard *folder
│   │   │   └── product.routes.js       # 5 route CRUD
│   │   └── utils/
│   │       └── roles.js                # SUPER, ADMIN, CLIENT
│   ├── upload/                         # File storage locale
│   └── uploads/                        # Storage per cliente
│       ├── NobleRail/
│       │   ├── config/
│       │   ├── manuals/
│       │   └── upload/
│       └── Taipei Metro/
│           ├── Corrugation/
│           ├── Track Geometry/         # contiene file .geo di test
│           └── Tunnel Scan/
│
├── frontend_webbone/
│   ├── .env                        # VITE_API_URL
│   ├── index.html                  # Entry HTML, Bootstrap Icons CDN
│   ├── Dockerfile                  # Multi-stage: build + preview
│   ├── package.json
│   ├── vite.config.js              # base: /webone/, proxy /api → :5000
│   ├── tailwind.config.js          # Custom blue.950: #0a1929
│   ├── postcss.config.js
│   ├── eslint.config.js
│   └── src/
│       ├── main.jsx                # React entry, BrowserRouter basename=/webone
│       ├── App.jsx                 # Routing table (17 route)
│       ├── i18n.js                 # IT/EN/ZH con chiavi traduzione
│       ├── index.css               # Tailwind directives
│       ├── styles/
│       │   └── fade-transition.css # Animazioni pagina
│       ├── components/
│       │   ├── Sidebar.jsx         # Navigazione laterale, profilo, logout
│       │   ├── LayoutWithSidebar.jsx  # Layout 2 colonne
│       │   ├── PageTransition.jsx     # Animazione transizione pagine
│       │   ├── ProtectedRoute.jsx     # Guard autenticazione + ruoli
│       │   └── SkeletonBlock.jsx      # Placeholder caricamento
│       ├── hooks/
│       │   ├── useProfile.js       # GET /api/auth/me
│       │   └── useFolders.js       # GET /api/files/available
│       ├── utils/
│       │   ├── api.js              # Axios instance con interceptor 401
│       │   ├── auth.js             # logout(), getToken()
│       │   ├── adminApi.js         # 15 funzioni API admin
│       │   ├── geoParser.js        # Parser binario .geo
│       │   └── resumableUpload.js  # Upload chunked
│       └── pages/
│           ├── LoginPage.jsx
│           ├── Dashboard.jsx
│           ├── ClientFilesPage.jsx     # Navigazione Project/System
│           ├── ClientFolderPage.jsx    # Gestione file nella cartella
│           ├── DataVizualizer.jsx      # CUORE: ~1060 righe
│           ├── AdminUsersPage.jsx      # Gestione utenti
│           ├── AdminClientsPage.jsx    # Gestione aziende
│           ├── AdminGroupsPage.jsx     # Gestione gruppi
│           ├── AdminProductsPage.jsx   # Gestione prodotti
│           ├── AdminSettingsPage.jsx   # Impostazioni file storage
│           ├── ProductsPage.jsx        # Lista prodotti
│           └── ProductDetail.jsx       # Dettaglio prodotto
│
└── docs/                           # Normative e documentazione
    ├── 00013231.PDF
    ├── DIN EN 13231-3 English Version.pdf
    ├── EN 13231-3 - 2003.pdf
    ├── EN 13231-3_2006 (Eng).pdf
    ├── EN 13231-3_2006_ENG.pdf
    ├── EN_13231-3_(E).pdf
    ├── EN_13231-3_2007_ENG.pdf
    ├── Normativa EN13231-3.pdf
    ├── prEN 13231-3.pdf
    ├── prEN13231-3.pdf
    ├── Action_plan_summary.xlsx
    ├── Issues Analysis.xlsx
    ├── MVP_Tasks_Detailed.csv.xlsx
    └── README-deploy-portainer.md
```

---

## 4. Schema Database (Prisma)

**Provider**: `mysql` (dev locale) / `postgresql` (Docker produzione)
**File**: [schema.prisma](file:///D:/004_Software/WebOne/backend_webbone/prisma/schema.prisma)

```prisma
model Client {
  id         Int       @id @default(autoincrement())
  name       String    @unique
  contact    String?
  folderName String
  users      User[]
  products   Product[]
  groups     Group[]
}

model User {
  id        Int        @id @default(autoincrement())
  name      String
  email     String     @unique
  password  String
  role      String              // "superadmin" | "admin" | "cliente"
  clientId  Int?                // null per superadmin
  client    Client?   @relation(fields: [clientId], references: [id])
  files     File[]
  groups    GroupUser[]
  createdAt DateTime  @default(now())
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  serial      String
  firmware    String?
  description String?
  clientId    Int
  client      Client   @relation(fields: [clientId], references: [id])
  files       File[]
}

model File {
  id         Int      @id @default(autoincrement())
  filename   String
  path       String
  productId  Int
  product    Product  @relation(fields: [productId], references: [id])
  uploadedBy Int
  user       User     @relation(fields: [uploadedBy], references: [id])
  createdAt  DateTime @default(now())
}

model Group {
  id       Int         @id @default(autoincrement())
  name     String
  clientId Int
  client   Client      @relation(fields: [clientId], references: [id])
  members  GroupUser[]
}

model GroupUser {
  userId  Int
  groupId Int
  user    User  @relation(fields: [userId], references: [id])
  group   Group @relation(fields: [groupId], references: [id])
  @@id([userId, groupId])
}
```

### Seed (utenti iniziali)

| Utente | Email | Password | Ruolo | Client |
|--------|-------|----------|-------|--------|
| Superadmin | `super@local` (o env `ADMIN_EMAIL`) | `StrongP@ssw0rd` (o env `ADMIN_PASSWORD`) | superadmin | nessuno |
| Admin | `admin@local` | `StrongP@ssw0rd` | admin | Root |

---

## 5. Backend — Server e Configurazione

### 5.1 Variabili d'Ambiente (.env)

```env
DATABASE_URL=mysql://root:@localhost:3306/webone
PORT=5000
JWT_SECRET=webone_secret_key_change_me
UPLOAD_DIR=./uploads
```

### 5.2 Express App ([app.js](file:///D:/004_Software/WebOne/backend_webbone/src/app.js))

**CORS Origins**: `['http://localhost:5173', 'http://localhost', 'http://127.0.0.1']`
**Methods**: `GET, POST, PUT, DELETE, OPTIONS`
**Body parser**: `express.json()`

**File Base Path** (risoluzione):
1. Se `CLIENT_FILES_BASE_PATH` è impostato → usa il valore (assoluto o relativo a CWD)
2. Altrimenti → fallback a `<project>/uploads`
3. Crea la directory con `mkdirSync({ recursive: true })`

**Route mounting**:
| Prefisso | Router |
|----------|--------|
| `/admin` | adminRoutes |
| `/api/auth` | authRoutes |
| `/api/products` | productRoutes |
| `/api/files` | filesRoutes |

**Test endpoint**: `GET /` → `'🌐 API ADTS online'`

### 5.3 Ruoli Utente

```javascript
const ROLES = {
  SUPER: 'superadmin',
  ADMIN: 'admin',
  CLIENT: 'cliente'
};
```

---

## 6. Backend — API Endpoints Completi

### 6.1 Autenticazione (`/api/auth`)

| Metodo | Path | Auth | Descrizione |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | ❌ Nessuna | Registra nuovo utente |
| `POST` | `/api/auth/login` | ❌ Nessuna | Login, restituisce JWT (scade 7gg) |
| `GET` | `/api/auth/me` | ✅ Bearer | Profilo utente corrente |

**Login payload**: `{ email, password }`
**Login response**: `{ token, user: { id, name, email, role, clientId, client } }`
**JWT payload**: `{ id, role, clientId, folderName }`

### 6.2 Admin — Clients (`/admin/clients`)

| Metodo | Path | Auth | Ruolo | Descrizione |
|--------|------|------|-------|-------------|
| `POST` | `/admin/clients` | ✅ | superadmin | Crea azienda |
| `GET` | `/admin/clients` | ✅ | superadmin | Lista aziende |
| `DELETE` | `/admin/clients/:id` | ✅ | superadmin | Elimina azienda |
| `POST` | `/admin/clients/create-folder` | ✅ | superadmin | Crea cartella fisica + 3 sottocartelle |

**create-folder** crea automaticamente: `config/`, `upload/`, `manuals/`

### 6.3 Admin — Users (`/admin/users`)

| Metodo | Path | Auth | Ruolo | Descrizione |
|--------|------|------|-------|-------------|
| `POST` | `/admin/users` | ✅ | admin, superadmin | Crea utente |
| `GET` | `/admin/users` | ✅ | tutti | Lista utenti (scoped per client) |
| `DELETE` | `/admin/users/:id` | ✅ | admin, superadmin | Elimina utente |
| `POST` | `/admin/users/:id/reset-password` | ✅ | admin, superadmin | Reset password (min 6 char) |

### 6.4 Admin — Groups (`/admin/groups`)

| Metodo | Path | Auth | Ruolo | Descrizione |
|--------|------|------|-------|-------------|
| `POST` | `/admin/groups` | ✅ | admin, cliente | Crea gruppo |
| `GET` | `/admin/groups` | ✅ | admin, cliente | Lista gruppi con membri |
| `POST` | `/admin/groups/:groupId/members` | ✅ | admin, cliente | Aggiungi membri |
| `DELETE` | `/admin/groups/:groupId/members/:userId` | ✅ | admin, cliente | Rimuovi membro |

### 6.5 Admin — Settings e Metrics

| Metodo | Path | Auth | Ruolo | Descrizione |
|--------|------|------|-------|-------------|
| `GET` | `/admin/settings/files` | ✅ | superadmin | Leggi impostazioni (password SMB mascherata) |
| `POST` | `/admin/settings/files` | ✅ | superadmin | Salva impostazioni + aggiorna env |
| `GET` | `/admin/metrics` | ✅ | superadmin | Conteggi: users, clients, products, groups |

### 6.6 Products (`/api/products`)

| Metodo | Path | Auth | Descrizione |
|--------|------|------|-------------|
| `GET` | `/api/products/` | ✅ | Lista prodotti del client |
| `POST` | `/api/products/` | ✅ | Crea prodotto (name+serial obbligatori) |
| `PUT` | `/api/products/:id` | ✅ | Aggiorna prodotto (verifica ownership) |
| `DELETE` | `/api/products/:id` | ✅ | Elimina prodotto (verifica ownership) |
| `GET` | `/api/products/:id` | ✅ | Dettaglio prodotto |

### 6.7 Files (`/api/files`) — Il più complesso

| Metodo | Path | Auth | Descrizione |
|--------|------|------|-------------|
| `GET` | `/api/files/available` | ✅ | Lista cartelle disponibili (con ?path=) |
| `POST` | `/api/files/singularities/save` | ✅ | Salva singolarità in JSON |
| `GET` | `/api/files/raw` | ✅ | Scarica file binario (?folder, ?file, ?download) |
| `GET` | `/api/files/*folder` | ✅ | Lista file nella cartella |
| `POST` | `/api/files/*folder/upload` | ✅ | Upload singolo file (multer) |
| `POST` | `/api/files/*folder/create` | ✅ | Crea sottocartella |
| `PATCH` | `/api/files/*folder/rename` | ✅ | Rinomina file |
| `DELETE` | `/api/files/*folder/:fileName` | ✅ | Elimina file |
| `POST` | `/api/files/*folder/upload/resumable/init` | ✅ | Inizializza upload chunked |
| `POST` | `/api/files/*folder/upload/resumable/upload-chunk` | ✅ | Carica singolo chunk |
| `GET` | `/api/files/*folder/upload/resumable/status` | ✅ | Stato upload resumable |
| `POST` | `/api/files/*folder/upload/resumable/complete` | ✅ | Assembla chunk in file finale |

**saveSingularities payload**: `{ folder, file, singularities }` → salva come `{filename}_db.json`

---

## 7. Backend — Middleware

### 7.1 verifyToken ([auth.middleware.js](file:///D:/004_Software/WebOne/backend_webbone/src/middlewares/auth.middleware.js))
1. Estrae token da header `Authorization: Bearer <token>`
2. Verifica con `jwt.verify(token, JWT_SECRET)`
3. Imposta `req.user = { id, role, clientId, folderName, iat, exp }`
4. Errore → `401` (token mancante) o `403` (token invalido)

### 7.2 requireRole(...roles) ([role.middleware.js](file:///D:/004_Software/WebOne/backend_webbone/src/middlewares/role.middleware.js))
- Confronta `req.user.role` (lowercase) con array di ruoli ammessi
- Errore → `403 { error: 'forbidden' }`

### 7.3 restrictToOwnClient
- Se superadmin → passa senza filtro
- Altrimenti → imposta `req.scopeClientId = req.user.clientId`
- Tutti i controller downstream usano `scopeClientId` per filtrare i dati

---

## 8. Backend — Controller: Logica di Business

### 8.1 File Controller (502 righe) — Dettagli Critici

**Struttura filesystem**:
```
BASE_PATH/
  └── {clientFolder}/           ← dal JWT (folderName del client)
        ├── config/
        ├── upload/             ← qui vanno i file di dati
        ├── manuals/
        └── {sottocartelle}/
```

**Upload resumable**:
1. `initResumable` → crea manifest JSON in `os.tmpdir()/weebone_resumable/`
2. `uploadResumableChunk` → salva chunk come `{id}.chunk.{index}` (multer memoryStorage)
3. `completeResumable` → assembla i chunk sequenzialmente con backpressure (writeStream), verifica dimensione totale, copia nella destinazione finale, pulisce i file temporanei
4. Timeout: 30 secondi per la copia finale

**Prevenzione path traversal**: `path.resolve()` verificato contro `BASE_PATH`

### 8.2 Settings Controller
- **File di configurazione**: `backend_webbone/config/filesettings.json`
- **Default**: `{ useSmb: false, basePath: "/srv/webone_files", allowPublicDownload: false }`
- Su update → aggiorna anche `process.env` runtime (SMB, basePath)

---

## 9. Frontend — Configurazione Build

### 9.1 Vite ([vite.config.js](file:///D:/004_Software/WebOne/frontend_webbone/vite.config.js))

```javascript
export default defineConfig({
  base: '/webone/',                          // ← tutti gli asset sotto /webone/
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',     // ← proxy verso il backend
        changeOrigin: true,
        secure: false
      }
    }
  },
  css: { devSourcemap: true }
});
```

### 9.2 Entry Point ([main.jsx](file:///D:/004_Software/WebOne/frontend_webbone/src/main.jsx))

```javascript
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// BrowserRouter con basename="/webone"
```

### 9.3 index.html
- CDN: Bootstrap Icons `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css`
- Favicon: `/public/Logo.png`
- Title: `Web One`

### 9.4 Tailwind
- Colore custom: `blue.950: '#0a1929'` (blu navy scuro)
- Content: `./index.html`, `./src/**/*.{js,jsx,ts,tsx}`

---

## 10. Frontend — Routing e Layout

### 10.1 Tabella Route ([App.jsx](file:///D:/004_Software/WebOne/frontend_webbone/src/App.jsx))

| Path | Componente | Protezione | Props |
|------|-----------|-----------|-------|
| `/` | `Navigate → /login` | — | — |
| `/login` | `LoginPage` | — | — |
| `/Dashboard` | `Dashboard` | autenticato | — |
| `/files` | `ClientFilesPage` | autenticato | `level="project"` |
| `/files/:project` | `ClientFilesPage` | autenticato | `level="system"` |
| `/files/:project/:system` | `ClientFolderPage` | autenticato | — |
| `/visualizer` | `DataVisualizer` | autenticato | — |
| `/visualizer/:fileId` | `DataVisualizer` | autenticato | — |
| `/products` | `ProductsPage` | autenticato | — |
| `/product/:id` | `ProductDetail` | autenticato | — |
| `/productedit` | `ProductsAdminPage` | autenticato | — |
| `/admin/users` | `AdminUsersPage` | superadmin, admin, cliente | — |
| `/admin/groups` | `AdminGroupsPage` | superadmin, admin, cliente | — |
| `/admin/clients` | `AdminClientsPage` | superadmin | — |
| `/admin/settings` | `AdminSettingsPage` | superadmin | — |

### 10.2 Layout a 2 Colonne

```
┌─────────┬──────────────────────────────────────────┐
│ Sidebar │   Main Content (con PageTransition)      │
│ w-64    │   flex-1 p-6 md:p-10 bg-slate-50       │
│ (o w-16 │                                          │
│  collas)│                                          │
└─────────┴──────────────────────────────────────────┘
```

- La sidebar è sticky (`md:sticky md:top-0 md:h-screen`)
- Può collassare (toggle tra `w-16` e `w-64`)
- Transizione pagine: slide-in da destra (`translate-x-4 → translate-x-0`, 300ms)

### 10.3 Sidebar — Link di Navigazione

**Sezione principale**:
1. `/dashboard` — Dashboard (icona chart)
2. `/files` — Project (icona cartella)
3. `/visualizer` — Visualizer (icona grafico a barre)

**Sezione admin** (solo admin/superadmin):
- `/admin/users` — Users
- `/admin/clients` — Aziende (solo superadmin)
- `/admin/settings` — Settings (solo superadmin)

**Profilo** (in fondo): Cerchio con iniziali, nome + email, pulsante Logout

---

## 11. Frontend — Componenti Condivisi

### 11.1 ProtectedRoute
- Legge `token` e `role` da localStorage
- Se manca token → redirect a `/login`
- Se `roles` specificati e ruolo non incluso → redirect a `/login`

### 11.2 PageTransition
- Effetto di entrata: `opacity: 0 + translateX(4)` → `opacity: 1 + translateX(0)` dopo 20ms

### 11.3 SkeletonBlock
- Placeholder `animate-pulse bg-slate-200/70` con rounded-md

---

## 12. Frontend — Hooks Personalizzati

### 12.1 useProfile
- `GET /api/auth/me` con Bearer token
- Ritorna: `{ profile: { id, name, email, role, clientId }, loading }`
- Cleanup flag per evitare setState su componente smontato

### 12.2 useFolders
- `GET /api/files/available?path={path}` con Bearer token
- Ritorna: `{ folders: string[], loading, error }`
- Re-fetch quando `token` o `path` cambiano

---

## 13. Frontend — Utility e API Client

### 13.1 auth.js
```javascript
logout()   → rimuove token da localStorage, redirect a /webone/login
getToken() → localStorage.getItem('token')
```

### 13.2 api.js (Axios Instance)
- `baseURL`: da `VITE_API_URL` o `http://localhost:5000`
- **Request interceptor**: aggiunge `Authorization: Bearer {token}`
- **Response interceptor**: su errore 401 → `logout()` e redirect

### 13.3 adminApi.js (15 funzioni)

| Funzione | Metodo | URL |
|----------|--------|-----|
| `listClients()` | GET | `/admin/clients` |
| `createClient(body)` | POST | `/admin/clients` |
| `createClientFolder(body)` | POST | `/admin/clients/create-folder` |
| `deleteClient(id)` | DELETE | `/admin/clients/{id}` |
| `listUsers(params)` | GET | `/admin/users` |
| `createUser(body)` | POST | `/admin/users` |
| `changeUserRole(id, role)` | PATCH | `/admin/users/{id}/role` |
| `resetUserPassword(id, pw)` | POST | `/admin/users/{id}/reset-password` |
| `deleteUserProfile(id)` | DELETE | `/admin/users/{id}` |
| `listGroups(params)` | GET | `/admin/groups` |
| `createGroup(body)` | POST | `/admin/groups` |
| `addGroupMembers(gId, uIds)` | POST | `/admin/groups/{gId}/members` |
| `removeGroupMember(gId, uId)` | DELETE | `/admin/groups/{gId}/members/{uId}` |
| `getMetrics()` | GET | `/admin/metrics` |

---

## 14. Frontend — Pagine Admin

### 14.1 AdminClientsPage
- **Etichette UI**: "Company" (NON "Client"), "Company name" (NON "name")
- **Form creazione**: 4 colonne (name, folderName, contact, submit)
- **Tabella**: ID, Company name, Folder Name, Contact, Actions (Delete)
- **Flusso creazione**: prima crea record client, poi crea cartella filesystem

### 14.2 AdminUsersPage (22.395 byte — molto complessa)
- **16 variabili di stato**
- **Icona occhietto** (👁) sulla password per toggle visibilità
- **Pulsante "Crea Utente"** a destra, allo stesso livello del campo "Ruolo"
- **Animazioni**: conferma eliminazione/reset con CSS transition (`max-height`, `opacity`, `cubic-bezier`)
- **Alert successo**: posizionato in basso al centro, scompare con translateY dopo 2.5s
- **Form creazione**: griglia 4 colonne (client select, name, email, password+eye, role)
- **Tabella**: Name, Client, Email, Role (select editabile), Actions (Reset Password, Delete)
- **Password minima**: 6 caratteri

### 14.3 AdminGroupsPage
- **Multi-select** nativi HTML per aggiunta membri
- **Badge** per ogni membro con 'x' per rimozione

### 14.4 AdminSettingsPage
- **Campi**: useSmb (checkbox), basePath, SMB (share, domain, username, password), allowPublicDownload
- Salva in file JSON `backend_webbone/config/filesettings.json`

---

## 15. Frontend — Pagine Client (Files e Cartelle)

### 15.1 ClientFilesPage ([ClientFilesPage.jsx](file:///D:/004_Software/WebOne/frontend_webbone/src/pages/ClientFilesPage.jsx))

Navigazione a 2 livelli:
- `level="project"` → mostra cartelle progetto (path: `/files`)
- `level="system"` → mostra cartelle sistema dentro il progetto (path: `/files/:project`)

**Funzionalità**:
- Ricerca case-insensitive
- Ordinamento per nome
- Creazione nuova cartella (prompt nativo + POST + reload)
- Card grid 3 colonne (lg)

### 15.2 ClientFolderPage ([ClientFolderPage.jsx](file:///D:/004_Software/WebOne/frontend_webbone/src/pages/ClientFolderPage.jsx))

**Funzionalità complete**:
- **Lista file** con icone per estensione (emoji mapping)
- **Upload semplice** (multipart con progress bar gialla)
- **Upload resumable** automatico per file > 5MB (con cancellazione e retry)
- **Fallback 413** → passa automaticamente a upload resumable
- **Download** con progress bar blu e possibilità di cancellazione
- **Rinomina** inline con input + Save/Cancel + supporto Enter/Escape
- **Eliminazione** file
- **Pulsante Visualizza** per file .csv e .geo → naviga a `/visualizer?folder={}&file={}`
- **Ordinamento**: name (localeCompare), date (desc), size (desc)
- **Formattazione**: dimensione in B/KB/MB/GB, data locale

---

## 16. Frontend — Data Visualizer

> [!CAUTION]
> Questo è il componente più critico e complesso del progetto: ~1060 righe di JSX. Segue la specifica esatta.

### 16.1 Variabili di Stato (31 variabili)

| Variabile | Tipo | Iniziale | Scopo |
|-----------|------|----------|-------|
| `hoveredCoords` | `{lat,lon}\|null` | `null` | Coordinate per Google Maps |
| `singularities` | `Array<{km,type,icon}>` | `[]` | Singolarità ferroviarie |
| `contextMenu` | `{x,y,kmLabel}\|null` | `null` | Menu contestuale click |
| `defectStats` | `Object` | `{}` | Statistiche difetti per colonna |
| `tolerances` | `Object` | `{}` | Tolleranze per colonna Y |
| `csvData` | `Array` | `[]` | Righe dati parsate (preview) |
| `headers` | `string[]` | `[]` | Intestazioni colonne |
| `selectedX` | `string` | `""` | Colonna asse X selezionata |
| `selectedYs` | `string[]` | `[]` | Colonne asse Y selezionate |
| `availableFiles` | `Array` | `[]` | File disponibili sul server |
| `metadata` | `Array` | `[]` | Metadati grezzi |
| `infoPairs` | `{key,value}[]` | `[]` | Metadati parsati |
| `loading` | `boolean` | `false` | Flag caricamento |
| `parseProgress` | `{parsed,seen?,done?}\|null` | `null` | Progresso parsing |
| `isFullLoad` | `boolean` | `false` | Caricamento completo |
| `sampledRows` | `Array` | `[]` | Campione reservoir/ordinato |
| `sampleSize` | `number` | `2000` | Dimensione campione |
| `useSampling` | `boolean` | `true` | Campionamento attivo |
| `lastLocalFile` | `File\|null` | `null` | Ultimo file locale |
| `lastServerFile` | `string\|null` | `null` | Ultimo file server |
| `uploadCandidate` | `File\|null` | `null` | File da caricare |
| `showUploadModal` | `boolean` | `false` | Modale upload |
| `uploadStatus` | `{type,msg}\|null` | `null` | Stato upload |
| `parseError` | `string\|null` | `null` | Errore parsing |
| `uploadInProgress` | `boolean` | `false` | Upload in corso |
| `kmMinInput` | `string` | `''` | Input range min |
| `kmMaxInput` | `string` | `''` | Input range max |
| `kmRange` | `{min,max}\|null` | `null` | Range km applicato |
| `showYMenu` | `boolean` | `false` | Menu selezione Y |
| `currentFolder` | `string` | da URL | Cartella corrente |
| `initialFile` | `string` | da URL | File iniziale |

### 16.2 Funzioni Helper

**`parseCsvText(text)`**:
- Scansiona le prime 20 righe non vuote per trovare l'header (contiene 'ID' o 'km')
- Raccoglie le righe prima dell'header come metadati
- Parser: PapaParse con `header: true`, `delimiter: ';'`, `skipEmptyLines: true`
- Conversione numeri europei: virgola → punto (regex: `/^\s*-?\d+[,\.]\d+\s*$/`)

**`parseMetadataLines(lines)`**:
- Ogni riga splittata per `;` → coppie chiave-valore alternate

**`parseNumberCell(v)`**:
- Gestisce entrambi i formati europeo e anglosassone
- Confronta posizione dell'ultimo punto e dell'ultima virgola per determinare il separatore decimale

### 16.3 Caricamento Dati

**Due strategie di campionamento**:

1. **Campionamento ordinato** (preferito):
   - Primo pass: conta le righe totali
   - Se `totalDataRows > sampleSize`: calcola indici equidistanti
   - Secondo pass: raccoglie solo le righe agli indici target + prime 500 come preview
   - Auto-seleziona 'km' come X, prime 3 colonne numeriche (index 2-4) come Y

2. **Campionamento reservoir** (fallback):
   - Algoritmo standard: riempie fino a `ss`, poi sostituisce con probabilità `ss/totalSeen`
   - Aggiornamenti UI ogni 100 righe

**`loadServerCsv(fileName, requestedSampleSize, storeFull)`**:
- Download: `GET /api/files/raw?folder=upload&file={fileName}&download=1` → blob
- Supporta sia .csv che .geo (tramite `parseGeoBuffer`)
- PapaParse in modalità worker

**`handleLocalFile(file, requestedSampleSize, storeFull)`**:
- Identica logica ma opera su oggetto File locale

### 16.4 Layout UI del Data Visualizer

```
┌──────────────────────────────────────────────────────┐
│  Header: titolo + selettore lingua (IT/EN/ZH)        │
├──────────────────────────┬───────────────────────────┤
│  Info/Metadata Card      │  Google Maps              │
│  (max-h-64, scroll)     │  (iframe, min-h-300px)    │
│                          │                           │
│  Config Card             │  Mostra posizione su      │
│  (max-h-80, scroll)     │  hover del grafico        │
│  - Import file           │                           │
│  - Parametro X           │                           │
│  - Cartella corrente     │                           │
├──────────────────────────┴───────────────────────────┤
│  Area Grafico (height: 420px)                        │
│  ┌─────────────────────────────────────────┐         │
│  │  [Salva DB] [Reset Zoom] [⋯ Config Y]  │ ← top-2 │
│  │                                         │         │
│  │  <Line chart con ChartErrorBoundary>    │         │
│  │                                         │         │
│  │  (click → menu singolarità)             │         │
│  └─────────────────────────────────────────┘         │
├──────────────────────────────────────────────────────┤
│  Sampling Controls                                    │
│  [✓ Use sampling] [sample size: ___] [X range: _-_]  │
│  [Apply] [Reset] [Resample]                           │
├──────────────────────────────────────────────────────┤
│  Report Difetti e Tolleranze (EN 13231-3)            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │ Col Y1  │ │ Col Y2  │ │ Col Y3  │                │
│  │ Toll±mm │ │ Toll±mm │ │ Toll±mm │                │
│  │ Campioni│ │ Campioni│ │ Campioni│                │
│  │ Fuori T.│ │ Fuori T.│ │ Fuori T.│                │
│  │ %       │ │ %       │ │ %       │                │
│  └─────────┘ └─────────┘ └─────────┘                │
└──────────────────────────────────────────────────────┘
```

### 16.5 Pulsanti sull'Area Grafico

Posizionati in `absolute top-2 right-2 z-20`:

1. **Salva Database Linee** (icona download verde) — salva singolarità via `POST /api/files/singularities/save`
2. **Reset Zoom** (icona freccia circolare) — `chartRef.current?.resetZoom()`
3. **Configure Graphs (⋯)** — apre/chiude `showYMenu` dropdown per selezionare le serie Y

### 16.6 Chart Data (useMemo)

- **Sorgente dati**: `sampledRows` (se sampling attivo) oppure `csvData`
- **Filtro km**: applica `kmRange` se impostato
- **Labels**: valori della colonna `selectedX`
- **Datasets**: uno per colonna in `selectedYs`
- **Colori ciclici**: `['#0EA5E9', '#7C3AED', '#F97316', '#059669', '#EF4444']`
- **Opzioni**: `tension: 0.2, fill: false`

### 16.7 Chart Options (useMemo)

- `responsive: true, maintainAspectRatio: false`
- **onHover**: legge Latitudine/Longitudine dalla riga corrispondente → `setHoveredCoords`
- **Legenda**: posizionata in alto
- **Asse Y**: `maxTicksLimit: 6`

---

## 17. Formato Binario .geo

> [!IMPORTANT]
> Logica derivata dall'analisi del software **TGMAnalyzer / WavePartnerAnalyzer** (directory `D:\004_Software\TGMAnalyzer\WavePartnerAnalyzer`).

**File**: [geoParser.js](file:///D:/004_Software/WebOne/frontend_webbone/src/utils/geoParser.js)

### 17.1 Struttura del File

```
┌──────────────────────────────────────────┐
│  HEADER (2480 byte)                      │
│  ├── byte 28-283:  szOriginalName        │  ← windows-1252
│  ├── byte 320-575: szComment             │  ← windows-1252
│  └── byte 832-1087: szLine              │  ← windows-1252
├──────────────────────────────────────────┤
│  PACCHETTO DATI #0 (152 byte)           │
│  PACCHETTO DATI #1 (152 byte)           │
│  ...                                     │
│  PACCHETTO DATI #N (152 byte)           │
└──────────────────────────────────────────┘
```

`totalDataRows = Math.floor((fileSize - 2480) / 152)`

### 17.2 Struttura del Pacchetto Dati (152 byte, Little-Endian)

| Offset | Tipo | Nome | Descrizione |
|--------|------|------|-------------|
| 0 | Float32 | pos | Posizione (non usata) |
| **4** | **Float32** | **km** | **Progressiva effettiva della linea (trackpos)** |
| 8 | Float32 | speed | Velocità |
| 12 | Float32 | Sopraelevazione | Superelevazione |
| 16 | Float32 | Scartamento | Gauge |
| 20 | Float32 | Twist Corto | Short Twist |
| 24 | Float32 | Twist Lungo | Long Twist |
| 28 | Float32 | Allineamento Sinistro | Left Alignment |
| 32 | Float32 | Allineamento Destro | Right Alignment |
| 36 | Float32 | Livello Longitudinale Sinistro | Left Longitudinal Level |
| 40 | Float32 | Livello Longitudinale Destro | Right Longitudinal Level |
| 44 | Float32 | TopSxD1 | — |
| 48 | Float32 | TopDxD1 | — |
| 52 | Float32 | Sopraelevazione Mediata | Averaged Superelevation |
| 56 | Float32 | AlignSxD1 | — |
| 60 | Float32 | AlignDxD1 | — |
| 64 | Float32 | AlignSxD2 | — |
| 68 | Float32 | AlignDxD2 | — |
| 72 | Float32 | TopSxD2 | — |
| 76 | Float32 | TopDxD2 | — |
| 80 | Float32 | Sopraelevazione Quasi Statica | Quasi-Static Superelevation |
| 84 | Float32 | Twist Medio | Average Twist |
| 88 | Float32 | Curvatura Laterale | Lateral Curvature |
| 92 | Float32 | Curvatura Verticale | Vertical Curvature |
| 96 | Float32 | MovAvAlignSx | Moving Avg Alignment Left |
| 100 | Float32 | MovAvAlignDx | Moving Avg Alignment Right |
| 104 | Float32 | MovAvTopSx | Moving Avg Top Left |
| 108 | Float32 | MovAvTopDx | Moving Avg Top Right |
| 112 | Float32 | MovAvGauge | Moving Avg Gauge |
| 116 | Float32 | MovAvCant | Moving Avg Cant |
| **120** | **Float64** | **Latitudine** | GPS Latitude |
| **128** | **Float64** | **Longitudine** | GPS Longitude |
| 136 | Float64 | Altezza | GPS Altitude |
| 144 | Int32 | Satelliti | GPS Satellite Count |

### 17.3 Campionamento
- Se `!storeFull && requestedSampleSize < totalDataRows`: step = `totalDataRows / requestedSampleSize`
- Itera su tutti i pacchetti, preleva solo quelli a indici equidistanti
- Default: `requestedSampleSize = 5000`

---

## 18. Specifiche Grafici e Chart.js

### 18.1 Registrazioni Plugin

```javascript
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend,
  zoomPlugin,          // chartjs-plugin-zoom
  annotationPlugin     // chartjs-plugin-annotation
);
```

### 18.2 Requisiti Specifici (da richieste utente)

| Requisito | Specifica |
|-----------|----------|
| **Asse X default** | Sempre "km" — NON deve apparire tra le opzioni Y |
| **Selettore X** | Nascosto dalla UI principale |
| **Selettore Y** | Accessibile SOLO tramite menu "⋯" (tre puntini) posizionato sul grafico |
| **Layout** | Tipo oscilloscopio: asse X condiviso, assi Y con offset indipendenti |
| **Zoom** | Supportato tramite `chartjs-plugin-zoom`, con icona "Reset Zoom" |
| **Unità di misura** | Devono essere presenti sulle ascisse (km) e sulle tolleranze (mm) |
| **Superamento tolleranza** | Le **LINEE del grafico** cambiano colore (NON lo sfondo) |

### 18.3 ChartErrorBoundary
- Class component React per catturare errori nel rendering del grafico
- Mostra messaggio di errore rosso invece di far crashare la pagina

### 18.4 Colori Ciclici delle Serie
```javascript
['#0EA5E9', '#7C3AED', '#F97316', '#059669', '#EF4444']
//  Sky-500   Violet-600 Orange-500 Emerald-600 Red-500
```

---

## 19. Singolarità Ferroviarie

### 19.1 Tipologie

| Tipo | Icona |
|------|-------|
| Semaforo | 🚦 |
| Passaggio a livello | 🚧 |
| Fabbricato viaggiatori | 🚉 |
| Scambio | 🛤️ |
| Cippo | 📍 |

### 19.2 Flusso di Inserimento

1. L'utente **clicca** sul grafico
2. Appare un **menu contestuale** nella posizione del click con il km label
3. L'utente seleziona il tipo di singolarità dal menu
4. La singolarità viene aggiunta all'array `singularities` come `{ km, type, icon }`
5. Viene renderizzata come **linea verticale** sovrapposta al grafico, **in secondo piano**
6. Sopra la linea appare l'**icona identificativa**

### 19.3 Persistenza
- **Frontend**: array in stato React
- **Backend**: `POST /api/files/singularities/save` con payload `{ folder, file, singularities }`
- **Storage**: file JSON `{filename_senza_ext}_db.json` nella stessa cartella del file dati

---

## 20. Tolleranze e Report Difetti (EN 13231-3)

> [!IMPORTANT]
> Normativa di riferimento: **EN 13231-3** (Railway applications — Track — Acceptance of works — Part 3: Acceptance of reprofiling rails in track). Documenti disponibili in `docs/`.

### 20.1 UI Report Difetti

Per ogni colonna Y selezionata:
- **Input tolleranza**: `± mm` (unità di misura OBBLIGATORIA)
- **Campioni**: totale righe
- **Fuori tolleranza**: conteggio eccedenze
- **Percentuale**: con colore condizionale (`> 5%` → rosso, altrimenti arancione)

### 20.2 Comportamento Visivo

> **CRITICO**: Al superamento della soglia di tolleranza, sono le **LINEE del grafico** che cambiano colore, **NON** lo sfondo del grafico.

### 20.3 Persistenza
- I parametri di tolleranza immessi devono essere **memorizzati** (localStorage o backend)
- Devono essere **sempre visualizzati** anche al ricaricamento

---

## 21. Integrazione Google Maps

### 21.1 Layout

Le sezioni "Info" e "Data/Chart Configuration" sono ridotte a **metà altezza**. Lo spazio liberato ospita un **iframe Google Maps**.

### 21.2 Implementazione

```jsx
<iframe
  title="Google Map"
  width="100%" height="100%"
  style={{ border: 0, position: 'absolute', top:0, left:0, bottom:0, right:0 }}
  loading="lazy"
  allowFullScreen
  src={`https://maps.google.com/maps?q=${hoveredCoords.lat},${hoveredCoords.lon}&z=16&output=embed`}
/>
```

### 21.3 Interazione con il Grafico

- Quando l'utente passa il mouse su un punto del grafico (`onHover` nelle chartOptions)
- Il sistema legge i valori di **Latitudine** e **Longitudine** dalla riga corrispondente
- Aggiorna `hoveredCoords` → l'iframe Google Maps si aggiorna mostrando la posizione

### 21.4 Fallback
Se nessuna coordinata disponibile: `"Nessuna posizione GPS disponibile"` (tradotto via i18n)

---

## 22. Internazionalizzazione (i18n)

### 22.1 Lingue Supportate

| Codice | Lingua |
|--------|--------|
| `it` | Italiano (fallback) |
| `en` | English |
| `zh` | 中文 (Cinese) |

### 22.2 Chiavi di Traduzione

| Chiave | IT | EN | ZH |
|--------|----|----|-----|
| `appTitle` | Visualizzatore Dati | Data Visualizer | 数据可视化工具 |
| `importFile` | Importa File | Import File | 导入文件 |
| `loadServer` | Carica da Server | Load from Server | 从服务器加载 |
| `noFileSelected` | Nessun file selezionato | No file selected | 未选择文件 |
| `saveDatabase` | Salva Database | Save Database | 保存数据库 |
| `resetZoom` | Reset Zoom | Reset Zoom | 重置缩放 |
| `configureGraphs` | Configura Grafici | Configure Graphs | 配置图表 |
| `infoTitle` | Informazioni File | File Information | 文件信息 |
| `configTitle` | Configurazione Dati | Data Configuration | 数据配置 |
| `defectsTitle` | Report Difetti | Defects Report | 缺陷报告 |
| `tolerance` | Tolleranza | Tolerance | 容差 |
| `samples` | Campioni | Samples | 样本 |
| `outOfBounds` | Fuori soglia | Out of bounds | 超出范围 |
| `percentage` | Percentuale | Percentage | 百分比 |
| `insertTolerance` | Inserisci tolleranza | Enter tolerance | 输入容差 |
| `resample` | Ricampiona | Resample | 重新采样 |
| `apply` | Applica | Apply | 应用 |
| `reset` | Reset | Reset | 重置 |
| `xRange` | Intervallo X | X Range | X范围 |
| `mapTitle` | Mappa Posizione | Position Map | 位置地图 |
| `noLocation` | Nessuna posizione GPS | No GPS location | 无GPS定位 |
| `savingSuccess` | Salvato con successo | Saved successfully | 保存成功 |
| `savingError` | Errore durante il salvataggio | Error while saving | 保存时出错 |
| `language` | Lingua | Language | 语言 |
| `selectX` | Seleziona X | Select X | 选择X |

### 22.3 Selettore Lingua

Posizionato nell'header del Data Visualizer:
```jsx
<select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}>
  <option value="it">Italiano</option>
  <option value="en">English</option>
  <option value="zh">中文</option>
</select>
```

---

## 23. Upload Resumable (Chunked)

**File**: [resumableUpload.js](file:///D:/004_Software/WebOne/frontend_webbone/src/utils/resumableUpload.js)

### 23.1 Parametri

| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `chunkSize` | 8 MB | Dimensione singolo chunk |
| `parallel` | 3 | Upload paralleli contemporanei |

### 23.2 Flusso

1. `POST /api/files/{folder}/upload/resumable/init` → `{ id }`
2. `GET /api/files/{folder}/upload/resumable/status?id={id}` → `{ uploaded: [indices] }`
3. Per ogni chunk non ancora caricato: `POST .../upload-chunk` (multipart: id, index, chunk)
4. Worker pool: max `parallel` upload contemporanei, retry su errore con 1s delay
5. `POST .../complete` → assembla il file finale

### 23.3 Soglia Attivazione
- **ClientFolderPage**: file > 5 MB → upload resumable automatico
- Fallback automatico su errore 413 (payload troppo grande) dal simple upload

### 23.4 Funzionalità
- Progress tracking per chunk
- Cancellazione via CancelToken axios
- Event system: `onProgress`, `onChunk`, `onStatus`

---

## 24. Docker e Deployment

### 24.1 docker-compose.yml (4 servizi)

| Servizio | Immagine | Container | Porta | Note |
|----------|---------|-----------|-------|------|
| **backend** | `./backend_webbone/Dockerfile` | `weebone_backend` | 5000:5000 | Volume: uploads |
| **frontend** | `./frontend_webbone/Dockerfile` | `weebone_frontend` | 5173:5173 | `VITE_API_URL` |
| **db** | `postgres:15` | `weebone_db` | — | User: weebone, DB: weebone |
| **prisma_migrate** | `node:18-alpine` | `weebone_prisma_migrate` | — | One-shot: migrate + seed |

- **Network**: `weebone_net` (bridge)
- **Volume**: `db_data` (persistent)

### 24.2 Backend Dockerfile
- Base: `node:18-alpine`
- `npm ci --only=production`
- Crea `/app/uploads`
- Genera Prisma client se schema esiste
- Porta: 5000
- Entry: `node server.js`

### 24.3 Frontend Dockerfile (Multi-stage)
- Build: `node:18-alpine` → `npm install` + `npm run build`
- Preview: `node:18-alpine` → `npm run preview`
- Porta: 5173

### 24.4 Variabili d'Ambiente Produzione

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/webone_db
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_FILES_BASE_PATH=./uploads
CLIENT_FILES_USE_SMB=0
VITE_API_URL=http://host.docker.internal:5000
POSTGRES_USER=weebone
POSTGRES_PASSWORD=weebonepass
POSTGRES_DB=weebone
```

---

## 25. Sicurezza e Requisiti Normativi

### 25.1 Requisiti Utente

- L'applicazione **NON deve inviare informazioni all'esterno** della rete aziendale
- **Nessuna telemetria**, nessuna analytic, nessun check versione
- Variabili di sicurezza: `COLLECT_ANALYTICS=0`, `LATEST_VERSION_CHECK=0`, `SENTRY_DSN=` (vuoto)
- Regole **Firewall Windows** per bloccare connessioni uscenti
- Il cliente avrà bisogno di garanzie, **NDA** o documenti equivalenti
- Password hashate con **bcrypt** (salt round: 10)
- JWT con scadenza **7 giorni**

### 25.2 Prevenzione Path Traversal
- Tutte le operazioni file verificano che il path risolto sia sotto `BASE_PATH`
- Validazione `folderName`: no `..`, no separatori di path, non vuoto

---

## 26. Bug Noti e Problemi di Sicurezza

> [!WARNING]
> Questi sono bug e problemi trovati durante l'analisi del codice. Devono essere risolti.

### 26.1 Sicurezza

| # | Severità | Descrizione |
|---|----------|-------------|
| S1 | 🔴 CRITICO | `POST /api/auth/register` è **pubblico** — chiunque può registrarsi |
| S2 | 🔴 CRITICO | `user.create` e `user.list` **restituiscono gli hash delle password** nella response |
| S3 | 🟡 ALTO | `getProductById` non filtra per `clientId` — leakage cross-client |
| S4 | 🟡 ALTO | JWT secret è un valore debole di default: `"webone_secret_key_change_me"` |
| S5 | 🟡 MEDIO | Debug logging di auth headers e token decodificati nel middleware di produzione |
| S6 | 🟡 MEDIO | Login in `LoginPage.jsx` usa URL hardcoded `http://localhost:5000` invece dell'api instance |

### 26.2 Bug Funzionali

| # | Severità | Descrizione |
|---|----------|-------------|
| B1 | 🔴 CRITICO | `group.controller.js`: `addMembers` e `removeMember` chiamano `ensureGroupScope()` come funzione locale ma è esportata come `exports.ensureGroupScope` — **ReferenceError a runtime** |
| B2 | 🟡 ALTO | `AdminProductsPage.jsx`: URL di update `PUT {databURL}{id}` manca `/products/` → 404 |
| B3 | 🟡 ALTO | `AdminSettingsPage.jsx`: URL senza prefisso `/api` (`GET /admin/settings/files`) — funziona solo perché il backend monta `/admin` senza `/api` prefix |
| B4 | 🟡 MEDIO | `package.json` backend contiene dipendenze frontend (`chart.js`, `react-chartjs-2`) e driver inutilizzato (`pg` quando lo schema è MySQL) |
| B5 | 🟡 MEDIO | `UPLOAD_DIR` nel .env non è mai referenziato nel codice (usa `CLIENT_FILES_BASE_PATH`) |
| B6 | 🟢 BASSO | `auth.controller.js` esporta `getAllProducts` ma non è wired a nessuna route |
| B7 | 🟢 BASSO | `package.json` frontend contiene `multer` (libreria backend, inutile qui) |

---

## 27. Regole di Sviluppo e Workflow

### 27.1 Directory di Lavoro
- La directory di lavoro DEVE essere una **directory locale** (es. `D:\004_Software\WebOne`)
- **MAI** eseguire server o npm install dalla cartella Google Drive
- Dopo le sessioni di sviluppo: backup su Google Drive (escludendo `node_modules` e `.git`)

### 27.2 Avvio in Locale

**Backend**:
```bash
cd backend_webbone
npm install
npx prisma generate
npm start          # porta 5000
```

**Frontend**:
```bash
cd frontend_webbone
npm install
npm run dev        # porta 5173, proxy /api → :5000
```

### 27.3 Istruzioni Operative per l'AI
- **Non chiedere mai permessi** per continuare. Procedere sempre in autonomia.
- **Unica eccezione**: sottoporre Implementation Plan per approvazione prima di modifiche architetturali.
- Eseguire in **modalità batch continua** senza interruzioni.

---

> **Fine del documento. Questa specifica copre l'intero progetto: 52 file sorgente, 59 richieste utente, ogni endpoint API, ogni variabile di stato React, ogni offset byte del formato .geo, ogni chiave di traduzione, ogni bug noto. È sufficiente a ricostruire il progetto da zero.**
