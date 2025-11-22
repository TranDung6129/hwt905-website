/**
 * GIAI ĐOẠN 6: AUTHENTICATION MIDDLEWARE
 * JWT token verification middleware
 */

const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/errorResponse');

/**
 * Authenticate JWT token
 */
exports.authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        errorResponse('Không có token xác thực. Vui lòng đăng nhập.', 401)
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    // Attach user info to request
    req.user = {
      userId: decoded.userId
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        errorResponse('Token đã hết hạn. Vui lòng đăng nhập lại.', 401, 'TOKEN_EXPIRED')
      );
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        errorResponse('Token không hợp lệ. Vui lòng đăng nhập lại.', 401)
      );
    }

    return res.status(401).json(
      errorResponse('Xác thực thất bại', 401)
    );
  }
};

/**
 * Require specific role
 */
exports.requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json(
          errorResponse('Người dùng không tồn tại', 404)
        );
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json(
          errorResponse('Bạn không có quyền truy cập tính năng này', 403)
        );
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      return res.status(500).json(
        errorResponse('Lỗi kiểm tra quyền truy cập', 500)
      );
    }
  };
};

/**
 * Require specific permission
 */
exports.requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json(
          errorResponse('Người dùng không tồn tại', 404)
        );
      }

      // Admin has all permissions
      if (user.role === 'admin') {
        req.user.role = user.role;
        return next();
      }

      // Check specific permission
      if (!user.permissions || !user.permissions[permission]) {
        return res.status(403).json(
          errorResponse(`Bạn không có quyền: ${permission}`, 403)
        );
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      return res.status(500).json(
        errorResponse('Lỗi kiểm tra quyền truy cập', 500)
      );
    }
  };
};

