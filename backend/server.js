// backend/server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importiere die Routen
const productRoutes = require('./routes/product.routes');
const predictingUserRoutes = require('./routes/predictingUser.routes');
const cartRoutes = require('./routes/cart.routes');
const imageRoutes = require('./routes/image.routes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware für Cross-Origin-Anfragen und JSON-Parsing
app.use(cors());
app.use(express.json());

const mode = process.env.APP_MODE || 'CLASSIC';
// mode options are 'CLASSIC' or 'CO2_AWARE'
if (mode !== 'CLASSIC' && mode !== 'CO2_AWARE') {
  console.error(`Ungültiger APP_MODE: ${mode}. Bitte 'CLASSIC' oder 'CO2_AWARE' verwenden.`);
  process.exit(1);
}
console.log(`Server startet im Modus: ${mode}`);

// Zeitstempel in Mikrosekunden
function nowUs() {
  return BigInt(Date.now()) * 1000n;
}

// Einheitliche Logging-Middleware für bestimmte Prefixe
function attachRouteLogger(prefix) {
  app.use(prefix, (req, res, next) => {
    res.on('finish', () => {
      const tsUs = nowUs();
      process.stdout.write(`${tsUs} BACKEND ${req.method} ${req.originalUrl}\n`);
    });
    next();
  });
}

attachRouteLogger('/api');
attachRouteLogger('/images');

// Eine einfache Test-Route, um zu sehen, ob der Server läuft
app.get('/', (req, res) => {
  res.json({ message: 'Der Backend-Server ist online!' });
});

// ======================================================
// API-&Image-Routen registrieren
// ======================================================
app.use('/api/products', productRoutes);
app.use('/api/predicting-user', predictingUserRoutes);
app.use('/api/cart', cartRoutes);
app.use('/images', imageRoutes);


// Server starten und auf dem definierten Port lauschen
app.listen(PORT, () => {
  console.log(`Express-Server läuft auf http://localhost:${PORT}`);
});
