
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.adminAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Check if the Authorization header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. Token is missing or malformed.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. Token is missing.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.log('Auth middleware - Invalid token:', err.message);
            // Any JWT verification error (expired, invalid signature, etc.) will result in a 401.
            // This is the signal for our client-side interceptor to attempt a token refresh.
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        try {
            const admin = await Admin.findById(decoded.id);

            if (!admin) {
                console.log('Auth middleware - User from token not found in DB:', decoded.id);
                return res.status(401).json({ message: 'Unauthorized: User no longer exists.' });
            }

            req.user = { id: admin._id.toString(), role: admin.role };
            next();
        } catch (dbErr) {
            console.error('Auth middleware - Database error during user check:', dbErr.message);
            return res.status(500).json({ message: 'Server error during authentication.' });
        }
    });
};

// Role guard helper: require specific role(s)
exports.requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
    }
    next();
};
