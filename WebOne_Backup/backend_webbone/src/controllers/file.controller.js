// ...existing code...
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const multer = require('multer');
const os = require('os');
const crypto = require('crypto');

function getFolderPath(folderParam) {
  if (Array.isArray(folderParam)) return folderParam.join('/');
  return folderParam || '';
}

const BASE_PATH = process.env.CLIENT_FILES_BASE_PATH
  ? path.resolve(process.env.CLIENT_FILES_BASE_PATH)
  : path.join(process.cwd(), 'uploads');

// Ensure base path exists
if (!fs.existsSync(BASE_PATH)) fs.mkdirSync(BASE_PATH, { recursive: true });

// multer storage: always disk storage on local filesystem
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const clientFolder = req.user?.folderName;
    const folder = getFolderPath(req.params.folder);
    if (!clientFolder && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      return cb(new Error('Client folder not found'));
    }
    const uploadPath = path.join(BASE_PATH, clientFolder || '', folder || '');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const clientFolder = req.user?.folderName || '';
    const folder = getFolderPath(req.params.folder) || '';
    const uploadPath = path.join(BASE_PATH, clientFolder, folder);
    let finalName = file.originalname;
    
    if (finalName.toLowerCase().endsWith('.geo')) {
      let counter = 1;
      let checkPath = path.join(uploadPath, finalName);
      const parsed = path.parse(finalName);
      while (fs.existsSync(checkPath)) {
        finalName = `${parsed.name}_${counter}${parsed.ext}`;
        checkPath = path.join(uploadPath, finalName);
        counter++;
      }
    }
    cb(null, finalName);
  }
});

const upload = multer({ storage });

// Resumable uploads temp area
const RESUMABLE_TMP = path.join(os.tmpdir(), 'weebone_resumable');
if (!fs.existsSync(RESUMABLE_TMP)) fs.mkdirSync(RESUMABLE_TMP, { recursive: true });

function makeId() { return crypto.randomBytes(12).toString('hex'); }
function manifestPath(id) { return path.join(RESUMABLE_TMP, `${id}.json`); }

// Init resumable
exports.initResumable = async (req, res) => {
  try {
    const { filename, totalSize } = req.body;
    const clientFolder = req.user?.folderName;
    const folder = getFolderPath(req.params.folder);
    if (!clientFolder && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      return res.status(400).json({ message: 'Client folder not found' });
    }
    if (!filename || !totalSize) return res.status(400).json({ message: 'filename and totalSize required' });

    const id = makeId();
    const manifest = {
      id,
      filename,
      totalSize: Number(totalSize),
      folder: folder || '',
      clientFolder,
      chunks: {},
      createdAt: Date.now()
    };
    fs.writeFileSync(manifestPath(id), JSON.stringify(manifest));
    return res.json({ id });
  } catch (err) {
    console.error('initResumable Error', err);
    res.status(500).json({ message: 'Internal Error', error: err.message });
  }
};

// Upload chunk
const chunkUpload = multer({ storage: multer.memoryStorage() });
exports.uploadResumableChunk = [chunkUpload.single('chunk'), async (req, res) => {
  try {
    const { id, index } = req.body;
    if (!id || typeof index === 'undefined') return res.status(400).json({ message: 'id and index required' });
    const manifestP = manifestPath(id);
    if (!fs.existsSync(manifestP)) return res.status(400).json({ message: 'Invalid upload id' });
    const manifest = JSON.parse(fs.readFileSync(manifestP));
    const idx = Number(index);
    const buf = req.file && req.file.buffer ? req.file.buffer : null;
    if (!buf) return res.status(400).json({ message: 'No chunk file' });

    const chunkFile = path.join(RESUMABLE_TMP, `${id}.chunk.${idx}`);
    fs.writeFileSync(chunkFile, buf);
    manifest.chunks[idx] = { size: buf.length, path: chunkFile };
    fs.writeFileSync(manifestP, JSON.stringify(manifest));
    return res.json({ ok: true, index: idx });
  } catch (err) {
    console.error('uploadResumableChunk Error', err);
    res.status(500).json({ message: 'Internal Error', error: err.message });
  }
}];

