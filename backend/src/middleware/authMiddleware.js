const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Find user by ID
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid token or user not found.' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Email not verified. Please verify your email to access this resource.' });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('[AUTH] Error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        }
        res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;
