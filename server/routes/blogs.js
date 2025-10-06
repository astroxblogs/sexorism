const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const categoryController = require('../controllers/categoryController');

router.get('/', blogController.getBlogs);
router.get('/categories', categoryController.getCategories);
 
router.get('/search', blogController.searchBlogs);
router.get('/latest', blogController.getLatestBlogs);
router.get('/homepage-feed', blogController.getHomepageBlogs);

// ✅ ADD THIS NEW ROUTE HERE - Keep specific routes before generic ones
router.get('/:categoryName/:slug', blogController.getBlogByCategoryAndSlug);

// Debug route to check if routes are being hit
router.get('/test/:categoryName/:slug', (req, res) => {
    console.log('🧪 Test route hit:', req.params);
    res.json({ message: 'Test route working', params: req.params });
});
router.get('/slug/:slug', blogController.getBlogBySlug); // You can keep this or remove it
router.get('/:id', blogController.getBlog); // The new route MUST be before this one

router.patch('/:id/views', blogController.incrementViews);
router.post('/:id/share', blogController.incrementShares);
router.post('/:id/like', blogController.likePost);
router.post('/:id/unlike', blogController.unlikePost);
router.post('/:id/comments', blogController.addComment);

// ✅ ADD: Delete blog route
router.delete('/:id', blogController.deleteBlog);

module.exports = router;