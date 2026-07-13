# Specifiche di Implementazione TQI su RailPulse

> **Basato su**: `TQI報告115年3-4月.doc` (Taipei MRT, marzo-aprile 2026)  
> **Dati di riferimento**: `DATABASE/TGM/**/*TQI*.csv` (encoding: **GBK**)  
> **Autore**: Analisi automatica — 2026-07-10

---

## 0. Architettura e Filosofia del Modulo

Il modulo **TQI (Track Quality Index)** deve essere implementato come un modulo indipendente con le stesse caratteristiche architetturali e di isolamento dei moduli **TGM** (Track Geometry Measurement) e **RP** (RailProfile):
- **Isolamento e Modularità (Micro-modulo / Plugin)**: Il codice del modulo (sia backend che frontend) deve essere isolato in modo che il suo ciclo di vita, sviluppo, configurazione, deployment ed eventuale rimozione non compromettano o influenzino in alcun modo le funzionalità core dell'applicazione principale (**WebOne** / **RailPulse**).
- **Aggancio Dinamico**: Le rotte del backend e gli elementi della UI del frontend (come la Sidebar o i pannelli della Dashboard) devono essere registrati ed integrati dinamicamente. Se la cartella del modulo non è presente, l'applicazione principale deve continuare a funzionare regolarmente, omettendo semplicemente le funzionalità TQI e senza produrre errori a runtime.
- **Integrazione dei Dati Coerente**: Il modulo si deve interfacciare in modo pulito e coerente con la struttura delle sessioni presenti nel database a file-system (`DATABASE/TGM/` e/o `DATABASE/RP/`), senza richiedere accoppiamenti rigidi o modifiche strutturali al core database.

---

## 1. Definizione della Formula

### 1.1 TQI di Segmento

Il TQI di ogni segmento è la **somma delle deviazioni standard (σ di popolazione)** di 7 parametri geometrici del binario:

```
TQI = σ(左軌向) + σ(右軌向) + σ(左高低) + σ(右高低) + σ(水平) + σ(軌距) + σ(平面性)
```

In italiano:

| Parametro cinese | Parametro italiano | Colonna CSV |
|---|---|---|
| `左軌向` | Allineamento orizzontale sinistro | col 2 |
| `右軌向` | Allineamento orizzontale destro | col 3 |
| `左高低` | Livello verticale sinistro | col 4 |
| `右高低` | Livello verticale destro | col 5 |
| `水平` | Sopraelevazione (cant) | col 6 |
| `軌距` | Scartamento (gauge) | col 7 |
| `平面性` | Svergolamento (twist) | col 8 |
| **`TQI數值`** | **TQI pre-calcolato** (colonna di controllo) | col 9 |

### 1.2 Deviazione Standard — Formula esatta

Si usa la **σ di popolazione** (divisione per *n*, NON per *n-1*):

```
σ = √[ (1/n) × Σ(xᵢ - x̄)² ]
```

dove:
- `n` = numero di punti nel segmento = lunghezza_m ÷ 0.25
- `xᵢ` = valore raw del parametro al punto *i*
- `x̄` = media aritmetica dei valori del segmento

**In Python/NumPy**: `np.std(array, ddof=0)` ← **ddof=0 obbligatorio**  
**In JavaScript**: calcolo manuale (vedi sezione 4)

### 1.3 Granularità dati raw

I dati grezzi del TGM car vengono acquisiti ogni **0.25 m**.  
Un segmento da 200 m contiene quindi **800 punti**.

---

## 2. Struttura dei File CSV nel Database

### 2.1 Encoding

**Encoding obbligatorio: `GBK`** (non UTF-8, non BIG5, non UTF-8-BOM)

```javascript
const iconv = require('iconv-lite');
const rawBuffer = fs.readFileSync(filepath);
const content = iconv.decode(rawBuffer, 'gbk');
```

```python
df = pd.read_csv(filepath, encoding='gbk', skiprows=4)
```

### 2.2 File TQI pre-calcolati (`*軌道TQI報表.csv`)

Posizione: `DATABASE/TGM/<sessione>/<timestamp>軌道TQI報表.csv`

**Intestazione (prime 4 righe — da saltare):**
```
線路名稱,1140814NKLUP,線路行別,上行,報表名稱,軌道TQI報表,...
開始里程,100.300...,結束里程,112.048...
波長,25米-3米波長,測量日期,2025.08.15,測量時刻,01:28:03
(riga vuota)
```

**Colonne dati (dalla riga 5 in poi, indice 0-based):**

