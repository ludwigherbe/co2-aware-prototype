// backend/routes/predictingUser.routes.js

const express = require('express');
const router = express.Router();
// Die importierte Funktion wurde an den Controller angepasst.
const { getPredictedUserCalls } = require('../controllers/predictingUser.controller');

// Route zum Abrufen der Vorhersagedaten für Benutzeraufrufe
// Erreichbar unter GET http://localhost:5000/api/predicting-user
router.get('/', getPredictedUserCalls);

module.exports = router;
