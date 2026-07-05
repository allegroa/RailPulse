# ALLEGATO TECNICO / CAPITOLATO TECNICO DI PROGETTO
## Progetto: RAMSYS (WebOne) — Piattaforma Multi-Misura di Monitoraggio e Diagnostica Ferroviaria (Sistemi ADT Solution)
**Codice Commessa:** P2604  
**Fornitore di Riferimento:** ADT Solution (Alberto Baqqari)  
**Destinazione:** Piattaforma Web Multi-Tenant per la visualizzazione e l'analisi predittiva di dati multi-misura e diagnostica dell'infrastruttura ferroviaria provenienti dai sistemi ADT Solution.

---

## 1. PREMESSA E OBIETTIVI DEL SISTEMA
La presente documentazione definisce le specifiche tecniche e funzionali della piattaforma software denominata **WebOne** (nome commerciale/progetto: **RAMSYS**), finalizzata alla creazione di un allegato tecnico per un contratto di sviluppo o fornitura software.

RAMSYS è un **Decision Support System (DSS)** per l'Asset Management e la manutenzione basata sulle condizioni reali (*Condition-Based Maintenance*) delle infrastrutture ferroviarie. Il sistema raccoglie, organizza e visualizza dati diagnostici fisici multi-misura provenienti dai vari sistemi diagnostici di ADT Solution (tra cui la geometria del binario, l'ondulazione/usura ondulatoria delle rotaie tramite modulo *Corrugation*, la scansione tridimensionale di gallerie e profili liberi tramite modulo *Tunnel Scan*, catenaria/linea aerea e sistemi di rilevamento contactless come laser, ultrasuoni UT e correnti indotte EC) acquisiti da veicoli diagnostici (Yellow Plant) o ispezioni manuali, offrendo strumenti di visualizzazione grafica interattiva, report di superamento delle tolleranze normative e georeferenziazione spaziale dei difetti.

---

## 2. MODELLO ARCHITETTURALE E STACK TECNOLOGICO
La piattaforma adotta un'architettura **Client-Server** moderna, ottimizzata per operare sia in ambienti server standard che in configurazioni locali "Air-Gapped" (senza connettività Internet).

### A. Stack Tecnologico del Backend
*   **Runtime:** Node.js (versione 18 o superiore).
*   **Framework HTTP:** Express.js (gestione delle rotte REST).
*   **ORM (Object-Relational Mapping):** Prisma ORM.
*   **Database:** MySQL per l'ambiente di sviluppo/locale e PostgreSQL per l'infrastruttura di produzione.
*   **Autenticazione:** Token crittografici JWT (JSON Web Token) con scadenza prefissata (7 giorni) e crittografia password tramite algoritmo **bcryptjs** (salt round: 10).
*   **Gestione File:** Libreria Multer per la gestione e l'upload dei flussi di file in ingresso.

### B. Stack Tecnologico del Frontend
*   **Libreria Core:** React 19.
*   **Build Tool & Dev Server:** Vite.
*   **Styling & UI:** Tailwind CSS con layout personalizzato e design responsive ad alte prestazioni.
*   **Routing:** React Router v7.
*   **Data Visualization:** Chart.js e React-Chartjs-2 integrati con plugin specialistici per la gestione dello zoom (`chartjs-plugin-zoom`) e per le annotazioni grafiche (`chartjs-plugin-annotation`).
*   **Data Ingestion (Client-Side):** PapaParse per il parsing ultrarapido di file CSV strutturati.
*   **Internazionalizzazione (i18n):** react-i18next con supporto nativo e dinamico per tre lingue: **Italiano (it)**, **Inglese (en)** e **Cinese (zh)**.

### C. Infrastruttura e Distribuzione
*   **Containerizzazione:** Docker e Docker Compose.
*   **Servizi definiti:**
    1.  `weebone_backend`: Server API Express (porta 5000).
    2.  `weebone_frontend`: SPA React servita tramite Vite preview o server statico (porta 5173).
    3.  `weebone_db`: Database relazionale PostgreSQL.
    4.  `weebone_prisma_migrate`: Servizio temporaneo per l'applicazione automatica delle migrazioni e dei dati di seed.

