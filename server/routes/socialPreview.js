const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Social media preview routes - handles both old and new URL structures
router.get('/blog/:slug', blogController.getSocialMediaPreview);
router.get('/blog-detail/:slug', blogController.getSocialMediaPreview);
router.get('/category/:categoryName/:slug', blogController.getSocialMediaPreview);

module.exports = router;