const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');
const fileController = require('../controllers/file.controller');
const databaseViewController = require('../controllers/databaseView.controller');

router.get('/database-view/acquisitions', verifyToken, databaseViewController.getAllAcquisitions);

router.get('/available', verifyToken, fileController.getAvailableFolders);
router.post('/singularities/save', verifyToken, fileController.saveSingularities);
router.get('/singularities', verifyToken, fileController.getSingularities);
router.post('/tolerances/save', verifyToken, fileController.saveTolerances);
router.get('/tolerances', verifyToken, fileController.getTolerances);
router.get('/raw', verifyToken, fileController.getRawFile);
router.get('/*folder', verifyToken, fileController.getFilesInFolder);
router.post('/*folder/upload', verifyToken, fileController.uploadFile);
// Resumable chunked upload endpoints
router.post('/*folder/upload/resumable/init', verifyToken, fileController.initResumable);
router.post('/*folder/upload/resumable/upload-chunk', verifyToken, fileController.uploadResumableChunk);
router.post('/*folder/upload/resumable/complete', verifyToken, fileController.completeResumable);
router.get('/*folder/upload/resumable/status', verifyToken, fileController.resumableStatus);
router.post('/*folder/create', verifyToken, fileController.createFolder);
router.patch('/*folder/rename', verifyToken, fileController.renameFile);
router.delete('/*folder/:fileName', verifyToken, fileController.deleteFile);

module.exports = router;
