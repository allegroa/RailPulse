import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fsSync from 'fs';const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const DB_PATH = path.join(__dirname, 'database', 'maintenance_db.json');

app.use(cors());
app.use(express.json());

// Serve uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Multer config for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'maintenance');
if (!fsSync.existsSync(uploadDir)) {
  fsSync.mkdirSync(uploadDir, { recursive: true });
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

// Upload endpoint
app.post('/api/maintenance/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nessun file caricato' });
  }
  const filePaths = req.files.map(f => `/uploads/maintenance/${f.filename}`);
  res.json({ files: filePaths });
});

// Helper per leggere il database JSON
async function readDatabase() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Se il file non esiste, crealo vuoto
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      await fs.writeFile(DB_PATH, '[]', 'utf-8');
      return [];
    }
    console.error('Errore durante la lettura del DB:', error);
    return [];
  }
}

// Helper per scrivere sul database JSON
async function writeDatabase(data) {
  try {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Errore durante la scrittura sul DB:', error);
    throw error;
  }
}

// GET /api/maintenance - Recupero interventi con filtri
app.get('/api/maintenance', async (req, res) => {
  try {
    const { line, track, taskType, dateStart, dateEnd, startKm, endKm } = req.query;
    let records = await readDatabase();

    // Filtro per linea
    if (line) {
      records = records.filter(r => r.line && r.line.toLowerCase() === line.toLowerCase());
    }

    // Filtro per binario
    if (track) {
      records = records.filter(r => r.track && r.track.toLowerCase() === track.toLowerCase());
    }

    // Filtro per tipo di intervento
    if (taskType) {
      records = records.filter(r => r.taskType && r.taskType.toLowerCase() === taskType.toLowerCase());
    }

    // Filtro per intervallo temporale
    if (dateStart) {
      records = records.filter(r => r.date >= dateStart);
    }
    if (dateEnd) {
      records = records.filter(r => r.date <= dateEnd);
    }

    // Filtro per coordinate chilometriche (logica di intersezione/sovrapposizione tratte)
    if (startKm !== undefined || endKm !== undefined) {
      const qStart = startKm !== undefined ? parseFloat(startKm) : -Infinity;
      const qEnd = endKm !== undefined ? parseFloat(endKm) : Infinity;

      records = records.filter(r => {
        const rStart = r.startKm !== undefined ? parseFloat(r.startKm) : 0;
        const rEnd = r.endKm !== undefined ? parseFloat(r.endKm) : 0;
        
        // Un record si sovrappone alla query se:
        // record.startKm <= query.endKm AND record.endKm >= query.startKm
        return rStart <= qEnd && rEnd >= qStart;
      });
    }

    // Ordina per data decrescente
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il recupero dei dati' });
  }
});

// GET /api/maintenance/:id - Singolo record
app.get('/api/maintenance/:id', async (req, res) => {
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

// POST /api/maintenance - Creazione record
app.post('/api/maintenance', async (req, res) => {
  try {
    const { date, taskType, line, track, startKm, endKm, operator, status, notes, externalRef } = req.body;

    // Validazione campi obbligatori
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

// PUT /api/maintenance/:id - Aggiornamento record
app.put('/api/maintenance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const records = await readDatabase();
    const index = records.findIndex(r => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Record di manutenzione non trovato' });
    }

    const updatedData = { ...records[index], ...req.body };

    // Validazioni
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

// DELETE /api/maintenance/:id - Eliminazione record
app.delete('/api/maintenance/:id', async (req, res) => {
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

// Configurazione serving statico per il frontend in produzione
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  // Se la richiesta è per un endpoint API, non servire index.html
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // In sviluppo il frontend gira separatamente, invia un messaggio di fallback
      res.status(200).send('maintenance-web backend attivo. Frontend in attesa di compilazione o attivo su porta di sviluppo.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[maintenance-web] Server attivo sulla porta ${PORT}`);
});
