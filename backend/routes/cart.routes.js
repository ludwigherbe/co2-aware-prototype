// backend/routes/cart.routes.js

const express = require('express');
const router = express.Router();
const {
  getCart,
  addItemToCart,
  updateItemInCart,
  removeItemFromCart,
  clearCart
} = require('../controllers/cart.controller');

// Route, um den gesamten Warenkorb abzurufen
// GET /api/cart
router.get('/', getCart);

// Route, um den Warenkorb zu leeren
// DELETE /api/cart
router.delete('/', clearCart);

// Route, um ein Produkt hinzuzufügen
// POST /api/cart/items
router.post('/items', addItemToCart);

// Route, um ein Produkt zu aktualisieren
// PUT /api/cart/items/:productId
router.put('/items/:productId', updateItemInCart);

// Route, um ein Produkt zu entfernen
// DELETE /api/cart/items/:productId
router.delete('/items/:productId', removeItemFromCart);

module.exports = router;
