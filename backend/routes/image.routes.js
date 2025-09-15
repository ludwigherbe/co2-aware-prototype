const express = require('express');
const router = express.Router();
const { getImageByName } = require('../controllers/image.controller');

// Fängt alle GET-Anfragen an /:imageName ab.
// z.B. /template_detail_1.png?product=1
// Der Controller wird nur 'template_detail_1.png' verwenden.
router.get('/:imageName', getImageByName);

module.exports = router;