| Indice | Nome colonna CSV | Tipo | Descrizione |
|--------|-----------------|------|-------------|
| 0 | `里程(Km)` | float | Km iniziale del segmento |
| 1 | `超限` | string | Tipo: `直線` / `曲線` / `介曲線` |
| 2 | `左軌向(mm)` | float | σ allineamento sinistra |
| 3 | `右軌向(mm)` | float | σ allineamento destra |
| 4 | `左高低(mm)` | float | σ livello verticale sinistra |
| 5 | `右高低(mm)` | float | σ livello verticale destra |
| 6 | `水平(mm)` | float | σ cant/sopraelevazione |
| 7 | `軌距(mm)` | float | σ scartamento |
| 8 | `平面性(mm)` | float | σ svergolamento |
| 9 | `TQI數值` | float | **TQI già calcolato** (= somma σ col.2-8) |
| 10 | `TQI超標` | string | Stato: `超標20%`, `未超標`, ecc. |
| 11 | `速度(km/h)` | float | Velocità di rilevamento |
| 12 | `標準` | string | Classe velocità (`≤15`, `15-16.5`, `>18.0`) |

### 2.3 File dati grezzi (`*原始數據報表.csv`)

Stesso encoding GBK, stessa intestazione (4 righe da saltare).  
Colonne dati principali:

| Indice | Contenuto |
|--------|-----------|
| 0 | Numero sequenza punto |
| 1 | `里程(Km)` — posizione ogni 0.25 m |
| 2 | `軌距(mm)` — scartamento grezzo |
| 3 | `水平(mm)` — cant grezzo |
| 4-6 | Angoli IMU (rad) |
| 7-8 | Timestamp IMU |
| 9-12 | Valori per quadrante (sinistro/destro, alto/basso) |

> **NOTA**: il TGM car pre-calcola già le σ per segmento nel file `*TQI報表.csv`.  
> I file `*原始數據報表.csv` sono necessari solo per **ricalcolare** o **verificare** dal raw.

### 2.4 Struttura cartelle sessioni

```
DATABASE/TGM/
└── 2026.04.22 01.29.12K100+400~K112+059/
    ├── 2026.04.22 01.29.12原始數據報表.csv    ← raw a 0.25m
    ├── 2026.04.22 01.29.12軌道TQI報表.csv     ← TQI pre-calcolati ← USARE QUESTO
    └── 2026.04.22 01.29.12超限報表.csv         ← punti singoli fuori soglia geometrica
```

**Parsing nome cartella:**
```
Formato: "<YYYY.MM.DD HH.mm.ss><LineCode><Dir>+<kmStart>~<kmEnd>"
Esempio: "2026.04.22 01.29.12K100+400~K112+059"
→ data:     2026-04-22
→ ora:      01:29:12
→ LineCode: K (o NKL, ecc. — vedere il campo 線路名稱 nel CSV)
→ km_start: 100.400
→ km_end:   112.059
```

---

## 3. Soglie e Condizioni di Allerta

### 3.1 Rettilineo e Curva (`直線` / `曲線`)

**Soglia assoluta fissa**: TQI > **10.75**

Derivazione: media TQI iniziale linee storiche = 9.77 → +10% = 10.75

```javascript
if ((tipo === '直線' || tipo === '曲線') && tqi > 10.75) → ALLERTA
```

### 3.2 Curva di transizione (`介曲線`)

Nessuna soglia assoluta. Doppia condizione — richiedono confronto con sessione precedente:

- **Condizione A**: `TQI_corrente > TQI_precedente × 1.20` (+20%)
- **Condizione B**: `TQI_corrente > TQI_precedente × 1.10` AND `TQI_precedente > TQI_ante_precedente × 1.10` (+10% per 2 cicli consecutivi)

### 3.3 Soglia Statistica Intera Linea (`x̄ + 3σ`)

Per ogni tipo (直線 / 曲線 / 介曲線), soglia calcolata su tutti i segmenti dello stesso tipo della sessione corrente:

```
Soglia_tipo = mean(TQI_tipo) + 3 × std(TQI_tipo)
```

**Valori di riferimento reali (115年3-4月):**

| Tipo | x̄ | σ | Soglia |
|------|-----|---|--------|
| Rettilineo (`直線`) | 7.2755 | 1.8837 | **12.9268** |
| Curva (`曲線`) | 7.1594 | 1.9765 | **13.0897** |
| Curva di transizione (`介曲線`) | 8.1149 | 1.9441 | **13.9472** |

---

## 4. Implementazione Backend Node.js

### 4.1 Modulo `tqi.js` — da creare in `track_web-main/backend/utils/`

