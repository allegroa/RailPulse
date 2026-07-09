# Specifiche Applicativo: Start Server Manager GUI

## 1. Obiettivo del Progetto
Sviluppare un'applicazione con interfaccia grafica (GUI) per gestire in modo semplificato ed efficace l'avvio e lo spegnimento dei server del progetto WebOne (Backend, Frontend e General Configuration). L'applicativo sostituirà i vecchi script batch (`start_servers_adts.bat` e `start_servers_rmt_home.bat`), offrendo un controllo visuale e centralizzato sui processi.

## 2. Tecnologie e Architettura Suggerite
- **Linguaggio / Framework**: C++ (tramite framework come Qt, wxWidgets o ImGui). L'ambiente di sviluppo primario deve essere **Visual Studio Code (VS Code)**.
- **Gestione Processi**: Il software deve essere in grado di avviare ("spawn") e terminare ("kill") processi figlio in ambiente Windows (nello specifico i runtime di Node.js e npm), catturandone eventualmente lo standard output (stdout/stderr).

## 3. Funzionalità Principali

### 3.1. Gestione Profili (Configurazioni PC)
L'applicativo deve gestire due profili operativi, selezionabili dall'utente (es. tramite un menu a tendina o radio button):
- **Profilo "ADTS"**:
  - Il server Frontend viene avviato tramite il comando standard: `npm run dev`.
  - Verifica stretta dell'esistenza di tutte le directory necessarie (Backend, Frontend, GenConfig).
- **Profilo "RMT Home"**:
  - Il server Frontend viene avviato tramite il comando specifico: `npm.cmd run dev` (necessario per bypassare blocchi di esecuzione di PowerShell su specifici PC).
  - Tolleranza per l'assenza della directory `general-configuration_web`: se la directory non esiste, l'avvio di questo modulo viene saltato automaticamente senza generare errori bloccanti.

### 3.2. Controlli di Avvio e Arresto
- **Pulsante "Avvia Tutto"**: Avvia sequenzialmente i server in base al profilo selezionato (Backend -> GenConfig -> Frontend), applicando i dovuti ritardi per permettere l'allocazione delle porte.
- **Pulsante "Ferma Tutto"**: Termina in modo pulito tutti i processi correntemente avviati dall'applicativo.
- **Controllo Individuale (Raccomandato)**: Pulsanti indipendenti di Start/Stop per i singoli moduli:
  - **Backend** (Porta 5000)
  - **GenConfig** (Porta 5002)
  - **Frontend** (Porta 5173)

### 3.3. Monitoraggio Stato e Log
- **Indicatori Visivi (LED/Status)**: Mostrare chiaramente lo stato di ogni modulo (es. _In attesa_, _In esecuzione_, _Errore/Fermato_) utilizzando indicatori semantici o colori (grigio, verde, rosso).
- **Console Integrata (Log)**: Un'area di testo scrollabile all'interno della GUI che raccoglie l'output standard dei processi avviati. Questo evita l'apertura di molteplici finestre del Prompt dei Comandi. Deve essere presente un pulsante per pulire i log ("Clear Log").

## 4. Gestione degli Errori e Ciclo di Vita
- **Validazione Directory**: Notificare l'utente (es. tramite alert modale o testo rosso nei log) se una directory necessaria per il profilo selezionato non viene trovata.
- **Prevenzione Processi Zombie**: Assicurarsi che, alla chiusura dell'applicativo (es. cliccando sulla "X" della finestra principale), tutti i processi figlio ancora in esecuzione vengano intercettati e terminati in modo pulito. Questo evita di lasciare porte occupate (5000, 5002, 5173) in background.

## 5. Configurazione e Percorsi
I percorsi delle cartelle target devono essere risolti in modo relativo alla directory radice del progetto, partendo dalla posizione dell'applicativo:
- **Directory Radice**: `..` (rispetto alla cartella `start_server`) o directory base del progetto.
- **Backend**: `WebOne\backend_webbone` (comando: `node server.js`)
- **Frontend**: `WebOne\frontend_webbone` (comando: `npm run dev` o `npm.cmd run dev`)
- **GenConfig**: `general-configuration_web` (comando: `node server.js`)
