# CONTRATTO DI FORNITURA DI SERVIZI DI SVILUPPO SOFTWARE E MANUTENZIONE

**TRA:**

1. **ADT Solution S.r.l.** (o ditta individuale), con sede legale in [Indirizzo], [Città], P.IVA/C.F. [Numero], in persona del legale rappresentante *pro tempore* Alberto Baqqari, di seguito denominata per brevità il **"Fornitore"**;

**E:**

2. **[Nome Società Cliente]**, con sede legale in [Indirizzo], [Città], P.IVA/C.F. [Numero], in persona del legale rappresentante *pro tempore* [Nome Rappresentante], di seguito denominata per brevità il **"Committente"**.

Il Fornitore e il Committente sono di seguito denominati singolarmente la **"Parte"** e congiuntamente le **"Parti"**.

---

### PREMESSE

A. Il Fornitore è specializzato nello sviluppo di soluzioni software per il monitoraggio e la diagnostica delle infrastrutture ferroviarie e possiede la proprietà intellettuale e le competenze tecniche per lo sviluppo e la manutenzione della piattaforma denominata **"WebOne"** (progetto **RAMSYS**), un Decision Support System (DSS) per l'Asset Management e la manutenzione predittiva ferroviaria.
B. Il Committente gestisce o esegue attività diagnostiche su reti ferroviarie e/o metropolitane e ha espresso la necessità di dotarsi di una piattaforma web multi-tenant per la visualizzazione e l'analisi predittiva dei dati multi-misura provenienti dai sistemi diagnostici, conforme alle specifiche descritte nell'**Allegato A** (Capitolato Tecnico).
C. Le Parti concordano che il servizio di sviluppo ed evoluzione del software venga erogato in modalità continuativa con un corrispettivo a canone mensile, secondo le modalità di seguito regolamentate.

Tutto ciò premesso, le Parti stipulano e convengono quanto segue:

---

### ARTICOLO 1 — OGGETTO DEL CONTRATTO
1.1. Il presente Contratto ha per oggetto l’affidamento da parte del Committente al Fornitore, che accetta, dei servizi di sviluppo software, personalizzazione, integrazione, manutenzione e supporto tecnico della piattaforma **WebOne (RAMSYS)** (di seguito il **"Software"** o **"Servizio"**).
1.2. Le caratteristiche tecniche, i moduli funzionali abilitati (quali, a titolo esemplificativo, *Track Geometry*, *Corrugation*, *Tunnel Scan*), lo stack tecnologico (React/Node.js/C++), i requisiti di multi-tenancy e di sicurezza "Air-Gap" sono dettagliati nell’**Allegato A** (Capitolato Tecnico), che forma parte integrante e sostanziale del presente accordo.

---

### ARTICOLO 2 — MODALITÀ DI EROGAZIONE E SVILUPPO AGILE
2.1. Il servizio di sviluppo software verrà erogato su base mensile secondo la metodologia Agile. Le Parti concorderanno periodicamente (su base mensile o sprint) la lista delle funzionalità prioritarie da implementare (*Product Backlog*), in conformità con la roadmap generale prevista nell'Allegato A.
2.2. Il Fornitore si impegna ad allocare un team di sviluppo qualificato per garantire l'avanzamento dei lavori e a fornire rilasci periodici del Software in ambiente di test per la validazione da parte del Committente.
2.3. Il Committente si impegna a collaborare attivamente con il Fornitore, fornendo tempestivamente i dati diagnostici necessari (es. file in formato `.csv` e `.geo`) e procedendo alle verifiche di conformità (collaudi intermedi) entro 10 (dieci) giorni lavorativi da ciascun rilascio.

---

