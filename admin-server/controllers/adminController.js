const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// ------------------- COOKIE OPTIONS -------------------
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/admin'
};

// ------------------- TOKEN GENERATOR -------------------
const generateTokens = (adminId, adminRole) => {
    const accessToken = jwt.sign(
        { id: adminId, role: adminRole },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { id: adminId, role: adminRole },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '2d' }
    );

    return { accessToken, refreshToken };
};

// ------------------- LOGIN -------------------
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;

    try {
        const user = await Admin.findOne({ username });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ 
                message: 'Account is deactivated. Please contact administrator.' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const { accessToken, refreshToken } = generateTokens(user._id, user.role);

        user.refreshToken = await bcrypt.hash(refreshToken, 10);
        await user.save();

        res.cookie('refreshToken', refreshToken, cookieOptions);

        res.status(200).json({
            message: 'Login successful',
            role: user.role,
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// ------------------- CREATE OPERATOR (Admin Only) -------------------
exports.createOperator = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;

    try {
        const existing = await Admin.findOne({ username });
        if (existing) return res.status(400).json({ message: 'Username already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const operator = new Admin({
            username,
            password: hashedPassword,
            role: 'operator',
            isActive: true
        });

        await operator.save();

        res.status(201).json({
            message: 'Operator created successfully',
            operator: {
                id: operator._id,
                username: operator.username,
                role: operator.role,
                isActive: operator.isActive
            }
        });
    } catch (err) {
        console.error('Create operator error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// ------------------- LIST OPERATORS -------------------
exports.getOperators = async (req, res) => {
    try {
        const operators = await Admin.find({ role: 'operator' })
            .select('-password -refreshToken')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ operators });
    } catch (err) {
        console.error('Get operators error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// ------------------- TOGGLE OPERATOR STATUS -------------------
exports.toggleOperatorStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const operator = await Admin.findOne({ _id: id, role: 'operator' });
        if (!operator) {
            return res.status(404).json({ message: 'Operator not found' });
        }

        operator.isActive = !operator.isActive;
        
        if (!operator.isActive) {
            operator.refreshToken = null;
        }
        
        await operator.save();

        const statusText = operator.isActive ? 'activated' : 'deactivated';
        
        res.status(200).json({ 
            message: `Operator ${statusText} successfully`,
            operator: {
                id: operator._id,
                username: operator.username,
                isActive: operator.isActive
            }
        });
    } catch (err) {
        console.error('Toggle operator status error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// ------------------- DELETE OPERATOR -------------------
exports.deleteOperator = async (req, res) => {
    const { id } = req.params;

    try {
        const operator = await Admin.findOneAndDelete({ _id: id, role: 'operator' });
        if (!operator) {
            return res.status(404).json({ message: 'Operator not found or already deleted' });
        }

        res.status(200).json({ message: 'Operator deleted successfully' });
    } catch (err) {
        console.error('Delete operator error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// ------------------- REFRESH TOKEN -------------------
exports.refreshAdminToken = async (req, res) => {
    const cookies = req.cookies;
    const headerToken = req.headers['x-refresh-token'];
    const bodyToken = req.body?.refreshToken;
    const refreshToken = cookies?.refreshToken || headerToken || bodyToken;

    if (!refreshToken) return res.status(401).json({ message: 'Unauthorized: No refresh token' });

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );

        const admin = await Admin.findById(decoded.id);
        if (!admin) return res.status(403).json({ message: 'Forbidden: Invalid admin' });

        if (!admin.isActive) {
            return res.status(403).json({ message: 'Forbidden: Account deactivated' });
        }

        const isMatch = await bcrypt.compare(refreshToken, admin.refreshToken);
        if (!isMatch) {
            admin.refreshToken = null;
            await admin.save();
            return res.status(403).json({ message: 'Forbidden: Invalid refresh token' });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(admin._id, admin.role);

        admin.refreshToken = await bcrypt.hash(newRefreshToken, 10);
        await admin.save();

        res.cookie('refreshToken', newRefreshToken, cookieOptions);

        res.json({ accessToken, role: admin.role });
    } catch (err) {
        console.error('Refresh token error:', err.message);
        res.status(403).json({ message: 'Forbidden: Refresh token invalid or expired' });
    }
};

// ------------------- LOGOUT -------------------
exports.logout = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );

        const admin = await Admin.findById(decoded.id);
        if (admin && await bcrypt.compare(refreshToken, admin.refreshToken)) {
            admin.refreshToken = null;
            await admin.save();
        }
    } catch (err) {
        console.log('Logout attempted with invalid/expired token:', err.message);
    }

    res.clearCookie('refreshToken', cookieOptions);
    res.sendStatus(204);
};

// ------------------- UPDATE ADMIN CREDENTIALS (EXISTING) -------------------
exports.updateAdminCredentials = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const adminId = req.user.id;
    const { currentPassword, newUsername, newPassword } = req.body;

    if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
    }

    try {
        const admin = await Admin.findById(adminId);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid current password' });

        let changesMade = false;

        if (newUsername && newUsername !== admin.username) {
            const existingUser = await Admin.findOne({ username: newUsername });
            if (existingUser) return res.status(400).json({ message: 'That username is already taken.' });

            admin.username = newUsername;
            changesMade = true;
        }

        if (newPassword) {
            admin.password = await bcrypt.hash(newPassword, 10);
            changesMade = true;
        }

        if (!changesMade) {
            return res.status(400).json({ message: 'No new information provided to update.' });
        }

        await admin.save();
        res.status(200).json({ message: 'Credentials updated successfully.' });
    } catch (err) {
        console.error('Update credentials error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// ------------------- CHANGE PASSWORD ONLY (for modern UI) -------------------
exports.changePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const adminId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
    }
    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }
    if (confirmPassword && newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New passwords do not match' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    try {
        const admin = await Admin.findById(adminId);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        // Check if current password is correct
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

        // Check if new password is different from current
        const isSame = await bcrypt.compare(newPassword, admin.password);
        if (isSame) {
            return res.status(400).json({ message: 'New password must be different from current password' });
        }

        // Hash and save new password
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();

        res.status(200).json({ message: 'Password changed successfully!' });
    } catch (err) {
        console.error('Change password error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// ------------------- UPDATE OPERATOR CREDENTIALS -------------------
// This is the new function for the operator.
// As you can see, the logic is identical to the admin's 'changePassword' function.
exports.updateOperatorCredentials = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const operatorId = req.user.id;
    // We now expect confirmPassword as well, but only need newPassword for the logic
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // A final check on the server
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New passwords do not match' });
    }

    try {
        const operator = await Admin.findById(operatorId);
        if (!operator) {
            return res.status(404).json({ message: 'Operator not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, operator.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        const isSame = await bcrypt.compare(newPassword, operator.password);
        if (isSame) {
            return res.status(400).json({ message: 'New password must be different from the current password' });
        }

        operator.password = await bcrypt.hash(newPassword, 10);
        await operator.save();

        res.status(200).json({ message: 'Password changed successfully!' });

    } catch (err) {
        console.error('Operator change password error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};