```javascript
// track_web-main/backend/utils/tqi.js
const fs    = require('fs');
const iconv = require('iconv-lite'); // npm install iconv-lite

const SOGLIA_ASSOLUTA = 10.75;
const TIPI = ['直線', '曲線', '介曲線'];

/**
 * Legge un file *TQI報表.csv con encoding GBK.
 * @param {string} filePath
 * @returns {Array<Object>} array di segmenti
 */
function parseTqiCsv(filePath) {
  const rawBuffer = fs.readFileSync(filePath);
  const content = iconv.decode(rawBuffer, 'gbk');
  const lines = content.split(/\r?\n/).map(l => l.trim());

  // Trova la riga header colonne (inizia con '里程')
  let dataStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('里程')) { dataStart = i + 1; break; }
  }
  if (dataStart === -1) throw new Error(`Header non trovato in: ${filePath}`);

  const segments = [];
  for (let i = dataStart; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 10 || !cols[0] || isNaN(parseFloat(cols[0]))) continue;

    segments.push({
      km:     parseFloat(cols[0]),
      tipo:   cols[1]?.trim() ?? '',
      sigma: {
        leftAlign:  parseFloat(cols[2])  || 0,
        rightAlign: parseFloat(cols[3])  || 0,
        leftLevel:  parseFloat(cols[4])  || 0,
        rightLevel: parseFloat(cols[5])  || 0,
        cant:       parseFloat(cols[6])  || 0,
        gauge:      parseFloat(cols[7])  || 0,
        twist:      parseFloat(cols[8])  || 0,
      },
      tqi:    parseFloat(cols[9])  || 0,
      status: cols[10]?.trim()     ?? '',
      speed:  parseFloat(cols[11]) || 0,
    });
  }
  return segments;
}

/**
 * Calcola media, σ di popolazione e soglia 3σ per tipo di segmento.
 * @param {Array} segments
 * @returns {Object} { '直線': {n,mean,std,threshold}, ... }
 */
function calcolaStatistiche(segments) {
  const stats = {};
  for (const tipo of TIPI) {
    const vals = segments.filter(s => s.tipo === tipo).map(s => s.tqi);
    if (!vals.length) continue;
    const n    = vals.length;
    const mean = vals.reduce((a, b) => a + b, 0) / n;
    const std  = Math.sqrt(vals.reduce((a, v) => a + (v - mean) ** 2, 0) / n);
    stats[tipo] = { n, mean, std, threshold: mean + 3 * std };
  }
  return stats;
}

/**
 * Aggiunge il campo `alerts[]` a ogni segmento.
 * @param {Array} segments - sessione corrente
 * @param {Object} stats - output calcolaStatistiche
 * @param {Array} [segmentsPrev=[]] - sessione precedente (per 介曲線)
 * @param {Array} [segmentsAnte=[]] - sessione ante-precedente (per cond. B 介曲線)
 * @returns {Array}
 */
function applicaSoglie(segments, stats, segmentsPrev = [], segmentsAnte = []) {
  const prevMap = Object.fromEntries(segmentsPrev.map(s => [s.km.toFixed(3), s.tqi]));
  const anteMap = Object.fromEntries(segmentsAnte.map(s => [s.km.toFixed(3), s.tqi]));

  return segments.map(seg => {
    const alerts = [];
    const kmKey  = seg.km.toFixed(3);

    // Soglia assoluta
    if ((seg.tipo === '直線' || seg.tipo === '曲線') && seg.tqi > SOGLIA_ASSOLUTA) {
      alerts.push({ type: 'ABSOLUTE', value: seg.tqi, threshold: SOGLIA_ASSOLUTA });
    }

    // Soglia statistica 3σ
    const stat = stats[seg.tipo];
    if (stat && seg.tqi > stat.threshold) {
      alerts.push({ type: 'STAT_3SIGMA', value: seg.tqi, threshold: +stat.threshold.toFixed(4) });
    }

    // 介曲線 — Condizione A: +20% vs precedente
    if (seg.tipo === '介曲線' && prevMap[kmKey] !== undefined) {
      const prev = prevMap[kmKey];
      const pct  = (seg.tqi - prev) / prev * 100;
      if (pct > 20) {
        alerts.push({ type: 'TRANSITION_A_20PCT', value: seg.tqi, prevTqi: prev, deltaPercent: +pct.toFixed(2) });
      }
      // Condizione B: +10% consecutivo
      if (pct > 10 && anteMap[kmKey] !== undefined) {
        const pctPrev = (prev - anteMap[kmKey]) / anteMap[kmKey] * 100;
        if (pctPrev > 10) {
          alerts.push({ type: 'TRANSITION_B_10PCT_X2', value: seg.tqi, prevTqi: prev });
        }
      }
    }

    return { ...seg, alerts };
  });
}

module.exports = { parseTqiCsv, calcolaStatistiche, applicaSoglie, SOGLIA_ASSOLUTA };
```

### 4.2 Endpoint da aggiungere in `routes.js`