---

## 3. STRUTTURA E GERARCHIA DEI DATI (MULTI-TENANCY)
Il sistema garantisce la totale segregazione dei dati tra i diversi clienti registrati (Multi-Tenancy) attraverso una gerarchia rigida implementata a livello di database e di file-system locale:

```
Azienda (Company / Client)
  └── Progetto (Project)
        └── Sistema (System) ── [Associazione a linea ferroviaria dedicata]
              └── Files (Dati diagnostici .csv, .geo, manuali, configurazioni per i vari sistemi di misura)
```

1.  **Azienda (Company/Client):** Entità di massimo livello. Ogni azienda possiede una cartella fisica dedicata sul server (es. `/uploads/Taipei_Metro/`).
2.  **Progetto (Project):** Raggruppamento logico-operativo all'interno dell'azienda.
3.  **Sistema (System):** Corrisponde operativamente a una specifica linea ferroviaria o tratta su cui vengono effettuati i rilievi.
4.  **File-system:** Ciascuna cartella di sistema contiene sottocartelle standardizzate in base alla tipologia di sistema di misura (es. `Corrugation/`, `Track Geometry/`, `Tunnel Scan/`, ecc.), organizzate internamente con:
    *   `/config/`: Parametri di calcolo e tolleranze specifiche della linea.
    *   `/manuals/`: Documentazione tecnica d'uso.
    *   `/upload/`: File di misura grezzi ed elaborati.

### Ruoli e Controllo Accessi (RBAC)
*   **SuperAdmin:** Controllo totale della piattaforma, creazione/eliminazione delle aziende, gestione delle configurazioni globali del server.
*   **Admin (Aziendale):** Gestione utenti, assegnazione dei ruoli interni e organizzazione dei gruppi all'interno della propria azienda.
*   **Cliente (Operatore):** Accesso e visualizzazione dei dati di misura del proprio client, caricamento file, salvataggio di report e analisi grafica.

---

## 4. GESTIONE E PARSING DEI FILE DIAGNOSTICI (.CSV e .GEO)
Il modulo di caricamento e lettura dati supporta l'acquisizione di file di grandi dimensioni tramite due formati principali.

### A. Upload Resiliente (Chunked/Resumable Upload)
Per superare i limiti di timeout delle reti e gestire file superiori a 5MB, il sistema implementa un algoritmo di upload frazionato (chunked):
1.  **Inizializzazione:** Richiesta al backend con metadata del file e ricezione di un ID di transazione unico.
2.  **Upload parallelo:** Invio dei singoli pacchetti (chunk) da 8MB gestito da un pool di upload in parallelo (fino a 3 contemporanei) con retry automatico in caso di errore.
3.  **Finalizzazione:** Assemblaggio lato server con verifica di integrità ed inserimento nel percorso di destinazione corretto.
4.  **Fallback automatico:** Qualora il server restituisca un errore di payload troppo grande (HTTP 413) durante l'upload standard, il client passa in autonomia alla modalità frazionata.

### B. Ingestione File Standard .CSV
Il sistema scansiona le prime 20 righe del file per isolare i metadati descrittivi della tratta dall'effettivo inizio della tabella dei dati diagnostici (identificata dalla riga contenente l'intestazione 'ID' o 'km'). Esegue inoltre la normalizzazione automatica dei formati numerici (es. conversione delle virgole decimali europee in punti).

### C. Parsing del Formato Binario Proprietario .GEO
Il formato proprietario `.geo` (derivante da sistemi di misura storici quali *TGMAnalyzer*) è un file binario strutturato come segue:
*   **Header (2480 byte):** Contiene stringhe in formato codificato Windows-1252 relative a:
    *   Nome file originale (offset byte 28-283).
    *   Commenti di rilievo (offset byte 320-575).
    *   Nome della linea ferroviaria (offset byte 832-1087).
