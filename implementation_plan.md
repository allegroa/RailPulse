# Implementation Plan: RAMSYS Web-Based Platform

Questo documento delinea il piano di sviluppo per la nuova piattaforma software **RAMSYS (Web-Based)**, orientata alla gestione dei dati diagnostici ferroviari, analisi predittiva e supporto decisionale.

## Obiettivo Principale
Sviluppare un'applicazione web moderna, scalabile e ad alte prestazioni che sostituisca/aggiorni le vecchie logiche desktop/client-server, permettendo la visualizzazione, l'integrazione e l'analisi avanzata dei dati infrastrutturali e dei difetti geometrici direttamente dal browser.

> [!IMPORTANT]
> **User Review Required**
> Ti chiedo di visionare l'architettura tecnologica proposta e la suddivisione in fasi. Per favore approva il piano o indica se preferisci adottare stack tecnologici differenti (es. Angular anziché React, o C# .NET anziché Node.js/Python).

## 1. Architettura Tecnologica Proposta (Stack)

Per supportare l'elevata mole di dati (big data diagnostici) e fornire una UI reattiva:

*   **Frontend (Interfaccia Web):** `React` (tramite framework `Next.js` o `Vite`) + `TypeScript`. Questa scelta garantisce una gestione a componenti modulari, ottima per le complesse dashboard di analisi (Grafici, Mappe GIS). Il frontend includerà un robusto sistema di internazionalizzazione (i18n) per supportare nativamente le lingue **Inglese, Italiano e Cinese**.
*   **Styling & UI Components:** `Tailwind CSS` e librerie di data-visualization ad alte prestazioni (es. `ECharts`, `Mapbox GL`). L'interfaccia utente dovrà essere **altamente professionale, "premium" e curata in ogni dettaglio estetico e funzionale**, adeguata a un software ingegneristico di altissimo livello.
*   **Backend (API Gateway):** `Node.js (NestJS)` o `Go` per gestire le connessioni client, l'autenticazione, le API REST/GraphQL e la logica multi-tenancy in modo asincrono.
*   **Core Engine di Analisi Dati (Data Processing):** `C++`. Come richiesto, l'elaborazione intensiva (algoritmi di Degradation Rate, correlazioni statistiche, filtraggio spaziale) sarà sviluppata in C++ per garantire massime prestazioni computazionali e gestione ottimale della memoria.
*   **Architettura Multi-Utente e Multi-Tenant:** Il sistema sarà progettato nativamente per supportare più clienti e più utenti simultanei. Ogni cliente (Tenant) avrà i propri dati segregati e protetti, con un sistema di Role-Based Access Control (RBAC) per definire permessi specifici per ciascun utente.
*   **Database (Multi-Tenant):** 
    *   *Relazionale:* `PostgreSQL` + l'estensione `PostGIS` (per la geolocalizzazione lineare). Verrà implementata una strategia di segregazione dei dati per cliente (es. Schema-per-Tenant o Row-Level Security).
    *   *Time-Series/Big Data:* `InfluxDB` o `TimescaleDB` per archiviare in modo efficiente le serie storiche dei sensori diagnostici.

## 2. Open Questions

> [!WARNING]
> **Decisioni di Design**
> 1. Vuoi che inizializziamo subito lo scheletro del progetto frontend (es. usando Next.js o Vite) all'interno del workspace attuale?
> 2. Come preferisci integrare il motore di analisi C++ con il gateway Web? (Opzioni: Microservizio separato comunicante via gRPC/REST, Modulo nativo C++ bindato direttamente in Node.js, oppure Web Backend interamente sviluppato in framework C++ come Drogon).
> 3. Per il multi-tenant, preferisci una segregazione dei dati fisica (database separati per cliente), logica (schema separati nello stesso DB) o condivisa (Row-Level Security)?

## 3. Fasi di Sviluppo (Roadmap)

### Fase 1: Setup dell'Infrastruttura, Core System e Multi-Tenancy
- [ ] Inizializzazione repository Frontend (React/TypeScript).
- [ ] Setup sistema di routing, layout base e **Sistema di Autenticazione (login multi-utente)**.
- [ ] Inizializzazione repository Backend (API Gateway) e **Core Engine in C++**.
- [ ] Progettazione del Data Model Multi-Tenant per `Clienti`, `Utenti`, `Asset`, e `Misurazioni`.
- [ ] Implementazione logiche di Role-Based Access Control (RBAC) e segregazione dati (Tenant isolation).

### Fase 2: Sviluppo Frontend - Moduli di Acquisizione e Visualizzazione
- [ ] Sviluppo **Dashboard Home**: KPI generali, alert di sistema e stato della rete.
- [ ] Implementazione modulo **Asset Management**: viste tabellari e di dettaglio per scambi, binari, ponti.
- [ ] Sviluppo del **Modulo GIS Integrato (Track Chart Light)**: mappa interattiva per visualizzare la posizione esatta dei difetti.

### Fase 3: Moduli di Data Analysis e Predictive
- [ ] Implementazione API Backend per *Single e Cross-Parameter Analysis*.
- [ ] Creazione componenti grafici Frontend per il *Deterioration Speed*.
- [ ] Creazione viste per il *What-If Analysis* e la predizione.

### Fase 4: Pianificazione e Integrazione
- [ ] Modulo di **Maintenance Planning & Control**: tool per convertire i difetti in richieste di intervento.
- [ ] Implementazione di interfacce standardizzate (Esportazione CSV/PDF).
- [ ] Sviluppo dell'architettura per l'integrazione con sistemi esterni (es. SAP Interface mock/stubs).

## 4. Verification Plan

### Automated Tests
- Setup di **Jest** e **React Testing Library** per unit test sui componenti UI critici (es. grafici).
- Test API per gli endpoint analitici assicurandosi che restituiscano formati compatibili.

### Manual Verification
- Verifica della reattività dell'interfaccia con volumi di dati consistenti (stress test grafico del modulo GIS).
- Revisione del design dell'interfaccia (UX/UI) per garantire un look "premium" e user-friendly.
