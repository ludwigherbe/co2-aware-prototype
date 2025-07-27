// backend/controllers/product.controller.js

// Importiert den Datenbank-Verbindungspool
const pool = require('../config/db');

/**
 * Holt eine paginierte Liste aller Produkte aus der PostgreSQL-Datenbank.
 * Akzeptiert 'page' und 'limit' als Query-Parameter.
 * Beispiel: /api/products?page=1&limit=10
 */
const getAllProducts = async (req, res) => {
  try {
    // 1. Lese die Query-Parameter für die Paginierung aus.
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit; // Berechne den Offset für die SQL-Abfrage

    // 2. Führe zwei Abfragen parallel aus: eine für die Gesamtzahl und eine für die paginierten Daten
    const totalProductsQuery = pool.query('SELECT COUNT(*) FROM products');
    const productsQuery = pool.query(
      'SELECT * FROM products ORDER BY id ASC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    // Warte auf die Ergebnisse beider Abfragen
    const [totalResult, productsResult] = await Promise.all([totalProductsQuery, productsQuery]);

    const totalProducts = parseInt(totalResult.rows[0].count, 10);
    const products = productsResult.rows;

    // 3. Erstelle das finale Antwort-Objekt
    const results = {};

    // Füge Informationen für die nächste und vorherige Seite hinzu
    if (offset + limit < totalProducts) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (offset > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    
    // Füge Metadaten zur Paginierung hinzu
    results.info = {
        totalProducts: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        limit: limit
    };

    // Füge die Produkte für die aktuelle Seite hinzu
    results.results = products;

    res.status(200).json(results);

  } catch (error) {
    console.error('Fehler beim Abrufen der Produkte aus der Datenbank:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Produkte.' });
  }
};

/**
 * Holt ein einzelnes Produkt anhand seiner ID aus der Datenbank.
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Führe eine SQL-Abfrage aus, um das Produkt mit der passenden ID zu finden
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    // Überprüfe, ob ein Produkt gefunden wurde
    if (result.rows.length > 0) {
      const product = result.rows[0];
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: `Produkt mit ID ${id} nicht gefunden.` });
    }
  } catch (error) {
    console.error('Fehler beim Abrufen des Produkts aus der Datenbank:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen des Produkts.' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
};