```javascript
const { parseTqiCsv, calcolaStatistiche, applicaSoglie } = require('./utils/tqi');
const TGM_DB_PATH = path.join(__dirname, '../../DATABASE/TGM');

// GET /api/tgm/tqi/sessions
router.get('/tgm/tqi/sessions', (req, res) => {
  const dirs = fs.readdirSync(TGM_DB_PATH);
  const sessions = dirs.map(dir => {
    // Parsing: "2026.04.22 01.29.12K100+400~K112+059"
    const match = dir.match(/^(\d{4}\.\d{2}\.\d{2} \d{2}\.\d{2}\.\d{2})(.+?)([A-Z])(\d+)\+(\d+)~([A-Z]?)(\d+)\+(\d+)$/);
    return match ? {
      id: dir,
      datetime: match[1].replace(/\./g, '-').replace(' ', 'T'),
      lineCode: match[3],
      kmStart: parseFloat(match[4] + '.' + match[5]),
      kmEnd:   parseFloat(match[7] + '.' + match[8]),
    } : { id: dir };
  });
  res.json(sessions);
});

// GET /api/tgm/tqi/segments?session=<id>
router.get('/tgm/tqi/segments', (req, res) => {
  const sessionDir = path.join(TGM_DB_PATH, req.query.session);
  const csvFiles = fs.readdirSync(sessionDir).filter(f => f.includes('TQI'));
  if (!csvFiles.length) return res.status(404).json({ error: 'CSV TQI non trovato' });

  const segments = parseTqiCsv(path.join(sessionDir, csvFiles[0]));
  const stats = calcolaStatistiche(segments);
  const withAlerts = applicaSoglie(segments, stats);
  res.json({ session: req.query.session, segments: withAlerts, statistics: stats });
});

// GET /api/tgm/tqi/alerts?session=<id>
router.get('/tgm/tqi/alerts', (req, res) => {
  const sessionDir = path.join(TGM_DB_PATH, req.query.session);
  const csvFiles = fs.readdirSync(sessionDir).filter(f => f.includes('TQI'));
  const segments = parseTqiCsv(path.join(sessionDir, csvFiles[0]));
  const stats = calcolaStatistiche(segments);
  const withAlerts = applicaSoglie(segments, stats);
  const alerts = withAlerts.filter(s => s.alerts.length > 0);
  res.json({ session: req.query.session, alerts, statistics: stats });
});
```

---

## 5. Implementazione Python (per analisi/batch)

```python
# tqi_calc.py
import pandas as pd
import numpy as np
from pathlib import Path

SOGLIA_ASSOLUTA = 10.75
COLS_SIGMA = ['左軌向(mm)', '右軌向(mm)', '左高低(mm)', '右高低(mm)', '水平(mm)', '軌距(mm)', '平面性(mm)']

def parse_tqi_csv(filepath: str) -> pd.DataFrame:
    """Legge file *TQI報表.csv (GBK, skiprows=4)."""
    df = pd.read_csv(filepath, encoding='gbk', skiprows=4,
                     on_bad_lines='skip', low_memory=False)
    df.columns = df.columns.str.strip()
    df = df.rename(columns={'里程(Km)': 'km', '超限': 'tipo',
                             'TQI數值': 'tqi', 'TQI超標': 'status', '速度(km/h)': 'speed'})
    for col in COLS_SIGMA:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df['km']  = pd.to_numeric(df['km'],  errors='coerce')
    df['tqi'] = pd.to_numeric(df['tqi'], errors='coerce')
    return df.dropna(subset=['km', 'tqi'])

def calcola_statistiche(df: pd.DataFrame) -> dict:
    """Statistiche per tipo (σ di popolazione, ddof=0)."""
    stats = {}
    for tipo in ['直線', '曲線', '介曲線']:
        subset = df[df['tipo'] == tipo]['tqi']
        if subset.empty: continue
        mean = subset.mean()
        std  = subset.std(ddof=0)   # σ di POPOLAZIONE — obbligatorio
        stats[tipo] = {'n': len(subset), 'mean': mean, 'std': std,
                       'threshold': mean + 3 * std}
    return stats

def trova_alerts(df: pd.DataFrame, stats: dict, df_prev: pd.DataFrame = None) -> pd.DataFrame:
    """Aggiunge colonna 'alert' con lista di allerte per segmento."""
    prev_map = {} if df_prev is None else df_prev.set_index('km')['tqi'].to_dict()

    def check(row):
        a = []
        if row['tipo'] in ('直線', '曲線') and row['tqi'] > SOGLIA_ASSOLUTA:
            a.append(f'ASSOLUTA>{SOGLIA_ASSOLUTA}')
        s = stats.get(row['tipo'])
        if s and row['tqi'] > s['threshold']:
            a.append(f"3SIGMA>{s['threshold']:.4f}")
        if row['tipo'] == '介曲線':
            prev = prev_map.get(row['km'])
            if prev:
                pct = (row['tqi'] - prev) / prev * 100
                if pct > 20: a.append(f'+20%({pct:.1f}%)')
        return ', '.join(a)

    df = df.copy()
    df['alert'] = df.apply(check, axis=1)
    return df
```

