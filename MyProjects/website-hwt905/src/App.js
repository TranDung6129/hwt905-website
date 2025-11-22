/**
 * GIAI ĐOẠN 6: APP COMPONENT với Authentication Integration
 * Chương 6: React Router với Protected Routes và Auth Context
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import { AppContextProvider } from './context/AppContext';
import ProtectedRoute, { DashboardRoute, PublicRoute } from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * Main App Component với Authentication Flow
 */
function App() {
  return (
    <Router>
      <AuthContextProvider>
        <AppContextProvider>
          <div className="App">
            <Routes>
              {/* Public Routes - redirect to dashboard if authenticated */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />

              {/* Protected Routes - require authentication */}
              <Route 
                path="/dashboard" 
                element={
                  <DashboardRoute>
                    <DashboardPage />
                  </DashboardRoute>
                } 
              />

              {/* Default redirect */}
              <Route 
                path="/" 
                element={<Navigate to="/dashboard" replace />} 
              />

              {/* 404 Page */}
              <Route 
                path="*" 
                element={<NotFoundPage />} 
              />
            </Routes>
          </div>
        </AppContextProvider>
      </AuthContextProvider>
    </Router>
  );
}

export default App;
