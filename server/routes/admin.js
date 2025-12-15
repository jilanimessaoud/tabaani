const express = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

const router = express.Router();

// Admin dashboard stats
router.get('/stats', auth, adminController.getStats);

module.exports = router;
