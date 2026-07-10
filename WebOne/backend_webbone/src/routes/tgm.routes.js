const express = require('express');
const fs = require('fs/promises');
const { existsSync, createReadStream, readFileSync, writeFileSync, readdirSync } = require('fs');
const path = require('path');
const { exec, execFile } = require('child_process');
const { promisify } = require('util');
const mime = require('mime-types');
const multer = require('multer');
const os = require('os');
const Papa = require('papaparse');

const { getSessions, getSessionData, getSessionExceedances, getSessionTQI } = require('../controllers/tgm/tgmController');
const { getMaintenanceRecords, addMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord } = require('../controllers/tgm/maintenanceManager');
const { readStations, writeStations, readGis, writeGis, readConfig: readGlobalConfig, writeConfig: writeGlobalConfig, readLines, writeLines } = require('../controllers/configManager');
const { checkNewEmails } = require('../controllers/tgm/emailService');
const { extractArchive } = require('../controllers/tgm/extractor');
const { parseCSVFile, extractLineNameData, extractGisElementsFromParameters } = require('../controllers/tgm/tgmParser');

const router = express.Router();
const execAsync = promisify(exec);
const upload = multer({ dest: 'tmp_uploads/multer_temp/' });

function resolveTargetPath(targetPath) {
  if (!targetPath) return '';
  if (path.isAbsolute(targetPath)) return targetPath;
  // Utilizza __dirname per robustezza indipendente dalla directory di avvio del processo Node
  return path.resolve(__dirname, '..', '..', '..', '..', targetPath);
}

const CONFIG_DIR = path.resolve(__dirname, '..', '..', '..', '..', 'track_web-main', 'backend', 'configuration');


// Regex per convalidare il nome standard della cartella
const SESSION_FOLDER_REGEX = /^(\d{4}\.\d{2}\.\d{2})\s+(\d{2}\.\d{2}\.\d{2})K(\d+)\+(\d{3})~K(\d+)\+(\d{3})$/;

const logFilePath = path.resolve(__dirname, '..', '..', '..', '..', 'DATABASE', 'TGM', 'import_debug.log');
async function logDebug(msg) {
  const timestamp = new Date().toISOString();
  const formattedMsg = `[${timestamp}] ${msg}\n`;
  console.log(`[TGM IMPORT DEBUG] ${msg}`);
  try {
    await fs.mkdir(path.dirname(logFilePath), { recursive: true });
    await fs.appendFile(logFilePath, formattedMsg, 'utf-8');
  } catch (err) {
    console.error('Errore scrittura import_debug.log:', err);
  }
}

async function deleteFolder(folderPath) {
  try {
    await fs.rm(folderPath, { recursive: true, force: true });
    await logDebug(`Cartella rimossa dal filesystem: ${folderPath}`);
  } catch (err) {
    console.error(`Errore durante la rimozione della cartella ${folderPath}:`, err);
    try {
      await logDebug(`ERRORE durante la rimozione della cartella ${folderPath}: ${err.message}`);
    } catch {}
  }
}

async function cleanupEmailFile(emailQueueDir, emailFileName) {
  if (emailFileName) {
    try {
      await fs.unlink(path.join(emailQueueDir, emailFileName));
    } catch (err) {
      console.warn('Impossibile eliminare il file dalla coda email:', err);
    }
  }
}

const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const TOLERANCES_FILE = path.join(CONFIG_DIR, 'tolerances.json');

async function ensureConfigDir() {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
}

async function readConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {
      activeOperator: '',
      operators: {},
      emailConfig: {
        email: 'railpulse@adts.it',
        password: 'RaIlpul1!26',
        pollingInterval: 15,
        imapHost: 'imap.adts.it',
        imapPort: 993,
        imapSecure: true,
        smtpHost: 'smtp.adts.it',
        smtpPort: 465,
        smtpSecure: true
      }
    };
  }
}

// -------------------------------------------------------------
// 1. CONFIGURATION ROUTES
// -------------------------------------------------------------
router.get('/configuration', async (req, res) => {
  await ensureConfigDir();
  const config = await readConfig();
  res.json(config);
});

