const express = require('express');
const upload = require('../config/upload');
const adController = require('../controllers/adController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all active advertisements (public)
router.get('/public', adController.getPublicAds);

// Get all advertisements (admin)
router.get('/', auth, adController.getAllAds);

// Get single advertisement
router.get('/:id', auth, adController.getAdById);

// Create advertisement
router.post('/', auth, upload.any(), adController.createAd);

// Update advertisement
router.put('/:id', auth, upload.any(), adController.updateAd);

// Delete advertisement
router.delete('/:id', auth, adController.deleteAd);

module.exports = router;

