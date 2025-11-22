/**
 * FINAL VERSION: MAIN APP COMPONENT với React Router và Authentication
 * Tích hợp đầy đủ: AppContext, AuthContext, Protected Routes, Real-time WebSocket
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AppProvider } from './context/AppContext';
import { AuthContextProvider } from './context/AuthContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Notification from './components/common/Notification';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChartsPage from './pages/ChartsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ProjectManagementPage from './pages/ProjectManagementPage';
import NotFoundPage from './pages/NotFoundPage';

// Styles
import './index.css';

function App() {
  return (
    <AuthContextProvider>
      <AppProvider>
        <Router>
          <div className="App">
            {/* Global Notifications */}
            <Notification />
            
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/charts" 
                element={
                  <ProtectedRoute>
                    <ChartsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute>
                    <ProjectManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </AuthContextProvider>
  );
}

export default App;
