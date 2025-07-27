const express = require('express');
const router = express.Router();

// Importiere die Controller-Funktionen
const {
  getAllProducts,
  getProductById,
} = require('../controllers/product.controller');

// Definiere die Routen und verknüpfe sie mit den Controller-Funktionen

// Route, um alle Produkte (paginiert) abzurufen
// Erreichbar unter GET http://localhost:5000/api/products
router.get('/', getAllProducts);

// Route, um ein einzelnes Produkt anhand seiner ID abzurufen
// Erreichbar unter GET http://localhost:5000/api/products/p_001
router.get('/:id', getProductById);

// Exportiere den Router, damit er in server.js verwendet werden kann
module.exports = router;
