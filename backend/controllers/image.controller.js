

const path = require('path');
const fs = require('fs');

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

  if (!fs.existsSync(filePath)) {
    console.error(`Bild nicht gefunden (Prüfung vorab): ${filePath}`);
    return res.status(404).send('Bild nicht gefunden.');
  }

  res.sendFile(filePath, (err) => {
    // Dieser Callback wird nun hauptsächlich für Fehler während des Streamens relevant.
    if (err) {
      // wenn Express das nicht schon selbst getan hat (z.B. bei "Request aborted").
      if (!res.headersSent) {
        console.error(`Fehler vor dem Senden für: ${filePath}`, err.message);
        res.status(500).send('Ein interner Fehler ist aufgetreten.');
      } else {
        console.error(`Fehler nach Beginn des Sendens für: ${filePath}`, err.message);
      }
    }
  });
};

module.exports = {
  getImageByName,
};