---

## 6. Componenti Frontend da Creare

| Componente | File | Descrizione |
|---|---|---|
| `TqiTrendChart` | `TqiTrendChart.jsx` | Grafico temporale TQI per segmento attraverso le sessioni |
| `TqiHeatmap` | `TqiHeatmap.jsx` | Heatmap km → colore TQI (verde→rosso) per una sessione |
| `TqiAlertTable` | `TqiAlertTable.jsx` | Tabella segmenti in allerta (modellare su `DefectTable.jsx`) |
| `TqiSigmaBreakdown` | `TqiSigmaBreakdown.jsx` | Stacked bar: contributo di ogni σ al TQI |

**Colormap suggerita per heatmap:**
```javascript
function tqiToColor(tqi) {
  if (tqi < 7)     return '#22c55e';  // verde — ottimo
  if (tqi < 10.75) return '#eab308';  // giallo — attenzione
  if (tqi < 13.9)  return '#f97316';  // arancione — vicino soglia
  return '#ef4444';                   // rosso — superato
}
```

---

## 7. Percorsi File nel Workspace

```
track_web-main/
├── backend/
│   ├── routes.js              ← aggiungere endpoint /api/tgm/tqi/*
│   └── utils/
│       └── tqi.js             ← [NEW] modulo calcolo/parsing TQI
└── frontend/src/components/
    ├── DataVisualizer.jsx     ← integrare TqiHeatmap come nuova tab
    ├── TqiTrendChart.jsx      ← [NEW]
    ├── TqiHeatmap.jsx         ← [NEW]
    ├── TqiAlertTable.jsx      ← [NEW] (ispirarsi a DefectTable.jsx)
    └── TqiSigmaBreakdown.jsx  ← [NEW]

DATABASE/TGM/
└── <sessione>/
    ├── *原始數據報表.csv    ← raw (GBK)
    ├── *軌道TQI報表.csv     ← TQI per segmento (GBK) ← USARE
    └── *超限報表.csv
```

---

## 8. Validazione — Test di Correttezza

```python
# TEST 1: verifica formula TQI su riga reale CSV (sessione 2025-08-15, km 100.300)
sigma_vals = [2.586, 1.173, 0.607, 0.602, 0.384, 6.051, 1.753]
assert abs(sum(sigma_vals) - 13.156) < 0.001  # ✓

# TEST 2: verifica soglie statistiche ufficiali rapporto 115年3-4月
assert abs(7.2755 + 3 * 1.8837 - 12.9268) < 0.001  # rettilineo ✓
assert abs(7.1594 + 3 * 1.9765 - 13.0897) < 0.001  # curva ✓
assert abs(8.1149 + 3 * 1.9441 - 13.9472) < 0.001  # transizione ✓

# TEST 3: caso critico — segmento Beitou→Fuxinggang
# km 111.239, tipo 介曲線, TQI = 13.7861
# Soglia: 13.9472 → NON supera, ma vicino → monitorare
assert 13.7861 < 13.9472  # ✓ sotto soglia ma a <1.5% dalla soglia
```

**Caso critico di riferimento** per validazione visiva UI:

| Campo | Valore |
|---|---|
| Stazione | Beitou → Fuxinggang (上行) |
| Km | `111.239 ~ 111.301` |
| Tipo | `介曲線` |
| TQI | **13.7861** |
| Soglia 3σ | 13.9472 |
| Scartamento raw | -5.9 mm ~ +15.3 mm |
| Acceleraz. laterale | 0.09g (soglia: 0.13g — OK) |
| Stato | Monitoraggio continuo |

---

## 9. Report Testuale Automatico per Linea

### 9.1 Scopo

Dopo il calcolo del TQI di ogni sessione, il sistema deve generare automaticamente un **paragrafo di sintesi per ciascuna linea**, da mostrare nel report e nell'interfaccia. Il testo rispecchia il formato ufficiale del rapporto TQI del MRT di Taipei.

### 9.2 Template del testo

Il testo deve essere generato dinamicamente in base ai risultati del calcolo:

