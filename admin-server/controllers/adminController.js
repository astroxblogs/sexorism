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

        // 🔥 NEW: Check if user is active
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
            isActive: true // 🔥 NEW: Default to active
        });

        await operator.save();

        res.status(201).json({
            message: 'Operator created successfully',
            operator: {
                id: operator._id,
                username: operator.username,
                role: operator.role,
                isActive: operator.isActive // 🔥 NEW: Include status in response
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
        // 🔥 UPDATED: Include isActive in selection
        const operators = await Admin.find({ role: 'operator' })
            .select('-password -refreshToken')
            .sort({ createdAt: -1 }); // Sort by newest first
        
        res.status(200).json({ operators });
    } catch (err) {
        console.error('Get operators error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// 🔥 NEW: TOGGLE OPERATOR STATUS (Replace delete functionality)
exports.toggleOperatorStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const operator = await Admin.findOne({ _id: id, role: 'operator' });
        if (!operator) {
            return res.status(404).json({ message: 'Operator not found' });
        }

        // Toggle the status
        operator.isActive = !operator.isActive;
        
        // If deactivating, clear refresh token to force logout
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

// ------------------- DELETE OPERATOR (Keep for permanent deletion if needed) -------------------
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

        // 🔥 NEW: Check if admin is still active
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

// ------------------- UPDATE ADMIN CREDENTIALS -------------------
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

// ------------------- UPDATE OPERATOR CREDENTIALS -------------------
// For operators to update their own username/password
exports.updateOperatorCredentials = async (req, res) => {
    // 1️⃣ Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const operatorId = req.user.id; // from JWT
    const { currentPassword, newUsername, newPassword } = req.body;

    try {
        // 2️⃣ Find operator
        const operator = await Admin.findById(operatorId);
        if (!operator) return res.status(404).json({ message: 'Operator not found' });

        if (operator.role !== 'operator') {
            return res.status(403).json({ message: 'Forbidden: only operators can update here' });
        }

        // 3️⃣ Check current password
        const isMatch = await bcrypt.compare(currentPassword, operator.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid current password' });

        let changesMade = false;

        // 4️⃣ Update username if provided
        if (newUsername && newUsername !== operator.username) {
            const existingUser = await Admin.findOne({ username: newUsername });
            if (existingUser) return res.status(400).json({ message: 'Username already taken' });

            operator.username = newUsername;
            changesMade = true;
        }

        // 5️⃣ Update password if provided
        if (newPassword) {
            operator.password = await bcrypt.hash(newPassword, 10);
            changesMade = true;
        }

        if (!changesMade) {
            return res.status(400).json({ message: 'No new information provided to update' });
        }

        // 6️⃣ Save changes
        await operator.save();

        res.status(200).json({ message: 'Operator credentials updated successfully' });
    } catch (err) {
        console.error('Update operator error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};