/**
 * GIAI ĐOẠN 6: PROTECTED ROUTE COMPONENT
 * Chương 9: Route Protection với Authentication và Permissions
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinnerCSS } from './LoadingSpinner';

/**
 * ProtectedRoute Component
 * Protects routes based on authentication and permissions
 */
const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  requiredPermission = null,
  requiredRole = null,
  fallbackComponent = null 
}) => {
  const { 
    isAuthenticated, 
    isInitialized, 
    hasPermission, 
    hasRole, 
    user,
    loading 
  } = useAuth();
  
  const location = useLocation();

  // Show loading spinner while auth is initializing
  if (!isInitialized || loading.general) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f6fa'
      }}>
        <LoadingSpinnerCSS size="large" />
        <div style={{ marginTop: '20px', color: '#7f8c8d' }}>
          Đang xác thực người dùng...
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location.pathname,
          message: 'Vui lòng đăng nhập để truy cập trang này'
        }} 
        replace 
      />
    );
  }

  // If specific permission is required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (fallbackComponent) {
      return fallbackComponent;
    }
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f6fa',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>
          Không có quyền truy cập
        </h2>
        <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
          Bạn không có quyền để truy cập trang này.
          <br />
          Vui lòng liên hệ quản trị viên để được cấp quyền.
        </p>
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7',
          borderRadius: '6px',
          padding: '12px',
          color: '#856404',
          fontSize: '14px'
        }}>
          <strong>Quyền yêu cầu:</strong> {requiredPermission}
          <br />
          <strong>Quyền hiện tại:</strong> {user?.role || 'Không xác định'}
        </div>
      </div>
    );
  }

  // If specific role is required
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallbackComponent) {
      return fallbackComponent;
    }
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f6fa',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>👤</div>
        <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>
          Vai trò không phù hợp
        </h2>
        <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
          Trang này chỉ dành cho người dùng có vai trò: <strong>{requiredRole}</strong>
          <br />
          Vai trò hiện tại của bạn: <strong>{user?.role || 'Không xác định'}</strong>
        </p>
      </div>
    );
  }

  // All checks passed, render the protected component
  return children;
};

/**
 * Convenience wrapper for admin-only routes
 */
export const AdminRoute = ({ children, fallbackComponent = null }) => {
  return (
    <ProtectedRoute 
      requireAuth={true}
      requiredRole="admin"
      fallbackComponent={fallbackComponent}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Convenience wrapper for routes that require dashboard permission
 */
export const DashboardRoute = ({ children, fallbackComponent = null }) => {
  return (
    <ProtectedRoute 
      requireAuth={true}
      requiredPermission="canViewDashboard"
      fallbackComponent={fallbackComponent}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Convenience wrapper for routes that require history permission
 */
export const HistoryRoute = ({ children, fallbackComponent = null }) => {
  return (
    <ProtectedRoute 
      requireAuth={true}
      requiredPermission="canViewHistory"
      fallbackComponent={fallbackComponent}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Convenience wrapper for routes that require device management permission
 */
export const DeviceManagementRoute = ({ children, fallbackComponent = null }) => {
  return (
    <ProtectedRoute 
      requireAuth={true}
      requiredPermission="canManageDevices"
      fallbackComponent={fallbackComponent}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Redirect authenticated users away from public-only pages (like login)
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <LoadingSpinnerCSS size="large" />
      </div>
    );
  }

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    const redirectTo = location.state?.from || '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  // User is not authenticated, show public content
  return children;
};

export default ProtectedRoute;