*   **Record Dati (152 byte cad. in formato Little-Endian):**
    *   `km` (Float32 a offset 4): Progressiva spaziale millimetrica (spazio percorso).
    *   `speed` (Float32 a offset 8): Velocità di rilievo.
    *   `Sopraelevazione` (Float32 a offset 12).
    *   `Scartamento` (Float32 a offset 16).
    *   `Twist Corto` / `Twist Lungo` (Float32 a offset 20 e 24).
    *   `Allineamento Sinistro/Destro` (Float32 a offset 28 e 32).
    *   `Livello Longitudinale Sinistro/Destro` (Float32 a offset 36 e 40).
    *   `Latitudine` (Float64 a offset 120): Coordinata GPS.
    *   `Longitudine` (Float64 a offset 128): Coordinata GPS.
    *   `Altezza` (Float64 a offset 136) e `Numero Satelliti` (Int32 a offset 144).

La formula di estrazione dei record è:  
$$\text{Record Totali} = \left\lfloor \frac{\text{Dimensione File in Byte} - 2480}{152} \right\rfloor$$

---

## 5. IL CUORE ANALITICO: IL MODULO "DATA VISUALIZER"
Il modulo grafico rappresenta lo strumento principale per l'analisi visiva delle condizioni dell'infrastruttura e dei parametri di misura acquisiti.

### A. Algoritmi di Campionamento e Performance
Per prevenire il rallentamento del browser derivante dal rendering di milioni di punti sul grafico, il sistema implementa due strategie:
1.  **Campionamento Ordinato Equidistante:** Se la dimensione del file supera la soglia del campione impostata (es. 2000 punti), il parser calcola un passo fisso di iterazione ed estrae dati distribuiti uniformemente sull'intera tratta, garantendo un'anteprima fedele della geometria generale.
2.  **Campionamento Reservoir (Fallback):** Per caricamenti in modalità stream, seleziona in modo probabilistico un sottoinsieme rappresentativo del dataset man mano che viene processato.

