const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'logs.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create logs table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            source TEXT,
            level TEXT,
            payload TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            }
        });
    }
});

function insertLog(source, level, payload) {
    return new Promise((resolve, reject) => {
        const payloadStr = typeof payload === 'object' ? JSON.stringify(payload) : payload;
        
        db.run(`INSERT INTO logs (source, level, payload) VALUES (?, ?, ?)`, 
            [source || 'unknown', level || 'info', payloadStr], 
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
}

function getLogs(limit = 100) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?`, [limit], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = {
    db,
    insertLog,
    getLogs
};
