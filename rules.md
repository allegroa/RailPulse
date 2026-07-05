[PERMANENT SYSTEM INSTRUCTION - AGENTIC MEMORY AND DOCUMENTATION LOG]

1. REGOLA MANDATORIA DI ARCHIVIAZIONE
Ogni volta che l'utente fornisce nuove specifiche tecniche, tolleranze, modifiche al codice, variazioni hardware o aggiornamenti d'architettura, hai l'obbligo tassativo di trascrivere e aggiornare immediatamente queste informazioni su un documento di log dedicato all'interno del workspace.

2. SPECIFICHE DEL DOCUMENTO
- Denominazione file: .agent_specs_log.md (mantiene il punto iniziale per rimanere nascosto o separato dai sorgenti standard).
- Destinatario unico: Questo documento è un registro tecnico strutturato a uso esclusivo delle AI agentiche che lavoreranno su questo workspace. Non deve contenere prose discorsive o riassunti qualitativi per l'utente, ma solo dati tecnici strutturati, vincoli, modifiche e cronologia delle decisioni ingegneristiche.

3. STRUTTURA DEL LOG DA AGGIORNARE
Per ogni modifica o specifica rilevata, aggiorna il file applicando questa formattazione:
- Data e Ora (Timestamp)
- Componente Target (es. File specifico, Modulo Hardware, Tabella DB)
- Specifica precedente / Stato iniziale
- Nuova Specifica / Modifica applicata
- Vincolo logico derivato (es. impatto su altre funzioni)

4. AUTONOMIA E CONFIGURAZIONE RUNTIME
Esegui la lettura di questo file all'inizio di ogni task per allineare il tuo contesto e aggiornalo autonomamente alla fine di ogni operazione di refactoring o modifica senza richiedere autorizzazioni o conferme all'utente. 

Per l'esecuzione dei comandi di terminale associati alla gestione dei file e dei log di progetto, fai riferimento ai seguenti parametri operativi di auto-approvazione:

{
  "cursor.composer.auto_approve_terminal": true,
  "cursor.agent.yolo_mode": true
}

[TOKEN SAVING PROTOCOL - MANDATORY]
- Fornisci risposte estremamente sintetiche, asciutte e prive di introduzioni o conclusioni di cortesia.
- Quando modifichi il codice, non riscrivere mai l'intero file. Mostra esclusivamente lo snippet o il blocco di righe interessato dalla modifica (formato diff/patch).
- Limita le spiegazioni qualitative al minimo indispensabile.
- **LINGUA OBBLIGATORIA**: Tutte le comunicazioni, le risposte dell'AI e i commenti nel codice devono essere esclusivamente in lingua italiana.

5. REGOLE ARCHITETTURALI - MODULO TGM (track-view)
- **Porta**: TGM è un modulo integrato in WebOne, non ha server separato. Backend porta 5000, Frontend porta 5173.
- **Route backend TGM**: montate sotto `/api` (non `/api/tgm`) per preservare i percorsi usati dal frontend.
- **Navigazione**: il pulsante configurazione naviga a `/tgm/configuration` (non `/configuration`); il tasto "Annulla" nella configurazione naviga a `/tgm`.
- **Accesso dal file browser di WebOne**: la cartella `track_web-main` nella pagina Files di WebOne naviga a `/tgm` tramite `navigate('/tgm')` (non `window.open`).
- **TGM Sessions Database (FileBrowser)**: si deve aprire direttamente nella directory `DATABASE/TGM` come percorso iniziale.
- **Pagina di Configurazione TGM**: La configurazione (`/configuration`) era disabilitata se non c'era operatore attivo. Ora, in assenza di operatori, si apre automaticamente in modalità creazione nuovo operatore (`isCreatingNew = true`) e il salvataggio della configurazione globale email funziona indipendentemente dalla presenza di un operatore.

6. STRUTTURA station.json (DATABASE/station.json)
- **Formato**: Array di oggetti JSON (NON array di stringhe).
- **Schema obbligatorio di ogni voce**:
  ```json
  {
    "code": "NKL",
    "name": "Nome per esteso della stazione",
    "kmStart": 100.400,
    "kmEnd": 112.059,
    "tracks": 2
  }
  ```
- **Campo `code`**: identificatore univoco della stazione, solo lettere (es. NKL, TAL, XDL). Codici puramente numerici vengono ignorati.
- **Campo `name`**: nome completo della stazione. Può essere vuoto finché non viene compilato.
- **Campo `kmStart`**: chilometro iniziale della stazione (float, formato `km.metri`, es. 89.150).
- **Campo `kmEnd`**: chilometro finale della stazione (float).
- **Campo `tracks`**: numero di binari (intero ≥ 1).
- **Retrocompatibilità**: `stationManager.js` converte automaticamente le voci legacy (stringa) e i campi italiani (codice/nome/kmInizio/kmFine/binari) in inglese durante la lettura.
- **Compilazione durante import**: all'import di un archivio TGM, il codice stazione viene estratto dal Line Name del file CSV. Il codice viene aggiunto automaticamente a `station.json` se non esiste. I campi `nome`, `kmInizio`, `kmFine`, `binari` vengono compilati manualmente dalla tab "Stazioni" nella pagina di configurazione TGM (`/tgm/configuration`).
- **Interfaccia di gestione**: Tab "Stazioni" in `/tgm/configuration` con form CRUD completo (Codice, Nome, Km Inizio, Km Fine, N. Binari).
- **Backend routes**:
  - `GET /api/tgm/stations?path=...` → lista stazioni
  - `POST /api/tgm/stations` → salva/aggiorna stazione (body: `{path, station}`)
  - `DELETE /api/tgm/stations/:codice?path=...` → elimina stazione