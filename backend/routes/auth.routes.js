// backend/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/auth.controller');

// Route für den simulierten Login
// Erreichbar unter POST http://localhost:5000/api/auth/login
router.post('/login', loginUser);

module.exports = router;
