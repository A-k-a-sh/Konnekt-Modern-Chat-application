const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized, no token provided' 
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-2026'
        );

        // Get user from token (exclude password)
        const user = await User.findOne({ userId: decoded.userId }).select('-passwordHash');

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('[Auth Middleware] Error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired' 
            });
        }

        res.status(401).json({ 
            success: false, 
            message: 'Not authorized' 
        });
    }
};

module.exports = { protect };