router.post('/configuration', async (req, res) => {
  await ensureConfigDir();
  try {
    const { activeOperator, operators, emailConfig } = req.body;
    const currentConfig = await readConfig();

    const newConfig = {
      activeOperator: activeOperator !== undefined ? activeOperator : currentConfig.activeOperator,
      operators: operators || currentConfig.operators || {},
      emailConfig: emailConfig !== undefined ? emailConfig : (currentConfig.emailConfig || {
        email: 'railpulse@adts.it',
        password: 'RaIlpul1!26',
        pollingInterval: 15,
        imapHost: 'imap.adts.it',
        imapPort: 993,
        imapSecure: true,
        smtpHost: 'smtp.adts.it',
        smtpPort: 465,
        smtpSecure: true
      })
    };

    await fs.writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf8');
    
    // Riavvia il polling email con la nuova configurazione
    try {
      if (global.startEmailPolling) global.startEmailPolling();
    } catch (err) {
      console.warn('Errore nel riavvio del polling email:', err);
    }

    res.json({ success: true, config: newConfig });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/configuration/tolerances', async (req, res) => {
  await ensureConfigDir();
  try {
    if (existsSync(TOLERANCES_FILE)) {
      const data = await fs.readFile(TOLERANCES_FILE, 'utf8');
      return res.json(data.trim() ? JSON.parse(data) : {});
    }
    res.json({});
  } catch (err) {
    console.error('Error reading tolerances:', err);
    res.json({});
  }
});

router.post('/configuration/tolerances', async (req, res) => {
  await ensureConfigDir();
  try {
    await fs.writeFile(TOLERANCES_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving tolerances:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 2. FILESYSTEM BROWSE & DIALOG ROUTES
// -------------------------------------------------------------
router.get('/fs-browse', async (req, res) => {
  const targetPath = req.query.path;
  try {
    if (!targetPath) {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic logicaldisk get caption');
        const drives = stdout
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length === 2 && line.endsWith(':'))
          .map(drive => ({
            name: drive + '\\',
            path: drive + '\\',
            isDirectory: true
          }));
        return res.json({ path: '', items: drives });
      } else {
        return res.json({ path: '/', items: [{ name: '/', path: '/', isDirectory: true }] });
      }
    }

    const fullPath = path.normalize(targetPath);
    const files = await fs.readdir(fullPath, { withFileTypes: true });
    
    const directories = files
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
        path: path.join(fullPath, dirent.name),
        isDirectory: true
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({ path: fullPath, items: directories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/fs-windows-dialog', async (req, res) => {
  if (process.platform !== 'win32') {
    return res.status(400).json({ error: 'Operazione non supportata su questo sistema operativo. Usa Windows.' });
  }

  const vbsScript = `
Dim objShell, objFolder
Set objShell = CreateObject("Shell.Application")
Set objFolder = objShell.BrowseForFolder(0, "Seleziona la Cartella Dati", 0, 0)
If TypeName(objFolder) <> "Nothing" Then
    WScript.Echo objFolder.Self.Path
End If
  `;

  const tempFilePath = path.join(os.tmpdir(), `browse_${Date.now()}.vbs`);
  
  try {
    await fs.writeFile(tempFilePath, vbsScript, 'utf8');
  } catch (err) {
    return res.status(500).json({ error: 'Failed to write temp file' });
  }

  execFile('cscript.exe', ['//Nologo', tempFilePath], async (error, stdout, stderr) => {
    try { await fs.unlink(tempFilePath); } catch (e) {}

    if (error) {
      console.error('Errore esecuzione cscript', error);
      return res.status(500).json({ error: error.message });
    }
    
    const p = stdout.trim();
    res.json({ path: p });
  });
});

router.post('/list-dirs', async (req, res) => {
  try {
    let currentPath = req.body.currentPath || '';
    
    // Se il percorso è relativo, lo risolviamo rispetto alla radice del workspace (..)
    if (currentPath && !path.isAbsolute(currentPath)) {
      currentPath = path.resolve(process.cwd(), '..', currentPath);
    }
    
    if (!currentPath && process.platform === 'win32') {
      const drives = [];
      const driveLetters = 'CDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      await Promise.all(
        driveLetters.map(async (char) => {
          const root = char + ':\\';
          try {
            await fs.stat(root);
            drives.push({ name: root, isDir: true, path: root });
          } catch (e) {}
        })
      );
      
      if (drives.length === 0) {
        drives.push({ name: 'C:\\', isDir: true, path: 'C:\\' });
      }
      
      drives.sort((a, b) => a.name.localeCompare(b.name));
      return res.json({ files: drives, currentPath: '' });
    }

    if (!currentPath) {
      currentPath = '/';
    }

    try {
      const items = await fs.readdir(currentPath, { withFileTypes: true });
      
      const files = items
        .filter(dirent => dirent.isDirectory())
        .map(dirent => ({
          name: dirent.name,
          isDir: true,
          path: path.join(currentPath, dirent.name)
        }));

      files.sort((a, b) => a.name.localeCompare(b.name));
      res.json({ files, currentPath });
    } catch (fsError) {
      res.status(403).json({ error: 'Impossibile leggere la directory: ' + fsError.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/local-files', async (req, res) => {
  const targetPath = req.query.path;
  const action = req.query.action;
  const fileName = req.query.file;

  if (!targetPath) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  try {
    const fullPath = path.normalize(targetPath);

    if (action === 'download' && fileName) {
      const filePath = path.join(fullPath, fileName);
      
      try {
        const stat = await fs.stat(filePath);
        if (!stat.isFile()) {
          return res.status(400).json({ error: 'Not a file' });
        }

        const contentType = mime.lookup(filePath) || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        
        const stream = createReadStream(filePath);
        stream.pipe(res);
      } catch (err) {
        res.status(404).json({ error: 'File not found or cannot be read' });
      }
    } else if (action === 'get-tolerances') {
      const dbPath = path.join(fullPath, 'tolerances_db.json');
      if (existsSync(dbPath)) {
        const data = await fs.readFile(dbPath, 'utf-8');
        return res.json(data.trim() ? JSON.parse(data) : {});
      }
      res.json({});
    } else if (action === 'get-singularities') {
      if (!fileName) return res.status(400).json({ error: 'Missing file parameter' });
      const parsed = path.parse(fileName);
      const dbPath = path.join(fullPath, `${parsed.name}_db.json`);
      if (existsSync(dbPath)) {
        const data = await fs.readFile(dbPath, 'utf-8');
        return res.json(data.trim() ? JSON.parse(data) : []);
      }
      res.json([]);
    } else {
      const files = await fs.readdir(fullPath, { withFileTypes: true });
      const fileDetails = [];
      
      for (const dirent of files) {
        if (dirent.isFile() && (dirent.name.toLowerCase().endsWith('.csv') || dirent.name.toLowerCase().endsWith('.geo'))) {
          try {
            const stat = await fs.stat(path.join(fullPath, dirent.name));
            fileDetails.push({
              name: dirent.name,
              size: stat.size,
              createdAt: stat.birthtime || stat.mtime
            });
          } catch (e) {
            console.error('Error reading stat for', dirent.name);
          }
        }
      }

      res.json({ files: fileDetails });
    }
  } catch (error) {
    console.error('API local-files GET error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/local-files', async (req, res) => {
  try {
    const { action, path: targetPath, file, data } = req.body;

    if (!targetPath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    const fullPath = path.normalize(targetPath);
    if (!existsSync(fullPath)) {
      await fs.mkdir(fullPath, { recursive: true });
    }

    if (action === 'save-tolerances') {
      const dbPath = path.join(fullPath, 'tolerances_db.json');
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
      return res.json({ message: 'Success' });
    } else if (action === 'save-singularities') {
      if (!file) return res.status(400).json({ error: 'Missing file parameter' });
      const parsed = path.parse(file);
      const dbPath = path.join(fullPath, `${parsed.name}_db.json`);
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
      return res.json({ message: 'Success' });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('API local-files POST error:', error);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 3. EMAIL AUTO-IMPORT ROUTES
// -------------------------------------------------------------
const TMP_UPLOAD_DIR = path.resolve(process.cwd(), '..', '..', 'track_web-main', 'backend', 'tmp_uploads', 'email_queue');

router.get('/tgm/email/check', async (req, res) => {
  try {
    await fs.mkdir(TMP_UPLOAD_DIR, { recursive: true });
    const files = await fs.readdir(TMP_UPLOAD_DIR);
    
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const stat = await fs.stat(path.join(TMP_UPLOAD_DIR, file));
        return { name: file, size: stat.size, time: stat.mtimeMs };
      })
    );
    
    fileStats.sort((a, b) => a.time - b.time);

    res.json({
      success: true,
      files: fileStats.map(f => f.name),
      count: fileStats.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tgm/email/check', async (req, res) => {
  const emailConfig = (await readConfig()).emailConfig;
  
  if (!emailConfig || !emailConfig.email || !emailConfig.password) {
    return res.status(400).json({ success: false, error: 'Email configuration is missing or incomplete.' });
  }

  const result = await checkNewEmails(emailConfig);
  
  if (!result.success) {
    return res.status(500).json(result);
  }
  
  try {
    const files = await fs.readdir(TMP_UPLOAD_DIR);
    res.json({
      success: true,
      newFilesDownloaded: result.count,
      queueCount: files.length,
      files: files
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/tgm/email/queue', async (req, res) => {
  try {
    const fileName = req.query.file;

    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }

    const safeName = path.basename(fileName);
    const filePath = path.join(TMP_UPLOAD_DIR, safeName);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (e) {}

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tgm/email/test', async (req, res) => {
  try {
    const emailConfig = req.body;
    const { email, password, imapHost, imapPort, imapSecure } = emailConfig;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Indirizzo email o password mancanti.' });
    }

    const domain = email.split('@')[1];
    const host = imapHost || `mail.${domain}`;
    const port = imapPort || 993;
    const isTls = imapSecure !== undefined ? imapSecure : true;

    const config = {
      imap: {
        user: email,
        password: password,
        host: host,
        port: port,
        tls: isTls,
        authTimeout: 5000,
        tlsOptions: { rejectUnauthorized: false }
      }
    };

    const imaps = (await import('imap-simple')).default;
    const connection = await imaps.connect(config);
    connection.end();

    res.json({ success: true, message: 'Connessione IMAP stabilita con successo!' });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// 4. MAINTENANCE RECORDS ROUTES
// -------------------------------------------------------------
router.get('/tgm/maintenance', async (req, res) => {
  const targetPath = req.query.path;
  if (!targetPath) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  try {
    const fullPath = resolveTargetPath(targetPath);
    const records = await getMaintenanceRecords(fullPath);
    res.json({ records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tgm/maintenance', async (req, res) => {
  const targetPath = req.query.path;
  if (!targetPath) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  try {
    const fullPath = resolveTargetPath(targetPath);
    const newRecord = await addMaintenanceRecord(fullPath, req.body);
    res.json({ record: newRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/tgm/maintenance/:id', async (req, res) => {
  const recordId = req.params.id;
  const targetPath = req.query.path;
  if (!targetPath) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  try {
    const fullPath = resolveTargetPath(targetPath);
    const updatedRecord = await updateMaintenanceRecord(fullPath, recordId, req.body);
    res.json({ record: updatedRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/tgm/maintenance/:id', async (req, res) => {
  const recordId = req.params.id;
  const targetPath = req.query.path;
  if (!targetPath) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  try {
    const fullPath = resolveTargetPath(targetPath);
    await deleteMaintenanceRecord(fullPath, recordId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 5. TGM SESSIONS ROUTES
// -------------------------------------------------------------
router.get('/tgm/sessions', async (req, res) => {
  const targetPath = req.query.path;
  if (!targetPath) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  try {
    const fullPath = resolveTargetPath(targetPath);
    const sessions = await getSessions(fullPath);
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tgm/sessions/import', upload.any(), async (req, res) => {
  let foundSessionFolder = null;
  let foundSessionName = null;
  const tempDirName = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tempUploadDir = path.resolve(__dirname, '..', '..', '..', '..', 'track_web-main', 'backend', 'tmp_uploads', tempDirName);
  const emailQueueDir = path.resolve(__dirname, '..', '..', '..', '..', 'track_web-main', 'backend', 'tmp_uploads', 'email_queue');
  
  try {
    const targetPath = req.body.path;
    const overwrite = req.body.overwrite === 'true';

    await logDebug(`--- NUOVO IMPORT INIZIATO ---`);
    await logDebug(`Target Path (frontend): ${targetPath}`);
    await logDebug(`Overwrite: ${overwrite}`);

    if (!targetPath) {
      await logDebug(`ERRORE: Parametro path mancante`);
      return res.status(400).json({ error: 'The path parameter is required' });
    }

    const Easton = resolveTargetPath(targetPath);
    await logDebug(`Easton (risolto): ${Easton}`);
    await fs.mkdir(tempUploadDir, { recursive: true });

    let isArchive = false;
    let archiveFilePath = '';
    let archiveOriginalName = '';
    
    const serverFiles = req.body.serverFiles;
    let emailFileName = null;

    if (serverFiles) {
      const fileName = Array.isArray(serverFiles) ? serverFiles[0] : serverFiles;
      emailFileName = fileName;
      const sourcePath = path.join(emailQueueDir, fileName);
      
      const ext = path.extname(fileName).toLowerCase();
      if (ext === '.zip' || ext === '.rar') {
        isArchive = true;
        archiveOriginalName = path.basename(fileName, ext);
        archiveFilePath = path.join(tempUploadDir, fileName);
        await fs.copyFile(sourcePath, archiveFilePath);
      } else {
        return res.status(400).json({ error: 'Unsupported file type in email queue' });
      }
    } else {
      const files = req.files || [];
      await logDebug(`Ricevuti ${files.length} file caricati.`);
      if (files.length === 0) {
        await logDebug(`ERRORE: Nessun file caricato`);
        return res.status(400).json({ error: 'No files uploaded' });
      }

      if (files.length === 1) {
        const file = files[0];
        const decodedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const ext = path.extname(decodedOriginalName).toLowerCase();
        if (ext === '.zip' || ext === '.rar') {
          isArchive = true;
          archiveOriginalName = path.basename(decodedOriginalName, ext);
          archiveFilePath = path.join(tempUploadDir, decodedOriginalName);
          await fs.copyFile(file.path, archiveFilePath);
          try { await fs.unlink(file.path); } catch (e) {}
        }
      }
    }

    const tempExtractDir = path.join(tempUploadDir, 'extracted');
    await fs.mkdir(tempExtractDir, { recursive: true });

    if (isArchive) {
      try {
        await extractArchive(archiveFilePath, tempExtractDir);
      } catch (err) {
        await deleteFolder(tempUploadDir);
        await cleanupEmailFile(emailQueueDir, emailFileName);
        return res.status(400).json({ error: err.message });
      }
    } else if (!emailFileName) {
      const files = req.files || [];
      const relPaths = req.body.relPaths ? JSON.parse(req.body.relPaths) : [];
      await logDebug(`Estrazione file non-archivio (sfusi): ${files.length} file`);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const decodedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const relativePath = relPaths[i] || decodedOriginalName;
        const filePath = path.join(tempExtractDir, relativePath);
        
        await logDebug(`  Salvataggio file: ${decodedOriginalName} -> ${filePath}`);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.copyFile(file.path, filePath);
        try { await fs.unlink(file.path); } catch (e) {}
      }
    }

    async function scanForSession(dir) {
      await logDebug(`Scansione per sessione in: ${dir}`);
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const currentName = path.basename(dir);
      await logDebug(`  Nome cartella corrente: ${currentName}`);
      if (SESSION_FOLDER_REGEX.test(currentName)) {
        const filesInDir = entries.filter(e => e.isFile()).map(e => e.name);
        const hasExceedances = filesInDir.some(f => f.includes('超限報表.csv'));
        const hasTqi = filesInDir.some(f => f.includes('軌道TQI報表.csv'));
        const hasParams = filesInDir.some(f => f.includes('軌道參數報表.csv'));

        await logDebug(`  Pattern cartella valido. File rilevati: [${filesInDir.join(', ')}]. Exceedances: ${hasExceedances}, TQI: ${hasTqi}, Params: ${hasParams}`);

        if (hasExceedances && hasTqi && hasParams) {
          foundSessionFolder = dir;
          foundSessionName = currentName;
          await logDebug(`  Trovata cartella sessione valida: ${foundSessionFolder} -> ${foundSessionName}`);
          return;
        }
      }

      for (const entry of entries) {
        if (entry.isDirectory()) {
          await scanForSession(path.join(dir, entry.name));
          if (foundSessionFolder) return;
        }
      }
    }

    await scanForSession(tempExtractDir);
    await logDebug(`Dopo scanForSession: foundSessionFolder=${foundSessionFolder}, foundSessionName=${foundSessionName}`);

    if (!foundSessionFolder) {
      await logDebug(`Cartella non trovata con scanForSession. Controllo file sfusi alla radice.`);
      const rootEntries = await fs.readdir(tempExtractDir, { withFileTypes: true });
      const filesInDir = rootEntries.filter(e => e.isFile()).map(e => e.name);
      const hasExceedances = filesInDir.some(f => f.includes('超限報表.csv'));
      const hasTqi = filesInDir.some(f => f.includes('軌道TQI報表.csv'));
      const hasParams = filesInDir.some(f => f.includes('軌道參數報表.csv'));

      await logDebug(`  File sfusi: [${filesInDir.join(', ')}]. Exceedances: ${hasExceedances}, TQI: ${hasTqi}, Params: ${hasParams}`);

      if (hasExceedances && hasTqi && hasParams) {
        foundSessionFolder = tempExtractDir;
        
        const frontendSessionName = req.body.sessionName;
        if (frontendSessionName && SESSION_FOLDER_REGEX.test(frontendSessionName)) {
          foundSessionName = frontendSessionName;
        } else if (archiveOriginalName && SESSION_FOLDER_REGEX.test(archiveOriginalName)) {
          foundSessionName = archiveOriginalName;
        } else {
          const paramsFile = filesInDir.find(f => f.includes('軌道參數報表.csv'));
          const match = paramsFile.match(/^(\d{4}\.\d{2}\.\d{2}\s+\d{2}\.\d{2}\.\d{2})/);
          foundSessionName = match ? match[1] : `Sessione_Recuperata_${Date.now()}`;
        }
        await logDebug(`  Trovata sessione in file sfusi. Folder: ${foundSessionFolder}, Name: ${foundSessionName}`);
      }
    }

    if (!foundSessionFolder) {
      await logDebug(`ERRORE: Cartella sessione non trovata o incompleta.`);
      const rootEntries = await fs.readdir(tempExtractDir).catch(()=>[]);
      let debugInfo = `Original: ${archiveOriginalName || 'N/A'}. Files at root: ${rootEntries.join(', ')}`;
      await logDebug(`  Dettagli debug: ${debugInfo}`);
      await deleteFolder(tempUploadDir);
      await cleanupEmailFile(emailQueueDir, emailFileName);
      return res.status(400).json({ 
        error: `Non-standard directory format or incomplete acquisition. Ensure the folder is named in the standard format and contains the three CSV files. Debug: ${debugInfo}` 
      });
    }

    const targetSessionPath = path.join(Easton, foundSessionName);
    let isDuplicate = false;
    try {
      await fs.access(targetSessionPath);
      isDuplicate = true;
      await logDebug(`La sessione è duplicata (cartella già esistente in ${targetSessionPath})`);
    } catch {}

    if (isDuplicate && !overwrite) {
      await logDebug(`Aborting import: duplicate found and overwrite is false.`);
      await deleteFolder(tempUploadDir);
      return res.json({ 
        duplicate: true, 
        folderName: foundSessionName,
        message: `The session ${foundSessionName} already exists.` 
      });
    }

    const entries = await fs.readdir(foundSessionFolder);
    let exceedancesFile = '';
    let tqiFile = '';
    let parametersFile = '';

    for (const file of entries) {
      if (file.includes('超限報表.csv')) {
        exceedancesFile = path.join(foundSessionFolder, file);
      } else if (file.includes('軌道TQI報表.csv')) {
        tqiFile = path.join(foundSessionFolder, file);
      } else if (file.includes('軌道參數報表.csv')) {
        parametersFile = path.join(foundSessionFolder, file);
      }
    }

    await logDebug(`File abbinati:`);
    await logDebug(`  Exceedances: ${exceedancesFile || 'NON TROVATO'}`);
    await logDebug(`  TQI: ${tqiFile || 'NON TROVATO'}`);
    await logDebug(`  Parameters: ${parametersFile || 'NON TROVATO'}`);

    try {
      await logDebug(`Parsing file CSV per validazione...`);
      await parseCSVFile(exceedancesFile);
      await parseCSVFile(tqiFile);
      await parseCSVFile(parametersFile);
      await logDebug(`Validazione CSV completata con successo.`);
    } catch (parseErr) {
      await logDebug(`ERRORE Validazione CSV fallita: ${parseErr.message}`);
      await deleteFolder(tempUploadDir);
      await cleanupEmailFile(emailQueueDir, emailFileName);
      return res.status(400).json({ error: `Corrupted CSV files or invalid headers: ${parseErr.message}` });
    }

    if (isDuplicate && overwrite) {
      await logDebug(`Sovrascrittura sessione attiva. Rimozione vecchia cartella ${targetSessionPath}`);
      await deleteFolder(targetSessionPath);
      const targetDbJsonPath = path.join(Easton, `${foundSessionName}_db.json`);
      try { await fs.unlink(targetDbJsonPath); } catch {}
    }

    await logDebug(`Creazione cartella sessione di destinazione: ${targetSessionPath}`);
    await fs.mkdir(targetSessionPath, { recursive: true });
    for (const file of entries) {
      const srcFile = path.join(foundSessionFolder, file);
      const dstFile = path.join(targetSessionPath, file);
      await logDebug(`  Copia file: ${srcFile} -> ${dstFile}`);
      await fs.copyFile(srcFile, dstFile);
    }

    const dbJsonPath = path.join(Easton, `${foundSessionName}_db.json`);
    await logDebug(`Creazione file database sessione vuoto: ${dbJsonPath}`);
    await fs.writeFile(dbJsonPath, JSON.stringify([], null, 2), 'utf-8');

    let reportData = null;

    let isNewLine = false;
    try {
      await logDebug(`Estrazione nome linea dal file parametri...`);
      const lineData = await extractLineNameData(path.join(targetSessionPath, path.basename(parametersFile)));
      await logDebug(`Dati Linea estratti: ${JSON.stringify(lineData)}`);
      
      let currentLineId = '';
      if (lineData && lineData.stazionePartenza) {
        currentLineId = typeof lineData.stazionePartenza === 'string' ? lineData.stazionePartenza : (lineData.stazionePartenza.code || lineData.stazionePartenza.codice || '');
        currentLineId = currentLineId.trim();
        let code = currentLineId;
        await logDebug(`Line Code pulito: "${code}"`);
        if (code && code !== '-' && !/^\d+$/.test(code)) {
          const lines = await readLines();
          const lineExists = lines.find(l => l.id === code);
          await logDebug(`Verifica esistenza linea "${code}" nel database lines.json: ${!!lineExists}`);
          if (!lineExists) {
            isNewLine = true;
            lines.push({
              id: code,
              name: code,
              startKm: 0,
              endKm: 0,
              tracks: ['Binario 1', 'Binario 2']
            });
            await writeLines(lines);
            await logDebug(`Linea "${code}" creata nel database lines.json.`);
          }
        }
      } else {
        await logDebug(`Nessuna stazione di partenza (Line Name) valida trovata in lineData.`);
      }

      // Estrai GIS da CSV parameters
      reportData = {
        lineId: currentLineId || 'UNKNOWN',
        startKm: 0,
        endKm: 0,
        addedStations: 0,
        addedSwitches: 0,
        addedPoints: 0
      };

      try {
        await logDebug(`Esecuzione extractGisElementsFromParameters su: ${path.basename(parametersFile)}`);
        const gisElements = await extractGisElementsFromParameters(path.join(targetSessionPath, path.basename(parametersFile)));
        await logDebug(`Elementi GIS estratti grezzi: ${gisElements.stations.length} stazioni, ${gisElements.switches.length} scambi, ${gisElements.points.length} punti noti.`);

        if (gisElements.stations.length > 0 || gisElements.switches.length > 0 || gisElements.points.length > 0) {
          const lineId = currentLineId || 'UNKNOWN_LINE';
          let lineGis;
          if (isNewLine) {
            await logDebug(`Linea "${lineId}" è nuova o ricreata. Inizializzazione GIS vuoto per sovrascrivere vecchi file residui.`);
            lineGis = {
              lineId,
              gisLayers: {
                stations: [],
                sleepers: [],
                slab: [],
                ballast: [],
                curvatures: [],
                tonnage: [],
                switches: []
              }
            };
          } else {
            await logDebug(`Caricamento GIS esistente per linea "${lineId}"...`);
            lineGis = await readGis(lineId);
          }
          
          if (!lineGis.gisLayers.stations) lineGis.gisLayers.stations = [];
          if (!lineGis.gisLayers.switches) lineGis.gisLayers.switches = [];
          if (!lineGis.gisLayers.points) lineGis.gisLayers.points = [];

          let maxKm = 0;
          let minKm = 999999;
          
          const updateMinMax = (km) => {
            if (km > maxKm) maxKm = km;
            if (km < minKm) minKm = km;
          };

          const allStations = await readStations();
          let stationsUpdated = false;

          for (const s of gisElements.stations) {
            updateMinMax(s.startKm);
            updateMinMax(s.endKm);
            const isDup = lineGis.gisLayers.stations.some(ex => Math.abs(ex.startKm - s.startKm) < 0.001 && Math.abs(ex.endKm - s.endKm) < 0.001);
            const stCode = s.stationCode || s.id;
            if (!isDup) {
              lineGis.gisLayers.stations.push(s);
              reportData.addedStations++;
              await logDebug(`  Stazione GIS ${stCode} aggiunta al layer GIS della linea (km ${s.startKm} - ${s.endKm}).`);
            } else {
              await logDebug(`  Stazione GIS ${stCode} ignorata perché già presente in ${lineId}_gis.json (km ${s.startKm} - ${s.endKm}).`);
            }

            // Aggiunge la stazione al registro globale station.json se manca
            const existingStation = allStations.find(existing => existing.code === stCode);
            if (!existingStation) {
              allStations.push({
                code: stCode,
                name: stCode,
                kmStart: s.startKm,
                kmEnd: s.endKm,
                tracks: s.tracks || 1,
                lineCode: lineId,
                stationNumber: '',
                stationType: 'station'
              });
              stationsUpdated = true;
              await logDebug(`  Stazione ${stCode} aggiunta al registro station.json.`);
            } else {
              await logDebug(`  Stazione ${stCode} ignorata nel registro station.json perché già esistente.`);
            }
          }

          if (stationsUpdated) {
            allStations.sort((a, b) => a.code.localeCompare(b.code));
            await writeStations(allStations);
            await logDebug(`Nuove stazioni caricate e inserite in station.json.`);
          }
          
          for (const s of gisElements.switches) {
            updateMinMax(s.startKm);
            updateMinMax(s.endKm);
            const isDup = lineGis.gisLayers.switches.some(ex => Math.abs(ex.startKm - s.startKm) < 0.001 && Math.abs(ex.endKm - s.endKm) < 0.001);
            const swId = s.switchId || s.id;
            if (!isDup) {
              lineGis.gisLayers.switches.push(s);
              reportData.addedSwitches++;
              await logDebug(`  Scambio GIS ${swId} aggiunto al layer GIS.`);
            } else {
              await logDebug(`  Scambio GIS ${swId} ignorato perché già esistente in ${lineId}_gis.json.`);
            }
          }

          for (const p of gisElements.points) {
            updateMinMax(p.km);
            const isDup = lineGis.gisLayers.points.some(ex => Math.abs(ex.km - p.km) < 0.001 && ex.type === p.type);
            const ptId = p.id;
            if (!isDup) {
              lineGis.gisLayers.points.push(p);
              reportData.addedPoints++;
              await logDebug(`  Punto Noto GIS ${ptId} aggiunto al layer GIS.`);
            } else {
              await logDebug(`  Punto Noto GIS ${ptId} ignorato perché già esistente in ${lineId}_gis.json.`);
            }
          }

          if (minKm !== 999999) reportData.startKm = minKm;
          reportData.endKm = maxKm;
          
          await logDebug(`Elementi GIS aggiunti (non duplicati): ${reportData.addedStations} stazioni, ${reportData.addedSwitches} scambi, ${reportData.addedPoints} punti noti.`);
          await logDebug(`Estremi chilometrici calcolati per la tratta corrente: ${reportData.startKm} - ${reportData.endKm}`);

          try {
            await logDebug(`Aggiornamento chilometrica in lines.json per linea "${lineId}"...`);
            const lines = await readLines();
            const st = lines.find(l => l.id === lineId);
            if (st) {
              let updated = false;
              if (minKm !== 999999 && (st.startKm === 0 || minKm < st.startKm)) { 
                st.startKm = parseFloat(minKm.toFixed(3)); 
                updated = true; 
              }
              if (maxKm > st.endKm) { 
                st.endKm = parseFloat(maxKm.toFixed(3)); 
                updated = true; 
              }
              if (updated) {
                await writeLines(lines);
                await logDebug(`Estremi chilometrici della linea aggiornati nel lines.json: ${st.startKm} - ${st.endKm}`);
              } else {
                await logDebug(`Nessun aggiornamento chilometrico necessario per lines.json (valori esistenti già inclusivi).`);
              }
            } else {
              await logDebug(`AVVISO: Linea "${lineId}" non trovata in lines.json, impossibile aggiornare i km.`);
            }
          } catch (stErr) {
            await logDebug(`ERRORE aggiornamento km in lines.json: ${stErr.message}`);
            console.warn('Errore aggiornamento km in lines.json:', stErr);
          }

          await writeGis(lineId, lineGis);
          await logDebug(`Scrittura file GIS completata per ${lineId}_gis.json`);
        } else {
          await logDebug(`Nessun elemento GIS da inserire.`);
        }
      } catch (gisErr) {
        await logDebug(`ERRORE durante l'estrazione GIS o scrittura: ${gisErr.message}\nStack: ${gisErr.stack}`);
        console.warn('Errore estrazione dati GIS da CSV:', gisErr);
      }

    } catch (stationErr) {
      await logDebug(`ERRORE nel blocco stationErr: ${stationErr.message}\nStack: ${stationErr.stack}`);
      console.warn('Impossibile aggiornare station.json:', stationErr);
    }

    if (emailFileName) {
      try {
        await fs.unlink(path.join(emailQueueDir, emailFileName));
      } catch (err) {
        console.warn('Impossibile eliminare il file dalla coda email:', err);
      }
    }

    await deleteFolder(tempUploadDir);
    await logDebug(`Importazione terminata con successo. Risultato: ${JSON.stringify(reportData)}`);

    res.json({ success: true, folderName: foundSessionName, report: typeof reportData !== 'undefined' ? reportData : null });

  } catch (error) {
    await logDebug(`ERRORE CRITICO NON GESTITO: ${error.message}\nStack: ${error.stack}`);
    console.error('Import error:', error);
    await deleteFolder(tempUploadDir);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/tgm/sessions/manage', async (req, res) => {
  try {
    const { action, targetPath, folderName, sourceFolder, destinationFolder, sessionId, updates } = req.body;

    if (!targetPath) {
      return res.status(400).json({ error: 'targetPath is required' });
    }

    const basePath = resolveTargetPath(targetPath);

    if (action === 'create') {
      if (!folderName) return res.status(400).json({ error: 'folderName is required' });
      const newFolderPath = path.join(basePath, folderName);
      await fs.mkdir(newFolderPath, { recursive: true });
      return res.json({ success: true, message: 'Folder created successfully' });
    }

    if (action === 'update-metadata') {
      if (!sessionId || !updates) {
        return res.status(400).json({ error: 'sessionId and updates are required' });
      }
      
      const sessionPath = path.join(basePath, sessionId);
      
      try {
        const files = await fs.readdir(sessionPath);
        let dbFile = files.find(f => f.endsWith('_db.json'));
        let dbFilePath;
        let dbData = {};
        
        if (!dbFile) {
          dbFile = `${sessionId}_db.json`;
          dbFilePath = path.join(sessionPath, dbFile);
        } else {
          dbFilePath = path.join(sessionPath, dbFile);
          try {
            const fileContent = await fs.readFile(dbFilePath, 'utf8');
            dbData = JSON.parse(fileContent);
          } catch (e) {
            console.warn('Error reading db.json, starting fresh', e);
          }
        }
        
        Object.assign(dbData, updates);
        await fs.writeFile(dbFilePath, JSON.stringify(dbData, null, 2), 'utf8');

        return res.json({ success: true, message: 'Metadata updated successfully', data: dbData });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to update metadata: ' + err.message });
      }
    }

    if (action === 'move') {
      if (!sourceFolder || !destinationFolder) {
        return res.status(400).json({ error: 'sourceFolder and destinationFolder are required' });
      }
      
      const sourcePath = path.join(basePath, sourceFolder);
      const destPath = destinationFolder === 'root' 
        ? path.join(basePath, path.basename(sourceFolder))
        : path.join(basePath, destinationFolder, path.basename(sourceFolder));

      await fs.rename(sourcePath, destPath);
      return res.json({ success: true, message: 'Folder moved successfully' });
    }

    if (action === 'delete') {
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }
      const sessionPath = path.join(basePath, sessionId);
      try {
        await fs.rm(sessionPath, { recursive: true, force: true });
        return res.json({ success: true, message: 'Session deleted successfully' });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to delete session: ' + err.message });
      }
    }

    if (action === 'clear-database') {
      try {
        const files = await fs.readdir(basePath);
        for (const file of files) {
          await fs.rm(path.join(basePath, file), { recursive: true, force: true });
        }
        return res.json({ success: true, message: 'Database cleared successfully' });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to clear database: ' + err.message });
      }
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('API TGM Sessions Manage error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/tgm/sessions/:id/data', async (req, res) => {
  const sessionId = req.params.id;
  const targetPath = req.query.path;

  if (!targetPath) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  try {
    const fullPath = resolveTargetPath(targetPath);
    const data = await getSessionData(fullPath, sessionId);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tgm/sessions/:id/downsample', async (req, res) => {
  const sessionId = req.params.id;
  const targetPath = req.query.path;
  const fileName = req.query.file;
  const sampleSize = parseInt(req.query.sampleSize || '2000', 10);

  if (!targetPath || !fileName) {
    return res.status(400).json({ error: 'Path and file parameters are required' });
  }

  try {
    const fullPath = resolveTargetPath(targetPath);
    const sessionFolderPath = path.join(fullPath, sessionId);
    const cachedFileName = `.downsampled_${sampleSize}.json`;
    const cachedFilePath = path.join(sessionFolderPath, cachedFileName);
    
    if (existsSync(cachedFilePath)) {
      const cachedData = readFileSync(cachedFilePath, 'utf-8');
      return res.json(JSON.parse(cachedData));
    }

    let actualFileName = fileName;
    if (existsSync(sessionFolderPath)) {
      const files = readdirSync(sessionFolderPath);
      const match = files.find(f => f.includes(fileName));
      if (match) actualFileName = match;
    }
    const rawFilePath = path.join(sessionFolderPath, actualFileName);

    if (!existsSync(rawFilePath)) {
      return res.status(404).json({ error: 'Raw file not found: ' + fileName });
    }

    const fileContent = readFileSync(rawFilePath, 'utf-8');

    let totalDataRows = 0;
    let headerFound = false;
    let headers = [];
    let metadataLines = [];

    Papa.parse(fileContent, {
      skipEmptyLines: true,
      step: (results) => {
        const row = results.data;
        if (!headerFound) {
          const lower = row.map(c => (c || '').toString().trim().toLowerCase());
          if (lower.some(c => c === 'km' || c.includes('km'))) {
            headerFound = true;
            const seenHeaders = new Set();
            headers = row.map((c, index) => {
              let cleanHeader = (c || '').toString().replace(/[\x00-\x1F\x7F-\x9F\uFEFF]/g, '').trim();
              if (cleanHeader) {
                let original = cleanHeader;
                let counter = 1;
                while (seenHeaders.has(cleanHeader)) {
                  cleanHeader = `${original}_${counter}`;
                  counter++;
                }
                seenHeaders.add(cleanHeader);
              }
              return cleanHeader;
            });
          } else {
            metadataLines.push(row.join(';'));
          }
          return;
        }
        totalDataRows++;
      }
    });

    const targets = new Set();
    if (totalDataRows > sampleSize) {
      const step = totalDataRows / sampleSize;
      for (let i = 0; i < sampleSize; i++) {
        targets.add(Math.floor(i * step));
      }
    } else {
      for (let i = 0; i < totalDataRows; i++) targets.add(i);
    }

    const sampledRows = [];
    let dataIndex = -1;
    let headerFound2 = false;

    Papa.parse(fileContent, {
      skipEmptyLines: true,
      step: (results) => {
        const row = results.data;
        if (!headerFound2) {
          const lower = row.map(c => (c || '').toString().trim().toLowerCase());
          if (lower.some(c => c === 'km' || c.includes('km'))) {
            headerFound2 = true;
          }
          return;
        }
        dataIndex++;
        if (targets.has(dataIndex)) {
          const obj = {};
          for (let i = 0; i < headers.length; i++) {
            obj[headers[i]] = row[i];
          }
          sampledRows.push(obj);
        }
      }
    });

    const responsePayload = {
      metadataLines,
      headers,
      sampledRows,
      totalDataRows,
      sampleSize
    };

    writeFileSync(cachedFilePath, JSON.stringify(responsePayload), 'utf-8');
    res.json(responsePayload);

  } catch (error) {
    console.error(`API TGM Downsample GET error for ${sessionId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/tgm/sessions/:id/exceedances', async (req, res) => {
  const sessionId = req.params.id;
  const targetPath = req.query.path;

  if (!targetPath) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  try {
    const fullPath = resolveTargetPath(targetPath);
    const data = await getSessionExceedances(fullPath, sessionId);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tgm/sessions/:id/raw', async (req, res) => {
  const sessionId = req.params.id;
  const targetPath = req.query.path;
  const fileName = req.query.file;

  if (!targetPath || !fileName) {
    return res.status(400).json({ error: 'Path and file parameters are required' });
  }

  try {
    const fullPath = resolveTargetPath(targetPath);
    const sessionFolderPath = path.join(fullPath, sessionId);
    
    let actualFileName = fileName;
    if (existsSync(sessionFolderPath)) {
      const files = readdirSync(sessionFolderPath);
      const match = files.find(f => f.includes(fileName));
      if (match) actualFileName = match;
    }
    const rawFilePath = path.join(sessionFolderPath, actualFileName);

    if (!existsSync(rawFilePath)) {
      return res.status(404).json({ error: 'Raw file not found' });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(actualFileName)}"`);
    createReadStream(rawFilePath).pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tgm/sessions/:id/tqi', async (req, res) => {
  const sessionId = req.params.id;
  const targetPath = req.query.path;

  if (!targetPath) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  try {
    const fullPath = resolveTargetPath(targetPath);
    const data = await getSessionTQI(fullPath, sessionId);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Removed station routes as they are now in config.routes.js

module.exports = router;
