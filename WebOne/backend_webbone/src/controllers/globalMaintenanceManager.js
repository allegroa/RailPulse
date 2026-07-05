const fs = require('fs/promises');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'DATABASE', 'maintenance_db.json');

async function readDatabase() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      await fs.writeFile(DB_PATH, '[]', 'utf-8');
      return [];
    }
    console.error('Errore durante la lettura del DB di manutenzione:', error);
    return [];
  }
}

async function writeDatabase(data) {
  try {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Errore durante la scrittura sul DB di manutenzione:', error);
    throw error;
  }
}

module.exports = {
  readDatabase,
  writeDatabase
};
