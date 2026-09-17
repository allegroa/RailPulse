const fs = require('fs/promises');
const path = require('path');

const CONFIG_PATHS = [
  path.resolve(__dirname, '..', '..', '..', '..', 'DATABASE', 'config_db.json'),
  path.resolve(__dirname, '..', '..', '..', '..', 'general-configuration_web', 'database', 'config_db.json')
];

async function getDbPath() {
  for (const cfgPath of CONFIG_PATHS) {
    try {
      const configData = await fs.readFile(cfgPath, 'utf-8');
      const config = JSON.parse(configData);
      if (config.systemPrefs && config.systemPrefs.dataLocationPath) {
        const candidate = path.join(config.systemPrefs.dataLocationPath, 'MAINTENANCE', 'maintenance_db.json');
        try {
          await fs.access(candidate);
          return candidate;
        } catch {}
      }
    } catch (err) {}
  }
  
  const fallback = path.resolve(__dirname, '..', '..', '..', '..', 'DATABASE', 'MAINTENANCE', 'maintenance_db.json');
  try {
    await fs.access(fallback);
    return fallback;
  } catch {}

  return path.resolve(__dirname, '..', '..', '..', '..', 'DATABASE', 'maintenance_db.json');
}

async function readDatabase() {
  const dbPath = await getDbPath();
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(dbPath), { recursive: true });
      await fs.writeFile(dbPath, '[]', 'utf-8');
      return [];
    }
    console.error('Errore durante la lettura del DB di manutenzione:', error);
    return [];
  }
}

async function writeDatabase(data) {
  const dbPath = await getDbPath();
  try {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Errore durante la scrittura sul DB di manutenzione:', error);
    throw error;
  }
}

module.exports = {
  readDatabase,
  writeDatabase
};
