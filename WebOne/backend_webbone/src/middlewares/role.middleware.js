
const { ROLES } = require('../utils/roles');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    const role = String(req.user.role || '').toLowerCase();
    const allowed = roles.map(r => String(r).toLowerCase());
    if (allowed.includes(role)) return next();
    return res.status(403).json({ error: 'forbidden' });
  };
}

function restrictToOwnClient(req, res, next) {
  const role = String(req.user?.role || '').toLowerCase();
  if (role === ROLES.SUPER) return next(); // superadmin: no scoping

  const clientId = req.user?.clientId;
  if (!clientId) return res.status(403).json({ error: 'forbidden' });

  req.scopeClientId = clientId;
  return next();
}

module.exports = { requireRole, restrictToOwnClient };
