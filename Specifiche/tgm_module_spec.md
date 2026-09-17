# Specifica Tecnica: Modulo TGM (Track Geometry Measurement)

Questo documento definisce le specifiche funzionali, architetturali e operative del modulo **TGM (Track Geometry Measurement)** integrato nella piattaforma **RailPulse / WebOne**.

---

## 1. Architettura e Integrazione

A differenza di servizi esterni o microservizi separati, il modulo TGM A integrato nativamente all'interno di WebOne:
- **Backend**: Integrato in `WebOne/backend_webbone/src/routes/tgm.routes.js` e montato direttamente sotto `/api` sul server Express principale (Porta `5000`).
- **Frontend**: Integrato nella SPA WebOne alla rotta `/tgm` (`WebOne/frontend_webbone/src/pages/tgm/components/DataVisualizerClient.jsx`) e `/tgm/configuration` (`ConfigurationPage.jsx`) (Porta `5173`).
- **File Browser WebOne**: La cartella `track_web-main` nella vista file di WebOne indirizza direttamente al modulo `/tgm` tramite `navigate('/tgm')`.
- **Database Root**: La card "TGM SESSIONS DATABASE" apre come directory radice iniziale `DATABASE/TGM/`.

---

## 2. Flusso di Acquisizione e Importazione Dati

### 2.1 ModalitA di Caricamento
1. **Drag & Drop**: Trascinamento diretto di singole o multiple cartelle di rilievo o archivi compressi (`.zip`, `.rar`) sulla card "TGM SESSIONS DATABASE".
2. **Pulsante "Import File"**: Selezione interattiva di archivi o cartelle locali (con supporto HTML `webkitdirectory`).
3. **Servizio Background Email Polling**:
   - Polling periodico configurabile (in minuti) su casella di posta IMAP.
   - Download automatico degli archivi di rilievo allegati in background.
   - Decompressione e immissione automatica nel flusso di validazione senza intervento operatore.

### 2.2 Macchina a Stati di Importazione
- Rilevamento tipo file (archivio o cartella non compressa).
- Decompressione trasparente in directory temporanea (con gestione robusta di lock e cleanup).
- Validazione struttura interna: presenza dei file di misura geometrica CSV (scartamento, allineamento L/R, livello longitudinale L/R, sghembo, cant).
- Controllo duplicati: verifica della presenza della sessione nella cartella `DATABASE/TGM/`.
- Estrazione automatica della linea e del codice stazione:
  - Estrazione chilometrica iniziale e finale.
  - Aggiornamento automatico e sincronizzazione del registro stazioni in `DATABASE/station.json` e delle linee in `DATABASE/lines.json`.
- Registrazione del log dettagliato in `DATABASE/TGM/import_debug.log`.

---

## 3. Gestione Stazioni e Anagrafiche (`DATABASE/station.json`)

Il modulo TGM A sincronizzato con il registro stazioni centralizzato.
Ogni record stazione rispetta lo schema obbligatorio:
```json
{
  "code": "NKL",
  "name": "Nome per esteso della stazione",
  "kmStart": 100.400,
  "kmEnd": 112.059,
  "tracks": 2,
  "lineCode": "L1",
  "stationType": "station",
  "color": "#1e40af"
}
```

### Regole di Convalida
- `code`: Identificatore alfanumerico univoco (solo lettere o codice linea/stazione).
- `name`: Nome esteso della stazione.
- `kmStart` / `kmEnd`: Valori chilometrici decimali (formato km.metri).
- `tracks`: Numero binari (intero ?%? 1).
- `lineCode`: Codice della linea associata (mappato con `lines.json`).
- `stationType`: Distinzione tra fermata/stazione passeggeri (`station`) o scambio/bivio (`switch`).

---

## 4. Visualizzatore e Grafici (Data Visualizer)

- **Layout 50/50**: Layout a doppio pannello con controlli filtri e parametri a sinistra, e tracciato/mappa interattiva a destra.
- **Tracciamento Multicanale**:
  - Grafici sincronizzati sull'asse chilometrico per Allineamento Sinistro/Destro, Livello Longitudinale Sinistro/Destro, Scartamento, Sghembo e Sopraelevazione (Cant).
  - Supporto per zoom orizzontale sincronizzato e pan lungo la tratta.
  - Evidenziazione superamento tolleranze di usura/geometria con codici colore secondo normative vigenti.
- **Integrazione Manutenzione**: Sovrapposizione grafica dei simboli e degli interventi manutentivi registrati in `maintenance_db.json`.

---

## 5. Rotte Backend API (Montate sotto `/api`)

- `GET /api/tgm/sessions`: Lista delle sessioni TGM disponibili in `DATABASE/TGM/`.
- `POST /api/tgm/import`: Ricezione e importazione di cartelle o archivi di rilievo.
- `GET /api/tgm/stations`: Restituisce la lista aggiornata delle stazioni dal registro globale.
- `POST /api/tgm/stations`: Inserisce o aggiorna un record stazione in `DATABASE/station.json`.
- `DELETE /api/tgm/stations/:code`: Cancella una stazione previa conferma.
- `GET /api/tgm/config`: Lettura configurazione attiva TGM (email, polling, preferenze).
- `POST /api/tgm/config`: Salvataggio parametri operativi e configurazione email.
