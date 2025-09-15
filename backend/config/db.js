// Importiere den Pool-Client aus dem pg-Paket.
const { Pool } = require('pg');

// Erstelle eine neue Pool-Instanz mit festen Verbindungsdaten.
// HINWEIS: Dieser Ansatz wird verwendet, da im Zielsystem (Green Metrics Tool)
// keine Umgebungsvariablen für die DB-Verbindung gesetzt werden können.
const pool = new Pool({
  host: 'co2-aware-db',   // Der Service-Name des DB-Containers in Docker
  user: 'user',           // Der in docker-compose.yml definierte Benutzer
  password: 'password',   // Das in docker-compose.yml definierte Passwort
  database: 'co2_aware_db',// Die in docker-compose.yml definierte Datenbank
  port: 5432,             // Der Standard-Port von PostgreSQL
});

// Teste die Verbindung beim Start der Anwendung
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Fehler beim Verbinden mit der Datenbank:', err.stack);
  }
  console.log('Erfolgreich mit der PostgreSQL-Datenbank verbunden.');
  // Gib die Verbindung wieder frei, damit sie im Pool verfügbar ist
  release();
});

// Exportiere den Pool, damit wir von überall in unserer Anwendung
// Abfragen an die Datenbank senden können.
// Die Syntax lautet: pool.query('SELECT * FROM ...')
module.exports = pool;
