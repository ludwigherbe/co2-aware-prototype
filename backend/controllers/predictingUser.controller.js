// backend/controllers/predictingUser.controller.js

const fs = require('fs').promises;
const path = require('path');

// Pfad zur JSON-Datei mit den vorhergesagten Benutzer-Aufrufen
const predictedUserCallsPath = path.join(__dirname, '..', 'data', 'predictingUserCalls.json');

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

module.exports = {
  getPredictedUserCalls,
};
