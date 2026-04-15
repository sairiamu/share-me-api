//auth middleware
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Authentication middleware to verify JWT tokens
 * Extracts Bearer token from Authorization header and verifies it
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token missing'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

export { authenticateToken };