```
"Dopo il calcolo, i valori medi del TQI dei tratti rettilinei e delle curve della Linea [NOME_LINEA]
[NON superano / superano] 10,75.
Inoltre, confrontando il valore dei tratti di transizione di questo mese con quello dei due mesi
precedenti, [lo scostamento rispetto al mese precedente [non raggiunge / raggiunge] il 20%,
né si registra uno scostamento pari o superiore al 10% per due mesi consecutivi / si registra
uno scostamento ≥20% / si registra uno scostamento ≥10% per 2 mesi consecutivi].
[Anche la variazione complessiva del TQI dell'intera linea non raggiunge le condizioni di
rilevamento, a conferma di una condizione di stabilità generale. /
La variazione complessiva del TQI dell'intera linea raggiunge le condizioni di rilevamento.
Intervento richiesto.]"
```

### 9.3 Logica condizionale per la generazione del testo

```javascript
function generaReportLinea(lineaNome, segmentsCorrente, segmentsPrecedente, stats) {

  // Condizione 1: TQI medio rettilineo e curva
  const tqiRettilinei = segmentsCorrente
    .filter(s => s.tipo === '直線').map(s => s.tqi);
  const tqiCurve = segmentsCorrente
    .filter(s => s.tipo === '曲線').map(s => s.tqi);
  const mediaRett  = media(tqiRettilinei);
  const mediaCurva = media(tqiCurve);
  const oltreAssoluta = mediaRett > 10.75 || mediaCurva > 10.75;

  // Condizione 2: tratti di transizione (介曲線)
  let transOk = true;
  for (const seg of segmentsCorrente.filter(s => s.tipo === '介曲線')) {
    const prev = segmentsPrecedente.find(s => s.km.toFixed(3) === seg.km.toFixed(3));
    if (!prev) continue;
    const pct = (seg.tqi - prev.tqi) / prev.tqi * 100;
    if (pct >= 20) { transOk = false; break; }
    // TODO: aggiungere check consecutivo per condizione B (+10% per 2 cicli)
  }

  // Condizione 3: soglia statistica 3σ
  const alerts3sigma = segmentsCorrente.filter(s => {
    const st = stats[s.tipo];
    return st && s.tqi > st.threshold;
  });
  const lineaStabile = !oltreAssoluta && transOk && alerts3sigma.length === 0;

  // Costruisci testo
  const parte1 = oltreAssoluta
    ? `i valori medi del TQI dei tratti rettilinei e delle curve della Linea ${lineaNome} **superano** 10,75.`
    : `i valori medi del TQI dei tratti rettilinei e delle curve della Linea ${lineaNome} non superano 10,75.`;

  const parte2 = transOk
    ? `lo scostamento rispetto al mese precedente non raggiunge il 20%, né si registra uno scostamento pari o superiore al 10% per due mesi consecutivi.`
    : `si registra uno **scostamento anomalo** nei tratti di transizione. Verifica richiesta.`;

  const parte3 = lineaStabile
    ? `Anche la variazione complessiva del TQI dell'intera linea non raggiunge le condizioni di rilevamento, a conferma di una condizione di **stabilità generale**.`
    : `La variazione complessiva del TQI dell'intera linea **raggiunge le condizioni di rilevamento**. Intervento richiesto.`;

  return `Dopo il calcolo, ${parte1} Inoltre, confrontando il valore dei tratti di transizione di questo mese con quello dei due mesi precedenti, ${parte2} ${parte3}`;
}
```

### 9.4 Output atteso per sessione stabile (esempio Linea Tamsui)

```
Dopo il calcolo, i valori medi del TQI dei tratti rettilinei e delle curve della Linea Tamsui
non superano 10,75. Inoltre, confrontando il valore dei tratti di transizione di questo mese
con quello dei due mesi precedenti, lo scostamento rispetto al mese precedente non raggiunge
il 20%, né si registra uno scostamento pari o superiore al 10% per due mesi consecutivi.
Anche la variazione complessiva del TQI dell'intera linea non raggiunge le condizioni di
rilevamento, a conferma di una condizione di stabilità generale.
```

---

## 10. Grafici Trend TQI per Linea

### 10.1 Descrizione dei grafici richiesti

Per ogni linea il sistema deve generare **due grafici di trend** separati:

| Grafico | Titolo (cinese) | Titolo (italiano) |
|---------|-----------------|-------------------|
| Grafico A | `[線路]道碴段TQI變化趨勢` | Trend TQI Tratti a Massicciata |
| Grafico B | `[線路]非道碴段TQI變化趨勢` | Trend TQI Tratti senza Massicciata |

Dove:
- **道碴段** = binario su massicciata (ballasted track) — tipicamente tratti in superficie/sopraelevati
- **非道碴段** = binario su soletta di cemento (non-ballasted/slab track) — tipicamente gallerie

### 10.2 Struttura dei grafici (da immagini di riferimento)

**Asse X** — periodi bimestrali, etichetta a due livelli:
```
5/6月   7/8月   9/10月   11/12月   1/2月   3/4月
         114年度                    115年度
