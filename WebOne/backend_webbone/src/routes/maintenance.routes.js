const express = require('express');
const router = express.Router();
const { readDatabase, writeDatabase } = require('../controllers/globalMaintenanceManager');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(process.cwd(), 'uploads', 'maintenance');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post('/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nessun file caricato' });
  }
  const filePaths = req.files.map(f => `/uploads/maintenance/${f.filename}`);
  res.json({ files: filePaths });
});
router.get('/', async (req, res) => {
  try {
    const { line, track, taskType, dateStart, dateEnd, startKm, endKm } = req.query;
    let records = await readDatabase();

    if (line) {
      records = records.filter(r => r.line && r.line.toLowerCase() === line.toLowerCase());
    }

    if (track) {
      records = records.filter(r => r.track && r.track.toLowerCase() === track.toLowerCase());
    }

    if (taskType) {
      records = records.filter(r => r.taskType && r.taskType.toLowerCase() === taskType.toLowerCase());
    }

    if (dateStart) {
      records = records.filter(r => r.date >= dateStart);
    }
    if (dateEnd) {
      records = records.filter(r => r.date <= dateEnd);
    }

    if (startKm !== undefined || endKm !== undefined) {
      const qStart = startKm !== undefined ? parseFloat(startKm) : -Infinity;
      const qEnd = endKm !== undefined ? parseFloat(endKm) : Infinity;

      records = records.filter(r => {
        const rStart = r.startKm !== undefined ? parseFloat(r.startKm) : 0;
        const rEnd = r.endKm !== undefined ? parseFloat(r.endKm) : 0;
        return rStart <= qEnd && rEnd >= qStart;
      });
    }

    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il recupero dei dati' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const records = await readDatabase();
    const record = records.find(r => r.id === id);
    if (!record) {
      return res.status(404).json({ error: 'Record di manutenzione non trovato' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Errore del server' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { date, taskType, line, track, startKm, endKm, operator, status, notes, externalRef } = req.body;

    if (!date || !taskType || !line || !track || startKm === undefined || endKm === undefined || !status) {
      return res.status(400).json({ error: 'I campi date, taskType, line, track, startKm, endKm e status sono obbligatori.' });
    }

    const numStart = parseFloat(startKm);
    const numEnd = parseFloat(endKm);

    if (isNaN(numStart) || isNaN(numEnd)) {
      return res.status(400).json({ error: 'I campi startKm e endKm devono essere valori numerici.' });
    }

    if (numStart > numEnd) {
      return res.status(400).json({ error: 'Il chilometraggio di inizio (startKm) deve essere minore o uguale a quello di fine (endKm).' });
    }

    const records = await readDatabase();

    const newRecord = {
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      date,
      taskType,
      line,
      track,
      startKm: numStart,
      endKm: numEnd,
      operator: operator || '',
      status,
      statusDate: req.body.statusDate || new Date().toISOString().split('T')[0],
      notes: notes || '',
      attachments: req.body.attachments || [],
      externalRef: externalRef || { erpId: '', tgmId: '', rpId: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    records.push(newRecord);
    await writeDatabase(records);

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il salvataggio del record' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const records = await readDatabase();
    const index = records.findIndex(r => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Record di manutenzione non trovato' });
    }

    const updatedData = { ...records[index], ...req.body };

    if (updatedData.startKm !== undefined && updatedData.endKm !== undefined) {
      const numStart = parseFloat(updatedData.startKm);
      const numEnd = parseFloat(updatedData.endKm);
      if (numStart > numEnd) {
        return res.status(400).json({ error: 'Il chilometraggio di inizio (startKm) deve essere minore o uguale a quello di fine (endKm).' });
      }
      updatedData.startKm = numStart;
      updatedData.endKm = numEnd;
    }

    updatedData.updatedAt = new Date().toISOString();
    records[index] = updatedData;

    await writeDatabase(records);
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del record' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const records = await readDatabase();
    const filtered = records.filter(r => r.id !== id);

    if (records.length === filtered.length) {
      return res.status(404).json({ error: 'Record di manutenzione non trovato' });
    }

    await writeDatabase(filtered);
    res.json({ success: true, message: 'Record eliminato con successo' });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'eliminazione del record' });
  }
});

module.exports = router;
