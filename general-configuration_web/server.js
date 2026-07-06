import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;
const DB_PATH = path.join(__dirname, 'database', 'config_db.json');

app.use(cors());
app.use(express.json());

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
