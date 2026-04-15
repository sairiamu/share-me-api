import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get user profile - Protected route
 */
router.get('/profile', authenticateToken, (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Get profile endpoint',
            userId: req.user.id,
            userData: req.user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving profile'
        });
    }
});

/**
 * Update user profile - Protected route
 */
router.put('/profile', authenticateToken, (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Update profile endpoint - to be implemented',
            userId: req.user.id
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});

/**
 * Delete account - Protected route
 */
router.delete('/profile/delete/:id', authenticateToken, (req, res) => {
    try {
        // Verify user is deleting their own account
        if (req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own account'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Delete account endpoint - to be implemented',
            userId: req.user.id
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting account'
        });
    }
});

export default router;