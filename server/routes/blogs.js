const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const categoryController = require('../controllers/categoryController'); // <-- NEW IMPORT

router.get('/', blogController.getBlogs);

router.get('/categories', categoryController.getCategories);

// Existing routes
router.get('/search', blogController.searchBlogs);
router.get('/latest', blogController.getLatestBlogs);
router.get('/slug/:slug', blogController.getBlogBySlug);
router.get('/:id', blogController.getBlog);
router.patch('/:id/views', blogController.incrementViews);
router.post('/:id/share', blogController.incrementShares);

// New routes for likes and comments
router.post('/:id/like', blogController.likePost);
router.post('/:id/unlike', blogController.unlikePost);
router.post('/:id/comments', blogController.addComment);

module.exports = router;