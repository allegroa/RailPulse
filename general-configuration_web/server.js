import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { parseStringPromise, processors } from 'xml2js';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;
const DB_PATH = path.join(__dirname, '..', 'DATABASE', 'config_db.json');
const LINES_DB_PATH = path.join(__dirname, '..', 'DATABASE', 'lines.json');

app.use(cors());
app.use(express.json());

const GIS_DIR = path.join(__dirname, '..', 'DATABASE', 'GIS');



// Helper per leggere il database delle configurazioni
async function readConfig() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.systemPrefs) {
      parsed.systemPrefs = { dataLocationType: 'local', dataLocationPath: '', serverIp: '' };
      await writeConfig(parsed);
    }
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Se non esiste, crea la struttura di base
      const defaultConfig = {
        language: {
          active: 'it',
          available: [
            { code: 'it', label: 'Italiano' },
            { code: 'en', label: 'English' },
            { code: 'zh', label: '简体中文' },
            { code: 'zh-TW', label: '繁體中文 (台灣)' }
          ]
        },
        lines: [],
        operators: [],
        taskTypes: [],
        systemPrefs: { dataLocationType: 'local', dataLocationPath: '', serverIp: '' }
      };
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      await fs.writeFile(DB_PATH, JSON.stringify(defaultConfig, null, 2), 'utf-8');
      return defaultConfig;
    }
    console.error('Errore durante la lettura di config_db.json:', error);
    return null;
  }
}

// Helper per leggere il database delle linee
async function readLinesDB() {
  try {
    const data = await fs.readFile(LINES_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Migrate from config_db.json if possible
      const config = await readConfig();
      const lines = config && config.lines ? config.lines : [];
      await fs.mkdir(path.dirname(LINES_DB_PATH), { recursive: true });
      await fs.writeFile(LINES_DB_PATH, JSON.stringify(lines, null, 2), 'utf-8');
      return lines;
    }
    console.error('Errore durante la lettura di lines.json:', error);
    return [];
  }
}

// Helper per scrivere sul database delle linee
async function writeLinesDB(lines) {
  try {
    await fs.mkdir(path.dirname(LINES_DB_PATH), { recursive: true });
    await fs.writeFile(LINES_DB_PATH, JSON.stringify(lines, null, 2), 'utf-8');
  } catch (error) {
    console.error('Errore durante la scrittura su lines.json:', error);
    throw error;
  }
}

// Helper per scrivere sul database
async function writeConfig(config) {
  try {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('Errore durante la scrittura su config_db.json:', error);
    throw error;
  }
}

// Helper per leggere i dati GIS di una linea
async function readGis(lineId) {
  const filePath = path.join(GIS_DIR, `${lineId}_gis.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const defaultGis = {
        lineId,
        gisLayers: {
          stations:   [],
          sleepers:   [],
          slab:       [],
          ballast:    [],
          curvatures: [],
          tonnage:    [],
          switches:   []
        }
      };
      await fs.mkdir(GIS_DIR, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(defaultGis, null, 2), 'utf-8');
      return defaultGis;
    }
    console.error(`Errore lettura GIS per linea ${lineId}:`, error);
    throw error;
  }
}

// Helper per scrivere i dati GIS di una linea
async function writeGis(lineId, data) {
  const filePath = path.join(GIS_DIR, `${lineId}_gis.json`);
  try {
    await fs.mkdir(GIS_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Errore scrittura GIS per linea ${lineId}:`, error);
    throw error;
  }
}

// GET /api/config - Recupera intera configurazione
app.get('/api/config', async (req, res) => {
  const config = await readConfig();
  if (!config) {
    return res.status(500).json({ error: 'Errore interno del server' });
  }
  const lines = await readLinesDB();
  config.lines = lines || [];
  res.json(config);
});

// GET /api/config/system-prefs - Ottiene preferenze di sistema
app.get('/api/config/system-prefs', async (req, res) => {
  const config = await readConfig();
  res.json(config ? config.systemPrefs : {});
});

// POST /api/config/system-prefs - Aggiorna preferenze di sistema
app.post('/api/config/system-prefs', async (req, res) => {
  try {
    const { dataLocationType, dataLocationPath, serverIp } = req.body;
    const config = await readConfig();
    config.systemPrefs = {
      dataLocationType: dataLocationType || config.systemPrefs.dataLocationType,
      dataLocationPath: dataLocationPath !== undefined ? dataLocationPath : config.systemPrefs.dataLocationPath,
      serverIp: serverIp !== undefined ? serverIp : config.systemPrefs.serverIp
    };
    await writeConfig(config);
    res.json({ success: true, systemPrefs: config.systemPrefs });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il salvataggio delle preferenze di sistema.' });
  }
});

