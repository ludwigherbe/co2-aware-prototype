// backend/controllers/auth.controller.js

/**
 * Simuliert einen Benutzer-Login.
 * Gibt immer einen festen Benutzer (userId: "1") zurück, um den Prototyp
 * einfach zu halten. In einer echten Anwendung würde hier eine
 * Authentifizierungslogik mit Passwortprüfung etc. stattfinden.
 */
const loginUser = (req, res) => {
  try {
    // Für den Prototyp geben wir einfach eine Erfolgsmeldung und den
    // festen User zurück.
    res.status(200).json({
      message: 'Login erfolgreich (simuliert).',
      user: {
        id: '1',
        name: 'Test User'
      },
      // In einer echten App würde hier ein JWT (JSON Web Token) zurückgegeben.
      token: 'fake-jwt-token-for-prototype' 
    });
  } catch (error) {
    console.error('Fehler im simulierten Login:', error);
    res.status(500).json({ message: 'Serverfehler beim Login.' });
  }
};

module.exports = {
  loginUser,
};
