# Architettura del Sistema RailPulse (WebOne)

Questo documento sintetizza l'architettura del sistema, i framework e i software utilizzati nel progetto **RailPulse (WebOne)**, in base alle specifiche di sviluppo e alla configurazione attuale.

## Architettura del Sistema

L'applicazione segue un'architettura **Client-Server** classica, separando il frontend dedicato alla visualizzazione e interazione con i dati, da un ambiente backend/locale responsabile del servire i dati e gestire gli script di progetto:

- **Frontend (WebOne)**: Applicazione Single Page (SPA) sviluppata a componenti, progettata per la visualizzazione complessa di dati geometrici (es. file binari/proprietari `.geo` e file standard `.csv`). Include moduli come il *Data Visualizer* che affiancano grafici di dati, heatmap e mappe (Google Maps iframe o Leaflet).
- **Backend / Ambiente Locale**: L'ambiente locale di riferimento ("master") è basato su **XAMPP**, suggerendo l'uso di un server Apache locale ed eventualmente un database (come indicato dalla cartella `Database_and_Logs` e dalle API per le *Tolleranze* citate nei log).
- **Integrazione Dati**: Il sistema gestisce upload/lettura lato client di dataset (tramite l'uso di *Papaparse* per i CSV) e allineamenti algoritmici (es. least-squares) per la correlazione spaziale dei difetti rilevati.

## Framework e Librerie Utilizzati

Il Frontend è costruito con uno stack React molto moderno e ricco di librerie per la Data Visualization:

- **Core Framework**: **React 19** costruito e pacchettizzato tramite **Vite**.
- **Stile e Layout**: **Tailwind CSS** per lo styling utility-first, accompagnato da librerie come `react-grid-layout` e `react-resizable` per le schermate a pannelli mobili.
- **Data Visualization**: 
  - **Chart.js** (e `react-chartjs-2`) insieme a plugin (`chartjs-plugin-zoom`, `chartjs-plugin-annotation`) per grafici lineari, barre e heatmap.
- **Mappe**: Uso di **Leaflet** / `react-leaflet`, alternato a integrazioni *iframe* dirette di Google Maps.
- **Parsing e Dati**: **Papaparse** per l'analisi dei file CSV sul client. Richieste esterne gestite da **Axios**.
- **Internazionalizzazione (i18n)**: **react-i18next** (con supporto per tre lingue: `it`, `en`, `zh`).

## Software e Strumenti di Sviluppo

- **Ambiente di Sviluppo e IDE**: **Cursor** (supportato dalle specifiche operative descritte in `.cursorrules` per AI agentica e Composer).
- **Server Locale**: **XAMPP** (per il serving in `D:\004_Software\WebOne`).
- **Runtime**: **Node.js** e gestore di pacchetti **npm** per le dipendenze frontend.
- **Backup e Versioning**: Sincronizzazione automatizzata su Google Drive tramite script batch (`sync_to_gdrive.bat`), in sostituzione/aggiunta al classico Git, escludendo cartelle pesanti come `node_modules`.
