const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Social media preview route - handles /blog/:slug for social media crawlers
router.get('/blog/:slug', blogController.getSocialMediaPreview);

module.exports = router;