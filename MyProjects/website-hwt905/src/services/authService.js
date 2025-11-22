/**
 * GIAI ĐOẠN 6: AUTHENTICATION SERVICE
 * Chương 9: JWT Authentication với Local Storage
 * 
 * Service quản lý authentication state và API calls
 */

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'sensor_dashboard_token';
const USER_KEY = 'sensor_dashboard_user';

/**
 * Axios instance for auth API calls
 */
const authAPI = axios.create({
  baseURL: `${BASE_URL}/api/auth`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Auth API Error class
 */
export class AuthError extends Error {
  constructor(message, status, code = null) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
  }
}

/**
 * LOCAL STORAGE MANAGEMENT
 */
export const tokenStorage = {
  
  /**
   * Get stored token
   */
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.warn('Cannot access localStorage:', error);
      return null;
    }
  },

  /**
   * Store token
   */
  setToken(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.warn('Cannot store token:', error);
    }
  },

  /**
   * Remove token
   */
  removeToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.warn('Cannot remove token:', error);
    }
  },

  /**
   * Get stored user data
   */
  getUser() {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Cannot get user data:', error);
      return null;
    }
  },

  /**
   * Store user data
   */
  setUser(user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn('Cannot store user data:', error);
    }
  },

  /**
   * Remove user data
   */
  removeUser() {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.warn('Cannot remove user data:', error);
    }
  },

  /**
   * Clear all auth data
   */
  clearAll() {
    this.removeToken();
    this.removeUser();
  }
};

/**
 * JWT TOKEN UTILITIES
 */
export const tokenUtils = {
  
  /**
   * Decode JWT token (basic decode, no verification)
   */
  decode(token) {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if token is expired
   */
  isExpired(token) {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  },

  /**
   * Get time until expiration (in seconds)
   */
  getTimeUntilExpiry(token) {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - currentTime);
  },

  /**
   * Check if token expires soon (within 5 minutes)
   */
  expiresSoon(token) {
    const timeLeft = this.getTimeUntilExpiry(token);
    return timeLeft > 0 && timeLeft < 300; // 5 minutes
  }
};

/**
 * API INTERCEPTORS
 */

