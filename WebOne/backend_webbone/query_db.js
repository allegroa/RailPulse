const Database = require('better-sqlite3');
const db = new Database('e:/Software/RailPulse/DATABASE/RP/railprofile.db');
const tableInfo = db.prepare("PRAGMA table_info(sessions)").all();
console.log("Sessions columns:", tableInfo.map(c => c.name));