### ARTICOLO 3 — CORRISPETTIVO, FATTURAZIONE E PAGAMENTI
3.1. A fronte del servizio di sviluppo continuativo e manutenzione ordinaria di cui all'Articolo 1, il Committente corrisponderà al Fornitore un canone mensile pari a **Euro [Importo]** (oltre IVA di legge).
3.2. Il canone mensile comprende un pacchetto di **[Numero] ore mensili** dedicate allo sviluppo, personalizzazione e supporto. Eventuali ore aggiuntive richieste dal Committente e preventivamente autorizzate per iscritto verranno fatturate alla tariffa oraria di **Euro [Importo]** + IVA.
3.3. La fatturazione avverrà su base mensile [anticipata / posticipata] entro il giorno [Giorno] di ciascun mese. Il pagamento dovrà essere effettuato tramite bonifico bancario entro **[30/60] giorni** data fattura fine mese.
3.4. In caso di ritardo nei pagamenti decorreranno automaticamente gli interessi di mora ai sensi del D.Lgs. 231/2002. Qualora il ritardo nel pagamento si protragga per oltre 30 (trenta) giorni dalla scadenza, il Fornitore avrà il diritto di sospendere l'erogazione dei servizi e l'accesso alla piattaforma web, previa comunicazione scritta con preavviso di 5 (cinque) giorni.

---

### ARTICOLO 4 — PROPRIETÀ INTELLETTUALE E LICENZA D'USO
4.1. Tutti i diritti di proprietà intellettuale e industriale relativi alla piattaforma WebOne (RAMSYS), al codice sorgente core, ai moduli di parsing binario `.geo` e agli algoritmi di analisi sviluppati dal Fornitore rimangono di esclusiva proprietà di **ADT Solution**.
4.2. Il Fornitore concede al Committente una licenza d’uso non esclusiva, non trasferibile e temporanea (limitata alla durata del presente Contratto) per l’utilizzo della piattaforma WebOne. La licenza è configurata in modalità multi-tenant con i limiti di quote (es. numero massimo di aziende, progetti, sistemi) indicati nell’Allegato A.
4.3. Eventuali personalizzazioni del Software sviluppate specificamente per il Committente su sue specifiche esclusive (ad esclusione del codice core riutilizzabile e degli algoritmi di base del Fornitore) saranno di proprietà del Committente a seguito dell'integrale pagamento dei relativi canoni e corrispettivi. Il Fornitore manterrà comunque il diritto di utilizzare il know-how acquisito durante lo sviluppo.

---

### ARTICOLO 5 — TEMPI DI RISPOSTA E LIVELLI DI SERVIZIO (SLA)
5.1. Il Fornitore si impegna a garantire la disponibilità dei servizi di manutenzione correttiva (bug fixing) e assistenza tecnica in base alla gravità dei disservizi riscontrati sul Software, secondo la seguente classificazione:
*   **Gravità 1 (Bloccante):** Malfunzionamento che rende impossibile l'utilizzo della piattaforma o causa perdite di dati.
    *   *Tempo di presa in carico:* entro 4 ore lavorative.
    *   *Tempo di risoluzione/workaround:* entro 24 ore lavorative.
*   **Gravità 2 (Critico/Medio):** Malfunzionamento che limita gravemente l'uso di una funzionalità importante (es. visualizzatore grafico o parser file), ma consente un utilizzo parziale o aggirabile della piattaforma.
    *   *Tempo di presa in carico:* entro 8 ore lavorative.
    *   *Tempo di risoluzione/workaround:* entro 5 giorni lavorativi.
*   **Gravità 3 (Minore/Evolutivo):** Bug estetici, richieste di modifiche minori o quesiti tecnici.
    *   *Tempo di presa in carico:* entro 16 ore lavorative.
    *   *Tempo di risoluzione:* inserimento nello sprint di sviluppo successivo.
5.2. I tempi si riferiscono all'orario lavorativo standard del Fornitore: dal lunedì al venerdì, dalle 09:00 alle 18:00 (ora italiana), escluse le festività nazionali.

---

### ARTICOLO 6 — REQUISITI DI ISOLAMENTO "AIR-GAP" E SICUREZZA
6.1. Il Fornitore garantisce che il Software è progettato per funzionare in ambiente locale o LAN isolato ("Air-Gap"), escludendo l'uso di telemetrie, tracciamento delle licenze o script di analytics che richiedano connessioni esterne ad Internet, salvo esplicita richiesta scritta del Committente per l'integrazione di servizi web esterni (es. Google Maps).
6.2. Il Fornitore si impegna ad implementare e mantenere misure di sicurezza adeguate a prevenire accessi non autorizzati e attacchi di tipo *Path Traversal*, garantendo la corretta segregazione logica dei dati in ambiente multi-tenant.

