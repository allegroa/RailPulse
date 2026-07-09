# Specifiche Tecniche del Modulo "Database View"

## 1. Scopo del Modulo
Il modulo **Database View** funge da visualizzatore centralizzato per le acquisizioni di tutti i sistemi. Il suo obiettivo primario è permettere l'identificazione e il raggruppamento delle acquisizioni che condividono la stessa tratta.

## 2. Requisiti Funzionali

### 2.1 Sorgenti Dati
- **Sistemi supportati**: Nella fase iniziale, il modulo deve caricare e mostrare esclusivamente le acquisizioni provenienti dai sistemi **RP** e **TGM**.
- **Lettura Dati Reali**: I dati devono essere estratti dinamicamente dalla cartella globale `DATABASE`:
  - Per **TGM**: Analizzando i nomi delle sottocartelle in `DATABASE/TGM` (es. `2026.02.27 00.22.18K100+000~K99+442`) per estrarre data, ora e progressiva chilometrica. La Stazione Iniziale sarà dedotta incrociando i Km rilevati con le stazioni presenti in `station.json`.
  - Per **RP**: Leggendo la tabella `sessions` dal database SQLite `DATABASE/RP/railprofile.db`.

### 2.2 Identificazione "Tratta in Comune"
- **Criterio di raggruppamento/identificazione**: Due o più acquisizioni sono considerate relative alla "stessa tratta" se condividono i seguenti due parametri:
  1. **Stazione iniziale**
  2. **Direzione** (Up / Down)
- Il sistema deve evidenziare visivamente o raggruppare le acquisizioni che soddisfano questo criterio.

### 2.3 Ricerca e Filtraggio
- **Parametri di ricerca**: Il modulo deve implementare *tutti* i parametri e i filtri di ricerca attualmente presenti e utilizzati nel modulo TGM.
- La logica di ricerca deve comportarsi esattamente come nel modulo TGM.
- **Autocompletamento Stazione**: Il filtro di ricerca della "Stazione Iniziale" deve essere precompilato e supportare l'autocompletamento utilizzando il codice delle stazioni precedentemente inserito nel dizionario globale (`DATABASE/station.json`).

### 2.4 Azioni sulle Acquisizioni
- **Predisposizione Azioni**: L'interfaccia deve prevedere lo spazio o il componente (es. un bottone "Azione", un menu contestuale o un'icona) per eseguire azioni sulle singole acquisizioni o su gruppi di acquisizioni.
- *Nota implementativa*: L'azione effettiva sarà definita in un secondo momento, per ora va solo predisposto l'hook/UI nell'interfaccia.

### 2.5 Gestione Volumi di Dati
- **Paginazione**: Il volume dei dati non è ancora definito in modo certo. È consigliato progettare l'interfaccia (es. la tabella dei risultati) tenendo in considerazione una possibile implementazione futura della paginazione o del virtual scrolling se i dati dovessero rivelarsi eccessivi.

## 3. Requisiti di Interfaccia (UI/UX)
- **Coerenza**: Il comportamento, la navigazione e lo stile dei componenti devono essere identici a quelli dei moduli sviluppati in precedenza.
- **Layout Grafico**: Fare riferimento esclusivo al documento `gen_layout.md` per le specifiche di layout, spaziature, tipografia e palette dei colori.
- **Multilingua (i18n)**: L'intero modulo deve rispettare la lingua di default attualmente impostata dal sistema. La lingua attiva va prelevata dal modulo General Configuration (disponibile all'indirizzo `http://192.168.1.101:5173/webone/general-configuration` sotto la voce "Select Active Language").
- **Map Preview Placeholder**: Nel placeholder della mappa (la sezione destra del layout 50/50), dovrà essere inserita la "mappa a nodi e grafi" attualmente presente nel progetto `TaipeiScafold`. 
  - *Vincolo UI mappa*: Della mappa originale dovrà essere visibile esclusivamente la componente grafica dei nodi (canvas/svg). La barra laterale di ricerca/routing originale (la colonna alla sua sinistra) non deve essere mostrata.

## 4. Accesso e Integrazione
- **URL del Modulo**: Il modulo dovrà essere raggiungibile e visibile al seguente indirizzo (route): `http://192.168.1.101:5173/webone/files`.