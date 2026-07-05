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