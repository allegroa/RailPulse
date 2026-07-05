const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/auth.middleware');

const { requireRole } = require('../middlewares/role.middleware');
const ROLES = require('../utils/roles');

router.post('/register', verifyToken, requireRole(ROLES.SUPER, ROLES.ADMIN), authController.register);
router.post('/login', authController.login);

// Rotta protetta
router.get('/me', verifyToken, authController.getProfile);

module.exports = router;
