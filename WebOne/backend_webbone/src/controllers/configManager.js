const fs = require('fs/promises');
const path = require('path');

// Il backend risiede in WebOne/backend_webbone, quindi saliamo di due livelli per raggiungere DATABASE
const DB_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'DATABASE', 'config_db.json');
const STATION_DB_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'DATABASE', 'station.json');

// Helper per leggere il database delle configurazioni
async function readConfig() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const defaultConfig = {
        language: {
          active: 'it',
          available: [
            { code: 'it', label: 'Italiano' },
            { code: 'en', label: 'English' },
            { code: 'zh', label: '中文' }
          ]
        },
        lines: [],
        operators: [],
        taskTypes: []
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

// Helpers per stazioni
async function readStations() {
  try {
    const content = await fs.readFile(STATION_DB_PATH, 'utf-8');
    const raw = JSON.parse(content);
    if (!Array.isArray(raw)) return [];

    return raw.map(item => {
      if (typeof item === 'string') {
        return { code: item, name: '', kmStart: 0, kmEnd: 0, tracks: 0 };
      }
      return {
        code:    item.code    || item.codice  || '',
        name:    item.name    || item.nome     || '',
        kmStart: typeof item.kmStart === 'number' ? item.kmStart : (typeof item.kmInizio === 'number' ? item.kmInizio : 0),
        kmEnd:   typeof item.kmEnd   === 'number' ? item.kmEnd   : (typeof item.kmFine   === 'number' ? item.kmFine   : 0),
        tracks:  typeof item.tracks  === 'number' ? item.tracks  : (typeof item.binari   === 'number' ? item.binari   : 0)
      };
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(path.dirname(STATION_DB_PATH), { recursive: true });
      await fs.writeFile(STATION_DB_PATH, '[]', 'utf-8');
      return [];
    }
    console.warn('Errore lettura station.json:', err);
    return [];
  }
}

async function writeStations(stations) {
  try {
    await fs.mkdir(path.dirname(STATION_DB_PATH), { recursive: true });
    await fs.writeFile(STATION_DB_PATH, JSON.stringify(stations, null, 2), 'utf-8');
  } catch (error) {
    console.error('Errore durante la scrittura su station.json:', error);
    throw error;
  }
}

module.exports = {
  readConfig,
  writeConfig,
  readStations,
  writeStations
};