// POST /api/config/language - Imposta lingua attiva
app.post('/api/config/language', async (req, res) => {
  try {
    const { active } = req.body;
    if (!active) {
      return res.status(400).json({ error: 'Il campo active è obbligatorio.' });
    }

    const config = await readConfig();
    const langExists = config.language.available.some(lang => lang.code === active);
    
    if (!langExists) {
      return res.status(400).json({ error: `La lingua '${active}' non è tra quelle disponibili.` });
    }

    config.language.active = active;
    await writeConfig(config);
    res.json({ success: true, activeLanguage: active });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della lingua.' });
  }
});

// GET /api/config/lines - Ottiene linee
app.get('/api/config/lines', async (req, res) => {
  const lines = await readLinesDB();
  res.json(lines || []);
});

// POST /api/config/lines - Crea una linea
app.post('/api/config/lines', async (req, res) => {
  try {
    const { id, name, color, stationSymbol, stationNumber, startKm, endKm, tracks } = req.body;
    if (!id || !name || startKm === undefined || endKm === undefined || !tracks) {
      return res.status(400).json({ error: 'Tutti i campi principali sono obbligatori.' });
    }

    const lines = await readLinesDB();
    if (lines.some(l => l.id === id)) {
      return res.status(400).json({ error: `Una linea con ID '${id}' esiste già.` });
    }

    const newLine = {
      id,
      name,
      color: color || '#2196f3',
      stationSymbol: stationSymbol ? stationSymbol.toUpperCase() : '',
      stationNumber: stationNumber ? parseInt(stationNumber, 10) : 0,
      startKm: parseFloat(startKm),
      endKm: parseFloat(endKm),
      tracks: Array.isArray(tracks) ? tracks : [tracks]
    };

    lines.push(newLine);
    await writeLinesDB(lines);
    res.status(201).json(newLine);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante la creazione della linea.' });
  }
});

// PUT /api/config/lines/:id - Aggiorna linea
app.put('/api/config/lines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, stationSymbol, stationNumber, startKm, endKm, tracks } = req.body;

    const lines = await readLinesDB();
    const index = lines.findIndex(l => l.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Linea non trovata.' });
    }

    const updatedLine = {
      ...lines[index],
      name: name || lines[index].name,
      color: color || lines[index].color || '#2196f3',
      stationSymbol: stationSymbol !== undefined ? stationSymbol.toUpperCase() : lines[index].stationSymbol,
      stationNumber: stationNumber !== undefined ? parseInt(stationNumber, 10) : lines[index].stationNumber,
      startKm: startKm !== undefined ? parseFloat(startKm) : lines[index].startKm,
      endKm: endKm !== undefined ? parseFloat(endKm) : lines[index].endKm,
      tracks: tracks || lines[index].tracks
    };

    lines[index] = updatedLine;
    await writeLinesDB(lines);
    res.json(updatedLine);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della linea.' });
  }
});

// DELETE /api/config/lines/:id - Elimina linea
app.delete('/api/config/lines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lines = await readLinesDB();
    const filtered = lines.filter(l => l.id !== id);

    if (lines.length === filtered.length) {
      return res.status(404).json({ error: 'Linea non trovata.' });
    }

    await writeLinesDB(filtered);
    res.json({ success: true, message: 'Linea eliminata con successo.' });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'eliminazione della linea.' });
  }
});

// GET /api/config/operators - Ottiene operatori
app.get('/api/config/operators', async (req, res) => {
  const config = await readConfig();
  res.json(config ? config.operators : []);
});

// POST /api/config/operators - Aggiunge operatore
app.post('/api/config/operators', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Il campo name è obbligatorio.' });
    }

    const config = await readConfig();
    if (config.operators.some(op => op.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ error: 'Operatore già registrato.' });
    }

    config.operators.push(name);
    await writeConfig(config);
    res.status(201).json(name);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'inserimento dell\'operatore.' });
  }
});

