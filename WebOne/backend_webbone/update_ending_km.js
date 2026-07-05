const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const dbPath = path.resolve('E:/Software/RailPulse/DATABASE/RP/railprofile.db');
const csvDir = path.resolve('E:/Software/RailPulse/RP');

async function getLastKm(filePath) {
    return new Promise((resolve, reject) => {
        let lastKm = null;
        if (!fs.existsSync(filePath)) {
            return resolve(null);
        }
        
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            if (line.trim()) {
                const parts = line.split(',');
                // Check if it's a data line (first column is a sequence number 'check', second is 'mile(Km)')
                if (parts.length >= 2 && !isNaN(parts[0]) && parts[0].trim() !== '' && !isNaN(parts[1]) && parts[1].trim() !== '') {
                    lastKm = parseFloat(parts[1]);
                }
            }
        });

        rl.on('close', () => {
            resolve(lastKm);
        });

        rl.on('error', (err) => {
            reject(err);
        });
    });
}

async function updateDb() {
    const db = new Database(dbPath);
    const sessions = db.prepare('SELECT session_id, filename FROM sessions').all();
    
    let updatedCount = 0;
    
    for (const session of sessions) {
        if (!session.filename) continue;
        const filePath = path.join(csvDir, session.filename);
        const endingKm = await getLastKm(filePath);
        
        if (endingKm !== null && !isNaN(endingKm)) {
            db.prepare('UPDATE sessions SET ending_km = ? WHERE session_id = ?').run(endingKm, session.session_id);
            updatedCount++;
            console.log(`Updated ${session.filename} -> ending_km = ${endingKm}`);
        } else {
            console.log(`File not found or no valid km for ${session.filename}`);
        }
    }
    
    db.close();
    console.log(`Finished updating ${updatedCount} sessions.`);
}

updateDb().catch(console.error);