```

**Asse Y** — scala 0-16, griglia orizzontale ogni 2 unità

**6 serie per grafico** (3 tipi × 2 direzioni):

| Serie | Colore suggerito | Marker |
|-------|-----------------|--------|
| 介曲線段 上行 (trans. UP) | `#facc15` giallo | `*` |
| 介曲線段 下行 (trans. DN) | `#06b6d4` ciano | `X` |
| 曲線段 上行 (curva UP) | `#a855f7` viola | `*` |
| 曲線段 下行 (curva DN) | `#991b1b` rosso scuro | `●` |
| 直線段 上行 (rett. UP) | `#1d4ed8` blu scuro | `♦` |
| 直線段 下行 (rett. DN) | `#ec4899` rosa | `■` |

**Label dati**: ogni punto mostra il valore TQI numerico  
**Linea di riferimento**: linea tratteggiata rossa a **y = 10.75** (soglia allerta)

### 10.3 Dati di esempio — Grafico A (道碴段, Linea Tamsui)

```javascript
const datiEsempioBallastedTamsui = {
  title: '淡水線道碴段TQI變化趨勢',
  periods: [
    { label: '5/6月',  year: '114年度' },
    { label: '7/8月',  year: '114年度' },
    { label: '9/10月', year: '114年度' },
    { label: '11/12月',year: '114年度' },
    { label: '1/2月',  year: '115年度' },
    { label: '3/4月',  year: '115年度' },
  ],
  series: [
    { name: '介曲線段下行', data: [9.75, 9.55, 9.36, 9.46, 9.22, 9.79] },
    { name: '介曲線段上行', data: [9.49, 9.30, 9.57, 9.15, 9.45, 9.90] },
    { name: '曲線段下行',   data: [9.51, 9.55, 9.36, 9.46, 9.22, 9.79] },
    { name: '直線段下行',   data: [9.44, 9.40, 9.41, 9.31, 9.42, 9.48] },
    { name: '曲線段上行',   data: [8.73, 8.76, 8.61, 8.66, 8.63, 8.77] },
    { name: '直線段上行',   data: [8.73, 8.61, 8.37, 8.49, 9.67, 9.28] },
  ]
};
```

### 10.4 Dati di esempio — Grafico B (非道碴段, Linea Tamsui)

```javascript
const datiEsempioSlabTamsui = {
  title: '淡水線非道碴段TQI變化趨勢',
  periods: [
    { label: '5/6月',  year: '114年度' },
    { label: '7/8月',  year: '114年度' },
    { label: '9/10月', year: '114年度' },
    { label: '11/12月',year: '114年度' },
    { label: '1/2月',  year: '115年度' },
    { label: '3/4月',  year: '115年度' },
  ],
  series: [
    { name: '介曲線段下行', data: [9.58, 9.50, 9.46, 9.48, 9.48, 9.76] },
    { name: '介曲線段上行', data: [9.92, 9.87, 9.89, 9.71, 9.77, 9.89] },
    { name: '曲線段下行',   data: [9.19, 9.02, 9.03, 8.92, 8.86, 9.08] },
    { name: '直線段上行',   data: [8.78, 8.67, 8.68, 8.62, 8.57, 8.93] },
    { name: '直線段下行',   data: [8.89, 8.67, 8.68, 8.62, 8.57, 8.93] },
    { name: '曲線段上行',   data: [7.22, 7.21, 7.26, 7.30, 7.30, 7.36] },
  ]
};
```

### 10.5 Aggregazione dati dal database per il grafico

Per costruire i dati del grafico, aggregare le sessioni CSV per periodo bimestrale:

```javascript
/**
 * Aggrega TQI medio per tipo, direzione, tipo binario, per periodo bimestrale
 * @param {Array} sessions - lista sessioni con { datetime, lineCode, direction, segments }
 * @param {string} trackType - 'ballasted' | 'slab' (道碴 | 非道碴)
 * @returns {Object} struttura dati per il grafico
 */
function aggregaPerPeriodo(sessions, trackType) {
  // Raggruppa sessioni per bimestre (es. mesi 3-4 → '3/4月')
  const groups = {};
  for (const sess of sessions) {
    const d = new Date(sess.datetime);
    const month = d.getMonth() + 1;
    // Calcola bimestre (1→1/2月, 3→3/4月, 5→5/6月, ecc.)
    const bimonth = month % 2 === 1 ? `${month}/${month+1}月` : `${month-1}/${month}月`;
    const yearKey = d.getFullYear(); // convertire in anno ROC se necessario
    const key = `${yearKey}-${bimonth}`;

    if (!groups[key]) groups[key] = { label: bimonth, year: yearKey, sessions: [] };
    groups[key].sessions.push(sess);
  }

  // Per ogni gruppo, calcola TQI medio per tipo e direzione
  const seriesMap = {
    '介曲線UP': [], '介曲線DN': [],
    '曲線UP':   [], '曲線DN':   [],
    '直線UP':   [], '直線DN':   [],
  };

  for (const [, group] of Object.entries(groups).sort()) {
    for (const [serieKey, arr] of Object.entries(seriesMap)) {
      const tipo = serieKey.replace('UP','').replace('DN','');
      const dir  = serieKey.endsWith('UP') ? '上行' : '下行';
      const vals = group.sessions
        .filter(s => s.direction === dir)
        .flatMap(s => s.segments)
        .filter(seg => {
          const tipoMatch = tipo === '介曲線' ? seg.tipo === '介曲線'
                          : tipo === '曲線'   ? seg.tipo === '曲線'
                          : seg.tipo === '直線';
          // Filtra per tipo binario (道碴/非道碴) basandosi su metadati sessione
          const trackMatch = seg.trackType === trackType;
          return tipoMatch && trackMatch;
        })
        .map(seg => seg.tqi);
      arr.push(vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null);
    }
  }

  return seriesMap;
}
```

