const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dir = 'C:/Software/RailPulse/DATABASE/RP';
for (const file of fs.readdirSync(dir)) {
  if (file.endsWith('.db')) {
    try {
      const db = new Database(path.join(dir, file));
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      console.log(`File: ${file}`);
      for (const t of tables) {
        const count = db.prepare(`SELECT count(*) as c FROM "${t.name}"`).get();
        console.log(`  Table ${t.name}: ${count.c} rows`);
      }
      db.close();
    } catch (e) {
      console.log(`File: ${file} error: ${e.message}`);
    }
  }
}
