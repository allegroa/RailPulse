# Web One

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

Una piattaforma web completa per la gestione multi-tenant di clienti, prodotti e file. Web One offre un sistema robusto di autenticazione, gestione ruoli e file management con supporto SMB, ideale per aziende che necessitano di organizzare i propri dati per diversi clienti.

## 🚀 Funzionalità Principali

- **🏢 Gestione Multi-Tenant**: Organizzazione completa per clienti multipli
- **👥 Gestione Utenti e Ruoli**: Sistema a ruoli (SuperAdmin, Admin, Cliente)
- **📦 Gestione Prodotti**: Catalogazione prodotti con serial number e firmware
- **📁 File Management**: Upload, organizzazione e gestione file per prodotto
- **🖥️ Dashboard Analytics**: Statistiche e metriche in tempo reale
- **🔐 Autenticazione JWT**: Sistema di login sicuro con token JWT
- **🌐 Supporto SMB**: Integrazione con share di rete SMB/CIFS *(🚧 WIP - Work In Progress)*
- **📊 Visualizzazione Dati**: Grafici e report interattivi con Chart.js
- **👥 Gestione Gruppi**: Organizzazione utenti in gruppi per cliente

## 🏗️ Architettura

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Database**: PostgreSQL con Prisma ORM
- **Autenticazione**: JWT (JSON Web Tokens)
- **File Storage**: Locale + SMB share support
- **API**: RESTful API design

### Frontend (React + Vite)
- **Framework**: React 19 con Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v7
- **State Management**: React Hooks
- **Charts**: Chart.js + React-Chart.js-2
- **HTTP Client**: Axios

## 📋 Prerequisiti

- **Node.js** >= 18.x
- **pnpm** >= 10.x
- **PostgreSQL** >= 12.x
- **Docker** (opzionale, per deployment)

## ⚙️ Installazione

### 1. Ambiente Locale e Sincronizzazione GDrive (Regola del Team)
> [!IMPORTANT]
> **REGOLA FONDAMENTALE**: Per evitare blocchi e corruzione dei file dovuti alla sincronizzazione, la cartella di lavoro principale deve essere sempre una directory locale (es. `D:\004_Software\WebOne` o `C:\xampp\htdocs\WebOne`). 
> Al termine delle sessioni di sviluppo, esegui lo script `sync_to_gdrive.bat` per generare una copia di backup esatta del codice su Google Drive (escludendo `node_modules` e `.git`). **Non avviare server o eseguire installazioni NPM direttamente nella cartella di Google Drive.**

### 2. Clona il repository
```bash
git clone https://github.com/ADTSolution/WebOne.git
cd WebOne
```

### 2. Installazione dipendenze
```bash
# Installa le dipendenze per entrambi backend e frontend
pnpm install --recursive
```

### 3. Configurazione Backend

#### Configura il database
```bash
cd backend_webbone
cp .env.example .env
```

Modifica il file `.env`:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/webone_db
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_FILES_BASE_PATH=./uploads
CLIENT_FILES_USE_SMB=0
# Per configurazione SMB (🚧 WIP - funzionalità in sviluppo)
SMB_SHARE=\\\\server\\share
SMB_DOMAIN=your-domain
SMB_USERNAME=your-username
SMB_PASSWORD=your-password
```

#### Setup database
```bash
# Genera il client Prisma
npx prisma generate

# Esegui le migrazioni
npx prisma migrate dev

# Seed del database (opzionale)
npx prisma db seed
```

### 4. Configurazione Frontend
```bash
cd ../frontend_webbone
```

Il frontend è configurato per utilizzare `http://localhost:5000` come URL dell'API per lo sviluppo locale.

## 🚀 Avvio in Modalità Sviluppo

### Metodo 1: Sviluppo Locale
```bash
# Terminal 1 - Backend
cd backend_webbone
pnpm run dev

# Terminal 2 - Frontend  
cd frontend_webbone
pnpm run dev
```

