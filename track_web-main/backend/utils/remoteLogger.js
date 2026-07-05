import os from 'os';

const LOG_COLLECTOR_URL = 'http://192.168.1.144:3000/api/logs';
const APP_NAME = 'track_web';

// Funzione helper per ottenere l'IP locale (IPv4)
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Salta gli indirizzi interni e non IPv4 (node < 18 usava stringa 'IPv4', in versioni successive un numero 4)
            if ((iface.family === 'IPv4' || iface.family === 4) && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

/**
 * Invia un log di debug al Log Collector remoto
 * @param {string} message - Il testo del messaggio
 */
export async function sendRemoteDebugLog(message) {
    try {
        const payload = {
            source: APP_NAME,
            level: 'debug',
            timestamp: new Date().toISOString(),
            ip: getLocalIP(),
            macchina: os.hostname(),
            message: message
        };

        const response = await fetch(LOG_COLLECTOR_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`[RemoteLogger] Errore nell'invio del log al server: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`[RemoteLogger] Impossibile raggiungere il Log Collector:`, error.message);
    }
}
