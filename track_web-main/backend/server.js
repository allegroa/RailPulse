import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// Forzare process.cwd() per essere la radice del modulo track_web-main
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.chdir(path.join(__dirname, '..'));

import apiRoutes from './routes.js';
import { checkNewEmails } from './utils/emailService.js';
import { sendRemoteDebugLog } from './utils/remoteLogger.js';

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Montare le rotte API
app.use('/api', apiRoutes);

// Servire i file statici del frontend buildato se in produzione
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Gestione Polling Email Automatico in background
let emailIntervalId = null;

export async function setupEmailPolling() {
  if (emailIntervalId) {
    clearInterval(emailIntervalId);
    emailIntervalId = null;
  }

  try {
    const configPath = path.resolve('configuration', 'config.json');
    const data = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(data);
    const emailConfig = config.emailConfig;

    if (emailConfig && emailConfig.email && emailConfig.password) {
      const intervalMin = parseInt(emailConfig.pollingInterval) || 15;
      console.log(`[Email Polling] Avvio controllo email automatico ogni ${intervalMin} minuti per ${emailConfig.email}`);
      
      emailIntervalId = setInterval(async () => {
        console.log(`[Email Polling] Avvio controllo email periodico...`);
        try {
          const result = await checkNewEmails(emailConfig);
          console.log(`[Email Polling] Controllo completato. Scaricati: ${result.count || 0} file.`);
        } catch (err) {
          console.error(`[Email Polling] Errore durante il controllo automatico:`, err);
        }
      }, intervalMin * 60 * 1000);
    }
  } catch (err) {
    console.log('[Email Polling] Configurazione email non trovata o incompleta. Polling disattivato.');
  }
}

// Avvio server
const server = app.listen(PORT, async () => {
  console.log(`[Backend track-view] Server attivo sulla porta ${PORT}`);
  try {
    await sendRemoteDebugLog("L'applicazione track-view è stata accesa");
  } catch (e) {
    console.warn('Errore logging remoto avvio:', e.message);
  }
  setupEmailPolling();
});

// Graceful Shutdown
const handleShutdown = async (signal) => {
  console.log(`Ricevuto segnale ${signal}. Arresto server...`);
  if (emailIntervalId) clearInterval(emailIntervalId);
  try {
    await sendRemoteDebugLog("L'applicazione track-view è stata spenta");
  } catch (e) {
    console.warn('Errore logging remoto spegnimento:', e.message);
  }
  setTimeout(() => {
    process.exit(0);
  }, 500);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
