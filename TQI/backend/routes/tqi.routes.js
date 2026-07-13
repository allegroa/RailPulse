const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { parseTqiCsv, calcolaStatistiche, applicaSoglie } = require('../utils/tqi');

function getTgmDbPath() {
  const configPath = path.join(__dirname, '../../../DATABASE/config_db.json');
  let tgmDbPath = path.join(__dirname, '../../../DATABASE/TGM');
  try {
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (configData.systemPrefs && configData.systemPrefs.dataLocationPath) {
        tgmDbPath = path.join(configData.systemPrefs.dataLocationPath, 'TGM');
      }
    }
  } catch(e) { console.error('Errore lettura config_db.json in TQI:', e); }
  return tgmDbPath;
}

// GET /api/tqi/lines
router.get('/lines', (req, res) => {
  try {
    const linesDbPath = path.join(__dirname, '../../../DATABASE/lines.json');
    if (fs.existsSync(linesDbPath)) {
      const lines = JSON.parse(fs.readFileSync(linesDbPath, 'utf8'));
      return res.json(lines);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tqi/sessions
router.get('/sessions', (req, res) => {
  try {
    const tgmDbPath = getTgmDbPath();
    if (!fs.existsSync(tgmDbPath)) {
      return res.json([]);
    }
    const linesDbPath = path.join(__dirname, '../../../DATABASE/lines.json');
    let lines = [];
    if (fs.existsSync(linesDbPath)) {
      lines = JSON.parse(fs.readFileSync(linesDbPath, 'utf8'));
    }

    const dirs = fs.readdirSync(tgmDbPath);
    const sessions = dirs.map(dir => {
      const match = dir.match(/^(\d{4}\.\d{2}\.\d{2} \d{2}\.\d{2}\.\d{2})([A-Z]*)(\d+)\+(\d+)~([A-Z]*)(\d+)\+(\d+)$/i);
      if (match) {
        const kmStart = parseFloat(match[3] + '.' + match[4]);
        const kmEnd = parseFloat(match[6] + '.' + match[7]);
        
        // Find line by KM range
        const minKm = Math.min(kmStart, kmEnd);
        const maxKm = Math.max(kmStart, kmEnd);
        let foundLine = null;
        for (const l of lines) {
           const lMin = Math.min(l.startKm || 0, l.endKm || 0);
           const lMax = Math.max(l.startKm || 0, l.endKm || 0);
           if (minKm >= lMin - 2 && maxKm <= lMax + 2 && lMin !== lMax) {
              foundLine = l;
              break;
           }
        }

        return {
          id: dir,
          datetime: match[1].replace(/\./g, '-').replace(' ', 'T'),
          lineCode: foundLine ? foundLine.id : 'UNKNOWN',
          lineName: foundLine ? foundLine.name : `Sconosciuta (${kmStart}-${kmEnd})`,
          kmStart: kmStart,
          kmEnd: kmEnd,
        };
      }
      return { id: dir, lineName: 'Altre Sessioni' };
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tqi/segments?session=<id>
router.get('/segments', (req, res) => {
  const sessionId = req.query.session;
  if (!sessionId) return res.status(400).json({ error: 'Manca il parametro session' });

  try {
    const tgmDbPath = getTgmDbPath();
    const sessionPath = path.join(tgmDbPath, sessionId);
    if (!fs.existsSync(sessionPath)) {
      return res.status(404).json({ error: 'Sessione non trovata' });
    }
    const csvFiles = fs.readdirSync(sessionPath).filter(f => f.includes('TQI'));
    if (!csvFiles.length) return res.status(404).json({ error: 'CSV TQI non trovato' });

    const segments = parseTqiCsv(path.join(sessionPath, csvFiles[0]));
    const stats = calcolaStatistiche(segments);
    const withAlerts = applicaSoglie(segments, stats);
    res.json({ session: sessionId, segments: withAlerts, statistics: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tqi/alerts?session=<id>
router.get('/alerts', (req, res) => {
  try {
    const tgmDbPath = getTgmDbPath();
    const sessionDir = path.join(tgmDbPath, req.query.session);
    if (!fs.existsSync(sessionDir)) return res.status(404).json({ error: 'Sessione non trovata' });

    const csvFiles = fs.readdirSync(sessionDir).filter(f => f.includes('TQI'));
    if (!csvFiles.length) return res.status(404).json({ error: 'CSV TQI non trovato' });

    const segments = parseTqiCsv(path.join(sessionDir, csvFiles[0]));
    const stats = calcolaStatistiche(segments);
    const withAlerts = applicaSoglie(segments, stats);
    const alerts = withAlerts.filter(s => s.alerts && s.alerts.length > 0);
    res.json({ session: req.query.session, alerts, statistics: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tqi/trend?line=<id>
router.get('/trend', (req, res) => {
  const lineCode = req.query.line;
  const targetKm = req.query.km ? parseFloat(req.query.km) : null;
  
  if (!lineCode) return res.status(400).json({ error: 'Manca il parametro line' });

  try {
    const tgmDbPath = getTgmDbPath();
    if (!fs.existsSync(tgmDbPath)) {
      return res.json([]);
    }

    const linesDbPath = path.join(__dirname, '../../../DATABASE/lines.json');
    let lines = [];
    if (fs.existsSync(linesDbPath)) {
      lines = JSON.parse(fs.readFileSync(linesDbPath, 'utf8'));
    }

    const dirs = fs.readdirSync(tgmDbPath);
    const trendData = [];

    for (const dir of dirs) {
      const match = dir.match(/^(\d{4}\.\d{2}\.\d{2} \d{2}\.\d{2}\.\d{2})([A-Z]*)(\d+)\+(\d+)~([A-Z]*)(\d+)\+(\d+)$/i);
      if (match) {
        const kmStart = parseFloat(match[3] + '.' + match[4]);
        const kmEnd = parseFloat(match[6] + '.' + match[7]);
        const minKm = Math.min(kmStart, kmEnd);
        const maxKm = Math.max(kmStart, kmEnd);
        
        let foundLineCode = null;
        for (const l of lines) {
           const lMin = Math.min(l.startKm || 0, l.endKm || 0);
           const lMax = Math.max(l.startKm || 0, l.endKm || 0);
           if (minKm >= lMin - 2 && maxKm <= lMax + 2 && lMin !== lMax) {
              foundLineCode = l.id;
              break;
           }
        }

        if (foundLineCode === lineCode) {
          const sessionPath = path.join(tgmDbPath, dir);
          const csvFiles = fs.readdirSync(sessionPath).filter(f => f.includes('TQI'));
          if (csvFiles.length) {
          const segments = parseTqiCsv(path.join(sessionPath, csvFiles[0]));
          
          if (targetKm !== null && !isNaN(targetKm)) {
            // Cerca il segmento specifico (tolleranza di 0.001 km)
            const seg = segments.find(s => Math.abs(s.km - targetKm) < 0.005);
            if (seg) {
              trendData.push({
                sessionId: dir,
                date: match[1].replace(/\./g, '-').replace(' ', 'T'),
                direction: segments.direction,
                averageTqi: +seg.tqi.toFixed(4)
              });
            }
          } else {
            // Calcola la media di tutta la linea e per i vari tipi
            const validSegments = segments.filter(s => s.tqi > 0);
            const avgTqi = validSegments.length > 0 
              ? validSegments.reduce((sum, s) => sum + s.tqi, 0) / validSegments.length 
              : 0;
              
            const st = validSegments.filter(s => s.tipo === '直線');
            const cv = validSegments.filter(s => s.tipo === '曲線');
            const tr = validSegments.filter(s => s.tipo === '介曲線');
            
            const avgSt = st.length ? st.reduce((sum, s) => sum + s.tqi, 0) / st.length : null;
            const avgCv = cv.length ? cv.reduce((sum, s) => sum + s.tqi, 0) / cv.length : null;
            const avgTr = tr.length ? tr.reduce((sum, s) => sum + s.tqi, 0) / tr.length : null;

            trendData.push({
              sessionId: dir,
              date: match[1].replace(/\./g, '-').replace(' ', 'T'),
              direction: segments.direction,
              averageTqi: +avgTqi.toFixed(4),
              avgStraight: avgSt ? +avgSt.toFixed(4) : null,
              avgCurve: avgCv ? +avgCv.toFixed(4) : null,
              avgTransition: avgTr ? +avgTr.toFixed(4) : null
            });
          }
        }
      }
    }
  }

    // Ordina per data crescente
    trendData.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(trendData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
