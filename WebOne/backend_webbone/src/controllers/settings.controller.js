const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.resolve(__dirname, '..', '..', 'config');
const CONFIG_FILE = path.join(CONFIG_DIR, 'filesettings.json');

// ensure config dir exists
if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });

// default settings
const DEFAULTS = {
  useSmb: false,
  smb: {
    share: '',
    username: '',
    password: '',
    domain: ''
  },
  basePath: '/srv/webone_files',
  allowPublicDownload: false
};

function readConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULTS, null, 2));
      return DEFAULTS;
    }
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading file settings config', err);
    return DEFAULTS;
  }
}

function writeConfig(obj) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(obj, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing file settings config', err);
    return false;
  }
}

exports.getSettings = (req, res) => {
  const cfg = readConfig();
  // don't return sensitive password in full; mask it
  const safe = { ...cfg, smb: { ...cfg.smb, password: cfg.smb.password ? '*****' : '' } };
  res.json(safe);
};

exports.updateSettings = (req, res) => {
  const body = req.body || {};
  const current = readConfig();
  const updated = {
    useSmb: typeof body.useSmb === 'boolean' ? body.useSmb : current.useSmb,
    smb: {
      share: body.smb?.share ?? current.smb.share,
      username: body.smb?.username ?? current.smb.username,
      password: body.smb?.password ?? current.smb.password,
      domain: body.smb?.domain ?? current.smb.domain,
    },
    basePath: body.basePath ?? current.basePath,
    allowPublicDownload: typeof body.allowPublicDownload === 'boolean' ? body.allowPublicDownload : current.allowPublicDownload
  };

  const ok = writeConfig(updated);
  if (!ok) return res.status(500).json({ message: 'Unable to save settings' });

  // Optionally: propagate env changes immediately (for the running process)
  process.env.CLIENT_FILES_USE_SMB = updated.useSmb ? '1' : '0';
  process.env.CLIENT_FILES_BASE_PATH = updated.basePath;
  if (updated.smb.share) process.env.SMB_SHARE = updated.smb.share;
  if (updated.smb.username) process.env.SMB_USERNAME = updated.smb.username;
  if (updated.smb.password) process.env.SMB_PASSWORD = updated.smb.password;
  if (updated.smb.domain) process.env.SMB_DOMAIN = updated.smb.domain;

  res.json({ message: 'Settings saved' });
};
