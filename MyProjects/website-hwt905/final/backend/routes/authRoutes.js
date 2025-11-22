/**
 * GIAI ĐOẠN 6: AUTHENTICATION ROUTES
 * Routes cho authentication và user management
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  refreshToken,
  logout
} = require('../controllers/authController');

// Import middleware
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * Public routes
 */
router.post('/register', register);
router.post('/login', login);

/**
 * Protected routes - require authentication
 */
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/refresh', authenticateToken, refreshToken);
router.post('/logout', authenticateToken, logout);

module.exports = router;

