const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Social media preview routes - handles both /blog/:slug and /blog-detail/:slug
router.get('/blog/:slug', blogController.getSocialMediaPreview);
router.get('/blog-detail/:slug', blogController.getSocialMediaPreview);

module.exports = router;