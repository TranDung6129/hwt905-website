/**
 * GIAI ĐOẠN 3: PROTECTED ROUTE COMPONENT
 * Chương 6: React Router, Conditional Rendering, Component composition
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Check authentication - Giai đoạn 6 sẽ có JWT validation thật
  const user = localStorage.getItem('user');
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    // Redirect to login with return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
