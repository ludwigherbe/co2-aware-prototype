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

const metrics = {
  total: 0,
  byStatus: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
  byExact: {},
  conditional: 0,
  byRoute: {
    products_list: 0, products_id: 0, products_related: 0,
    cart: 0, images: 0, predicting_user: 0, other: 0,
  },
  byAgent: { swWarmup: 0, normal: 0 },
};

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

function isConditional(req) {
  return ('if-none-match' in req.headers) || ('if-modified-since' in req.headers);
}

function incExact(sc) {
  const k = String(sc);
  metrics.byExact[k] = (metrics.byExact[k] || 0) + 1;
}

function bucketFor(url) {
  if (url.startsWith('/api/products?')) return 'products_list';
  if (url.startsWith('/api/products/') && url.endsWith('/related')) return 'products_related';
  if (url.startsWith('/api/products/')) return 'products_id';
  if (url.startsWith('/api/cart')) return 'cart';
  if (url.startsWith('/api/predicting-user')) return 'predicting_user';
  if (url.startsWith('/images/')) return 'images';
  return 'other';
}
function statusClass(sc) {
  if (sc >= 200 && sc < 300) return '2xx';
  if (sc >= 300 && sc < 400) return '3xx';
  if (sc >= 400 && sc < 500) return '4xx';
  return '5xx';
}

// Einheitliche Logging-Middleware für bestimmte Prefixe
function attachRouteLogger(prefix) {
  app.use(prefix, (req, res, next) => {
    res.on('finish', () => {
      if (req.originalUrl.startsWith('/api/notes') || req.originalUrl.startsWith('/api/metrics')) return;

      metrics.total += 1;
      metrics.byStatus[statusClass(res.statusCode)] += 1;
      incExact(res.statusCode);
      if (isConditional(req)) metrics.conditional += 1;

      metrics.byRoute[bucketFor(req.originalUrl)] += 1;
      if (req.headers['x-sw-warmup'] === '1') metrics.byAgent.swWarmup += 1;
      else metrics.byAgent.normal += 1;
    });
    next();
  });
}

app.post('/api/metrics/flush', (req, res) => {
  const tsUs = nowUs();
  process.stdout.write(
  `${tsUs} BACKEND:METRICS total=${metrics.total}` +
  ` 2xx=${metrics.byStatus['2xx']} 3xx=${metrics.byStatus['3xx']}` +
  ` 4xx=${metrics.byStatus['4xx']} 5xx=${metrics.byStatus['5xx']}` +
  ` 200=${metrics.byExact['200']||0} 304=${metrics.byExact['304']||0}` +
  ` conditional=${metrics.conditional}` +
  ` products_list=${metrics.byRoute.products_list}` +
  ` products_id=${metrics.byRoute.products_id}` +
  ` products_related=${metrics.byRoute.products_related}` +
  ` cart=${metrics.byRoute.cart}` +
  ` predicting_user=${metrics.byRoute.predicting_user}` +
  ` images=${metrics.byRoute.images}` +
  ` other=${metrics.byRoute.other}` +
  ` swWarmup=${metrics.byAgent.swWarmup} normal=${metrics.byAgent.normal}\n`
);
  return res.sendStatus(204);
});

attachRouteLogger('/api');
attachRouteLogger('/images');

// Eine einfache Test-Route, um zu sehen, ob der Server läuft
app.get('/', (req, res) => {
  res.json({ message: 'Der Backend-Server ist online!' });
});

// server.js (oder separate Route)
app.post('/api/notes', (req, res) => {
  try {
    const { ts, msg } = req.body || {};
    const tsNum = Number(ts);
    if (!Number.isFinite(tsNum) || !msg) return res.sendStatus(400);

    // exakt eine Zeile, kein Prefix, kein JSON:
    process.stdout.write(`${BigInt(tsNum)} ${String(msg)}\n`);
    res.sendStatus(204);
  } catch {
    res.sendStatus(500);
  }
});


// ======================================================
// API-&Image-Routen registrieren
// ======================================================
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/images', imageRoutes);
if (process.env.APP_MODE === 'CO2_AWARE') {
  app.use('/api/predicting-user', predictingUserRoutes);
}

// Server starten und auf dem definierten Port lauschen
app.listen(PORT, () => {
  console.log(`Express-Server läuft auf http://localhost:${PORT}`);
});
