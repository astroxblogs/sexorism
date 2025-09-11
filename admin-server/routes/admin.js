const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const blogController = require('../controllers/blogcontroller');
const categoryController = require('../controllers/categoryController');
const { adminAuth, requireRole } = require('../middleware/auth');

// Admin Authentication Routes
router.post('/login', adminController.login);
router.post('/refresh-token', adminController.refreshAdminToken);
router.post('/logout', adminController.logout);
router.get('/verify-token', adminAuth, (req, res) => {
    res.status(200).json({ message: 'Token is valid', role: req.user.role });
});

router.get('/blogs/search', adminAuth, blogController.searchBlogs);
router.post('/blogs', adminAuth, blogController.createBlog);
router.put('/blogs/:id', adminAuth, blogController.updateBlog);
router.delete('/blogs/:id', adminAuth, blogController.deleteBlog);
router.get('/blogs', adminAuth, blogController.getBlogs);

// Pending approvals (admin only)
router.get('/blogs/pending', adminAuth, requireRole('admin'), blogController.getPendingBlogs);
router.post('/blogs/:id/approve', adminAuth, requireRole('admin'), blogController.approveBlog);
router.post('/blogs/:id/reject', adminAuth, requireRole('admin'), blogController.rejectBlog);


// Category Management Routes (protected)
router.post('/categories', adminAuth, categoryController.createCategory);
router.get('/categories', adminAuth, categoryController.getCategories);
router.delete('/categories/:id', adminAuth, categoryController.deleteCategory);

module.exports = router;