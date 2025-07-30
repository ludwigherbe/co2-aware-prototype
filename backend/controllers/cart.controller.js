// backend/controllers/cart.controller.js

// --- In-Memory-Warenkorb für den Prototyp ---
let cart = {
  userId: "1",
  items: []
};

const pool = require('../config/db');
async function getProductDetails(productId) {
    const result = await pool.query('SELECT id, name, price FROM products WHERE id = $1', [productId]);
    if (result.rows.length > 0) return result.rows[0];
    return null;
}


// --- API-Funktionen ---

const getCart = (req, res) => {
  res.status(200).json(cart);
};

const addItemToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: 'Produkt-ID und eine gültige Menge sind erforderlich.' });
  }
  try {
    const productDetails = await getProductDetails(productId);
    if (!productDetails) {
        return res.status(404).json({ message: `Produkt mit ID ${productId} nicht gefunden.` });
    }
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ 
          productId: productId,
          name: productDetails.name,
          price: parseFloat(productDetails.price),
          quantity: quantity 
        });
    }
    res.status(200).json(cart);
  } catch(error) {
    console.error("Fehler beim Hinzufügen zum Warenkorb:", error);
    res.status(500).json({ message: 'Serverfehler.' });
  }
};

const updateItemInCart = (req, res) => {
  // KORREKTUR: productId aus dem String-Parameter in eine Zahl umwandeln
  const productId = parseInt(req.params.productId, 10);
  const { quantity } = req.body;

  if (isNaN(productId)) {
    return res.status(400).json({ message: 'Ungültige Produkt-ID.' });
  }
  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'Eine gültige Menge ist erforderlich.' });
  }

  // Der Vergleich funktioniert jetzt (Zahl mit Zahl)
  const itemIndex = cart.items.findIndex(item => item.productId === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    res.status(200).json(cart);
  } else {
    res.status(404).json({ message: `Produkt mit ID ${productId} nicht im Warenkorb gefunden.` });
  }
};

const removeItemFromCart = (req, res) => {
  // KORREKTUR: productId aus dem String-Parameter in eine Zahl umwandeln
  const productId = parseInt(req.params.productId, 10);
  
  if (isNaN(productId)) {
    return res.status(400).json({ message: 'Ungültige Produkt-ID.' });
  }
  
  const initialLength = cart.items.length;
  // Der Vergleich funktioniert jetzt (Zahl mit Zahl)
  cart.items = cart.items.filter(item => item.productId !== productId);

  if (cart.items.length < initialLength) {
    res.status(200).json(cart);
  } else {
    res.status(404).json({ message: `Produkt mit ID ${productId} nicht im Warenkorb gefunden.` });
  }
};

const clearCart = (req, res) => {
  cart.items = [];
  res.status(200).json(cart);
};


module.exports = {
  getCart,
  addItemToCart,
  updateItemInCart,
  removeItemFromCart,
  clearCart
};