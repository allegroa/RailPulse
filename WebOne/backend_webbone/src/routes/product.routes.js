const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Tutti i prodotti del cliente loggato
router.get('/', verifyToken, productController.getAllProducts);
router.post('/', verifyToken, productController.createProduct);
router.put('/:id', verifyToken, productController.updateProduct);
router.delete('/:id', verifyToken, productController.deleteProduct);
router.get('/:id', verifyToken, productController.getProductById);

module.exports = router;
