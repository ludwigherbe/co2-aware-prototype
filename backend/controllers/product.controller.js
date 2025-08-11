// Importiert den Datenbank-Verbindungspool
const pool = require('../config/db');

const PRODUCT_COLUMNS = `
  id, name, price, description, category, thumbnail,
  detail_images AS "detailImages", in_stock AS "inStock"
`;

/**
 * Holt eine paginierte und/oder gefilterte Liste aller Produkte.
 * Akzeptiert 'page', 'limit' und 'search' als Query-Parameter.
 */
const getAllProducts = async (req, res) => {
  try {
    // 1. Lese Query-Parameter aus
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { search } = req.query; // Neuer Suchparameter

    // 2. Baue die WHERE-Klausel und die Query-Parameter dynamisch auf
    const whereClauses = [];
    const queryParams = [];
    let paramIndex = 1;

    if (search) {
      // Fügt eine Bedingung für die Namenssuche hinzu (case-insensitive)
      whereClauses.push(`name ILIKE $${paramIndex++}`);
      queryParams.push(`%${search}%`);
    }

    // HINWEIS: Um später nach Kategorie zu filtern, füge einfach hinzu:
    // if (req.query.category) {
    //   whereClauses.push(`category = $${paramIndex++}`);
    //   queryParams.push(req.query.category);
    // }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 3. Führe die Abfragen aus (Gesamtzahl und paginierte Daten)
    // Die WHERE-Klausel wird für beide Abfragen verwendet
    const totalProductsQuery = pool.query(`SELECT COUNT(*) FROM products ${whereString}`, queryParams);
    
    // Füge Paginierungs-Parameter zur Parameter-Liste hinzu
    const dataQueryParams = [...queryParams, limit, offset];
    const productsQuery = pool.query(
      `SELECT ${PRODUCT_COLUMNS} FROM products ${whereString} ORDER BY id ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      dataQueryParams
    );
    
    const [totalResult, productsResult] = await Promise.all([totalProductsQuery, productsQuery]);

    const totalProducts = parseInt(totalResult.rows[0].count, 10);
    const products = productsResult.rows;

    // 4. Erstelle das finale Antwort-Objekt (unverändert)
    const results = {};
    if (offset + limit < totalProducts) {
      results.next = { page: page + 1, limit: limit };
    }
    if (offset > 0) {
      results.previous = { page: page - 1, limit: limit };
    }
    results.info = {
        totalProducts: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        limit: limit
    };
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
    
    const result = await pool.query(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = $1`, [id]);
    
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

/**
 * Holt bis zu 3 ähnliche Produkte aus derselben Kategorie.
 */
const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const categoryResult = await pool.query('SELECT category FROM products WHERE id = $1', [id]);

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({ message: `Produkt mit ID ${id} nicht gefunden.` });
    }
    const { category } = categoryResult.rows[0];

    const relatedProductsResult = await pool.query(
      `SELECT ${PRODUCT_COLUMNS} FROM products WHERE category = $1 AND id != $2 ORDER BY id ASC LIMIT 3`,
      [category, id]
    );

    res.status(200).json(relatedProductsResult.rows);

  } catch (error) {
    console.error('Fehler beim Abrufen ähnlicher Produkte:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen ähnlicher Produkte.' });
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  getRelatedProducts,
};