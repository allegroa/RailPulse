const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_BASE_PATH = path.resolve(process.env.DATABASE_BASE_PATH || 'E:/Software/RailPulse/DATABASE');
const SESSION_FOLDER_REGEX = /^(\d{4}\.\d{2}\.\d{2})\s+(\d{2}\.\d{2}\.\d{2})K(\d+)\+(\d{3})~K(\d+)\+(\d{3})$/;

exports.getAllAcquisitions = (req, res) => {
  try {
    const acquisitions = [];
    let idCounter = 1;

    // 1. Read TGM
    const tgmPath = path.join(DB_BASE_PATH, 'TGM');
    if (fs.existsSync(tgmPath)) {
      const folders = fs.readdirSync(tgmPath, { withFileTypes: true });
      for (const dirent of folders) {
        if (!dirent.isDirectory()) continue;
        const match = dirent.name.match(SESSION_FOLDER_REGEX);
        if (match) {
          const dateStr = match[1].replace(/\./g, '-');
          const timeStr = match[2].replace(/\./g, ':');
          const startKm = parseFloat(`${match[3]}.${match[4]}`);
          const endKm = parseFloat(`${match[5]}.${match[6]}`);
          const direction = startKm < endKm ? 'Up' : 'Down';
          
          acquisitions.push({
            id: `TGM_${idCounter++}`,
            system: 'TGM',
            date: dateStr,
            time: timeStr,
            startKm,
            endKm,
            stazionePartenza: '', // Verrà arricchito dal frontend con station.json
            direction,
            filename: dirent.name
          });
        }
      }
    }

    // 2. Read RP
    const rpDbPath = path.join(DB_BASE_PATH, 'RP', 'railprofile.db');
    if (fs.existsSync(rpDbPath)) {
      const db = new Database(rpDbPath, { readonly: true });
      const sessions = db.prepare('SELECT * FROM sessions').all();
      for (const row of sessions) {
        const startKm = row.starting_km != null ? row.starting_km : (row.km_first != null ? row.km_first : 0);
        const endKm = row.ending_km != null ? row.ending_km : (row.km_last != null ? row.km_last : 0);
        const direction = row.direction || (startKm < endKm ? 'Up' : 'Down');

        acquisitions.push({
          id: `RP_${row.session_id || idCounter++}`,
          system: 'RP',
          date: row.measurement_date || '',
          time: row.measurement_time || '',
          startKm,
          endKm,
          stazionePartenza: '', // Verrà arricchito dal frontend
          direction,
          filename: row.filename || ''
        });
      }
      db.close();
    }

    res.json({ success: true, acquisitions });
  } catch (error) {
    console.error('Error fetching acquisitions:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
