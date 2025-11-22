/**
 * GIAI ĐOẠN 6: AUTHENTICATION CONTEXT
 * Chương 9: React Context cho Authentication State Management
 * 
 * Context quản lý global authentication state và methods
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService, { tokenStorage, tokenUtils, PERMISSIONS, ROLES } from '../services/authService';

// Create Context
const AuthContext = createContext();

// Action Types
const AUTH_ACTION_TYPES = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  
  LOGOUT: 'LOGOUT',
  
  REFRESH_TOKEN_START: 'REFRESH_TOKEN_START',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILURE: 'REFRESH_TOKEN_FAILURE',
  
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  INITIALIZE_AUTH: 'INITIALIZE_AUTH'
};

// Initial State
const initialState = {
  // Authentication state
  isAuthenticated: false,
  user: null,
  token: null,
  
  // Loading states
  loading: {
    login: false,
    register: false,
    refresh: false,
    profile: false,
    general: false
  },
  
  // Error states
  errors: {
    login: null,
    register: null,
    refresh: null,
    profile: null,
    general: null
  },
  
  // Initialization state
  isInitialized: false,
  
  // Session info
  sessionInfo: {
    loginTime: null,
    lastActivity: null,
    tokenExpiresAt: null
  }
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTION_TYPES.LOGIN_START:
      return {
        ...state,
        loading: { ...state.loading, login: true },
        errors: { ...state.errors, login: null }
      };

    case AUTH_ACTION_TYPES.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: { ...state.loading, login: false },
        errors: { ...state.errors, login: null },
        sessionInfo: {
          loginTime: new Date(),
          lastActivity: new Date(),
          tokenExpiresAt: action.payload.tokenExpiresAt
        }
      };

    case AUTH_ACTION_TYPES.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: { ...state.loading, login: false },
        errors: { ...state.errors, login: action.payload.error }
      };

    case AUTH_ACTION_TYPES.REGISTER_START:
      return {
        ...state,
        loading: { ...state.loading, register: true },
        errors: { ...state.errors, register: null }
      };

    case AUTH_ACTION_TYPES.REGISTER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: { ...state.loading, register: false },
        errors: { ...state.errors, register: null },
        sessionInfo: {
          loginTime: new Date(),
          lastActivity: new Date(),
          tokenExpiresAt: action.payload.tokenExpiresAt
        }
      };

    case AUTH_ACTION_TYPES.REGISTER_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: { ...state.loading, register: false },
        errors: { ...state.errors, register: action.payload.error }
      };

    case AUTH_ACTION_TYPES.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        sessionInfo: {
          loginTime: null,
          lastActivity: null,
          tokenExpiresAt: null
        },
        errors: {
          login: null,
          register: null,
          refresh: null,
          profile: null,
          general: null
        }
      };

    case AUTH_ACTION_TYPES.REFRESH_TOKEN_START:
      return {
        ...state,
        loading: { ...state.loading, refresh: true }
      };

    case AUTH_ACTION_TYPES.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        loading: { ...state.loading, refresh: false },
        sessionInfo: {
          ...state.sessionInfo,
          lastActivity: new Date(),
          tokenExpiresAt: action.payload.tokenExpiresAt
        }
      };

    case AUTH_ACTION_TYPES.REFRESH_TOKEN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: { ...state.loading, refresh: false },
        sessionInfo: {
          loginTime: null,
          lastActivity: null,
          tokenExpiresAt: null
        }
      };

    case AUTH_ACTION_TYPES.UPDATE_PROFILE:
      return {
        ...state,
        user: action.payload.user
      };

    case AUTH_ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.value
        }
      };

    case AUTH_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.type]: null
        }
      };

    case AUTH_ACTION_TYPES.INITIALIZE_AUTH:
      const { isAuthenticated, user, token, tokenExpiresAt } = action.payload;
      return {
        ...state,
        isAuthenticated,
        user,
        token,
        isInitialized: true,
        sessionInfo: isAuthenticated ? {
          loginTime: null, // Unknown from storage
          lastActivity: new Date(),
          tokenExpiresAt
        } : {
          loginTime: null,
          lastActivity: null,
          tokenExpiresAt: null
        }
      };

    default:
      return state;
  }
}

// Context Provider Component
export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Initialize authentication state from localStorage
   */
  const initializeAuth = useCallback(() => {
    try {
      const storedToken = tokenStorage.getToken();
      const storedUser = tokenStorage.getUser();

      if (storedToken && storedUser && !tokenUtils.isExpired(storedToken)) {
        // Valid token found in storage
        const decoded = tokenUtils.decode(storedToken);
        const tokenExpiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;

        dispatch({
          type: AUTH_ACTION_TYPES.INITIALIZE_AUTH,
          payload: {
            isAuthenticated: true,
            user: storedUser,
            token: storedToken,
            tokenExpiresAt
          }
        });

        console.log('✅ Authentication restored from storage');
      } else {
        // No valid token found
        tokenStorage.clearAll();
        dispatch({
          type: AUTH_ACTION_TYPES.INITIALIZE_AUTH,
          payload: {
            isAuthenticated: false,
            user: null,
            token: null,
            tokenExpiresAt: null
          }
        });
        
        console.log('ℹ️ No valid authentication found in storage');
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      tokenStorage.clearAll();
      dispatch({
        type: AUTH_ACTION_TYPES.INITIALIZE_AUTH,
        payload: {
          isAuthenticated: false,
          user: null,
          token: null,
          tokenExpiresAt: null
        }
      });
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTION_TYPES.LOGIN_START });

    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        const decoded = tokenUtils.decode(result.token);
        const tokenExpiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;

        dispatch({
          type: AUTH_ACTION_TYPES.LOGIN_SUCCESS,
          payload: {
            user: result.user,
            token: result.token,
            tokenExpiresAt
          }
        });

        return result;
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTION_TYPES.LOGIN_FAILURE,
        payload: { error }
      });
      throw error;
    }
  }, []);

  /**
   * Register user
   */
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTION_TYPES.REGISTER_START });

    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        const decoded = tokenUtils.decode(result.token);
        const tokenExpiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;

        dispatch({
          type: AUTH_ACTION_TYPES.REGISTER_SUCCESS,
          payload: {
            user: result.user,
            token: result.token,
            tokenExpiresAt
          }
        });

        return result;
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTION_TYPES.REGISTER_FAILURE,
        payload: { error }
      });
      throw error;
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout API error:', error);
    } finally {
      dispatch({ type: AUTH_ACTION_TYPES.LOGOUT });
    }
  }, []);

  /**
   * Refresh token
   */
  const refreshToken = useCallback(async () => {
    dispatch({ type: AUTH_ACTION_TYPES.REFRESH_TOKEN_START });

    try {
      const result = await authService.refreshToken();
      
      if (result.success) {
        const decoded = tokenUtils.decode(result.token);
        const tokenExpiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;

        dispatch({
          type: AUTH_ACTION_TYPES.REFRESH_TOKEN_SUCCESS,
          payload: {
            user: result.user,
            token: result.token,
            tokenExpiresAt
          }
        });

        return result;
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.REFRESH_TOKEN_FAILURE });
      throw error;
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates) => {
    dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: { type: 'profile', value: true } });

    try {
      const result = await authService.updateProfile(updates);
      
      if (result.success) {
        dispatch({
          type: AUTH_ACTION_TYPES.UPDATE_PROFILE,
          payload: { user: result.user }
        });

        return result;
      }
    } catch (error) {
      throw error;
    } finally {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: { type: 'profile', value: false } });
    }
  }, []);

  /**
   * Check if user has permission
   */
  const hasPermission = useCallback((permission) => {
    if (!state.isAuthenticated || !state.user) return false;
    return authService.hasPermission(permission);
  }, [state.isAuthenticated, state.user]);

  /**
   * Check if user has role
   */
  const hasRole = useCallback((role) => {
    if (!state.isAuthenticated || !state.user) return false;
    return authService.hasRole(role);
  }, [state.isAuthenticated, state.user]);

  /**
   * Clear errors
   */
  const clearError = useCallback((type) => {
    dispatch({
      type: AUTH_ACTION_TYPES.CLEAR_ERROR,
      payload: { type }
    });
  }, []);

  /**
   * Auto refresh token effect
   */
  useEffect(() => {
    if (!state.isAuthenticated || !state.token) return;

    const interval = setInterval(async () => {
      try {
        const shouldRefresh = tokenUtils.expiresSoon(state.token);
        if (shouldRefresh) {
          console.log('🔄 Auto-refreshing token');
          await refreshToken();
        }
      } catch (error) {
        console.error('❌ Auto refresh failed:', error);
        // Token refresh failed, user will be logged out
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.token, refreshToken]);

  /**
   * Initialize auth on mount
   */
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Update last activity on user interaction
   */
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const updateActivity = () => {
      dispatch({
        type: AUTH_ACTION_TYPES.REFRESH_TOKEN_SUCCESS,
        payload: {
          user: state.user,
          token: state.token,
          tokenExpiresAt: state.sessionInfo.tokenExpiresAt
        }
      });
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const throttledUpdate = throttle(updateActivity, 60000); // Update at most once per minute

    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdate, true);
      });
    };
  }, [state.isAuthenticated, state.user, state.token, state.sessionInfo.tokenExpiresAt]);

  /**
   * Context value
   */
  const contextValue = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    
    // Utilities
    hasPermission,
    hasRole,
    clearError,
    
    // Constants
    PERMISSIONS,
    ROLES,
    
    // Session info
    isTokenExpiringSoon: state.token ? tokenUtils.expiresSoon(state.token) : false,
    timeUntilExpiry: state.token ? tokenUtils.getTimeUntilExpiry(state.token) : 0
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};

// Utility function for throttling
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

export default AuthContext;
