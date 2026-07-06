import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { parseStringPromise } from 'xml2js';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;
const DB_PATH = path.join(__dirname, 'database', 'config_db.json');

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
  const config = await readConfig();
  res.json(config ? config.lines : []);
});

// POST /api/config/lines - Crea una linea
app.post('/api/config/lines', async (req, res) => {
  try {
    const { id, name, startKm, endKm, tracks } = req.body;
    if (!id || !name || startKm === undefined || endKm === undefined || !tracks) {
      return res.status(400).json({ error: 'Tutti i campi (id, name, startKm, endKm, tracks) sono obbligatori.' });
    }

    const config = await readConfig();
    if (config.lines.some(l => l.id === id)) {
      return res.status(400).json({ error: `Una linea con ID '${id}' esiste già.` });
    }

    const newLine = {
      id,
      name,
      startKm: parseFloat(startKm),
      endKm: parseFloat(endKm),
      tracks: Array.isArray(tracks) ? tracks : [tracks]
    };

    config.lines.push(newLine);
    await writeConfig(config);
    res.status(201).json(newLine);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante la creazione della linea.' });
  }
});

// PUT /api/config/lines/:id - Aggiorna linea
app.put('/api/config/lines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startKm, endKm, tracks } = req.body;

    const config = await readConfig();
    const index = config.lines.findIndex(l => l.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Linea non trovata.' });
    }

    const updatedLine = {
      ...config.lines[index],
      name: name || config.lines[index].name,
      startKm: startKm !== undefined ? parseFloat(startKm) : config.lines[index].startKm,
      endKm: endKm !== undefined ? parseFloat(endKm) : config.lines[index].endKm,
      tracks: tracks || config.lines[index].tracks
    };

    config.lines[index] = updatedLine;
    await writeConfig(config);
    res.json(updatedLine);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della linea.' });
  }
});

// DELETE /api/config/lines/:id - Elimina linea
app.delete('/api/config/lines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const config = await readConfig();
    const filtered = config.lines.filter(l => l.id !== id);

    if (config.lines.length === filtered.length) {
      return res.status(404).json({ error: 'Linea non trovata.' });
    }

    config.lines = filtered;
    await writeConfig(config);
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

const VALID_LAYERS = ['sleepers', 'slab', 'ballast', 'curvatures', 'tonnage', 'switches'];

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
    if (layer !== 'switches' && (segment.startKm === undefined || segment.endKm === undefined)) {
      return res.status(400).json({ success: false, error: 'startKm e endKm sono obbligatori' });
    }
    if (layer !== 'switches' && parseFloat(segment.startKm) >= parseFloat(segment.endKm)) {
      return res.status(400).json({ success: false, error: 'startKm deve essere minore di endKm' });
    }
    if (layer === 'switches' && segment.km === undefined) {
      return res.status(400).json({ success: false, error: 'km è obbligatorio per gli scambi' });
    }

    const gis = await readGis(lineId);
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
    const idx = gis.gisLayers[layer].findIndex(s => s.id === segmentId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Segmento non trovato' });
    }

    // Validazione
    const updated = { ...gis.gisLayers[layer][idx], ...req.body, id: segmentId };
    if (layer !== 'switches' && parseFloat(updated.startKm) >= parseFloat(updated.endKm)) {
      return res.status(400).json({ success: false, error: 'startKm deve essere minore di endKm' });
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

// Configurazione multer per l'upload temporaneo in memoria
const upload = multer({ storage: multer.memoryStorage() });

// POST – importa un file RailML per precompilare il GIS
app.post('/api/config/gis/:lineId/import-railml', upload.single('file'), async (req, res) => {
  try {
    const { lineId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nessun file fornito' });
    }

    const xmlData = req.file.buffer.toString('utf-8');
    const result = await parseStringPromise(xmlData, { explicitArray: false, mergeAttrs: true });

    // Ottieni i dati GIS esistenti per non sovrascrivere tutto, o creane di nuovi
    const gis = await readGis(lineId);

    // Esempio logico di estrazione da RailML 3:
    // Questa è una struttura molto basilare basata sullo standard.
    // L'implementazione reale dipenderà fortemente dallo schema esatto caricato.
    
    // Per sicurezza, resettiamo o prepariamo i layer se l'utente vuole sovrascrivere
    const overwrite = req.body.overwrite === 'true';
    if (overwrite) {
      gis.gisLayers = { sleepers: [], slab: [], ballast: [], curvatures: [], tonnage: [], switches: [] };
    }

    const infrastructure = result?.railml?.infrastructure || result?.infrastructure;
    if (!infrastructure) {
      return res.status(400).json({ success: false, error: 'Formato RailML non valido o schema infrastructure mancante' });
    }

    // Estrazione TrackParameters -> trackBed per traverse/slab/ballast
    let trackParameters = infrastructure.trackParameters || infrastructure.tracks?.track?.trackParameters;
    if (trackParameters) {
      // Esempio: sleepers
      if (trackParameters.trackBed?.sleepers) {
         gis.gisLayers.sleepers.push({
           id: uuidv4(),
           startKm: 0, // da estrarre da linearLocation
           endKm: 100, // finto per demo
           params: 'Importato da RailML'
         });
      }
    }

    // Questo è un template: andrà espanso quando avremo un file RailML reale di esempio
    // ...

    await writeGis(lineId, gis);
    res.json({ success: true, message: 'File RailML processato', gis });
  } catch (err) {
    console.error('Errore durante il parsing RailML:', err);
    res.status(500).json({ success: false, error: 'Errore durante il parsing del file XML: ' + err.message });
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