// DELETE /api/config/operators/:name - Elimina operatore
app.delete('/api/config/operators/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const config = await readConfig();
    const initialLength = config.operators.length;
    
    config.operators = config.operators.filter(op => op.toLowerCase() !== name.toLowerCase());

    if (config.operators.length === initialLength) {
      return res.status(404).json({ error: 'Operatore non trovato.' });
    }

    await writeConfig(config);
    res.json({ success: true, message: 'Operatore rimosso con successo.' });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante la rimozione dell\'operatore.' });
  }
});

// GET /api/config/task-types - Ottiene tipologie di intervento
app.get('/api/config/task-types', async (req, res) => {
  const config = await readConfig();
  res.json(config ? config.taskTypes : []);
});

// POST /api/config/task-types - Aggiunge o modifica tipologia
app.post('/api/config/task-types', async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    if (!name || !color || !icon) {
      return res.status(400).json({ error: 'I campi name, color, icon sono tutti obbligatori.' });
    }

    const config = await readConfig();
    const index = config.taskTypes.findIndex(t => t.name.toLowerCase() === name.toLowerCase());

    const newTaskType = { name, color, icon };

    if (index !== -1) {
      config.taskTypes[index] = newTaskType;
    } else {
      config.taskTypes.push(newTaskType);
    }

    await writeConfig(config);
    res.status(index !== -1 ? 200 : 201).json(newTaskType);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il salvataggio della tipologia di intervento.' });
  }
});

// DELETE /api/config/task-types/:name - Rimuove tipologia
app.delete('/api/config/task-types/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const config = await readConfig();
    const filtered = config.taskTypes.filter(t => t.name.toLowerCase() !== name.toLowerCase());

    if (config.taskTypes.length === filtered.length) {
      return res.status(404).json({ error: 'Tipologia di intervento non trovata.' });
    }

    config.taskTypes = filtered;
    await writeConfig(config);
    res.json({ success: true, message: 'Tipologia rimossa con successo.' });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante la rimozione della tipologia.' });
  }
});

// GET /api/config/stations - Ottiene le stazioni
app.get('/api/config/stations', async (req, res) => {
  try {
    const stationDbPath = path.join(__dirname, '..', 'DATABASE', 'station.json');
    const data = await fs.readFile(stationDbPath, 'utf-8');
    const stations = JSON.parse(data);
    res.json({ success: true, stations });
  } catch (error) {
    console.error('Errore durante la lettura di station.json:', error);
    res.status(500).json({ error: 'Errore durante la lettura delle stazioni', stations: [] });
  }
});

