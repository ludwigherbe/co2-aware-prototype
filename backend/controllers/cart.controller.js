// backend/controllers/cart.controller.js

// --- In-Memory-Warenkorb für den Prototyp ---
// Hält den Zustand des Warenkorbs nur im Speicher.
// Wird bei jedem Neustart des Backends zurückgesetzt.
// Perfekt für isolierte Messungen.
let cart = {
  userId: "1",
  items: [] // Format: { productId: "p_001", name: "Produktname", price: 59.99, quantity: 1 }
};

// Hilfsfunktion zum Abrufen von Produktdetails (simuliert)
// In einer echten App würde dies aus der DB kommen
const pool = require('../config/db');
async function getProductDetails(productId) {
    const result = await pool.query('SELECT id, name, price FROM products WHERE id = $1', [productId]);
    if (result.rows.length > 0) {
        return result.rows[0];
    }
    return null;
}


// --- API-Funktionen ---

/**
 * Gibt den gesamten Warenkorb zurück.
 */
const getCart = (req, res) => {
  res.status(200).json(cart);
};

/**
 * Fügt ein Produkt zum Warenkorb hinzu oder erhöht die Menge.
 */
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
      // Produkt ist bereits im Warenkorb, Menge erhöhen
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Produkt neu hinzufügen
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

/**
 * Aktualisiert die Menge eines bestimmten Produkts im Warenkorb.
 */
const updateItemInCart = (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'Eine gültige Menge ist erforderlich.' });
  }

  const itemIndex = cart.items.findIndex(item => item.productId === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    res.status(200).json(cart);
  } else {
    res.status(404).json({ message: `Produkt mit ID ${productId} nicht im Warenkorb gefunden.` });
  }
};

/**
 * Entfernt ein Produkt aus dem Warenkorb.
 */
const removeItemFromCart = (req, res) => {
  const { productId } = req.params;
  const initialLength = cart.items.length;
  cart.items = cart.items.filter(item => item.productId !== productId);

  if (cart.items.length < initialLength) {
    res.status(200).json(cart);
  } else {
    res.status(404).json({ message: `Produkt mit ID ${productId} nicht im Warenkorb gefunden.` });
  }
};

/**
 * Leert den gesamten Warenkorb. Nützlich zum Zurücksetzen.
 */
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
