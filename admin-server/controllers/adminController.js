const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',

    sameSite: 'Lax', // Keep consistent for login, refresh, logout
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/admin'
};

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

exports.login = async (req, res) => {
    const { username, password } = req.body; // role removed
    console.log('Login attempt for username:', username);

    try {
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Server configuration error: JWT secret missing.' });
        }

        // No more role check against frontend input
        const { accessToken, refreshToken } = generateTokens(admin._id, admin.role);

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        admin.refreshToken = hashedRefreshToken;
        await admin.save();

        res.cookie('refreshToken', refreshToken, cookieOptions);

        console.log(`Login successful for username: ${username}, role: ${admin.role}`);
        
        // Always send back DB role
        res.json({ accessToken, role: admin.role, refreshToken });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: err.message });
    }
};


exports.refreshAdminToken = async (req, res) => {
    const cookies = req.cookies;
    const headerToken = req.headers['x-refresh-token'];
    const bodyToken = req.body?.refreshToken;
    const refreshToken = (cookies && cookies.refreshToken) || headerToken || bodyToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Unauthorized: No refresh token' });
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );

        const admin = await Admin.findById(decoded.id);
        if (!admin) return res.status(403).json({ message: 'Forbidden: Invalid admin for refresh token' });

        const isRefreshTokenMatch = await bcrypt.compare(refreshToken, admin.refreshToken);
        if (!isRefreshTokenMatch) {
            admin.refreshToken = null;
            await admin.save();
            return res.status(403).json({ message: 'Forbidden: Invalid refresh token' });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(admin._id, admin.role);

        const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
        admin.refreshToken = hashedNewRefreshToken;
        await admin.save();

        res.cookie('refreshToken', newRefreshToken, cookieOptions);

        res.json({ accessToken, role: admin.role });
    } catch (err) {
        console.error('Refresh token error:', err.message);
        res.status(403).json({ message: 'Forbidden: Refresh token invalid or expired' });
    }
};

exports.logout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        return res.sendStatus(204);
    }

    const refreshToken = cookies.refreshToken;

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