---

### ARTICOLO 7 — RISERVATEZZA E NON DIVULGAZIONE (NDA)
7.1. Ciascuna Parte si impegna a mantenere strettamente riservate e a non divulgare a terzi le informazioni di carattere tecnico, commerciale, amministrativo o industriale di cui venga a conoscenza in esecuzione del presente Contratto (di seguito **"Informazioni Riservate"**).
7.2. Le Informazioni Riservate comprendono, a titolo esemplificativo ma non esaustivo: il codice sorgente del Software, gli algoritmi di parsing diagnostico, i dati diagnostici ferroviari forniti dal Committente, i piani di sviluppo e le tariffe applicate.
7.3. Tale obbligo di riservatezza sopravvivrà alla scadenza o risoluzione del presente Contratto per un periodo di 3 (tre) anni.

---

### ARTICOLO 8 — TRATTAMENTO DEI DATI PERSONALI (GDPR)
8.1. Le Parti si impegnano a trattare i dati personali in conformità al Regolamento UE 2016/679 (GDPR) e alla normativa nazionale vigente.
8.2. Qualora nell'erogazione dei servizi il Fornitore debba trattare dati personali per conto del Committente (es. credenziali di accesso degli utenti o log di tracciamento), il Committente assume il ruolo di Titolare del Trattamento e il Fornitore viene nominato **Responsabile del Trattamento** ai sensi dell’art. 28 del GDPR. Le modalità di trattamento sono disciplinate nell'**Allegato B** al presente Contratto.

---

### ARTICOLO 9 — DURATA, RECESSO E PASSAGGIO DI CONSEGNE
9.1. Il presente Contratto ha durata di **12 (dodici) mesi** a decorrere dalla data di sottoscrizione e si rinnoverà tacitamente per periodi della stessa durata, salvo disdetta inviata da una delle Parti tramite PEC o raccomandata A.R. almeno **90 (novanta) giorni** prima della scadenza.
9.2. Ciascuna Parte ha diritto di recedere dal presente Contratto in qualsiasi momento con un preavviso scritto di almeno **60 (sessanta) giorni** da inviarsi tramite PEC. In caso di recesso del Committente, quest'ultimo sarà tenuto al pagamento dei canoni mensili maturati fino alla data di efficacia del recesso.
9.3. In caso di cessazione del rapporto contrattuale per qualsiasi causa, il Fornitore si impegna a cooperare lealmente per facilitare il passaggio di consegne, garantendo la restituzione al Committente di tutti i dati diagnostici e la documentazione di sua proprietà in un formato standard (es. dump database SQL, file JSON/CSV). Eventuali attività di affiancamento al nuovo fornitore saranno valorizzate a consuntivo secondo la tariffa oraria di cui all'Art. 3.2.

---

### ARTICOLO 10 — RISOLUZIONE
10.1. Il presente Contratto potrà essere risolto di diritto dal Fornitore ai sensi dell'art. 1456 c.c., previa comunicazione scritta tramite PEC, nei seguenti casi:
*   Mancato pagamento di due (2) canoni mensili consecutivi.
*   Violazione degli obblighi in materia di proprietà intellettuale (Articolo 4) o riservatezza (Articolo 7).
*   Cessazione dell'attività, liquidazione o ammissione a procedure concorsuali di una delle Parti.
10.2. La risoluzione del Contratto farà salvo il diritto al risarcimento di eventuali danni subiti dalle Parti.

---

### ARTICOLO 11 — LIMITAZIONE DI RESPONSABILITÀ
11.1. Salvo il caso di dolo o colpa grave, la responsabilità complessiva del Fornitore per eventuali danni derivanti dall'esecuzione o dalla mancata esecuzione del presente Contratto sarà limitata ad un importo massimo non superiore alla somma dei canoni mensili effettivamente pagati dal Committente nei 6 (sei) mesi precedenti il verificarsi dell'evento dannoso.
11.2. Il Fornitore non sarà in alcun caso responsabile per danni indiretti, perdita di dati, interruzione di attività commerciale, danni reputazionali o perdite di profitto subite dal Committente o da terzi.

