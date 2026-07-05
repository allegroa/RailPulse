const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { parseCSVFile } = require('../utils/railprofile.utils');

// ---------------------------------------------------------------------------
// Resolved paths from environment (fallback to old hardcoded values)
// ---------------------------------------------------------------------------
const dbPath     = path.resolve(process.env.RAILPROFILE_DB_PATH     || 'E:/Software/RailPulse/DATABASE/RP/railprofile.db');
const configPath = path.resolve(process.env.RAILPROFILE_CONFIG_PATH || 'E:/Software/RailPulse/WebOne/backend_webbone/config/railprofile_thresholds.json');

// ---------------------------------------------------------------------------
// Background exceedance calculation
// Runs after the HTTP response has already been sent (via setImmediate).
// Opens its own DB connection so the request DB is not kept alive.
// ---------------------------------------------------------------------------
const runExceedanceCalculation = () => {
    try {
        const db = new Database(dbPath);

        db.prepare(`
            CREATE TABLE IF NOT EXISTS exceedances (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                line_code TEXT,
                direction TEXT,
                measurement_date TEXT,
                measurement_time TEXT,
                wear_side TEXT,
                parameter TEXT,
                t1_count INTEGER,
                t1_percentage REAL,
                t2_count INTEGER,
                t2_percentage REAL,
                t3_count INTEGER,
                t3_percentage REAL,
                t4_count INTEGER,
                t4_percentage REAL,
                total_samples INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(session_id, wear_side, parameter) ON CONFLICT REPLACE
            )
        `).run();

        const missing = db.prepare(`
            SELECT s.session_id, s.filename, s.wear_side, s.line_code, s.direction,
                   s.measurement_date, s.measurement_time
            FROM sessions s
            LEFT JOIN exceedances e ON s.session_id = e.session_id
            WHERE e.session_id IS NULL
        `).all();

        if (missing.length === 0) {
            db.close();
            return;
        }

        let thresholds = {};
        if (fs.existsSync(configPath)) {
            try {
                thresholds = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            } catch (e) {
                console.error('[RailProfile] Error parsing config for exceedance calculation:', e);
            }
        }

        const insertStmt = db.prepare(`
            INSERT INTO exceedances (
                session_id, line_code, direction, measurement_date, measurement_time,
                wear_side, parameter, t1_count, t1_percentage, t2_count, t2_percentage,
                t3_count, t3_percentage, t4_count, t4_percentage, total_samples
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const wearParams = ['W1', 'W2', 'W3', 'W4'];

        for (const record of missing) {
            const rows = parseCSVFile(record.filename);
            if (!rows) continue;

            const summary = {};
            wearParams.forEach(param => {
                const pConfig = thresholds[param] || {};
                let totalCount = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0;

                rows.forEach(row => {
                    const val = row[param];
                    if (val !== null && !isNaN(val)) {
                        totalCount++;
                        const abs = Math.abs(val);
                        if (pConfig.T1 > 0 && abs > pConfig.T1) t1++;
                        if (pConfig.T2 > 0 && abs > pConfig.T2) t2++;
                        if (pConfig.T3 > 0 && abs > pConfig.T3) t3++;
                        if (pConfig.T4 > 0 && abs > pConfig.T4) t4++;
                    }
                });

                const pct = (n) => totalCount > 0 ? Number(((n / totalCount) * 100).toFixed(2)) : 0;
                summary[param] = { totalCount, t1, t1_pct: pct(t1), t2, t2_pct: pct(t2), t3, t3_pct: pct(t3), t4, t4_pct: pct(t4) };
            });

            db.transaction(() => {
                for (const param of wearParams) {
                    const s = summary[param];
                    insertStmt.run(
                        record.session_id, record.line_code, record.direction,
                        record.measurement_date, record.measurement_time, record.wear_side,
                        param, s.t1, s.t1_pct, s.t2, s.t2_pct, s.t3, s.t3_pct, s.t4, s.t4_pct, s.totalCount
                    );
                }
            })();
        }

        db.close();
    } catch (e) {
        console.error('[RailProfile] Error in background exceedance calculation:', e);
    }
};

// ---------------------------------------------------------------------------
// GET /api/railprofile/sessions
// Returns grouped sessions with pre-computed exceedances.
// Triggers background recalculation AFTER the response is sent.
// ---------------------------------------------------------------------------
exports.getSessions = (req, res) => {
    try {
        const db = new Database(dbPath);

        // Ensure exceedances table exists
        db.prepare(`
            CREATE TABLE IF NOT EXISTS exceedances (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                line_code TEXT,
                direction TEXT,
                measurement_date TEXT,
                measurement_time TEXT,
                wear_side TEXT,
                parameter TEXT,
                t1_count INTEGER,
                t1_percentage REAL,
                t2_count INTEGER,
                t2_percentage REAL,
                t3_count INTEGER,
                t3_percentage REAL,
                t4_count INTEGER,
                t4_percentage REAL,
                total_samples INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(session_id, wear_side, parameter) ON CONFLICT REPLACE
            )
        `).run();

        const sessions = db.prepare(`
            SELECT
                GROUP_CONCAT(session_id) as session_ids,
                measurement_date,
                measurement_time,
                MAX(starting_km) as starting_km,
                MAX(ending_km) as ending_km,
                line_code,
                MAX(line_name) as line_name,
                direction
            FROM sessions
            GROUP BY measurement_date, measurement_time, line_code, direction
            ORDER BY measurement_date DESC, measurement_time DESC
        `).all();

        const exceedances = db.prepare(`
            SELECT session_id, wear_side, parameter,
                   t1_count, t1_percentage, t2_count, t2_percentage,
                   t3_count, t3_percentage, t4_count, t4_percentage, total_samples
            FROM exceedances
        `).all();

        sessions.forEach(s => {
            const idArray = s.session_ids.split(',');
            s.exceedances = exceedances.filter(e => idArray.includes(String(e.session_id)));
        });

        db.close();

        res.status(200).json({ success: true, data: sessions });

        // Background: compute any missing exceedances without blocking the response
        setImmediate(runExceedanceCalculation);

    } catch (error) {
        console.error('[RailProfile] Error in getSessions:', error);
        res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
};

// ---------------------------------------------------------------------------
// PUT /api/railprofile/sessions/:id
// ---------------------------------------------------------------------------
exports.updateSession = (req, res) => {
    try {
        const { id } = req.params;
        const { starting_km, ending_km, measurement_date, measurement_time, direction, line_code } = req.body;

        if (!id) return res.status(400).json({ success: false, message: 'No session IDs provided' });

        const idArray = id.split(',');
        const db = new Database(dbPath);

        const updateStmt = db.prepare(`
            UPDATE sessions
            SET starting_km = ?, ending_km = ?, measurement_date = ?, measurement_time = ?, direction = ?, line_code = ?
            WHERE session_id = ?
        `);

        db.transaction(() => {
            for (const sid of idArray) {
                updateStmt.run(starting_km, ending_km, measurement_date, measurement_time, direction, line_code, sid);
            }
        })();

        // Clear exceedances so they get recalculated next time
        const delStmt = db.prepare(`DELETE FROM exceedances WHERE session_id = ?`);
        db.transaction(() => { for (const sid of idArray) delStmt.run(sid); })();

        db.close();
        res.status(200).json({ success: true, message: 'Sessions updated successfully' });

        setImmediate(runExceedanceCalculation);
    } catch (error) {
        console.error('[RailProfile] Error in updateSession:', error);
        res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
};

// ---------------------------------------------------------------------------
// DELETE /api/railprofile/sessions/:id
// ---------------------------------------------------------------------------
exports.deleteSession = (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'No session IDs provided' });

        const idArray = id.split(',');
        const db = new Database(dbPath);

        const delSession = db.prepare(`DELETE FROM sessions WHERE session_id = ?`);
        db.transaction(() => { for (const sid of idArray) delSession.run(sid); })();

        const delExc = db.prepare(`DELETE FROM exceedances WHERE session_id = ?`);
        db.transaction(() => { for (const sid of idArray) delExc.run(sid); })();

        db.close();
        res.status(200).json({ success: true, message: 'Sessions deleted successfully' });
    } catch (error) {
        console.error('[RailProfile] Error in deleteSession:', error);
        res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
};

// ---------------------------------------------------------------------------
// GET /api/railprofile/config
// ---------------------------------------------------------------------------
exports.getConfig = (req, res) => {
    try {
        if (fs.existsSync(configPath)) {
            return res.status(200).json({ success: true, data: JSON.parse(fs.readFileSync(configPath, 'utf8')) });
        }
        return res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error('[RailProfile] Error reading config:', error);
        res.status(500).json({ success: false, message: 'Server error reading config' });
    }
};

// ---------------------------------------------------------------------------
// POST /api/railprofile/config
// ---------------------------------------------------------------------------
exports.saveConfig = (req, res) => {
    try {
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2), 'utf8');

        // Wipe all exceedances so they are recalculated with the new thresholds
        const db = new Database(dbPath);
        try { db.prepare(`DELETE FROM exceedances`).run(); } catch (e) {
            console.error('[RailProfile] Error clearing exceedances on config save:', e);
        }
        db.close();

        res.status(200).json({ success: true, message: 'Config saved successfully' });

        // Trigger recalculation immediately after wiping
        setImmediate(runExceedanceCalculation);
    } catch (error) {
        console.error('[RailProfile] Error saving config:', error);
        res.status(500).json({ success: false, message: 'Server error saving config' });
    }
};

// ---------------------------------------------------------------------------
// GET /api/railprofile/sessions/:id/data
// ---------------------------------------------------------------------------
exports.getSessionData = (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'No session IDs provided' });

        const idArray = id.split(',');
        const db = new Database(dbPath);

        const placeholders = idArray.map(() => '?').join(',');
        const records = db.prepare(`
            SELECT session_id, filename, wear_side, line_code, direction, measurement_date, measurement_time
            FROM sessions
            WHERE session_id IN (${placeholders})
        `).all(...idArray);

        db.close();

        if (records.length === 0) {
            return res.status(404).json({ success: false, message: 'No sessions found for the provided IDs' });
        }

        const responseData = {
            success: true,
            metadata: {
                line_code: records[0].line_code,
                direction: records[0].direction,
                measurement_date: records[0].measurement_date,
                measurement_time: records[0].measurement_time,
            },
            left: [],
            right: [],
        };

        const MAX_POINTS = 2000;

        for (const record of records) {
            const rows = parseCSVFile(record.filename);
            if (!rows) {
                console.warn(`[RailProfile] File not found or unreadable: ${record.filename}`);
                continue;
            }

            // Downsample
            let sampled;
            if (rows.length <= MAX_POINTS) {
                sampled = rows;
            } else {
                const step = rows.length / MAX_POINTS;
                sampled = Array.from({ length: MAX_POINTS }, (_, i) => rows[Math.floor(i * step)]);
            }

            if (record.wear_side === 'left')  responseData.left  = sampled;
            if (record.wear_side === 'right') responseData.right = sampled;
        }

        return res.status(200).json(responseData);

    } catch (error) {
        console.error('[RailProfile] Error in getSessionData:', error);
        res.status(500).json({ success: false, message: 'Server error reading wear data', error: error.message });
    }
};
