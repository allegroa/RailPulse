const express = require('express');
const router = express.Router();
const railProfileController = require('../controllers/railprofile.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.get('/sessions', verifyToken, railProfileController.getSessions);
router.get('/sessions/:id/data', verifyToken, railProfileController.getSessionData);
router.put('/sessions/:id', verifyToken, railProfileController.updateSession);
router.delete('/sessions/:id', verifyToken, railProfileController.deleteSession);

router.get('/config', verifyToken, railProfileController.getConfig);
router.post('/config', verifyToken, railProfileController.saveConfig);

module.exports = router;
