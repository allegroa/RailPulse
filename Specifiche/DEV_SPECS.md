# Specifiche di Sviluppo RailPulse (DEV_SPECS)

Questo file raccoglie le linee guida di sviluppo, le porte di rete, la gestione dell'ambiente runtime e i vincoli tecnici per la piattaforma integrata **RailPulse / WebOne**.

---

## 1. Mappatura Servizi e Porte di Rete

| Servizio | Path Workspace | Comando di Avvio | Porta | Descrizione |
| :--- | :--- | :--- | :--- | :--- |
| **WebOne Backend** | `WebOne/backend_webbone` | `node server.js` | `5000` | Server API centrale Express, autenticazione, rotte TGM, TQI, MNT, RP |
| **GenConfig** | `general-configuration_web` | `node server.js` | `5002` | Servizio gestione GIS, anagrafica linee, operatori e preferenze |
| **WebOne Frontend** | `WebOne/frontend_webbone` | `npm.cmd run dev` | `5173` | UI React 19 + Vite 6 con Sidebar e navigazione unificata |

---

## 2. Architettura dei Dati e Database Hub

Tutti i dati condivisi tra i moduli devono risiedere nella cartella unificata `DATABASE/` alla radice del repository:
- `DATABASE/config_db.json`: Source of truth per lingua di default, preferenze di sistema e storage.
- `DATABASE/lines.json`: Source of truth per le linee ferroviarie, intervalli chilometrici e binari.
- `DATABASE/station.json`: Registro stazioni e scambi con codice, nome, kmStart, kmEnd, linea e colore.
- `DATABASE/maintenance_db.json`: Archivio delle manutenzioni con coordinate spaziali.
- `DATABASE/Taipei/stations.json`: Topologia coordinate nodi metro Taipei (decoupled da `app.js`).
- `DATABASE/TGM/`: Archivio sessioni di geometria binario e log di importazione.
- `DATABASE/RP/railprofile.db`: Database SQLite per l'usura del profilo rotaia.

---

## 3. Linee Guida per i Moduli Specialistici

### Modulo Data Visualizer e Mappa
- **Mappa Interattiva**: Utilizza un `iframe` incorporato di Google Maps (`https://maps.google.com/maps?q={lat},{lon}&output=embed`). Garantisce la consultazione immediata senza dipendenze API esterne a pagamento.
- **Layout 50/50**: Layout sdoppiato con pannelli info e configurazione a sinistra e mappa/grafo a destra, conforme a `gen_layout.md`.

### Modulo TGM (Track Geometry Measurement)
- **Porta**: TGM A integrato in WebOne (backend 5000, frontend 5173). Nessun server separato.
- **Rotte**: Montate sotto `/api` (es. `/api/tgm/sessions`, `/api/tgm/stations`).
- **Navigazione**: Il pulsante configurazione naviga a `/tgm/configuration`; "Annulla" naviga a `/tgm`.
- **Importazione**: Supporta drag & drop multi-cartella e file `.zip`/`.rar` con rilevamento duplicati. Servizio automatico di polling email IMAP attivo in background.

### Modulo TQI (Track Quality Index)
- **Calcolo**: $TQI = \sum_{k=1}^7 \sigma_k$ su segmenti da 200m a passo 0.25m.
- **Soglie**: Soglia fissa 10.75; soglia statistica $\bar{x} + 3\sigma$.
- **Backend & Frontend**: Codice residente in `TQI/` e montato dinamicamente sotto `/api/tqi` e `/projects/tqi`.

### Modulo Taipei Metro Scaffold
- **Disaccoppiamento**: Singola sorgente di veritA `DATABASE/Taipei/stations.json`. Nessuna modifica regex al sorgente `app.js` e nessun fallback su `localStorage`.

---

## 4. Internazionalizzazione (i18n)
- Lingue supportate: Italiano (`it`), Inglese (`en`), Cinese Semplificato (`zh`), Cinese Tradizionale (`zh-TW`).
- La lingua attiva A gestita da `general-configuration_web` in `DATABASE/config_db.json`.
- File traduzioni frontend: `WebOne/frontend_webbone/src/i18n.js`. Ogni nuova label UI deve utilizzare la funzione `t('chiave')`.

---

## 5. Script e Strumenti di Avvio
- Per l'ambiente locale Windows, utilizzare `start_servers_rmt_home.bat` o `start_servers_adts.bat`.
- Per la gestione integrata a finestra con telemetria e controllo processi, utilizzare `start_server/start_server_manager.exe`.
