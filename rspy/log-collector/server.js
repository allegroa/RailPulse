const express = require('express');
const cors = require('cors');
const { insertLog, getLogs } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // To parse JSON payloads
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// In-memory HTML dashboard (simple and quick)
const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Log Collector Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f9; padding: 20px; color: #333; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { margin-top: 0; color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: 600; }
        tr:hover { background-color: #f1f1f1; }
        .payload { font-family: monospace; font-size: 0.9em; white-space: pre-wrap; word-break: break-all; }
        .level-info { color: #2980b9; }
        .level-error { color: #c0392b; }
        .level-warn { color: #f39c12; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Received Logs</h1>
        <table>
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Source</th>
                    <th>Level</th>
                    <th>Payload</th>
                </tr>
            </thead>
            <tbody id="logs-table-body">
                <tr><td colspan="4">Loading logs...</td></tr>
            </tbody>
        </table>
    </div>

    <script>
        async function fetchLogs() {
            try {
                const res = await fetch('/api/logs');
                const logs = await res.json();
                const tbody = document.getElementById('logs-table-body');
                
                if (logs.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4">No logs yet.</td></tr>';
                    return;
                }

                tbody.innerHTML = logs.map(log => {
                    let levelClass = 'level-info';
                    if (log.level && log.level.toLowerCase() === 'error') levelClass = 'level-error';
                    if (log.level && log.level.toLowerCase() === 'warn') levelClass = 'level-warn';
                    
                    return \`
                        <tr>
                            <td>\${new Date(log.timestamp).toLocaleString()}</td>
                            <td>\${log.source || '-'}</td>
                            <td class="\${levelClass}">\${log.level || '-'}</td>
                            <td class="payload">\${log.payload || '-'}</td>
                        </tr>
                    \`;
                }).join('');
            } catch (err) {
                console.error('Error fetching logs:', err);
            }
        }

        // Fetch logs on load and every 5 seconds
        fetchLogs();
        setInterval(fetchLogs, 5000);
    </script>
</body>
</html>
`;

// Serve the dashboard
app.get('/', (req, res) => {
    res.send(dashboardHTML);
});

// API endpoint to retrieve logs
app.get('/api/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const logs = await getLogs(limit);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve logs' });
    }
});

// API endpoint to receive logs
app.post('/api/logs', async (req, res) => {
    try {
        // You can send JSON with "source", "level", and any other fields.
        // We dump the entire body into payload if it's not structured.
        const source = req.body.source || req.query.source || 'unknown';
        const level = req.body.level || req.query.level || 'info';
        
        // Remove source/level from payload if they exist so we don't duplicate
        const payloadData = { ...req.body };
        delete payloadData.source;
        delete payloadData.level;
        
        const payloadStr = Object.keys(payloadData).length > 0 ? payloadData : req.body;

        const id = await insertLog(source, level, payloadStr);
        res.status(201).json({ success: true, id });
    } catch (err) {
        console.error('Error saving log:', err);
        res.status(500).json({ error: 'Failed to save log' });
    }
});

app.listen(PORT, () => {
    console.log(`Log collector server running on http://localhost:${PORT}`);
    console.log(`Send POST requests to http://localhost:${PORT}/api/logs to store logs.`);
});
