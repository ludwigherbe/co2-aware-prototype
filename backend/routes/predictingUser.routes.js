// backend/routes/predictingUser.routes.js

const express = require('express');
const router = express.Router();
// Die importierte Funktion wurde an den Controller angepasst.
const { getPredictedUserCalls, getCachePlan } = require('../controllers/predictingUser.controller');

// Route zum Abrufen der Vorhersagedaten für Benutzeraufrufe
// Erreichbar unter GET http://localhost:5000/api/predicting-user
router.get('/', getPredictedUserCalls);
router.get('/cache-plan', getCachePlan);

module.exports = router;
