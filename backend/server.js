const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware für Cross-Origin-Anfragen und JSON-Parsing
app.use(cors());
app.use(express.json());

const mode = process.env.APP_MODE || 'CLASSIC';
console.log(`Server startet im Modus: ${mode}`);


// Eine einfache Test-Route, um zu sehen, ob der Server läuft
app.get('/', (req, res) => {
  res.json({ message: 'Der Backend-Server ist online!' });
});

// Füge hier deine API-Routen hinzu. Zum Beispiel:
// app.get('/api/products', (req, res) => { ... });

// Server starten und auf dem definierten Port lauschen
app.listen(PORT, () => {
  console.log(`Einfacher Express-Server läuft auf http://localhost:${PORT}`);
});
