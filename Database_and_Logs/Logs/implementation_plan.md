# Integrazione Google Maps e Supporto Multilingua

Questo documento descrive il piano di implementazione per riorganizzare il layout del `DataVizualizer.jsx`, aggiungere la mappa interattiva di Google Maps e attivare il supporto multilingua (Italiano, Inglese, Cinese).

## User Review Required

> [!IMPORTANT]
> - La mappa di Google utilizzerà l'URL di base `https://maps.google.com/maps?q=lat,lon&z=16&output=embed`. Non richiede API Key perché usa un iFrame pubblico standard, ma il marker non è completamente personalizzabile.
> - Le traduzioni di base sono già state preparate nel file `src/i18n.js`. Verranno ora applicate dinamicamente a tutti i testi dell'interfaccia `DataVizualizer`.

## Proposed Changes

### Frontend - WebOne

#### [MODIFY] [DataVizualizer.jsx](file:///D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx)
- **Supporto Multilingua:** 
  - Importazione di `useTranslation` da `react-i18next`.
  - Aggiunta del selettore della lingua (`<select>`) nella barra superiore del titolo.
  - Sostituzione dei testi statici con le chiamate alla funzione `t('...')` per tradurre i testi (es. "Importa file", "Configura Grafici", "Info Rilievo", ecc.).
- **Layout a 2 Colonne:**
  - Inserimento di una griglia `grid-cols-1 lg:grid-cols-2`.
  - **Colonna Sinistra:** Conterrà i box `Info` (metadati) e `Data/Chart Configuration` (caricamento file e selezione assi). L'altezza massima sarà limitata per non occupare tutto lo schermo.
  - **Colonna Destra:** Conterrà il nuovo `iframe` di Google Maps.
- **Marker Dinamico:**
  - Creazione di uno state `hoveredCoords` contenente `{ lat, lon }`.
  - Modifica delle `chartOptions` della libreria Chart.js per includere l'evento `onHover`. Al passaggio del mouse su un punto del grafico, il sistema identificherà l'indice del punto, cercherà le colonne "Latitudine" (o "Lat") e "Longitudine" (o "Lon") nel file CSV originale, e aggiornerà lo state `hoveredCoords`. La mappa si sposterà automaticamente.

## Verification Plan

### Manual Verification
1. L'utente aprirà la dashboard e accederà al Data Visualizer.
2. Si verificherà che i pannelli di Configurazione e Info siano sulla sinistra e occupino metà larghezza.
3. Si caricherà un file CSV contenente Latitudine e Longitudine.
4. Passando il mouse sul grafico, la mappa sulla destra si aggiornerà in tempo reale seguendo le coordinate del punto.
5. Dal menu a tendina in alto a destra sarà possibile cambiare la lingua e vedere l'interfaccia tradotta all'istante (Italiano, Inglese, Cinese).
