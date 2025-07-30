// backend/controllers/image.controller.js

const path = require('path');

/**
 * Sendet eine angeforderte Bilddatei an den Client.
 * Der Dateiname wird aus der URL entnommen, alle Query-Parameter
 * (z.B. ?product=1) werden ignoriert, um Caching zu umgehen.
 */
const getImageByName = (req, res) => {
  const { imageName } = req.params;

  // Sicherheitsüberprüfung: Verhindert Path-Traversal-Angriffe (z.B. /images/../../secrets.txt)
  if (imageName.includes('..')) {
    return res.status(400).send('Ungültiger Bildname.');
  }

  // Setzt den Pfad zur angeforderten Datei im 'public/images'-Ordner zusammen.
  const filePath = path.join(__dirname, '..', 'public', 'images', imageName);

  // Sendet die Datei an den Client.
  // res.sendFile kümmert sich automatisch um den korrekten Content-Type Header.
  res.sendFile(filePath, (err) => {
    // Wenn ein Fehler auftritt (z.B. Datei nicht gefunden), wird eine
    // 404-Antwort gesendet.
    if (err) {
      console.error(`Bild nicht gefunden oder Fehler beim Senden: ${filePath}`, err.message);
      res.status(404).send('Bild nicht gefunden.');
    }
  });
};

module.exports = {
  getImageByName,
};