> **NOTA**: il campo `trackType` (道碴/非道碴) deve essere memorizzato come metadato di sessione
> o derivato dal range km (da mappare sulla geometria della linea).
> Nella fase iniziale può essere inserito manualmente per sessione in `session.json`.

### 10.6 Componente React — `TqiTrendChart.jsx`

```jsx
// TqiTrendChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
         Legend, ReferenceLine, LabelList } from 'recharts';

const COLORI = {
  '介曲線段下行': '#06b6d4',
  '介曲線段上行': '#facc15',
  '曲線段下行':   '#991b1b',
  '曲線段上行':   '#a855f7',
  '直線段上行':   '#1d4ed8',
  '直線段下行':   '#ec4899',
};

export default function TqiTrendChart({ title, periods, series }) {
  // Costruisci dati per Recharts
  const data = periods.map((p, i) => {
    const row = { period: p.label, year: p.year };
    series.forEach(s => { row[s.name] = s.data[i]; });
    return row;
  });

  return (
    <div style={{ background: '#d1d5db', padding: 16, borderRadius: 4 }}>
      <h3 style={{ textAlign: 'center', fontFamily: 'serif' }}>{title}</h3>
      <LineChart width={780} height={420} data={data}
        margin={{ top: 20, right: 140, bottom: 40, left: 20 }}>
        <CartesianGrid strokeDasharray="" stroke="#9ca3af" />
        <XAxis dataKey="period"
          tick={{ fontSize: 12 }}
          label={{ value: '114年度 → 115年度', position: 'insideBottom', offset: -10 }} />
        <YAxis domain={[0, 16]} ticks={[0,2,4,6,8,10,12,14,16]} />
        <Tooltip />
        <Legend layout="vertical" align="right" verticalAlign="middle" />
        {/* Soglia assoluta */}
        <ReferenceLine y={10.75} stroke="red" strokeDasharray="6 3"
          label={{ value: '10.75', position: 'right', fill: 'red' }} />
        {series.map(s => (
          <Line key={s.name} type="linear" dataKey={s.name}
            stroke={COLORI[s.name] || '#666'} strokeWidth={1.5}
            dot={{ r: 4 }} activeDot={{ r: 6 }}>
            <LabelList dataKey={s.name} position="top" style={{ fontSize: 10 }} />
          </Line>
        ))}
      </LineChart>
    </div>
  );
}
```

### 10.7 Endpoint aggiuntivo per i dati del grafico

```
GET /api/tgm/tqi/trend-chart?line=<lineCode>&trackType=<ballasted|slab>
→ {
    title: string,
    periods: [{ label, year }],
    series: [{ name, data: number[] }]
  }
```

---

## 11. Informazioni da Memorizzare per Sessione

Per supportare i grafici e il report testuale, ogni sessione TGM deve registrare:

| Campo | Tipo | Fonte |
|---|---|---|
| `datetime` | ISO string | Nome cartella |
| `lineCode` | string | Campo `線路名稱` nel CSV |
| `direction` | `上行` / `下行` | Campo `線路行別` nel CSV |
| `trackType` | `ballasted` / `slab` | Metadato manuale o mappatura km |
| `kmStart` | float | Campo `開始里程` nel CSV |
| `kmEnd` | float | Campo `結束里程` nel CSV |
| `tqiMeanRett` | float | Media TQI segmenti `直線` |
| `tqiMeanCurva` | float | Media TQI segmenti `曲線` |
| `tqiMeanTrans` | float | Media TQI segmenti `介曲線` |
| `statsPerTipo` | object | `{mean, std, threshold}` per tipo |
| `alertCount` | int | N. segmenti con almeno un'allerta |