### B. Visualizzazione in Modalità Oscilloscopio
*   **Asse X (Spazio/km):** Bloccato sulla progressiva chilometrica. Non è possibile rimuovere o cambiare l'asse X dalla visualizzazione principale.
*   **Assi Y (Misure):** Selezione multipla e simultanea di serie di dati (es. Scartamento + Allineamento + Livello per la geometria del binario, oppure scostamenti micrometrici per l'ondulazione) tramite un menu a comparsa (tre puntini "⋯" sul grafico). Le curve sono visualizzate con scale e offset indipendenti.
*   **Interazione Cartografica Bidirezionale:** Al passaggio del mouse su qualsiasi punto della curva del grafico, il sistema estrae istantaneamente la Latitudine e Longitudine associate al record di misura e aggiorna un iframe Google Maps integrato, visualizzando in tempo reale il punto fisico esatto sulla mappa ferroviaria.

---

## 6. ANALISI DELLE TOLLERANZE E COMPLIANCE NORMATIVA
Il software esegue controlli matematici automatici in aderenza alle specifiche delle tolleranze dei vari sistemi di misura, inclusa la norma europea **EN 13231-3** per l'ondulazione e la profilatura delle rotaie.

1.  **Impostazione delle Soglie:** Per ciascuna serie Y selezionata, l'operatore può impostare una tolleranza massima di scostamento espressa obbligatoriamente in `± mm`.
2.  **Evidenziazione dei Difetti sul Grafico:** Al superamento della tolleranza impostata, sono **le linee stesse del grafico** a cambiare colore dinamico (es. virando al rosso/arancione), salvaguardando la pulizia visiva dello sfondo del grafico.
3.  **Reportistica Dinamica dei Difetti:** Sotto il grafico, il sistema genera un report tabellare riassuntivo che indica per ogni parametro:
    *   Il numero di campioni totali analizzati.
    *   Il numero di campioni fuori soglia (difetti).
    *   La percentuale di difettosità. Se tale percentuale supera il **5%**, viene visualizzato un alert rosso di non-conformità tecnica, altrimenti viene mostrato un avviso arancione.
4.  **Persistenza:** I parametri di tolleranza impostati dall'utente vengono memorizzati stabilmente a livello locale o di server, per essere riproposti ai successivi accessi.

---

## 7. GESTIONE DELLE SINGOLARITÀ FERROVIARIE
Le singolarità sono riferimenti spaziali lungo la linea (es. elementi strutturali o segnalamento) utili per correlare le anomalie e i dati di misura rilevati alle installazioni reali.
*   **Tipologie predefinite:** Semaforo (🚦), Passaggio a livello (🚧), Fabbricato Viaggiatori/Stazione (🚉), Scambio (🛤️), Cippo chilometrico (📍).
*   **Flusso di inserimento:** Tramite click destro o prolungato sul grafico, l'operatore può aggiungere un'annotazione spaziale. Questa viene renderizzata sul grafico come una linea verticale di riferimento con l'icona associata posizionata in alto.
*   **Persistenza:** Le singolarità inserite vengono inviate tramite API REST al server e salvate in un file JSON parallelo (`{nome_file_dati}_db.json`) situato nella stessa directory del file geometrico, escludendo la necessità di alterare il file di misura originale.

---

## 8. REQUISITI DI SICUREZZA, PRIVACY E "AIR-GAP"
Trattandosi di infrastrutture critiche nazionali, il sistema è progettato per rispettare i più severi standard di sicurezza industriale:
*   **Isolamento di Rete (Nessuna Connessione Esterna):** Il software non include telemetria, tracciamento, check di licenza o script di analytics esterni. Può funzionare interamente all'interno di una rete LAN chiusa e senza accesso a Internet. Le variabili di sicurezza globali forzano la disattivazione nativa di qualunque reportistica verso l'esterno.
*   **Protezione dal Path Traversal:** Tutte le funzioni di lettura e scrittura dei file sanitizzano rigorosamente i percorsi inviati dal client, assicurando che nessun utente possa accedere a file posizionati al di fuori della cartella dell'azienda assegnata.

---

## 9. PIANO DELLE CONSEGNE (DELIVERABLES) E FASI DI SVILUPPO
Al fine di strutturare il contratto, si suggerisce la suddivisione del progetto nelle seguenti pietre miliari (*Milestones*):

1.  **Milestone 1 — Struttura Base e Sicurezza (Backend):** Implementazione della base dati, gestione utenti multi-tenant con ruoli (RBAC), irrobustimento delle API e risoluzione dei punti critici di sicurezza (blocco delle rotte di registrazione pubblica, oscuramento degli hash delle password nei payload di risposta).
2.  **Milestone 2 — Ingestione File e Parser .GEO/CSV:** Sviluppo e validazione dell'algoritmo di upload frazionato (Resumable) per file pesanti e del modulo per il parsing binario a basso livello dei file `.geo` e dei vari formati di tracciamento multi-misura.
3.  **Milestone 3 — Visualizzazione Grafica ed Oscilloscopio:** Realizzazione della schermata di visualizzazione interattiva dei dati con asse X spaziale, assi Y multipli per i diversi sistemi ADTS, ottimizzazione delle prestazioni tramite campionamento ed integrazione cartografica Google Maps sincronizzata all'hover del mouse.
4.  **Milestone 5 — Analisi Tolleranze e Singolarità:** Sviluppo del modulo per l'inserimento spaziale delle singolarità, salvataggio dei file di annotazione JSON, calcolo statistico delle non-conformità (inclusa la EN 13231-3) e colorazione condizionale delle linee dei grafici.
5.  **Milestone 5 — Dockerizzazione, Collaudo e Rilascio:** Creazione dei container di produzione, esecuzione dei test prestazionali su database reali di Taipei Metro o Noble Rail per tutti i sistemi di misura attivi, verifica della conformità di sicurezza in ambiente isolato e rilascio della documentazione d'uso.
