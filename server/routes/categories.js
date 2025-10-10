// server/routes/categories.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// List
router.get('/', categoryController.getCategories);

// Single by slug (keep this BEFORE the :id route)
router.get('/by-slug/:slug', categoryController.getCategoryBySlug);

// Single by id (validate inside the controller)
router.get('/:id', categoryController.getCategoryById);

module.exports = router;