// POST /api/config/stations - Crea o aggiorna stazione
app.post('/api/config/stations', async (req, res) => {
  try {
    const { station } = req.body;
    if (!station || !station.code) {
      return res.status(400).json({ success: false, error: 'Codice stazione mancante' });
    }
    if (/^\d+$/.test(station.code)) {
      return res.status(400).json({ success: false, error: 'Codice non valido' });
    }

    const stationDbPath = path.join(__dirname, '..', 'DATABASE', 'station.json');
    let stations = [];
    try {
      const data = await fs.readFile(stationDbPath, 'utf-8');
      stations = JSON.parse(data);
    } catch (e) {
      stations = [];
    }

    const idx = stations.findIndex(s => s.code === station.code);
    if (idx >= 0) {
      if (station.name !== undefined) stations[idx].name = station.name;
      if (station.kmStart !== undefined) stations[idx].kmStart = station.kmStart;
      if (station.kmEnd !== undefined) stations[idx].kmEnd = station.kmEnd;
      if (station.tracks !== undefined) stations[idx].tracks = station.tracks;
      if (station.lineCode !== undefined) stations[idx].lineCode = station.lineCode;
      if (station.stationNumber !== undefined) stations[idx].stationNumber = station.stationNumber;
      if (station.stationType !== undefined) stations[idx].stationType = station.stationType;
      if (station.colorCode !== undefined) stations[idx].colorCode = station.colorCode;
    } else {
      stations.push(station);
      stations.sort((a, b) => a.code.localeCompare(b.code));
    }

    await fs.writeFile(stationDbPath, JSON.stringify(stations, null, 2), 'utf-8');
    res.json({ success: true, stations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/config/stations/:code - Elimina stazione
app.delete('/api/config/stations/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const stationDbPath = path.join(__dirname, '..', 'DATABASE', 'station.json');
    let stations = [];
    try {
      const data = await fs.readFile(stationDbPath, 'utf-8');
      stations = JSON.parse(data);
    } catch (e) {
      stations = [];
    }

    stations = stations.filter(s => s.code !== code);
    await fs.writeFile(stationDbPath, JSON.stringify(stations, null, 2), 'utf-8');
    res.json({ success: true, stations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GIS Database Routes ───────────────────────────────────────────────────

// Configurazione multer per l'upload temporaneo in memoria
const upload = multer({ storage: multer.memoryStorage() });

const VALID_LAYERS = ['stations', 'sleepers', 'slab', 'ballast', 'curvatures', 'tonnage', 'switches'];

// GET tutti i layer GIS di una linea
app.get('/api/config/gis/:lineId', async (req, res) => {
  try {
    const { lineId } = req.params;
    const gis = await readGis(lineId);
    res.json({ success: true, data: gis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST – importa un file RailML per precompilare il GIS
app.post('/api/config/gis/:lineId/import-railml', upload.single('file'), async (req, res) => {
  try {
    const { lineId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nessun file fornito' });
    }

    const xmlData = req.file.buffer.toString('utf-8');
    const result = await parseStringPromise(xmlData, { 
      explicitArray: false, 
      mergeAttrs: true,
      tagNameProcessors: [processors.stripPrefix]
    });

    const gis = await readGis(lineId);

    const overwrite = req.body.overwrite === 'true';
    if (overwrite) {
      gis.gisLayers = { stations: [], sleepers: [], slab: [], ballast: [], curvatures: [], tonnage: [], switches: [], topology: { nodes: [], edges: [] } };
    }
    if (!gis.gisLayers.topology) {
      gis.gisLayers.topology = { nodes: [], edges: [] };
    }

    // Se è un file codelist, importiamo gli operatori
    if (result?.infrastructureManagerCodes) {
      const managers = result.infrastructureManagerCodes.infrastructureManager || [];
      const managerList = Array.isArray(managers) ? managers : [managers];
      let db = { operators: [] };
      try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        db = JSON.parse(data);
      } catch (e) {}
      if (!db.operators) db.operators = [];
      let count = 0;
      for (const m of managerList) {
        let nameObj = m.name;
        let nameStr = m.code;
        if (nameObj) {
          if (Array.isArray(nameObj)) {
            const en = nameObj.find(n => n['xml:lang'] === 'en');
            if (en) nameStr = en._ || en;
            else nameStr = nameObj[0]._ || nameObj[0];
          } else {
            nameStr = nameObj._ || nameObj;
          }
        }
        const fullName = `${m.code} - ${nameStr}`;
        if (!db.operators.includes(fullName)) {
          db.operators.push(fullName);
          count++;
        }
      }
      await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
      return res.json({ success: true, message: `Importati ${count} operatori dalla codelist!`, gis: await readGis(lineId) });
    }

    const infrastructure = result?.railml?.infrastructure || result?.infrastructure || result?.railML?.infrastructure;
    if (!infrastructure) {
      const keys = Object.keys(result || {}).join(', ');
      return res.status(400).json({ success: false, error: `Formato RailML non valido o schema infrastructure mancante. Radici trovate nel file: [${keys}]` });
    }

    // Parsing RailML 2.5
    let tracks = infrastructure.tracks?.track;
    if (tracks) {
      if (!Array.isArray(tracks)) tracks = [tracks];

      // Build connection map for matching connections
      const connectionMap = {};
      tracks.forEach(track => {
        const topo = track.trackTopology;
        if (topo) {
          if (topo.trackBegin?.connection) {
            const conns = Array.isArray(topo.trackBegin.connection) ? topo.trackBegin.connection : [topo.trackBegin.connection];
            conns.forEach(conn => {
              connectionMap[conn.id] = {
                trackId: track.id,
                type: 'begin',
                pos: parseFloat(topo.trackBegin.pos || 0)
              };
            });
          }
          if (topo.trackEnd?.connection) {
            const conns = Array.isArray(topo.trackEnd.connection) ? topo.trackEnd.connection : [topo.trackEnd.connection];
            conns.forEach(conn => {
              connectionMap[conn.id] = {
                trackId: track.id,
                type: 'end',
                pos: parseFloat(topo.trackEnd.pos || 0)
              };
            });
          }
          if (topo.connections) {
            ['switch', 'crossing'].forEach(ctype => {
              const items = topo.connections[ctype];
              if (items) {
                const itemArr = Array.isArray(items) ? items : [items];
                itemArr.forEach(item => {
                  const conns = item.connection;
                  if (conns) {
                    const connArr = Array.isArray(conns) ? conns : [conns];
                    connArr.forEach(c => {
                      connectionMap[c.id] = {
                        trackId: track.id,
                        type: ctype,
                        itemId: item.id,
                        pos: parseFloat(item.pos || 0),
                        course: c.course,
                        orientation: c.orientation
                      };
                    });
                  }
                });
              }
            });
          }
        }
      });

      // Build edges map (deduplicated)
      const edgesMap = new Map();
      tracks.forEach(track => {
        const topo = track.trackTopology;
        if (topo) {
          const processConnection = (conn, sourceType, sourcePos, switchId = null) => {
            if (conn && conn.ref) {
              const targetConn = connectionMap[conn.ref];
              if (targetConn) {
                const edgeKey = [conn.id, conn.ref].sort().join('_');
                if (!edgesMap.has(edgeKey)) {
                  edgesMap.set(edgeKey, {
                    id: edgeKey,
                    source: track.id,
                    target: targetConn.trackId,
                    sourceConn: conn.id,
                    targetConn: conn.ref,
                    sourceType,
                    targetType: targetConn.type,
                    sourcePos,
                    targetPos: targetConn.pos,
                    switchId: switchId || targetConn.itemId || null
                  });
                }
              }
            }
          };

          if (topo.trackBegin?.connection) {
            const conns = Array.isArray(topo.trackBegin.connection) ? topo.trackBegin.connection : [topo.trackBegin.connection];
            conns.forEach(conn => processConnection(conn, 'begin', parseFloat(topo.trackBegin.pos || 0)));
          }
          if (topo.trackEnd?.connection) {
            const conns = Array.isArray(topo.trackEnd.connection) ? topo.trackEnd.connection : [topo.trackEnd.connection];
            conns.forEach(conn => processConnection(conn, 'end', parseFloat(topo.trackEnd.pos || 0)));
          }
          if (topo.connections) {
            ['switch', 'crossing'].forEach(ctype => {
              const items = topo.connections[ctype];
              if (items) {
                const itemArr = Array.isArray(items) ? items : [items];
                itemArr.forEach(item => {
                  const conns = item.connection;
                  if (conns) {
                    const connArr = Array.isArray(conns) ? conns : [conns];
                    connArr.forEach(conn => processConnection(conn, ctype, parseFloat(item.pos || 0), item.id));
                  }
                });
              }
            });
          }
        }
      });

      // Extract tracks nodes details
      const nodes = [];
      tracks.forEach(track => {
        const length = track.trackTopology?.trackEnd?.pos ? parseFloat(track.trackTopology.trackEnd.pos) : 0;
        const trackElements = track.trackElements || track.trackTopology?.trackElements || {};

        // Extract features
        const features = {
          signals: [],
          levelCrossings: [],
          platformEdges: [],
          derailers: [],
          speedChanges: []
        };

        const signals = track.ocsElements?.signals?.signal;
        if (signals) {
          const sigArr = Array.isArray(signals) ? signals : [signals];
          sigArr.forEach(s => {
            features.signals.push({
              id: s.id,
              name: s.code || s.id,
              pos: parseFloat(s.pos || 0),
              dir: s.dir || 'none',
              function: s.function || 'main',
              type: s.type || 'main'
            });
          });
        }

        const levelCrossings = trackElements.levelCrossings?.levelCrossing;
        if (levelCrossings) {
          const lcArr = Array.isArray(levelCrossings) ? levelCrossings : [levelCrossings];
          lcArr.forEach(lc => {
            features.levelCrossings.push({
              id: lc.id,
              pos: parseFloat(lc.pos || 0),
              protection: lc.protection || 'none',
              angle: parseFloat(lc.angle || 90)
            });
          });
        }

        const platformEdges = trackElements.platformEdges?.platformEdge;
        if (platformEdges) {
          const peArr = Array.isArray(platformEdges) ? platformEdges : [platformEdges];
          peArr.forEach(pe => {
            features.platformEdges.push({
              id: pe.id,
              name: pe.name || pe.id,
              pos: parseFloat(pe.pos || 0),
              length: parseFloat(pe.length || 0),
              side: pe.side || 'left'
            });
          });
        }

        const derailers = track.ocsElements?.derailers?.derailer;
        if (derailers) {
          const derArr = Array.isArray(derailers) ? derailers : [derailers];
          derArr.forEach(der => {
            features.derailers.push({
              id: der.id,
              name: der.code || der.id,
              pos: parseFloat(der.pos || 0),
              side: der.derailSide || 'none'
            });
          });
        }

        const speedChanges = trackElements.speedChanges?.speedChange;
        if (speedChanges) {
          const scArr = Array.isArray(speedChanges) ? speedChanges : [speedChanges];
          scArr.forEach(sc => {
            features.speedChanges.push({
              id: sc.id,
              pos: parseFloat(sc.pos || 0),
              vMax: sc.vMax || 'end'
            });
          });
        }

        nodes.push({
          id: track.id,
          name: track.name || track.id,
          type: track.type || 'track',
          length,
          features
        });

        // Curvatures
        let radiusChanges = trackElements.radiusChanges?.radiusChange;
        if (radiusChanges) {
          if (!Array.isArray(radiusChanges)) radiusChanges = [radiusChanges];
          radiusChanges.forEach(rc => {
            const km = parseFloat(rc.pos || 0) / 1000;
            gis.gisLayers.curvatures.push({
              id: uuidv4(),
              startKm: km,
              endKm: km + 0.1,
              radius: parseFloat(rc.radius || 0),
              superElevation: 0,
              transitionType: 'None',
              transitionLength: 0,
              color: '#FFC107'
            });
          });
        }

        // Switches
        let switches = trackElements?.switches?.switch || track.trackTopology?.connections?.switch || track.trackTopology?.connections?.crossing;
        if (switches) {
          if (!Array.isArray(switches)) switches = [switches];
          switches.forEach(sw => {
            const km = parseFloat(sw.pos || 0) / 1000;
            gis.gisLayers.switches.push({
              id: uuidv4(),
              km: km,
              switchId: sw.id || '',
              switchType: sw.type || 'Simple',
              angle: '1:12',
              condition: 'Good',
              color: '#2196F3'
            });
          });
        }
        
        // Ballast/Sleepers
        let trackConditions = track.trackElements?.trackConditions?.trackCondition;
        if (trackConditions) {
          if (!Array.isArray(trackConditions)) trackConditions = [trackConditions];
          trackConditions.forEach(tc => {
            if (tc.type === 'ballast') {
              const startKm = parseFloat(tc.pos || 0) / 1000;
              const length = parseFloat(tc.length || 100) / 1000;
              gis.gisLayers.ballast.push({
                id: uuidv4(),
                startKm: startKm,
                endKm: startKm + length,
                ballastType: 'Mixed',
                condition: 'Good',
                color: '#9E9E9E'
              });
            }
          });
        }
      });

      // Extract OCPs (stations)
      const ocps = [];
      const ocpElements = infrastructure.operationControlPoints?.ocp;
      if (ocpElements) {
        const ocpArr = Array.isArray(ocpElements) ? ocpElements : [ocpElements];
        ocpArr.forEach(ocp => {
          let name = ocp.name;
          if (name && typeof name === 'object') {
            name = name._ || name.name || ocp.id;
          }
          let coord = ocp.geoCoord?.coord;
          let lat = null, lon = null;
          if (coord) {
            const parts = coord.trim().split(/\s+/);
            if (parts.length >= 2) {
              lat = parseFloat(parts[0]);
              lon = parseFloat(parts[1]);
            }
          }
          const tracksList = [];
          if (ocp.propEquipment?.trackRef) {
            const refs = Array.isArray(ocp.propEquipment.trackRef) ? ocp.propEquipment.trackRef : [ocp.propEquipment.trackRef];
            refs.forEach(r => {
              if (r.ref) tracksList.push(r.ref);
            });
          }
          ocps.push({
            id: ocp.id,
            name: name || ocp.id,
            lat,
            lon,
            tracks: tracksList
          });
        });
      }

      // Associate cross-section ocpRefs to OCPs
      tracks.forEach(track => {
        const crossSections = track.trackTopology?.crossSections?.crossSection;
        if (crossSections) {
          const csArr = Array.isArray(crossSections) ? crossSections : [crossSections];
          csArr.forEach(cs => {
            if (cs.ocpRef) {
              const ocp = ocps.find(o => o.id === cs.ocpRef);
              if (ocp) {
                if (!ocp.tracks.includes(track.id)) {
                  ocp.tracks.push(track.id);
                }
              }
            }
          });
        }
      });

      // Extract main line
      let mainLine = [];
      const lineElements = infrastructure.trackGroups?.line;
      if (lineElements) {
        const lineArr = Array.isArray(lineElements) ? lineElements : [lineElements];
        const firstLine = lineArr[0];
        if (firstLine && firstLine.trackRef) {
          const trackRefs = Array.isArray(firstLine.trackRef) ? firstLine.trackRef : [firstLine.trackRef];
          const sortedRefs = [...trackRefs].sort((a, b) => parseInt(a.sequence || 0) - parseInt(b.sequence || 0));
          mainLine = sortedRefs.map(tr => tr.ref);
        }
      }

      gis.gisLayers.topology = {
        nodes,
        edges: Array.from(edgesMap.values()),
        ocps,
        mainLine
      };
    }

    await writeGis(lineId, gis);
    res.json({ success: true, message: 'File RailML 2.5 processato', gis });
  } catch (err) {
    console.error('Errore durante il parsing RailML:', err);
    res.status(500).json({ success: false, error: 'Errore durante il parsing del file XML: ' + err.message });
  }
});

// GET un singolo layer GIS
app.get('/api/config/gis/:lineId/:layer', async (req, res) => {
  try {
    const { lineId, layer } = req.params;
    if (!VALID_LAYERS.includes(layer)) {
      return res.status(400).json({ success: false, error: `Layer non valido: ${layer}` });
    }
    const gis = await readGis(lineId);
    res.json({ success: true, segments: gis.gisLayers[layer] || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST – aggiunge un segmento a un layer GIS
app.post('/api/config/gis/:lineId/:layer', async (req, res) => {
  try {
    const { lineId, layer } = req.params;
    if (!VALID_LAYERS.includes(layer)) {
      return res.status(400).json({ success: false, error: `Layer non valido: ${layer}` });
    }
    const segment = { ...req.body, id: uuidv4() };

    // Validazione base
    if (segment.startKm === undefined || segment.endKm === undefined) {
      return res.status(400).json({ success: false, error: "startKm e endKm sono obbligatori" });
    }
    if (parseFloat(segment.startKm) >= parseFloat(segment.endKm)) {
      return res.status(400).json({ success: false, error: "startKm deve essere minore di endKm" });
    }

    const gis = await readGis(lineId);
    if (!gis.gisLayers[layer]) {
      gis.gisLayers[layer] = [];
    }
    gis.gisLayers[layer].push(segment);
    await writeGis(lineId, gis);
    res.status(201).json({ success: true, segment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT – aggiorna un segmento esistente
app.put('/api/config/gis/:lineId/:layer/:segmentId', async (req, res) => {
  try {
    const { lineId, layer, segmentId } = req.params;
    if (!VALID_LAYERS.includes(layer)) {
      return res.status(400).json({ success: false, error: `Layer non valido: ${layer}` });
    }

    const gis = await readGis(lineId);
    if (!gis.gisLayers[layer]) {
      gis.gisLayers[layer] = [];
    }
    const idx = gis.gisLayers[layer].findIndex(s => s.id === segmentId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Segmento non trovato' });
    }

    // Validazione
    const updated = { ...gis.gisLayers[layer][idx], ...req.body, id: segmentId };
    if (parseFloat(updated.startKm) >= parseFloat(updated.endKm)) {
      return res.status(400).json({ success: false, error: "startKm deve essere minore di endKm" });
    }

    gis.gisLayers[layer][idx] = updated;
    await writeGis(lineId, gis);
    res.json({ success: true, segment: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE – elimina un segmento da un layer GIS
app.delete('/api/config/gis/:lineId/:layer/:segmentId', async (req, res) => {
  try {
    const { lineId, layer, segmentId } = req.params;
    if (!VALID_LAYERS.includes(layer)) {
      return res.status(400).json({ success: false, error: `Layer non valido: ${layer}` });
    }

    const gis = await readGis(lineId);
    if (!gis.gisLayers[layer]) {
      gis.gisLayers[layer] = [];
    }
    const initial = gis.gisLayers[layer].length;
    gis.gisLayers[layer] = gis.gisLayers[layer].filter(s => s.id !== segmentId);

    if (gis.gisLayers[layer].length === initial) {
      return res.status(404).json({ success: false, error: 'Segmento non trovato' });
    }

    await writeGis(lineId, gis);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});





// Gestione Frontend (Static files per ambiente di produzione)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('general-configuration_web backend attivo. Frontend in attesa di compilazione o attivo su porta di sviluppo.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[general-configuration_web] Server attivo sulla porta ${PORT}`);
});
