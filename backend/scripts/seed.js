const fs = require('fs').promises;
const path = require('path');
const pool = require('../config/db');

async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log('Starte Seeding-Prozess...');

    // 1. Lese die JSON-Datei mit den Produktdaten
    const productsPath = path.join(__dirname, '..', 'data', 'products.json');
    const productsData = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(productsData);

    // 2. Lösche die alte Tabelle, falls sie existiert
    await client.query('DROP TABLE IF EXISTS products');
    console.log('Alte "products"-Tabelle gelöscht.');

    // 3. Erstelle die neue "products"-Tabelle
    // HINWEIS: Die Spaltennamen entsprechen jetzt den Feldern in der products.json
    await client.query(`
      CREATE TABLE products (
        id INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        description TEXT,
        category VARCHAR(255),
        thumbnail VARCHAR(255),
        detail_images TEXT[],
        in_stock BOOLEAN
      );
    `);
    console.log('"products"-Tabelle erfolgreich erstellt.');

    // 4. Füge die Produkte aus der JSON-Datei in die Tabelle ein
    for (const product of products) {
      await client.query(
        `INSERT INTO products (id, name, price, description, category, thumbnail, detail_images, in_stock)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          product.id,
          product.name,
          product.price,
          product.description,
          product.category,
          product.thumbnail,
          product.detailImages, // In der JSON heißt das Feld "detailImages"
          product.inStock,      // In der JSON heißt das Feld "inStock"
        ]
      );
    }
    console.log(`${products.length} Produkte erfolgreich in die Datenbank eingefügt.`);

    console.log('Seeding-Prozess erfolgreich abgeschlossen!');
  } catch (error) {
    console.error('Fehler während des Seeding-Prozesses:', error);
  } finally {
    client.release();
  }
}

// Führe die Funktion aus, wenn das Skript direkt aufgerufen wird
seedDatabase().then(() => {
  // Schließe den Pool, damit das Skript beendet wird
  pool.end();
});
