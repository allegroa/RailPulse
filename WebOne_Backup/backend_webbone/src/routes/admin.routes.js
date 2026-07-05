const express = require('express');
const verifyToken = require('../middlewares/auth.middleware'); // il tuo middleware JWT
const {requireRole, restrictToOwnClient} = require('../middlewares/role.middleware');
const {ROLES} = require('../utils/roles');

const clientCtrl = require('../controllers/client.controller');
const userCtrl   = require('../controllers/user.controller');
const groupCtrl  = require('../controllers/group.controller');
const settingsCtrl = require('../controllers/settings.controller');
const metricsCtrl = require('../controllers/metrics.controller');
const fileCtrl = require('../controllers/file.controller');

const r = express.Router();

// tutte le rotte admin richiedono login
r.use(verifyToken);

// ===== Clients (solo SUPERADMIN crea; lista per admin/cliente) =====
r.post('/clients', requireRole(ROLES.SUPER), clientCtrl.create);
r.get('/clients',  requireRole(ROLES.SUPER), clientCtrl.list);
r.delete('/clients/:id', requireRole(ROLES.SUPER), clientCtrl.delete);
r.post('/clients/create-folder', requireRole(ROLES.SUPER), fileCtrl.createClientFolder);

// ===== Settings (solo SUPERADMIN) =====
r.get('/settings/files', requireRole(ROLES.SUPER), settingsCtrl.getSettings);
r.post('/settings/files', requireRole(ROLES.SUPER), settingsCtrl.updateSettings);

// ===== Metrics (solo SUPERADMIN) =====
r.get('/metrics', requireRole(ROLES.SUPER), metricsCtrl.getMetrics);

// ===== Users =====
r.post('/users', 
  requireRole(ROLES.ADMIN, ROLES.SUPER), //Admin only
  restrictToOwnClient,      //Vincola al client dell'admin
  userCtrl.create);         //Forza clientId = req.scopeClientId
  
r.get('/users',  
  requireRole(ROLES.SUPER, ROLES.ADMIN, ROLES.CLIENT),
  restrictToOwnClient,
  userCtrl.list);

r.delete('/users/:id',
  requireRole(ROLES.ADMIN, ROLES.SUPER),
  restrictToOwnClient,
  userCtrl.deleteUser
);
r.post('/users/:id/reset-password', 
  requireRole(ROLES.ADMIN, ROLES.SUPER),
  restrictToOwnClient,
  userCtrl.resetPassword
);

// ===== Groups =====
r.post('/groups', 
  requireRole(ROLES.ADMIN, ROLES.CLIENT),
  restrictToOwnClient,
  groupCtrl.create);

r.get('/groups',  
  requireRole(ROLES.ADMIN, ROLES.CLIENT), 
  restrictToOwnClient,
  groupCtrl.list);

r.post('/groups/:groupId/members',
  requireRole(ROLES.ADMIN, ROLES.CLIENT), 
  restrictToOwnClient,
  groupCtrl.addMembers
);

r.delete('/groups/:groupId/members/:userId',
  requireRole(ROLES.ADMIN, ROLES.CLIENT), 
  restrictToOwnClient,
  groupCtrl.removeMember
);

module.exports = r;

