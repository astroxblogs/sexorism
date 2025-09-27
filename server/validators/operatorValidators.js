const { check } = require('express-validator');

const updateOperatorValidators = [
  check('currentPassword', 'Current password is required').notEmpty(),
  check('newUsername')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  check('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

module.exports = { updateOperatorValidators };
