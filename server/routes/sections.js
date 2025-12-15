const express = require('express');
const sectionController = require('../controllers/sectionController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all sections (public)
router.get('/public', sectionController.getPublicSections);

// Get all sections (admin)
router.get('/', auth, sectionController.getAllSections);

// Create section
router.post('/', auth, sectionController.createSection);

// Update section
router.put('/:id', auth, sectionController.updateSection);

// Delete section
router.delete('/:id', auth, sectionController.deleteSection);

module.exports = router;
