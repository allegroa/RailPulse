const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const router = express.Router();
const execAsync = promisify(exec);

const DB_DIR = path.resolve(process.cwd(), '..', '..', 'DATABASE', 'Taipei');
const APP_JS_FILE = path.resolve(process.cwd(), 'public', 'taipei', 'app.js');

router.post('/save-station', async (req, res) => {
  try {
    const { id, x, y } = req.body;
    if (!id) return res.status(400).send("ID missing");
    
    // 1. Update data/stations.json
    const stationsFile = path.join(DB_DIR, 'stations.json');
    const stationsData = await fs.readFile(stationsFile, 'utf-8');
    const stations = JSON.parse(stationsData);
    
    if (stations[id]) {
      stations[id].x = parseInt(x, 10);
      stations[id].y = parseInt(y, 10);
      await fs.writeFile(stationsFile, JSON.stringify(stations, null, 2), 'utf-8');
    }
    
    // 2. Update public/taipei/app.js
    let appJs = await fs.readFile(APP_JS_FILE, 'utf-8');
    const pattern = new RegExp(`(${id}\\s*:\\s*\\{.*?)x:\\d+,\\s*y:\\d+(.*?\\})`, 'g');
    appJs = appJs.replace(pattern, `$1x:${x}, y:${y}$2`);
    
    const dbMatch = appJs.match(/const DB_VERSION = (\d+);/);
    let newVer = null;
    if (dbMatch) {
      newVer = parseInt(dbMatch[1], 10) + 1;
      appJs = appJs.replace(dbMatch[0], `const DB_VERSION = ${newVer};`);
    }
    await fs.writeFile(APP_JS_FILE, appJs, 'utf-8');
    
    // 3. Regenerate graph
    const scriptPath = path.resolve(__dirname, '..', 'taipei_backend', 'update_graph.py');
    await execAsync(`python "${scriptPath}"`);
    
    res.json({ status: 'success', new_db_version: newVer });
  } catch (err) {
    console.error('[Taipei Route Error]', err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
