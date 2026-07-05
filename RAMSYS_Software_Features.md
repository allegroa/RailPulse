# Funzionalità Software RailPulse

*(Estratte dalla documentazione ufficiale MERMEC, incluse le specifiche della brochure EN0214.10 e presentazioni storiche)*

La piattaforma RailPulse (Decision Support System for Asset Management Planning) è strutturata su un'architettura modulare che elabora un flusso di dati complesso per supportare la Condition-Based Maintenance (manutenzione basata sulle condizioni reali).

## 1. Modello Architetturale (Input / Output)

### INPUT (Dati in ingresso)
Il sistema è progettato per gestire altissimi volumi di dati provenienti da molteplici sorgenti (on-board, wayside, EAM/ERP):
- **Measurements:** Misurazioni diagnostiche grezze (es. geometria, usura, ecc.).
- **Asset Inventory:** Inventario lineare e spaziale degli asset.
- **Work History:** Storico degli interventi di manutenzione passati.
- **Inspections:** Dati derivanti da ispezioni visive o strumentali offline.
- **Costs:** Dati finanziari legati al costo della manodopera e dei materiali.

### OUTPUT (Supporto Decisionale)
- **Work Order Priority Lists:** Generazione automatica di liste prioritarie di ordini di lavoro basate sul reale grado di urgenza tecnica.
- **Condition Forecasting (Modelli di Degrado):** Previsione delle condizioni future dell'asset e calcolo del Degradation Rate tramite algoritmi flessibili.
- **What-If Analysis:** Simulazioni avanzate per prevedere l'impatto tecnico ed economico di diverse strategie di manutenzione a lungo termine.
- **Budgeting:** Creazione automatica di budget basati su dati di degrado verificabili e scenari di spesa ottimizzati.

## 2. Architettura Modulare Core

Il sistema è diviso in domini applicativi altamente specializzati:

### A. Domini di Asset Gestiti
- **Track (Binario):** Geometria e usura.
- **Switches & Crossings (Scambi e Intersezioni):** Componenti complessi.
- **Overhead Line (Linea Aerea):** Catenaria e interazione pantografo.
- **Rolling Stock (Materiale Rotabile):** Interazione veicolo-infrastruttura (ruote, freni, ecc.).
- **Bridges & Structures (Ponti e Opere Civili).**
- **Signalling & TLC (Segnalamento e Telecomunicazioni).**

### B. Funzionalità Orizzontali (Horizontal Functions)
- **Asset Registry:** Modellazione lineare e spaziale (nodi e link) per geolocalizzare difetti lungo la traccia.
- **Standard Data Import & Configuration:** Ingestione flessibile dei dati.
- **Multi Level Segmentation:** Segmentazione intelligente e dinamica del tracciato ferroviario per facilitare le analisi.

### C. Strumenti di Visualizzazione e Reporting (Visualisation Tools)
- **Track-GPS Mapping & GIS:** Mappe tematiche GIS interattive per la localizzazione lineare.
- **Data Correlation:** Strumenti per la correlazione di dati multipli nello spazio e nel tempo.
- **Reporting & Printing:** Esportazione standardizzata e reportistica di livello manageriale (es. Cost vs Quality).

## 3. Integrazione di Sistema (External Systems)
- **RailPulse SAP/ERP Interface:** Modulo nativo per la piena compatibilità e scambio bidirezionale di Work Orders con i sistemi EAM/ERP aziendali.
- **DBMS:** Interfacciamento aperto verso database relazionali per l'importazione di dati anagrafici e la restituzione degli esiti predittivi.