// Resumable status
exports.resumableStatus = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'id required' });
    const manifestP = manifestPath(id);
    if (!fs.existsSync(manifestP)) return res.status(404).json({ message: 'Upload id not found' });
    const manifest = JSON.parse(fs.readFileSync(manifestP));
    const uploaded = Object.keys(manifest.chunks || {}).map(x => Number(x)).sort((a, b) => a - b);
    return res.json({ uploaded });
  } catch (err) {
    console.error('resumableStatus Error', err);
    res.status(500).json({ message: 'Internal Error', error: err.message });
  }
};

// Complete resumable: assemble and move to final local folder
const writeWithTimeout = (promiseFactory, ms = 30 * 1000) => new Promise((resolve, reject) => {
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    reject(new Error(`Write operation timed out after ${ms}ms`));
  }, ms);
  try {
    const p = promiseFactory();
    Promise.resolve(p).then((r) => {
      if (!timedOut) {
        clearTimeout(timer);
        resolve(r);
      }
    }).catch((e) => {
      if (!timedOut) {
        clearTimeout(timer);
        reject(e);
      }
    });
  } catch (e) {
    if (!timedOut) {
      clearTimeout(timer);
      reject(e);
    }
  }
});

exports.completeResumable = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'id required' });
    const manifestP = manifestPath(id);
    if (!fs.existsSync(manifestP)) return res.status(404).json({ message: 'Upload id not found' });
    const manifest = JSON.parse(fs.readFileSync(manifestP));
    const chunkIndexes = Object.keys(manifest.chunks || {}).map(x => Number(x)).sort((a, b) => a - b);

    let total = 0;
    for (const i of chunkIndexes) total += manifest.chunks[i].size || 0;
    if (manifest.totalSize && total !== manifest.totalSize) {
      console.warn('Warning: assembled size does not match declared totalSize', total, manifest.totalSize);
    }

    const assembledPath = path.join(RESUMABLE_TMP, `${id}.assembled`);
    const writeStream = fs.createWriteStream(assembledPath);
    try {
      for (const i of chunkIndexes) {
        const chunkP = manifest.chunks[i].path;
        if (!fs.existsSync(chunkP)) {
          try { writeStream.close(); } catch (e) {}
          return res.status(400).json({ message: `Missing chunk ${i}` });
        }
        const data = fs.readFileSync(chunkP);
        if (!writeStream.write(data)) {
          await new Promise(r => writeStream.once('drain', r));
        }
      }
      writeStream.end();
      await new Promise((resolve, reject) => {
        writeStream.once('finish', resolve);
        writeStream.once('error', reject);
      });
    } catch (e) {
      try { writeStream.close(); } catch (er) {}
      console.error('Error assembling chunks', e);
      return res.status(500).json({ message: 'Error assembling file', error: e.message });
    }

    // Move assembled file to final local destination
    let finalName = manifest.filename;
    const clientFolder = manifest.clientFolder || '';
    const folder = manifest.folder || '';
    const destDir = path.join(BASE_PATH, clientFolder, folder);
    fs.mkdirSync(destDir, { recursive: true });
    
    if (finalName.toLowerCase().endsWith('.geo')) {
      let counter = 1;
      let checkPath = path.join(destDir, finalName);
      const parsed = path.parse(finalName);
      while (fs.existsSync(checkPath)) {
        finalName = `${parsed.name}_${counter}${parsed.ext}`;
        checkPath = path.join(destDir, finalName);
        counter++;
      }
    }
    const destPath = path.join(destDir, finalName);
    try {
      await writeWithTimeout(() => Promise.resolve(fs.copyFileSync(assembledPath, destPath)), 30 * 1000);
    } catch (e) {
      console.error('Local copy failed or timed out', e);
      return res.status(500).json({ message: 'Failed to move assembled file', error: e.message });
    }

    // Cleanup
    for (const i of chunkIndexes) {
      try { fs.unlinkSync(manifest.chunks[i].path); } catch (e) {}
    }
    try { fs.unlinkSync(assembledPath); } catch (e) {}
    try { fs.unlinkSync(manifestP); } catch (e) {}

    return res.json({ ok: true, message: 'File assembled and saved' });
  } catch (err) {
    console.error('completeResumable Error', err);
    res.status(500).json({ message: 'Internal Error', error: err.message });
  }
};