L'applicazione sarà disponibile su:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Metodo 2: Docker Compose
```bash
# Avvia tutti i servizi con Docker
docker-compose up -d

# Visualizza i logs
docker-compose logs -f
```

## 📁 Struttura del Progetto

```
WebOne/
├── backend_webbone/          # Backend Node.js
│   ├── src/
│   │   ├── controllers/      # Controller API
│   │   ├── middlewares/      # Middleware autenticazione
│   │   ├── routes/          # Route definitions
│   │   └── utils/           # Utilities
│   ├── prisma/
│   │   ├── schema.prisma    # Schema database
│   │   ├── migrations/      # Migrazioni DB
│   │   └── seed.js         # Dati di seed
│   └── uploads/            # File caricati
├── frontend_webbone/        # Frontend React
│   ├── src/
│   │   ├── components/     # Componenti React
│   │   ├── pages/         # Pagine applicazione
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # API client e utilities
│   └── public/            # Asset statici
├── docs/                   # Documentazione
└── docker-compose.yml     # Configurazione Docker
```

## 🔐 Sistema di Autenticazione

### Ruoli Utente
- **SuperAdmin**: Accesso completo al sistema
- **Admin**: Gestione clienti e utenti assegnati
- **Cliente**: Accesso limitato ai propri dati e prodotti

### Endpoint Principali
```
POST /api/auth/login          # Login utente
POST /api/auth/register       # Registrazione (solo admin)
GET  /api/auth/profile        # Profilo utente corrente
```

## 📊 API Endpoints

### Gestione Clienti
```
GET    /api/admin/clients     # Lista clienti
POST   /api/admin/clients     # Crea cliente
PUT    /api/admin/clients/:id # Aggiorna cliente
DELETE /api/admin/clients/:id # Elimina cliente
```

### Gestione Prodotti
```
GET    /api/products          # Lista prodotti
POST   /api/products          # Crea prodotto
PUT    /api/products/:id      # Aggiorna prodotto
DELETE /api/products/:id      # Elimina prodotto
```

### Gestione File
```
GET    /api/files/:productId  # File per prodotto
POST   /api/files/upload      # Upload file
DELETE /api/files/:id         # Elimina file
```

## 🐳 Deployment con Docker

### Build e Deploy
```bash
# Build delle immagini
docker-compose build

# Deploy in produzione
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Variabili d'Ambiente Produzione
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/webone
JWT_SECRET=your_production_jwt_secret
CLIENT_FILES_USE_SMB=1
# Configurazione SMB per produzione (🚧 WIP)
```

## 🛠️ Sviluppo

### Tecnologie utilizzate
- **Backend**: Node.js, Express, Prisma, PostgreSQL, JWT, Multer, bcrypt
- **Frontend**: React, Vite, TailwindCSS, React Router, Chart.js, Axios
- **Database**: PostgreSQL con schema Prisma
- **Deployment**: Docker, Docker Compose

### Script disponibili
```bash
# Backend
pnpm run dev          # Sviluppo con nodemon
pnpm run start        # Produzione
pnpm run seed         # Seed database

# Frontend  
pnpm run dev          # Sviluppo con Vite
pnpm run build        # Build produzione
pnpm run preview      # Preview build
```

## 👥 Team

Sviluppato da **ADT Solution**
Alberto Baqqari

---

## 🐛 Troubleshooting

### Problemi comuni

#### Errore connessione database
```bash
# Verifica che PostgreSQL sia in esecuzione
sudo service postgresql status

# Controlla la configurazione nel file .env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

#### Errori di migrazione Prisma
```bash
# Reset del database (ATTENZIONE: elimina tutti i dati)
npx prisma migrate reset

# Riapplica le migrazioni
npx prisma migrate dev
```

#### Problemi con file SMB *(🚧 WIP)*
```bash
# Verifica la connettività SMB
# Windows
net use \\server\share

# Linux
smbclient -L //server
```
> **Nota**: La funzionalità SMB è attualmente in fase di sviluppo e testing.

Per altri problemi, consulta la [documentazione](./docs/) o apri una issue su GitHub.
