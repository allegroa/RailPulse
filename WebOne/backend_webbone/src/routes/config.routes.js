const express = require('express');
const router = express.Router();
const { readConfig, writeConfig, readStations, writeStations } = require('../controllers/configManager');

router.get('/', async (req, res) => {
  const config = await readConfig();
  if (!config) {
    return res.status(500).json({ error: 'Errore interno del server' });
  }
  res.json(config);
});

router.post('/language', async (req, res) => {
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

router.get('/lines', async (req, res) => {
  const config = await readConfig();
  res.json(config ? config.lines : []);
});

router.post('/lines', async (req, res) => {
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

router.put('/lines/:id', async (req, res) => {
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

router.delete('/lines/:id', async (req, res) => {
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

router.get('/operators', async (req, res) => {
  const config = await readConfig();
  res.json(config ? config.operators : []);
});

router.post('/operators', async (req, res) => {
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

router.delete('/operators/:name', async (req, res) => {
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

router.get('/task-types', async (req, res) => {
  const config = await readConfig();
  res.json(config ? config.taskTypes : []);
});

router.post('/task-types', async (req, res) => {
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

router.delete('/task-types/:name', async (req, res) => {
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

router.get('/stations', async (req, res) => {
  try {
    const stations = await readStations();
    res.json({ success: true, stations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/stations', async (req, res) => {
  try {
    const { station } = req.body;
    if (!station || !station.code) {
      return res.status(400).json({ success: false, error: 'Codice stazione mancante' });
    }

    // Ignora codici numerici
    if (/^\d+$/.test(station.code)) {
      return res.status(400).json({ success: false, error: 'Codice non valido' });
    }

    const stations = await readStations();
    const idx = stations.findIndex(s => s.code === station.code);

    if (idx >= 0) {
      if (station.name !== undefined) stations[idx].name = station.name;
      if (station.kmStart !== undefined) stations[idx].kmStart = station.kmStart;
      if (station.kmEnd !== undefined) stations[idx].kmEnd = station.kmEnd;
      if (station.tracks !== undefined) stations[idx].tracks = station.tracks;
    } else {
      stations.push(station);
      stations.sort((a, b) => a.code.localeCompare(b.code));
    }

    await writeStations(stations);
    res.json({ success: true, stations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/stations/:code', async (req, res) => {
  try {
    const { code } = req.params;
    let stations = await readStations();
    stations = stations.filter(s => s.code !== code);
    await writeStations(stations);
    res.json({ success: true, stations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
