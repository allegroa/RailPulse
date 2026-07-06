const fs = require('fs/promises');
const path = require('path');

// Il backend risiede in WebOne/backend_webbone, quindi saliamo di due livelli per raggiungere DATABASE
const DB_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'DATABASE', 'config_db.json');
const STATION_DB_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'DATABASE', 'station.json');
const GIS_DIR = path.resolve(__dirname, '..', '..', '..', '..', 'DATABASE', 'GIS');

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

module.exports = {
  readConfig,
  writeConfig,
  readStations,
  writeStations,
  readGis,
  writeGis
};
