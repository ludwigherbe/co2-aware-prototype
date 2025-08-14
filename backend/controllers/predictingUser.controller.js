// backend/controllers/predictingUser.controller.js

const fs = require('fs').promises;
const path = require('path');

// Pfad zur JSON-Datei mit den vorhergesagten Benutzer-Aufrufen
const predictedUserCallsPath = path.join(__dirname, '..', 'data', 'predictingUserCalls.json');
const predictedUserCallsImagesPath = path.join(__dirname, '..', 'data', 'predictingUserCallsImages.json');

// Schwellenwert für die Vorhersage
const PREDICT_THRESHOLD = 0.8;

// Utility: JSON-Datei lesen & parsen
async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Liest die statische JSON-Datei mit den vorhergesagten Benutzer-Aufrufen und gibt sie zurück.
 * In einer echten Anwendung könnten diese Daten aus einer Datenbank oder
 * einem externen Service stammen.
 */
const getPredictedUserCalls = async (req, res) => {
  try {
    const predictedUserCallsData = await fs.readFile(predictedUserCallsPath, 'utf8');
    const predictedUserCalls = JSON.parse(predictedUserCallsData);
    
    // Wir gehen davon aus, dass die JSON immer die Daten für userId "1" enthält
    if (predictedUserCalls.userId === "1") {
        res.status(200).json(predictedUserCalls);
    } else {
        res.status(404).json({ message: 'Vorhersage für den Benutzer nicht gefunden.' });
    }

  } catch (error) {
    console.error('Fehler beim Laden der Vorhersagedaten:', error);
    res.status(500).json({ message: 'Serverfehler beim Laden der Vorhersagedaten.' });
  }
};

/**
 * Neuer Endpoint: Cache-Plan als reine URL-Liste.
 * - nur im CO2_AWARE-Modus (sonst 404)
 * - liest API- und Image-Vorhersagen
 * - filtert: isCacheable === true && probability >= PREDICT_THRESHOLD
 * - dedupliziert per URL; sortiert absteigend nach probability
 * - Antwort: string[] (nur URLs)
 */
const getCachePlan = async (req, res) => {
  if (process.env.APP_MODE !== 'CO2_AWARE') {
    return res.status(404).json({ message: 'Cache-Plan ist im CLASSIC-Modus nicht verfügbar.' });
  }

  try {
    const [apiPred, imgPred] = await Promise.all([
      readJson(predictedUserCallsPath),
      readJson(predictedUserCallsImagesPath),
    ]);

    const apiItems = Array.isArray(apiPred?.forecast) ? apiPred.forecast : [];
    const imgItems = Array.isArray(imgPred?.forecast) ? imgPred.forecast : [];

    // auf (url, probability) eindampfen
    const pick = (entries) =>
      entries
        .filter((e) => e && e.isCacheable === true && typeof e.probability === 'number' && e.probability >= PREDICT_THRESHOLD)
        .map((e) => ({ url: String(e.url), probability: Number(e.probability) }));

    const merged = [...pick(apiItems), ...pick(imgItems)];

    // deduplizieren: höchste probability gewinnt
    const byUrl = new Map(); // url -> {url, probability}
    for (const it of merged) {
      const ex = byUrl.get(it.url);
      if (!ex || it.probability > ex.probability) byUrl.set(it.url, it);
    }

    // sortiert nach probability (desc) und nur URLs zurückgeben
    const urls = Array.from(byUrl.values())
      .sort((a, b) => b.probability - a.probability)
      .map((x) => x.url);

    return res.status(200).json(urls);
  } catch (error) {
    console.error('Fehler beim Erzeugen des Cache-Plans:', error);
    return res.status(500).json({ message: 'Serverfehler beim Erzeugen des Cache-Plans.' });
  }
};


module.exports = {
  getPredictedUserCalls,
  getCachePlan,
};