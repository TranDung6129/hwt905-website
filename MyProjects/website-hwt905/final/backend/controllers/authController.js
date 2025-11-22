/**
 * GIAI ĐOẠN 6: AUTHENTICATION CONTROLLER
 * JWT Authentication với bcrypt password hashing
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { errorResponse } = require('../utils/errorResponse');

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validation
  if (!username || !email || !password || !confirmPassword) {
    return next(errorResponse('Vui lòng điền đầy đủ thông tin', 400));
  }

  if (password !== confirmPassword) {
    return next(errorResponse('Mật khẩu xác nhận không khớp', 400));
  }

  if (password.length < 6) {
    return next(errorResponse('Mật khẩu phải có ít nhất 6 ký tự', 400));
  }

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    if (existingUser.username === username) {
      return next(errorResponse('Tên đăng nhập đã tồn tại', 400));
    }
    if (existingUser.email === email) {
      return next(errorResponse('Email đã được sử dụng', 400));
    }
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role: 'user' // Default role
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Đăng ký thành công',
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { usernameOrEmail, password } = req.body;

  // Validation
  if (!usernameOrEmail || !password) {
    return next(errorResponse('Vui lòng nhập tên đăng nhập và mật khẩu', 400));
  }

  // Find user by username or email
  const user = await User.findOne({
    $or: [
      { username: usernameOrEmail },
      { email: usernameOrEmail }
    ]
  }).select('+password');

  if (!user) {
    return next(errorResponse('Tên đăng nhập hoặc mật khẩu không đúng', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(errorResponse('Tài khoản đã bị vô hiệu hóa', 403));
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return next(errorResponse('Tên đăng nhập hoặc mật khẩu không đúng', 401));
  }

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Đăng nhập thành công',
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    }
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    return next(errorResponse('Người dùng không tồn tại', 404));
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        createdAt: user.createdAt
      }
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { email, currentPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user.userId).select('+password');

  if (!user) {
    return next(errorResponse('Người dùng không tồn tại', 404));
  }

  // Update email if provided
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(errorResponse('Email đã được sử dụng', 400));
    }
    user.email = email;
  }

  // Update password if provided
  if (newPassword) {
    if (!currentPassword) {
      return next(errorResponse('Vui lòng nhập mật khẩu hiện tại', 400));
    }

    if (newPassword !== confirmPassword) {
      return next(errorResponse('Mật khẩu xác nhận không khớp', 400));
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return next(errorResponse('Mật khẩu hiện tại không đúng', 401));
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
  }

  await user.save();

  res.json({
    success: true,
    message: 'Cập nhật thông tin thành công',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    }
  });
});

/**
 * @desc    Refresh JWT token
 * @route   POST /api/auth/refresh
 * @access  Private
 */
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    return next(errorResponse('Người dùng không tồn tại', 404));
  }

  if (!user.isActive) {
    return next(errorResponse('Tài khoản đã bị vô hiệu hóa', 403));
  }

  // Generate new token
  const token = generateToken(user._id);

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    }
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can log the action or invalidate tokens in a token blacklist if needed
  
  res.json({
    success: true,
    message: 'Đăng xuất thành công'
  });
});

