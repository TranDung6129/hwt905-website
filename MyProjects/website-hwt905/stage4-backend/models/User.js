/**
 * GIAI ĐOẠN 4: USER MODEL (Chuẩn bị cho Giai đoạn 6)
 * Chương 8: Mongoose Schema với security features
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username là bắt buộc'],
    unique: true,
    trim: true,
    minlength: [3, 'Username phải có ít nhất 3 ký tự'],
    maxlength: [30, 'Username không được vượt quá 30 ký tự'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ, số và dấu gạch dưới']
  },
  
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  
  password: {
    type: String,
    required: [true, 'Password là bắt buộc'],
    minlength: [6, 'Password phải có ít nhất 6 ký tự'],
    select: false // Không return password trong queries mặc định
  },
  
  role: {
    type: String,
    enum: ['user', 'admin', 'operator'],
    default: 'user'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: {
    type: Date,
    default: null
  },
  
  loginCount: {
    type: Number,
    default: 0
  },
  
  // Permissions cho IoT system
  permissions: {
    canViewDashboard: {
      type: Boolean,
      default: true
    },
    canViewHistory: {
      type: Boolean,
      default: true  
    },
    canExportData: {
      type: Boolean,
      default: false
    },
    canManageDevices: {
      type: Boolean,
      default: false
    },
    canManageUsers: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

/**
 * Indexes
 */
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });

/**
 * Pre-save middleware để hash password
 */
userSchema.pre('save', async function(next) {
  // Chỉ hash password nếu password bị modify
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password với bcrypt
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method để so sánh password
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method để tạo safe user object (không có password)
 */
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

/**
 * Instance method để cập nhật login info
 */
userSchema.methods.updateLoginInfo = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

/**
 * Static method để tìm user cho authentication
 */
userSchema.statics.findByCredentials = async function(usernameOrEmail, password) {
  // Tìm user bằng username hoặc email
  const user = await this.findOne({
    $or: [
      { username: usernameOrEmail },
      { email: usernameOrEmail }
    ],
    isActive: true
  }).select('+password'); // Include password field
  
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }
  
  return user;
};

/**
 * Static method để tạo admin user đầu tiên
 */
userSchema.statics.createDefaultAdmin = async function() {
  try {
    const adminExists = await this.findOne({ role: 'admin' });
    if (adminExists) {
      return adminExists;
    }

    const defaultAdmin = new this({
      username: 'admin',
      email: 'admin@sensor-dashboard.com',
      password: 'admin123',
      role: 'admin',
      permissions: {
        canViewDashboard: true,
        canViewHistory: true,
        canExportData: true,
        canManageDevices: true,
        canManageUsers: true
      }
    });

    await defaultAdmin.save();
    console.log('✅ Đã tạo default admin user: admin/admin123');
    return defaultAdmin;
  } catch (error) {
    console.error('❌ Lỗi tạo default admin:', error.message);
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);
