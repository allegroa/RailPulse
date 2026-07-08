# Specifiche Tecniche - Tab GIS DATABASE

Questo documento contiene tutte le specifiche di dettaglio riguardanti la gestione e l'architettura del tab GIS DATABASE all'interno del modulo `general-configuration_web`.

## 1. Architettura
*Le specifiche architetturali verranno descritte qui...*

## 2. Requisiti Funzionali

### 2.1 Tab "Topologia 2D" (2D Topology)
In questa sezione viene visualizzata in modo grafico la topologia o la struttura della linea ferroviaria.
* **Internazionalizzazione (i18n)**: Attualmente la schermata "Topologia 2D" necessita di essere tradotta o allineata con il sistema di lingua di default, in quanto presenta testi non internazionalizzati.
* **Selezione Linea e Scala Chilometrica**: 
  * Quando l'utente seleziona una specifica linea dal menu/dropdown o dallo schema, la vista principale deve renderizzare la Scala Chilometrica (KM) associata alla linea (da `startKm` a `endKm`).
  * **Asse della Chilometrica**: La barra della chilometrica deve occupare *tutta la lunghezza (width: 100%)* disponibile del contenitore orizzontale dello schema, per fungere da riferimento proporzionale per l'intera tratta.
  * **Rappresentazione Stile RailML**: La grafica dell'asse deve rispecchiare lo standard RailML. In particolare:
    * **Tick Primari (Inferiori)**: Segni regolari (es. ogni 0.5 km o 1.0 km) posizionati *sotto* la linea principale dell'asse.
    * **Tick Specifici (Superiori)**: Segni o marker posizionati *sopra* la linea principale, che indicano le coordinate chilometriche esatte (con precisione a 3 decimali, es. `0.300`, `3.965`) per punti di interesse, stazioni o nodi topologici.
* **Rimozione Dati Fittizi (Mock)**: La schermata "Topologia 2D" deve essere completamente priva di disegni "hardcoded" o stazioni fittizie di test. In assenza di dati topologici espliciti (es. mancato caricamento di un file RailML), la vista dovrà renderizzare esclusivamente la griglia di sfondo e l'asse chilometrico dinamico calcolato in base alle proprietà della linea selezionata.
* **Rappresentazione Binario Principale (Main Track)**: Poiché una linea possiede intrinsecamente un inizio e una fine (`startKm` e `endKm`), il sistema deve disegnare automaticamente un **binario principale** che si estende per l'intera lunghezza della linea.
  * **Stile Visivo**: Il binario deve essere rappresentato graficamente nello stile RailML, ovvero come un segmento orizzontale spesso (es. una linea azzurra/blu con bordo) posizionato *sopra* l'asse chilometrico, perfettamente allineato con la scala.

#### 2.1.1 Rappresentazione Topologica di Scambi e Stazioni
In conformità con la tecnica RailML, la Topologia 2D deve renderizzare gli elementi infrastrutturali inseriti nei layer GIS nel seguente modo:
* **Stazioni (Stations / OCPs)**: Devono essere rappresentate come piattaforme/banchine rettangolari (es. colore arancione o grigio scuro) posizionate in parallelo, appena sopra o appena sotto l'asse del binario principale. Si estendono graficamente da `startKm` a `endKm`. L'etichetta identificativa della stazione (es. il Codice Stazione) deve essere visibile al centro o in prossimità della piattaforma.
* **Scambi (Switches)**: Devono essere rappresentati come linee di derivazione/deviazione (branching lines) che si distaccano diagonalmente dal binario principale partendo da `startKm` e terminando a `endKm` (con un offset verticale, es. 20px). L'etichetta identificativa (`switchId`) e l'angolo (es. `1:12`) devono essere riportati accanto al punto di deviazione.

### 2.2 Inserimento Elementi Infrastrutturali (GIS Form)
* **Layer "Station"**: All'interno della lista dei layer modificabili, deve essere sempre presente il tab **Station** posizionato come prima scelta (alla sinistra di *Sleepers*).
  * Il posizionamento di una stazione richiede una selezione obbligata da un elenco centralizzato (letto da `stations.json`), impedendo l'inserimento manuale o arbitrario del nome della stazione.
* **Layer "Switches" (Scambi)**: Tutti gli scambi inseriti lungo la tratta non devono essere puntuali ma **caratterizzati da un Km Iniziale (`startKm`) e un Km Finale (`endKm`)**. Tali dati devono essere riflessi correttamente sia a livello di form (input) sia salvati esplicitamente all'interno del DB associato.
  * **Ordine del Form**: All'interno del pannello di inserimento dello scambio, i campi identificativi e descrittivi (**Switch ID** e **Type**) devono sempre precedere gerarchicamente i campi spaziali (**StartKm** e **EndKm**).
