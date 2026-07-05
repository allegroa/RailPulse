// railprofile.utils.js — shared CSV parsing utilities for RailProfile module
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

/**
 * Safely parse a raw CSV cell value to a number.
 * Returns null for inf, nan, empty string, or non-numeric strings.
 */
const parseValue = (v) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim().toLowerCase();
    if (s === 'inf' || s === 'nan' || s === '') return null;
    const num = Number(s.replace(',', '.'));
    return isNaN(num) ? null : num;
};

/**
 * Read and parse a RailProfile CSV file.
 * Skips the first 4 metadata header lines.
 * Detects km and W1-W4 columns by name (case-insensitive prefix match).
 * Returns an array of { km, W1, W2, W3, W4 } sorted ascending by km,
 * or null if the file is missing or unreadable.
 *
 * @param {string} filename - Basename only; resolved against RAILPROFILE_DB_DIR env var.
 * @returns {Array|null}
 */
const parseCSVFile = (filename) => {
    const dbDir = process.env.RAILPROFILE_DB_DIR || 'E:/Software/RailPulse/DATABASE/RP';
    const filePath = path.join(dbDir, filename);

    if (!fs.existsSync(filePath)) return null;

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split(/\r?\n/);
    const csvText = lines.slice(4).join('\n');
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

    if (!parsed.data || parsed.data.length === 0) return null;

    const headers = parsed.meta.fields || Object.keys(parsed.data[0]);
    const kmKey   = headers.find(h => h.toLowerCase().includes('mile') || h.toLowerCase().includes('km'));
    const w1Key   = headers.find(h => h.toLowerCase().startsWith('w1'));
    const w2Key   = headers.find(h => h.toLowerCase().startsWith('w2'));
    const w3Key   = headers.find(h => h.toLowerCase().startsWith('w3'));
    const w4Key   = headers.find(h => h.toLowerCase().startsWith('w4'));

    if (!kmKey) return null;

    const rows = parsed.data.map(row => ({
        km: parseValue(row[kmKey]),
        W1: w1Key ? parseValue(row[w1Key]) : null,
        W2: w2Key ? parseValue(row[w2Key]) : null,
        W3: w3Key ? parseValue(row[w3Key]) : null,
        W4: w4Key ? parseValue(row[w4Key]) : null,
    })).filter(r => r.km !== null);

    rows.sort((a, b) => a.km - b.km);
    return rows;
};

module.exports = { parseValue, parseCSVFile };
