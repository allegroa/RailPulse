const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const authRoutes = require('./routes/auth.routes')
const productRoutes = require('./routes/product.routes');
const filesRoutes = require('./routes/files.routes');
const adminRoutes = require('./routes/admin.routes.js');
const railprofileRoutes = require('./routes/railprofile.routes.js');
const tgmRoutes = require('./routes/tgm.routes.js');
const configRoutes = require('./routes/config.routes.js');
const maintenanceRoutes = require('./routes/maintenance.routes.js');


const app = express();

// --- FILES BASE PATH CONFIGURATION ---
// The rest of the app expects an absolute path in process.env.CLIENT_FILES_BASE_PATH
// For production (container) you should set this env var to a host path mounted
// into the container (e.g. via a bind mount or a Docker volume pointing at the NAS).
// For development, we fallback to a local uploads dir inside the backend folder.
(() => {
  const envVal = process.env.CLIENT_FILES_BASE_PATH;
  let basePath;

  if (envVal && envVal.trim() !== '') {
    // Use as provided (prefer absolute). If relative, resolve against CWD.
    basePath = path.isAbsolute(envVal) ? envVal : path.resolve(process.cwd(), envVal);
  } else {
    // sensible default for local development
    basePath = path.resolve(__dirname, '..', 'uploads');
    console.warn('⚠️ CLIENT_FILES_BASE_PATH not set — using default development path:', basePath);
  }

  try {
    fs.mkdirSync(basePath, { recursive: true });
    process.env.CLIENT_FILES_BASE_PATH = basePath; // ensure other modules read an absolute path
    console.log('📁 CLIENT_FILES_BASE_PATH set to:', process.env.CLIENT_FILES_BASE_PATH);
  } catch (err) {
    console.error('❌ Failed to ensure CLIENT_FILES_BASE_PATH directory:', basePath, err);
    // don't crash here; controllers will return errors if they cannot access the path
  }
})();


app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost', 'http://127.0.0.1'],
  credentials: true,
  allowedHeaders: ['Content-Type', "Authorization"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

const statusRoutes = require('./routes/status.routes.js');
const taipeiRoutes = require('./routes/taipei.routes.js');

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/railprofile', railprofileRoutes);
app.use('/api/status', statusRoutes);
app.use('/api', tgmRoutes);
app.use('/api/config', configRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/taipei', taipeiRoutes);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/taipei_static', express.static(path.join(process.cwd(), 'public', 'taipei')));

// Routes di test
app.get('/', (req, res) => {
  res.send('🌐 API ADTS online');
});

module.exports = app;
