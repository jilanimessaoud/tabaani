const express = require('express');
const facebookController = require('../controllers/facebookController');
const auth = require('../middleware/auth');

const router = express.Router();

// Import Facebook post (admin only)
router.post('/import', auth, facebookController.importFacebookPost);

module.exports = router;