// Request interceptor - add auth token
authAPI.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token && !tokenUtils.isExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🔐 Auth API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Auth request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
authAPI.interceptors.response.use(
  (response) => {
    console.log(`✅ Auth API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ Auth response error:', error);

    if (error.response?.status === 401) {
      // Token expired or invalid
      tokenStorage.clearAll();
      
      if (error.response.data?.code === 'TOKEN_EXPIRED') {
        error.message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
      } else {
        error.message = 'Token không hợp lệ, vui lòng đăng nhập lại';
      }
    } else if (error.response?.status === 403) {
      error.message = 'Bạn không có quyền thực hiện hành động này';
    } else if (!error.response) {
      error.message = 'Không thể kết nối server authentication';
    }

    return Promise.reject(error);
  }
);

/**
 * AUTHENTICATION API METHODS
 */
export const authService = {

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const { username, email, password, confirmPassword } = userData;
      
      const response = await authAPI.post('/register', {
        username,
        email,
        password,
        confirmPassword
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Store auth data
        tokenStorage.setToken(token);
        tokenStorage.setUser(user);

        return {
          success: true,
          user,
          token,
          message: response.data.message
        };
      } else {
        throw new AuthError(response.data.message || 'Đăng ký thất bại');
      }

    } catch (error) {
      if (error instanceof AuthError) throw error;
      
      const message = error.response?.data?.message || error.message || 'Lỗi khi đăng ký';
      const errors = error.response?.data?.errors || [];
      
      throw new AuthError(message, error.response?.status, { errors });
    }
  },

  /**
   * Login user
   */
  async login(credentials) {
    try {
      const { usernameOrEmail, password, rememberMe = false } = credentials;
      
      const response = await authAPI.post('/login', {
        usernameOrEmail,
        password
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Store auth data
        tokenStorage.setToken(token);
        tokenStorage.setUser(user);

        console.log(`✅ Login successful: ${user.username}`);

        return {
          success: true,
          user,
          token,
          message: response.data.message
        };
      } else {
        throw new AuthError(response.data.message || 'Đăng nhập thất bại');
      }

    } catch (error) {
      if (error instanceof AuthError) throw error;
      
      const message = error.response?.data?.message || error.message || 'Lỗi khi đăng nhập';
      throw new AuthError(message, error.response?.status);
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      // Call logout API (optional - for server-side tracking)
      if (this.isAuthenticated()) {
        await authAPI.post('/logout');
      }
    } catch (error) {
      console.warn('Logout API call failed:', error.message);
      // Continue with local logout even if API fails
    } finally {
      // Clear local storage
      tokenStorage.clearAll();
      console.log('✅ Logout completed');
      
      return {
        success: true,
        message: 'Đăng xuất thành công'
      };
    }
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    try {
      const response = await authAPI.get('/profile');

      if (response.data.success) {
        const { user } = response.data.data;
        
        // Update stored user data
        tokenStorage.setUser(user);

        return {
          success: true,
          user
        };
      } else {
        throw new AuthError(response.data.message || 'Không thể lấy thông tin user');
      }

    } catch (error) {
      if (error instanceof AuthError) throw error;
      
      const message = error.response?.data?.message || error.message || 'Lỗi khi lấy profile';
      throw new AuthError(message, error.response?.status);
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    try {
      const response = await authAPI.put('/profile', updates);

      if (response.data.success) {
        const { user } = response.data.data;
        
        // Update stored user data
        tokenStorage.setUser(user);

        return {
          success: true,
          user,
          message: response.data.message
        };
      } else {
        throw new AuthError(response.data.message || 'Không thể cập nhật profile');
      }

    } catch (error) {
      if (error instanceof AuthError) throw error;
      
      const message = error.response?.data?.message || error.message || 'Lỗi khi cập nhật profile';
      throw new AuthError(message, error.response?.status);
    }
  },

  /**
   * Refresh JWT token
   */
  async refreshToken() {
    try {
      const response = await authAPI.post('/refresh');

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Update stored auth data
        tokenStorage.setToken(token);
        tokenStorage.setUser(user);

        return {
          success: true,
          token,
          user
        };
      } else {
        throw new AuthError(response.data.message || 'Không thể làm mới token');
      }

    } catch (error) {
      // If refresh fails, clear auth data
      tokenStorage.clearAll();
      
      if (error instanceof AuthError) throw error;
      
      const message = error.response?.data?.message || error.message || 'Lỗi khi làm mới token';
      throw new AuthError(message, error.response?.status);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser();
    
    if (!token || !user) return false;
    
    // Check if token is expired
    if (tokenUtils.isExpired(token)) {
      tokenStorage.clearAll();
      return false;
    }
    
    return true;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    if (!this.isAuthenticated()) return null;
    return tokenStorage.getUser();
  },

  /**
   * Get current token
   */
  getCurrentToken() {
    if (!this.isAuthenticated()) return null;
    return tokenStorage.getToken();
  },

  /**
   * Check if user has specific permission
   */
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    return user.permissions?.[permission] || false;
  },

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.role === role;
  },

  /**
   * Auto-refresh token if it expires soon
   */
  async autoRefreshToken() {
    const token = tokenStorage.getToken();
    
    if (!token) return false;
    
    if (tokenUtils.expiresSoon(token)) {
      try {
        await this.refreshToken();
        console.log('🔄 Token auto-refreshed');
        return true;
      } catch (error) {
        console.error('❌ Auto refresh failed:', error);
        return false;
      }
    }
    
    return true;
  }
};

/**
 * PERMISSION CONSTANTS
 */
export const PERMISSIONS = {
  VIEW_DASHBOARD: 'canViewDashboard',
  VIEW_HISTORY: 'canViewHistory',
  EXPORT_DATA: 'canExportData',
  MANAGE_DEVICES: 'canManageDevices',
  MANAGE_USERS: 'canManageUsers'
};

/**
 * ROLE CONSTANTS
 */
export const ROLES = {
  USER: 'user',
  OPERATOR: 'operator',
  ADMIN: 'admin'
};

// Export default
export default authService;
