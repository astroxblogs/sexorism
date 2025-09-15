const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');

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
    changePassword // ✅ ADDED: Import the new changePassword controller
} = require('../controllers/adminController');

const blogController = require('../controllers/blogcontroller');
const categoryController = require('../controllers/categoryController');

// ----------------- MIDDLEWARE -----------------
const { adminAuth, requireRole } = require('../middleware/auth');

// ----------------- VALIDATORS -----------------
const { updateOperatorValidators } = require('../validators/operatorValidators');

// ----------------- RATE LIMITER -----------------
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10, // max 10 attempts per IP
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

// This route is essential and is now correctly in place.
router.get('/verify-token', adminAuth, (req, res) => {
    res.status(200).json({ message: 'Token is valid', role: req.user.role });
});

// ----------------- BLOG ROUTES -----------------
router.get('/blogs/search', adminAuth, blogController.searchBlogs);
router.post('/blogs', adminAuth, blogController.createBlog);
router.put('/blogs/:id', adminAuth, blogController.updateBlog);
router.delete('/blogs/:id', adminAuth, requireRole('admin'), blogController.deleteBlog);
router.get('/blogs', adminAuth, blogController.getBlogs);

// ---------------------Pending approvals (admin only)--------------------------
router.get('/blogs/pending', adminAuth, requireRole('admin'), blogController.getPendingBlogs);
router.post('/blogs/:id/approve', adminAuth, requireRole('admin'), blogController.approveBlog);
router.post('/blogs/:id/reject', adminAuth, requireRole('admin'), blogController.rejectBlog);

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

// This is your old validation logic
const updateAdminValidators = [
    body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    body('newUsername').optional().notEmpty().withMessage('New username cannot be empty')
];

// ✅ ADDED: Validation for the new password change route
const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// This is your old route
router.put(
    '/credentials',
    adminAuth,
    requireRole('admin'),
    ...updateAdminValidators,
    updateAdminCredentials
);

// ✅ ADDED: The new route for the settings page UI
router.put(
    '/change-password', 
    adminAuth, 
    requireRole('admin'), // Assuming only admins can change their password this way
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

// ✅ ADD THIS NEW ROUTE FOR OPERATOR PASSWORD CHANGE
router.put(
    '/operator/change-password',
    adminAuth,
    requireRole('operator'),
    changePasswordValidation,
    // We will create this controller function in the next step
    updateOperatorCredentials // Re-using the same controller function name for simplicity
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
router.post('/categories', adminAuth, categoryController.createCategory);
router.get('/categories', adminAuth, categoryController.getCategories);
router.delete('/categories/:id', adminAuth, categoryController.deleteCategory);

module.exports = router;