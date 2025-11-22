/**
 * GIAI ĐOẠN 3: MAIN APP COMPONENT với React Router
 * Chương 6: React Router, Component composition, Context Provider
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AppProvider } from './context/AppContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Notification from './components/common/Notification';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Styles
import './index.css';

function App() {
  return (
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
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
