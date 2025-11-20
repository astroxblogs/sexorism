const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Admin = require('../../models/Admin');
const multer = require('multer'); // ✅ ADDED: For handling file uploads

// ----------------- MULTER SETUP FOR FILE UPLOADS -----------------
// Using memory storage to handle the file as a buffer. You can configure disk storage if you prefer.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ----------------- CONTROLLERS -----------------
const {
    login,
    refreshAdminToken,
    logout,
    createOperator,
    getOperators,
    deleteOperator,
    toggleOperatorStatus,
    updateAdminCredentials,
    updateOperatorCredentials,
    changePassword
} = require('../../controllers/admin/adminController');

const blogController = require('../../controllers/admin/blogcontroller');
const categoryController = require('../../controllers/admin/categoryController');
const subscriberController = require('../../controllers/admin/subscriberController');

// ----------------- MIDDLEWARE -----------------
const { adminAuth, requireRole } = require('../../middleware/auth');

// ----------------- VALIDATORS -----------------
const { updateOperatorValidators } = require('../../validators/operatorValidators');

// ----------------- RATE LIMITER -----------------
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many attempts, please try again later' }
});

// ----------------- AUTH ROUTES -----------------
router.post(
    '/login',
    [
        body('username').notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    login
);

router.post('/refresh-token', refreshAdminToken);
router.post('/logout', logout);

router.get('/verify-token', adminAuth, (req, res) => {
    res.status(200).json({ message: 'Token is valid', role: req.user.role });
});

// ----------------- BLOG ROUTES -----------------

// ✅ ADDED: Route for handling main cover image uploads
router.post(
    '/blogs/upload-image',
    adminAuth,
    upload.single('image'), // 'image' must match the field name in the form data
    blogController.uploadImage
);

router.get('/blogs/search', adminAuth, blogController.searchBlogs);
router.post('/blogs', adminAuth, blogController.createBlog);
router.put('/blogs/:id', adminAuth, blogController.updateBlog);
router.delete('/blogs/:id', adminAuth, requireRole('admin'), blogController.deleteBlog);
router.get('/blogs', adminAuth, blogController.getBlogs);
router.put('/blogs/:id/date', adminAuth, requireRole('admin'), blogController.updateBlogDate);

// ---------------------Pending approvals (admin only)--------------------------
router.get('/blogs/pending', adminAuth, requireRole('admin'), blogController.getPendingBlogs);
router.post('/blogs/:id/approve', adminAuth, requireRole('admin'), blogController.approveBlog);
router.post('/blogs/:id/reject', adminAuth, requireRole('admin'), blogController.rejectBlog);
// Deactivate (move to pending)

router.patch('/blogs/:id/deactivate', adminAuth, requireRole('admin'), blogController.deactivateBlog);
router.post('/blogs/:id/deactivate',  adminAuth, requireRole('admin'), blogController.deactivateBlog); // alias


// ----------------- OPERATOR MANAGEMENT (Admin Only) -----------------
router.post(
    '/operators',
    adminAuth,
    requireRole('admin'),
    body('username').notEmpty().withMessage('Username required'),
    body('password').notEmpty().withMessage('Password required'),
    createOperator
);

router.get('/operators', adminAuth, requireRole('admin'), getOperators);
router.put('/operators/:id/toggle', adminAuth, requireRole('admin'), toggleOperatorStatus);
router.delete('/operators/:id', adminAuth, requireRole('admin'), deleteOperator);

// ----------------- ADMIN SETTINGS (Admin Only) -----------------
const updateAdminValidators = [
    body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    body('newUsername').optional().notEmpty().withMessage('New username cannot be empty')
];

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

router.put(
    '/credentials',
    adminAuth,
    requireRole('admin'),
    ...updateAdminValidators,
    updateAdminCredentials
);

router.put(
    '/change-password',
    adminAuth,
    requireRole('admin'),
    changePasswordValidation,
    changePassword
);

// ----------------- OPERATOR SETTINGS (Operator Only) -----------------
router.put(
    '/operator/credentials',
    adminAuth,
    requireRole('operator'),
    ...updateOperatorValidators,
    updateOperatorCredentials
);

router.put(
    '/operator/change-password',
    adminAuth,
    requireRole('operator'),
    changePasswordValidation,
    updateOperatorCredentials
);

// ----------------- PROFILE ROUTE -----------------
router.get('/profile', adminAuth, async (req, res) => {
    try {
        const user = await Admin.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            username: user.username,
            role: user.role,
            isActive: user.isActive
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ----------------- CATEGORY ROUTES -----------------

// ✅ ADDED: Route for handling category image uploads
router.post(
    '/categories/upload-image',
    adminAuth,
    upload.single('image'), // 'image' must match the field name in the form data
    categoryController.uploadImage
);

router.post('/categories', adminAuth, categoryController.createCategory);
router.get('/categories', adminAuth, categoryController.getCategories);
router.delete('/categories/:id', adminAuth, categoryController.deleteCategory);
router.put('/categories/:id', adminAuth, categoryController.updateCategory);

// ----------------- SUBSCRIBER MANAGEMENT (Admin Only) -----------------
router.get('/subscribers', adminAuth, requireRole('admin'), subscriberController.getSubscribers);
router.get('/subscribers/stats', adminAuth, requireRole('admin'), subscriberController.getSubscriberStats);

module.exports = router;