---

### ARTICOLO 12 — LEGGE APPLICABILE E FORO COMPETENTE
12.1. Il presente Contratto è regolato e interpretato in conformità alla **legge italiana**.
12.2. Per qualsiasi controversia derivante dall'interpretazione, esecuzione o risoluzione del presente Contratto, sarà esclusivamente competente il **Foro di [Città, es. Milano]**.

---

Letto, confermato e sottoscritto.

[Luogo], lì [Data]

\
**IL FORNITORE**  
ADT Solution S.r.l.  
*(Alberto Baqqari)*  

\
**IL COMMITTENTE**  
[Nome Società]  
*([Nome Rappresentante])*  

---

# ALLEGATO A — CAPITOLATO TECNICO (WebOne / RAMSYS)

Il presente allegato descrive le specifiche e i requisiti del Software oggetto del contratto di sviluppo a canone mensile.

### 1. Descrizione e Moduli Funzionali
WebOne (RAMSYS) è una piattaforma web Multi-Tenant destinata alla visualizzazione grafica interattiva, al tracciamento e all'analisi statistica dei dati diagnostici fisici dell'infrastruttura ferroviaria provenienti dai sistemi di misura ADT Solution.

I servizi di sviluppo mensile comprendono il completamento e l'evoluzione dei seguenti moduli:
*   **Modulo Core & Multi-Tenancy (RBAC):** Segregazione logica e fisica dei dati secondo la gerarchia *Azienda → Progetto → Sistema (linea ferroviaria) → File*. Gestione ruoli (SuperAdmin, Admin aziendale, Operatore cliente).
*   **Modulo Data Ingestion:**
    *   Upload frazionato (Chunked Upload) resiliente per file pesanti (> 5MB).
    *   Ingestione file CSV con normalizzazione automatica dei formati numerici.
    *   Parser a basso livello del formato binario proprietario `.geo` (estrazione km, velocità, allineamento, livello, soprelevazione, scartamento e coordinate GPS).
*   **Modulo Data Visualizer (Grafico a Oscilloscopio):**
    *   Visualizzazione ad alte prestazioni ottimizzata con algoritmi di campionamento ordinato (Equidistante/Reservoir) per evitare rallentamenti.
    *   Asse X spaziale (km/progressiva) bloccato.
    *   Assi Y multipli e configurabili con scale/offset indipendenti per visualizzare curve e misure concorrenti.
    *   Interazione GIS bidirezionale: hover sul grafico con aggiornamento in tempo reale della posizione GPS su mappa Google Maps integrata.
*   **Modulo Analisi Tolleranze e Compliance Normativa:**
    *   Impostazione soglie in millimetri ($\pm\text{ mm}$) per ciascun parametro.
    *   Evidenziazione dinamica dei difetti tramite cambio colore delle linee del grafico.
    *   Generazione report statistico dei difetti (totale campioni, difettosità in percentuale) e alert visivi condizionali (alert rosso se i difetti superano il 5% del tracciato).
*   **Modulo Singolarità Ferroviarie:**
    *   Inserimento di annotazioni spaziali (semaforo, stazione, scambio, passaggio a livello, cippo) tramite click sul grafico.
    *   Salvataggio in file JSON parallelo per non alterare il file diagnostico originale.

### 2. Stack Tecnologico di Sviluppo
*   **Frontend:** React (Vite) + Tailwind CSS + Chart.js (con plugin zoom/annotation) + PapaParse (CSV client-side) + i18n (Italiano, Inglese, Cinese).
*   **Backend:** Node.js (Express.js) + ORM Prisma (MySQL/PostgreSQL) + JWT per sessioni.
*   **Infrastruttura:** Containerizzazione Docker e Docker Compose (`weebone_backend`, `weebone_frontend`, `weebone_db`, `weebone_prisma_migrate`).
*   **Requisiti di Sicurezza:** Assenza totale di telemetria esterna (predisposizione all'installazione Air-Gap locale), sanificazione percorsi file per prevenire *Path Traversal*.
