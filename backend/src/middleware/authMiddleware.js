const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticateToken = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'dharmasikhara_secret', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        
        // Attach user to request object
        req.user = user;
        next();
    });
};

/**
 * Middleware to check if user has required role
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // If roles is a string, convert to array
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        
        next();
    };
};

/**
 * Middleware to check if user is a contractor
 */
const requireContractor = (req, res, next) => {
    return requireRole('contractor')(req, res, next);
};

/**
 * Middleware to check if user is a client
 */
const requireClient = (req, res, next) => {
    return requireRole('client')(req, res, next);
};

module.exports = {
    authenticateToken,
    requireRole,
    requireContractor,
    requireClient
};