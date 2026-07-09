const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const router = express.Router();
const execAsync = promisify(exec);

const DB_DIR = path.resolve(process.cwd(), '..', '..', 'DATABASE');
const GLOBAL_STATIONS_FILE = path.join(DB_DIR, 'station.json');
const LINES_FILE = path.join(DB_DIR, 'lines.json');

// Helper to write DB (handles concurrent saves simply by awaiting)
async function writeGlobalStations(stations) {
  await fs.writeFile(GLOBAL_STATIONS_FILE, JSON.stringify(stations, null, 2), 'utf-8');
}

// Helper to read DB
async function readGlobalStations() {
  try {
    const data = await fs.readFile(GLOBAL_STATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

router.get('/stations', async (req, res) => {
  try {
    const stationsArray = await readGlobalStations();
    
    // Convert to dictionary format expected by frontend: { id: {e, z, x, y, ln, t, km} }
    // Or we could let the frontend handle the array, but converting here is easier for retrocompatibility of app.js logic
    // Actually, it's better to just return the array and let frontend parse it, but let's provide exactly what frontend needs
    const stationsDict = {};
    for (const s of stationsArray) {
      // Only include stations that have coordinates or are marked for taipei (e.g. have name_en, name_zh, or lineCode)
      // Since it's a global DB, we filter by those that have x,y defined or stationType defined.
      // We assume Taipei stations have name_en or name_zh defined during our migration.
      if (s.name_en !== undefined || s.name_zh !== undefined || (s.x !== 0 || s.y !== 0)) {
        stationsDict[s.code] = {
          e: s.name_en || "",
          z: s.name_zh || "",
          x: s.x || 0,
          y: s.y || 0,
          ln: s.LineName || (s.lineCode ? [s.lineCode] : []),
          t: s.stationType || "station",
          km: s.kmPosition || s.kmStart || 0.0
        };
      }
    }
    
    res.json(stationsDict);
  } catch (err) {
    console.error('[Taipei Route Error GET stations]', err);
    res.status(500).send(err.message);
  }
});

router.get('/lines', async (req, res) => {
  try {
    const linesData = await fs.readFile(LINES_FILE, 'utf-8');
    res.json(JSON.parse(linesData));
  } catch (err) {
    console.error('[Taipei Route Error GET lines]', err);
    res.status(500).send(err.message);
  }
});

router.post('/save-station', async (req, res) => {
  try {
    const { id, x, y, e, z, ln, t, km } = req.body;
    if (!id) return res.status(400).send("ID missing");
    
    let stations = await readGlobalStations();
    let stn = stations.find(s => s.code === id);
    
    if (!stn) {
      stn = {
        code: id,
        name: (e && z) ? `${e} - ${z}` : (e || z || ""),
        name_en: e || "",
        name_zh: z || "",
        kmStart: km || 0.0,
        kmEnd: km || 0.0,
        kmPosition: km || 0.0,
        tracks: 0,
        lineCode: (ln && ln.length > 0) ? ln[0] : "",
        stationNumber: "",
        x: x !== undefined ? parseInt(x, 10) : 0,
        y: y !== undefined ? parseInt(y, 10) : 0,
        stationType: t || "station",
        LineName: ln || []
      };
      stations.push(stn);
    } else {
      if (x !== undefined) stn.x = parseInt(x, 10);
      if (y !== undefined) stn.y = parseInt(y, 10);
      if (e !== undefined) stn.name_en = e;
      if (z !== undefined) stn.name_zh = z;
      if (e !== undefined || z !== undefined) {
        stn.name = (stn.name_en && stn.name_zh) ? `${stn.name_en} - ${stn.name_zh}` : (stn.name_en || stn.name_zh || "");
      }
      if (ln !== undefined) {
        stn.LineName = ln;
        if (ln.length > 0) stn.lineCode = ln[0];
      }
      if (t !== undefined) stn.stationType = t;
      if (km !== undefined) {
        stn.kmPosition = km;
        stn.kmStart = km;
        stn.kmEnd = km;
      }
    }
    
    await writeGlobalStations(stations);
    
    // Regenerate graph
    const scriptPath = path.resolve(__dirname, '..', 'taipei_backend', 'update_graph.py');
    await execAsync(`python "${scriptPath}"`);
    
    res.json({ status: 'success' });
  } catch (err) {
    console.error('[Taipei Route Error]', err);
    res.status(500).send(err.message);
  }
});

router.post('/delete-station', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).send("ID missing");
    
    let stations = await readGlobalStations();
    stations = stations.filter(s => s.code !== id);
    await writeGlobalStations(stations);
    
    // Regenerate graph
    const scriptPath = path.resolve(__dirname, '..', 'taipei_backend', 'update_graph.py');
    await execAsync(`python "${scriptPath}"`);
    
    res.json({ status: 'success' });
  } catch (err) {
    console.error('[Taipei Route Error]', err);
    res.status(500).send(err.message);
  }
});

router.post('/save-lines', async (req, res) => {
  try {
    const lines = req.body;
    if (!Array.isArray(lines)) return res.status(400).send("Invalid lines data");
    
    await fs.writeFile(LINES_FILE, JSON.stringify(lines, null, 2), 'utf-8');
    
    // Regenerate graph
    const scriptPath = path.resolve(__dirname, '..', 'taipei_backend', 'update_graph.py');
    await execAsync(`python "${scriptPath}"`);
    
    res.json({ status: 'success' });
  } catch (err) {
    console.error('[Taipei Route Error save-lines]', err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
