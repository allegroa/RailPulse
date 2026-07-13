# Specifica Tecnica: Modulo TQI v1.0 (Track Quality Index)

Questo documento definisce le specifiche funzionali e architetturali per la realizzazione del modulo **TQI v1.0**. Il modulo è progettato secondo un paradigma a **micro-moduli (o plugin indipendente)**, garantendo che il suo ciclo di vita (sviluppo, configurazione, deployment ed eventuale rimozione) non impatti le funzionalità core dell'applicazione principale (**WebOne**).

---

## 1. Architettura di Isolamento e Disaccoppiamento

Il modulo deve essere auto-contenuto all'interno della directory dedicata `/WebOne/projects/TQI/` (o simile, all'interno del workspace). 

### Regole di Isolamento
1. **Punto di Aggancio Backend**: L'integrazione con il backend di WebOne avviene esclusivamente registrando le rotte del modulo dinamicamente all'avvio o importandole come router separato.
2. **Punto di Aggancio Frontend**: Le rotte del frontend sono aggiunte al router principale (`App.jsx`). I componenti principali (Dashboard, Chart, Heatmap) restano incapsulati nel modulo.
3. **Database e Dati**: Il modulo leggerà i file CSV pre-calcolati dal TGM car (es. `*軌道TQI報表.csv` in `DATABASE/TGM/`) con encoding `GBK`.

---

## 2. Definizione dell'Indice TQI

Il TQI di ogni segmento (lungo esattamente **200 metri**) è la **somma delle deviazioni standard (σ di popolazione)** di 7 parametri geometrici del binario acquisiti ogni 0.25 metri:

`TQI = σ(左軌向) + σ(右軌向) + σ(左高低) + σ(右高低) + σ(水平) + σ(軌距) + σ(平面性)`

I parametri corrispondono rispettivamente a: Allineamento orizzontale Sx/Dx, Livello verticale Sx/Dx, Sopraelevazione (cant), Scartamento (gauge) e Svergolamento (twist). 
**Nota Tecnica**: Il sistema *calcola* il TQI in tempo reale sommando internamente i valori di queste 7 deviazioni standard estratti dal CSV (colonne da 2 a 8), applicando autonomamente la nostra formula, invece di basarsi esclusivamente sulla decima colonna del file TGM.

---

## 3. Logica del Backend (API & Utility)

### 3.1 Parsing CSV (Encoding GBK)
La lettura dei file CSV di input generati dal TGM car deve avvenire saltando le prime 4 righe e prestando attenzione all'encoding `GBK`.
Il parsing estrarrà il chilometraggio (`里程(Km)`), il tipo di tratto (`超限`: `直線` [Rettilineo], `曲線` [Curva], `介曲線` [Curva di transizione]) e il valore pre-calcolato del TQI (`TQI數值`).

### 3.2 Soglie e Allerte
- **Soglia assoluta**: Per rettilinei e curve (`直線` / `曲線`), se il TQI > **10.75**, scatta un'allerta.
- **Soglia Statistica Intera Linea (3σ)**: `x̄ + 3σ` dei TQI dei segmenti dello stesso tipo nella sessione.
- **Curva di transizione (`介曲線`)**: 
  - Condizione A: `TQI_corrente > TQI_precedente × 1.20` (+20%).
  - Condizione B: Aumento del +10% per due mesi consecutivi.

### 3.3 Endpoint Backend Proposti
- `GET /api/tqi/sessions`: Restituisce le sessioni TQI disponibili.
- `GET /api/tqi/segments?session=<id>`: Restituisce i segmenti di una sessione con le eventuali allerte statistiche calcolate.
- `GET /api/tqi/alerts?session=<id>`: Filtra e restituisce solo i segmenti in allerta.
- `GET /api/tqi/trend-chart?line=<lineCode>&trackType=<ballasted|slab>`: Restituisce l'aggregazione dei dati storici per il grafico di andamento.

---

## 4. Logica del Frontend (React & Recharts/Chart.js)

### 4.1 Componenti Principali
1. **TqiTrendChart (`TqiTrendChart.jsx`)**: Grafico temporale TQI per segmento attraverso le sessioni (bimestrale).
   - *Lingua Default*: I testi UI sono tradotti nella lingua di default (Inglese).
   - *Tooltip Informativi*: Presenza di tooltip informativi (es. formula del TQI, spiegazione "Line Average").
   - *Andamento Medio Multi-Serie*: Il grafico supporta la visualizzazione simultanea di tutte le medie per tipo di tracciato e direzione (es. `直線 UP`, `曲線 DN`, ecc.) e della media totale di linea. I dataset sono attivabili/disattivabili dalla legenda.
   - *Limiti Ammissibili*: Nella modalità "Single Segment", sono mostrati i limiti di chilometraggio Minimo e Massimo validi per la linea selezionata, estratti da `lines.json`.
2. **TqiHeatmap (`TqiHeatmap.jsx`)**: Mappa di calore (km vs TQI color-coded: Verde, Giallo, Arancione, Rosso).
3. **TqiAlertTable (`TqiAlertTable.jsx`)**: Tabella dei segmenti che superano le soglie di tolleranza o mostrano variazioni anomale.
4. **TqiSigmaBreakdown (`TqiSigmaBreakdown.jsx`)**: Grafico a barre impilate per analizzare i singoli contributi dei 7 parametri al TQI finale.
5. **Selettore Sessione/Linea**: L'elemento "Seleziona Sessione" nella dashboard deve visualizzare e permettere il filtraggio per *linee registrate* all'interno del database, identificando i limiti chilometrici (piuttosto che mostrare solo i nomi directory raw).

### 4.2 Report Testuale Automatico
Il modulo genererà un resoconto automatico sullo stato della linea (es. "I valori medi del TQI dei tratti rettilinei... non superano 10.75"), per semplificare il lavoro diagnostico dell'operatore.

---

## 5. Linee Guida di Deploy
- Copiare i file del modulo nella destinazione richiesta (`projects/TQI`).
- Registrare la rotta di frontend in `App.jsx` per l'accessibilità visiva (es. `Navigazione -> /projects/tqi`).
- Connettere le API del backend ai route controller generali.
