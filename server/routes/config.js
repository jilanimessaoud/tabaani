const express = require('express');
const configController = require('../controllers/configController');
const auth = require('../middleware/auth');
const upload = require('../config/upload');

const router = express.Router();

// Get website config (public - only active config)
router.get('/public', configController.getPublicConfig);

// Get website config (admin - can see preview)
router.get('/', auth, configController.getConfig);

// Save preview config
router.post('/preview', auth, configController.savePreview);

// Publish preview config (make it active)
router.post('/publish', auth, configController.publishConfig);

// Update active config directly
router.put('/', auth, upload.single('logo'), configController.updateConfig);

module.exports = router;