// Rename file
exports.renameFile = async (req, res) => {
  const clientFolder = req.user?.folderName;
  const folder = getFolderPath(req.params.folder);
  const { oldName, newName } = req.body;
  if (!clientFolder && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
    return res.status(400).json({ message: 'Cartella cliente non trovata nel token' });
  }
  if (!oldName || !newName) return res.status(400).json({ message: 'oldName and newName required' });

  try {
    const base = path.join(BASE_PATH, clientFolder || '', folder || '');
    const oldPath = path.join(base, oldName);
    const newPath = path.join(base, newName);

    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error('❌ Error renaming file:', err);
        return res.status(500).json({ message: 'Error renaming file', error: err.message });
      }
      res.json({ message: 'File renamed successfully' });
    });
  } catch (err) {
    console.error('renameFile Error', err);
    res.status(500).json({ message: 'Error renaming file', error: err.message });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  const clientFolder = req.user?.folderName;
  const folder = getFolderPath(req.params.folder);
  const fileName = req.params.fileName;
  if (!clientFolder && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
    return res.status(400).json({ message: 'Cartella cliente non trovata nel token' });
  }
  if (!fileName) return res.status(400).json({ message: 'fileName required' });

  try {
    const filePath = path.join(BASE_PATH, clientFolder || '', folder || '', fileName);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('❌ Error deleting file:', err);
        return res.status(500).json({ message: 'Error deleting file', error: err.message });
      }
      res.json({ message: 'File deleted successfully' });
    });
  } catch (err) {
    console.error('deleteFile Error', err);
    res.status(500).json({ message: 'Error deleting file', error: err.message });
  }
};

// List available folders
exports.getAvailableFolders = async (req, res) => {
  const folderName = req.user?.folderName;
  const subPath = req.query.path || '';
  
  try {
    let targetDir = BASE_PATH;
    
    // Se superadmin o admin, può esplorare le cartelle sotto BASE_PATH
    if (!folderName && (req.user.role === 'superadmin' || req.user.role === 'admin')) {
      targetDir = path.join(BASE_PATH, subPath);
    } else if (folderName) {
      targetDir = path.join(BASE_PATH, folderName, subPath);
    } else {
      return res.status(400).json({ message: 'Cartella cliente non trovata nel token' });
    }

    // Sicurezza: evitare directory traversal
    const resolved = path.resolve(targetDir);
    const baseResolved = path.resolve(BASE_PATH) + path.sep;
    if (!resolved.startsWith(baseResolved) && resolved !== path.resolve(BASE_PATH)) {
      return res.status(400).json({ message: 'Percorso non valido' });
    }

    if (!fs.existsSync(targetDir)) {
      return res.json({ folders: [] }); // return empty if dir doesn't exist
    }

    fs.readdir(targetDir, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.error("Errore nella lettura della directory:", err);
        return res.status(500).json({ message: 'Errore nella lettura della directory', error: err.message });
      }
      const folders = files.filter(f => f.isDirectory()).map(f => f.name);
      res.json({ folders });
    });
  } catch (err) {
    console.error('getAvailableFolders Error', err);
    res.status(500).json({ message: 'Internal Error', error: err.message });
  }
};

// List files in folder
exports.getFilesInFolder = async (req, res) => {
  const subFolder = getFolderPath(req.params.folder);
  const clientFolder = req.user?.folderName;

  if (!clientFolder && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
    return res.status(400).json({ message: "Cartella cliente non trovata nel token" });
  }

  try {
    const folderPath = path.join(BASE_PATH, clientFolder || '', subFolder || '');
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error("❌ Errore nella lettura della sotto-cartella:", err);
        return res.status(500).json({ message: "Errore durante la lettura dei file", error: err.message });
      }
      const fileDetails = files.map(file => {
        try {
          const stats = fs.statSync(path.join(folderPath, file));
          return { name: file, size: stats.size, createdAt: stats.birthtime || stats.mtime };
        } catch (e) {
          return { name: file, size: 0, createdAt: new Date() };
        }
      });
      res.json({ files: fileDetails });
    });
  } catch (err) {
    console.error('getFilesInFolder Error', err);
    res.status(500).json({ message: 'Internal Error', error: err.message });
  }
};

