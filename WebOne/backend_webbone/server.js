require('dotenv').config();
const app = require('./src/app');

const path = require('path');
const fs = require('fs/promises');
const { checkNewEmails } = require('./src/controllers/tgm/emailService');

const PORT = process.env.PORT || 5000;

let emailPollingIntervalId = null;

async function startEmailPolling() {
  try {
    const configPath = path.resolve(__dirname, '..', '..', 'track_web-main', 'backend', 'configuration', 'config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    const emailConfig = config.emailConfig;
    
    if (emailPollingIntervalId) {
      clearInterval(emailPollingIntervalId);
      emailPollingIntervalId = null;
    }
    
    if (emailConfig && emailConfig.email && emailConfig.password && emailConfig.pollingInterval > 0) {
      console.log(`[Email Polling] Avvio controllo email automatico ogni ${emailConfig.pollingInterval} minuti per ${emailConfig.email}`);
      
      const poll = async () => {
        console.log('[Email Polling] Avvio controllo email periodico...');
        try {
          const res = await checkNewEmails(emailConfig);
          console.log(`[Email Polling] Controllo completato. Scaricati: ${res.downloadedFiles?.length || 0} file.`);
        } catch (err) {
          console.error('[Email Polling] Errore durante il controllo email:', err.message);
        }
      };
      
      poll();
      emailPollingIntervalId = setInterval(poll, emailConfig.pollingInterval * 60 * 1000);
    }
  } catch (err) {
    console.error('[Email Polling] Impossibile avviare il servizio email:', err.message);
  }
}

global.startEmailPolling = startEmailPolling;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  startEmailPolling();
});
