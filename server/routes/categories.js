// server/routes/categories.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// This route gets all categories (e.g., /api/categories)
router.get('/', categoryController.getCategories);

// This is our NEW route to get a single category (e.g., /api/categories/health-wellness)
router.get('/:slug', categoryController.getCategoryBySlug);

module.exports = router;