// Stream or download file
exports.getRawFile = async (req, res) => {
  try {
    const { folder, file, download } = req.query;
    const clientFolder = req.user?.folderName;

    if (!BASE_PATH) return res.status(500).json({ message: 'CLIENT_FILES_BASE_PATH not configured.' });
    if (!clientFolder && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      return res.status(400).json({ message: 'Customer folder not found in token.' });
    }
    if (!folder || !file) return res.status(400).json({ message: 'Missing params: folder and file are required.' });

    const fullPath = path.resolve(BASE_PATH, clientFolder || '', folder, file);
    const baseResolved = path.resolve(BASE_PATH) + path.sep;
    if (!fullPath.startsWith(baseResolved)) {
      return res.status(400).json({ message: 'Path is not valid', fullPath });
    }
    if (!fs.existsSync(fullPath)) return res.status(404).json({ message: 'File not found' });

    const contentType = mime.lookup(fullPath) || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    if (download === '1' || download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(fullPath)}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(fullPath)}"`);
    }

    const stream = fs.createReadStream(fullPath);
    stream.on('error', (err) => {
      console.error('Stream file error', err);
      if (!res.headersSent) res.status(500).end('An error occurred while streaming the file.');
      else res.end();
    });
    stream.pipe(res);
  } catch (err) {
    console.error('getRawFile Error', err);
    res.status(500).json({ message: 'Internal Error', error: err.message });
  }
};

// Create folder
exports.createFolder = async (req, res) => {
  try {
    const clientFolder = req.user?.folderName;
    const folder = getFolderPath(req.params.folder);
    const { newFolderName } = req.body;

    if (!clientFolder && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      return res.status(400).json({ message: "Cartella cliente non trovata nel token" });
    }

    let newFolderPath;
    if (newFolderName) {
      newFolderPath = path.join(BASE_PATH, clientFolder || '', folder || '', newFolderName);
    } else {
      newFolderPath = path.join(BASE_PATH, clientFolder || '', folder || '');
    }

    // Sicurezza: evitare directory traversal
    const resolved = path.resolve(newFolderPath);
    const baseResolved = path.resolve(BASE_PATH) + path.sep;
    if (!resolved.startsWith(baseResolved)) {
      return res.status(400).json({ message: 'Percorso non valido' });
    }

    fs.mkdir(newFolderPath, { recursive: true }, (err) => {
      if (err) {
        console.error("❌ Error creating folder:", err);
        return res.status(500).json({ message: "Error creating folder", error: err.message });
      }
      res.status(201).json({ message: "Folder created successfully" });
    });
  } catch (err) {
    console.error("createFolder Error", err);
    res.status(500).json({ message: "Internal Error", error: err.message });
  }
};

// Upload single file (local)
exports.uploadFile = [
  (req, res) => {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error("❌ Error uploading file:", err);
        return res.status(500).json({ message: "Error uploading file", error: err.message });
      }
      try {
        console.log('✅ File uploaded successfully:', req.file);
        return res.json({ message: 'File uploaded successfully' });
      } catch (err) {
        console.error('uploadFile Error', err);
        return res.status(500).json({ message: 'Error uploading file', error: err.message });
      }
    });
  }
];


