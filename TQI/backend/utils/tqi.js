const fs    = require('fs');
const iconv = require('iconv-lite');

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

  // Trova la riga header colonne (cerca '(Km)' per maggiore robustezza con vari encoding)
  let dataStart = -1;
  let direction = 'UP'; // Default
  for (let i = 0; i < lines.length; i++) {
    const lUpper = lines[i].toUpperCase();
    if (i < 10) {
      if (lUpper.includes('UP')) direction = 'UP';
      else if (lUpper.includes('DN') || lUpper.includes('DOWN')) direction = 'DN';
    }
    if (lUpper.includes('(KM)')) { dataStart = i + 1; break; }
  }
  if (dataStart === -1) throw new Error(`Header non trovato in: ${filePath}`);

  const segments = [];
  for (let i = dataStart; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 10 || !cols[0] || isNaN(parseFloat(cols[0]))) continue;

    const leftAlign = parseFloat(cols[2]) || 0;
    const rightAlign = parseFloat(cols[3]) || 0;
    const leftLevel = parseFloat(cols[4]) || 0;
    const rightLevel = parseFloat(cols[5]) || 0;
    const cant = parseFloat(cols[6]) || 0;
    const gauge = parseFloat(cols[7]) || 0;
    const twist = parseFloat(cols[8]) || 0;
    
    // Calcolo TQI con formula interna: somma delle deviazioni standard
    const calculatedTqi = leftAlign + rightAlign + leftLevel + rightLevel + cant + gauge + twist;

    segments.push({
      km:     parseFloat(cols[0]),
      tipo:   cols[1]?.trim() ?? '',
      sigma: {
        leftAlign, rightAlign, leftLevel, rightLevel, cant, gauge, twist
      },
      tqi:    parseFloat(calculatedTqi.toFixed(4)),
      status: cols[10]?.trim()     ?? '',
      speed:  parseFloat(cols[11]) || 0,
    });
  }
  segments.direction = direction;
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
