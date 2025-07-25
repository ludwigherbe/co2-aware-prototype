// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Modus-Erkennung beim Serverstart
// const mode = process.env.REACT_APP_MODE || 'klassisch';
// console.log(`Server gestartet. Anwendung läuft im Modus: ${mode}`);

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, '../frontend/build')));

// // Produktdaten laden
// const loadProducts = () => {
//   try {
//     const data = fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf8');
//     return JSON.parse(data);
//   } catch (error) {
//     console.error('Fehler beim Laden der Produktdaten:', error);
//     return [];
//   }
// };

// // API Routes

// // GET /api/products - Gibt alle Produkte zurück
// app.get('/api/products', (req, res) => {
//   try {
//     const products = loadProducts();
//     console.log(`[${mode}] Products API aufgerufen - ${products.length} Produkte geladen`);
//     res.json(products);
//   } catch (error) {
//     console.error('Fehler beim Abrufen der Produkte:', error);
//     res.status(500).json({ error: 'Interner Serverfehler' });
//   }
// });

// // GET /api/products/:id - Gibt ein einzelnes Produkt zurück
// app.get('/api/products/:id', (req, res) => {
//   try {
//     const products = loadProducts();
//     const productId = parseInt(req.params.id);
//     const product = products.find(p => p.id === productId);
    
//     console.log(`[${mode}] Product Detail API aufgerufen - ID: ${productId}`);
    
//     if (product) {
//       res.json(product);
//     } else {
//       res.status(404).json({ error: 'Produkt nicht gefunden' });
//     }
//   } catch (error) {
//     console.error('Fehler beim Abrufen des Produkts:', error);
//     res.status(500).json({ error: 'Interner Serverfehler' });
//   }
// });

// // GET /api/co2-forecast - Simuliert CO2-Prognose für die nächsten 24h
// app.get('/api/co2-forecast', (req, res) => {
//   console.log(`[${mode}] CO2-Forecast API aufgerufen`);
  
//   // Simuliere realistische CO2-Intensitätsdaten für die nächsten 24 Stunden
//   const currentHour = new Date().getHours();
//   const forecast = [];
  
//   for (let i = 0; i < 24; i++) {
//     const hour = (currentHour + i) % 24;
//     let co2Intensity;
    
//     // Simuliere niedrigere CO2-Intensität nachts (mehr erneuerbare Energie)
//     // und höhere während der Stoßzeiten
//     if (hour >= 2 && hour <= 6) {
//       co2Intensity = Math.random() * 150 + 200; // 200-350 g CO2/kWh (grün)
//     } else if (hour >= 18 && hour <= 22) {
//       co2Intensity = Math.random() * 200 + 400; // 400-600 g CO2/kWh (hoch)
//     } else {
//       co2Intensity = Math.random() * 150 + 300; // 300-450 g CO2/kWh (mittel)
//     }
    
//     forecast.push({
//       hour: hour,
//       timestamp: new Date(Date.now() + (i * 60 * 60 * 1000)).toISOString(),
//       co2Intensity: Math.round(co2Intensity),
//       isGreenWindow: co2Intensity < 350 // Grünes Fenster unter 350 g CO2/kWh
//     });
//   }
  
//   // Finde das nächste grüne Zeitfenster
//   const nextGreenWindow = forecast.find(f => f.isGreenWindow);
  
//   const response = {
//     forecast: forecast,
//     nextGreenWindow: nextGreenWindow,
//     generatedAt: new Date().toISOString()
//   };
  
//   res.json(response);
// });

// // GET /api/user-behavior-forecast - Simuliert Nutzerverhalten-Prognose
// app.get('/api/user-behavior-forecast', (req, res) => {
//   console.log(`[${mode}] User-Behavior-Forecast API aufgerufen`);
  
//   const products = loadProducts();
  
//   // Simuliere wahrscheinliche Nutzeraktionen basierend auf Popularität und Tageszeit
//   const currentHour = new Date().getHours();
//   let popularityMultiplier = 1;
  
//   // Höhere Aktivität am Abend
//   if (currentHour >= 18 && currentHour <= 22) {
//     popularityMultiplier = 1.5;
//   } else if (currentHour >= 6 && currentHour <= 12) {
//     popularityMultiplier = 1.2;
//   }
  
//   const likelyProducts = products
//     .map(product => ({
//       productId: product.id,
//       name: product.name,
//       probability: Math.min(0.9, (product.popularity / 10) * popularityMultiplier),
//       expectedViews: Math.round(product.popularity * popularityMultiplier * 10),
//       category: product.category
//     }))
//     .sort((a, b) => b.probability - a.probability)
//     .slice(0, 6); // Top 6 wahrscheinlichste Produkte
  
//   const response = {
//     likelyUserActions: likelyProducts,
//     timeWindow: {
//       start: new Date().toISOString(),
//       end: new Date(Date.now() + (4 * 60 * 60 * 1000)).toISOString() // Nächste 4 Stunden
//     },
//     confidence: 0.75,
//     generatedAt: new Date().toISOString()
//   };
  
//   res.json(response);
// });

// // Catch-all handler: React App ausliefern
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
// });

// // Error handling middleware
// app.use((error, req, res, next) => {
//   console.error('Unbehandelter Fehler:', error);
//   res.status(500).json({ error: 'Interner Serverfehler' });
// });

// app.listen(PORT, () => {
//   console.log(`Express-Server läuft auf Port ${PORT}`);
//   console.log(`Betriebsmodus: ${mode.toUpperCase()}`);
//   console.log('API-Endpunkte verfügbar:');
//   console.log('  GET /api/products');
//   console.log('  GET /api/products/:id');
//   console.log('  GET /api/co2-forecast');
//   console.log('  GET /api/user-behavior-forecast');
// });