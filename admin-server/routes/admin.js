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
  toggleOperatorStatus, // 🔥 NEW: Import the toggle function
  updateAdminCredentials,
  updateOperatorCredentials
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

// 🔥 NEW: Toggle operator active/inactive status
router.put('/operators/:id/toggle', adminAuth, requireRole('admin'), toggleOperatorStatus);

// Keep delete route for permanent deletion (optional - you can remove this if not needed)
router.delete('/operators/:id', adminAuth, requireRole('admin'), deleteOperator);




// ----------------- ADMIN SETTINGS (Admin Only) -----------------

const updateAdminValidators = [
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  body('newUsername').optional().notEmpty().withMessage('New username cannot be empty')
];

router.put(
  '/credentials',
  adminAuth,
  requireRole('admin'),
  ...updateAdminValidators,
  updateAdminCredentials
);



// ----------------- OPERATOR SETTINGS (Operator Only) -----------------
router.put(
  '/operator/credentials',
  adminAuth,
  requireRole('operator'),
  ...updateOperatorValidators,
  updateOperatorCredentials
);


// Add this route to get operator profile
router.get('/profile', adminAuth, async (req, res) => {
    try {
        console.log('Profile route hit!'); // Debug log
        console.log('req.user:', req.user); // Debug log
        
        const operatorId = req.user.id;
        console.log('Looking for operator with ID:', operatorId); // Debug log
        
        const operator = await Admin.findById(operatorId).select('-password');
        console.log('Found operator:', operator); // Debug log
        
        if (!operator) {
            return res.status(404).json({ message: 'Operator not found' });
        }

        const response = {
            username: operator.username,
            role: operator.role,
            isActive: operator.isActive // 🔥 NEW: Include status in profile
        };
        console.log('Sending response:', response); // Debug log

        res.json(response);
    } catch (error) {
        console.error('Error fetching operator profile:', error); // This should show the actual error
        res.status(500).json({ message: 'Server error' });
    }
});



// ----------------- CATEGORY ROUTES -----------------
router.post('/categories', adminAuth, categoryController.createCategory);
router.get('/categories', adminAuth, categoryController.getCategories);
router.delete('/categories/:id', adminAuth, categoryController.deleteCategory);

module.exports = router;