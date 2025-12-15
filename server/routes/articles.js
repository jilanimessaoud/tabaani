const express = require('express');
const upload = require('../config/upload');
const articleController = require('../controllers/articleController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all articles (public - only published)
router.get('/public', articleController.getPublicArticles);

// Get all articles (admin - all articles)
router.get('/', auth, articleController.getAllArticles);

// Get single article
router.get('/:id', articleController.getArticleById);

// Create article - accept any files (images, contentBlockImage_*, contentBlockVideo_*, video)
router.post('/', auth, upload.any(), articleController.createArticle);

// Update article - accept any files (images, contentBlockImage_*, contentBlockVideo_*, video)
router.put('/:id', auth, upload.any(), articleController.updateArticle);

// Delete article
router.delete('/:id', auth, articleController.deleteArticle);

module.exports = router;