exports.createClientFolder = async (req, res) => {
  try {
    if (req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'forbidden' });
    }

    const { folderName } = req.body;
    if (!folderName || typeof folderName !== 'string') {
      return res.status(400).json({ message: 'folderName required' });
    }

    // Reject suspicious names to avoid path traversal and nested paths
    if (folderName.includes('..') || folderName.includes(path.sep) || folderName.trim() === '') {
      return res.status(400).json({ message: 'Invalid folderName' });
    }

    const safeName = folderName.trim();
    const newFolderPath = path.join(BASE_PATH, safeName);

    // Ensure resolved path stays inside BASE_PATH
    const resolved = path.resolve(newFolderPath);
    const baseResolved = path.resolve(BASE_PATH) + path.sep;
    if (!resolved.startsWith(baseResolved)) {
      return res.status(400).json({ message: 'Invalid folder path' });
    }

    const subfolders = ['config', 'upload', 'manuals'];

 try {
      // create main folder
      await fs.promises.mkdir(newFolderPath, { recursive: true });
      // create subfolders in parallel
      await Promise.all(
        subfolders.map((sf) => fs.promises.mkdir(path.join(newFolderPath, sf), { recursive: true }))
      );
    } catch (err) {
      console.error('❌ Error creating folder or subfolders:', err);
      return res.status(500).json({ message: 'Error creating folder', error: err.message });
    }

    return res.status(201).json({
      message: 'Folder and predefined subfolders created successfully',
      path: newFolderPath,
      subfolders
    });
  } catch (err) {
    console.error("createClientFolder Error", err);
    return res.status(500).json({ message: "Internal Error", error: err.message });
  }
};exports.saveSingularities = async (req, res) => {
  try {
    const { folder, file, singularities } = req.body;
    const clientFolder = req.user?.folderName;
    if (!clientFolder) return res.status(403).json({ error: 'Unauthorized' });
    if (!file) return res.status(400).json({ error: 'Missing file parameter' });

    const parsedPath = path.parse(file);
    const dbFileName = parsedPath.name + '_db.json';
    
    // Check path traversal
    const requestedDir = path.resolve(BASE_PATH, clientFolder, folder || '');
    if (!requestedDir.startsWith(path.resolve(BASE_PATH, clientFolder))) {
       return res.status(403).json({ error: 'Invalid path' });
    }

    const dbFilePath = path.join(requestedDir, dbFileName);

    if (!fs.existsSync(requestedDir)) {
      fs.mkdirSync(requestedDir, { recursive: true });
    }

    fs.writeFileSync(dbFilePath, JSON.stringify(singularities, null, 2), 'utf-8');
    res.json({ message: 'Success', dbFileName });
  } catch (err) {
    console.error('Error saving singularities', err);
    res.status(500).json({ error: err.message });
  }
};

exports.saveTolerances = async (req, res) => {
  try {
    const { folder, tolerances } = req.body;
    const clientFolder = req.user?.folderName;
    // Allow admin/superadmin (no folderName) — same pattern as getTolerances
    if (!clientFolder && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check path traversal
    const requestedDir = path.resolve(BASE_PATH, clientFolder || '', folder || '');
    if (!requestedDir.startsWith(path.resolve(BASE_PATH, clientFolder || ''))) {
       return res.status(403).json({ error: 'Invalid path' });
    }

    const dbFilePath = path.join(requestedDir, 'tolerances_db.json');

    if (!fs.existsSync(requestedDir)) {
      fs.mkdirSync(requestedDir, { recursive: true });
    }
    fs.writeFileSync(dbFilePath, JSON.stringify(tolerances, null, 2), 'utf-8');
    res.json({ message: 'Success' });
  } catch (err) {
    console.error('Error saving tolerances', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getTolerances = async (req, res) => {
  try {
    const { folder } = req.query;
    const clientFolder = req.user?.folderName;
    if (!clientFolder && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check path traversal
    const requestedDir = path.resolve(BASE_PATH, clientFolder || '', folder || '');
    if (!requestedDir.startsWith(path.resolve(BASE_PATH, clientFolder || ''))) {
       return res.status(403).json({ error: 'Invalid path' });
    }

    const dbFilePath = path.join(requestedDir, 'tolerances_db.json');
    if (fs.existsSync(dbFilePath)) {
      const data = fs.readFileSync(dbFilePath, 'utf-8');
      if (data.trim() === '') return res.json({});
      return res.json(JSON.parse(data));
    }
    res.json({});
  } catch (err) {
    console.error('Error loading tolerances', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getSingularities = async (req, res) => {
  try {
    const { folder, file } = req.query;
    const clientFolder = req.user?.folderName;
    if (!clientFolder && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (!file) return res.status(400).json({ error: 'Missing file parameter' });

    const parsedPath = path.parse(file);
    const dbFileName = parsedPath.name + '_db.json';

    // Check path traversal
    const requestedDir = path.resolve(BASE_PATH, clientFolder || '', folder || '');
    if (!requestedDir.startsWith(path.resolve(BASE_PATH, clientFolder || ''))) {
       return res.status(403).json({ error: 'Invalid path' });
    }

    const dbFilePath = path.join(requestedDir, dbFileName);
    if (fs.existsSync(dbFilePath)) {
      const data = fs.readFileSync(dbFilePath, 'utf-8');
      if (data.trim() === '') return res.json([]);
      return res.json(JSON.parse(data));
    }
    res.json([]);
  } catch (err) {
    console.error('Error loading singularities', err);
    res.status(500).json({ error: err.message });
  }
};
