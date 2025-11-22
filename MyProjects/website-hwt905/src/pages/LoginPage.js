/**
 * GIAI ĐOẠN 6: LOGIN PAGE COMPONENT  
 * Chương 9: Authentication Page với Form Switching
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const LoginPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const { isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate, location.state?.from]);

  /**
   * Handle successful login/register
   */
  const handleAuthSuccess = (user) => {
    console.log('✅ Authentication successful:', user.username);
    
    // Get redirect destination
    const redirectTo = location.state?.from || '/dashboard';
    
    // Navigate to dashboard or intended page
    navigate(redirectTo, { replace: true });
  };

  /**
   * Switch between login and register modes
   */
  const switchToRegister = () => {
    setMode('register');
  };

  const switchToLogin = () => {
    setMode('login');
  };

  return (
    <div className="login-page">
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          box-sizing: border-box;
        }

        .login-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          width: 100%;
          max-width: 900px;
          min-height: 600px;
          display: flex;
        }

        .login-hero {
          flex: 1;
          background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px;
          color: white;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%);
        }

        .hero-content {
          position: relative;
          z-index: 1;
        }

        .hero-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 30px;
          line-height: 1.5;
        }

        .hero-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .hero-features li {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 16px;
        }

        .hero-features .icon {
          font-size: 20px;
          width: 24px;
          text-align: center;
        }

        .login-form-container {
          flex: 1;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #fafbfc;
        }

        .status-message {
          background: #e3f2fd;
          border: 1px solid #bbdefb;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 20px;
          color: #1976d2;
          font-size: 14px;
          text-align: center;
        }

        .system-status {
          margin-top: 30px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .status-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #27ae60;
        }

        .status-dot.unknown {
          background: #f39c12;
        }

        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
            max-width: 100%;
            min-height: auto;
          }

          .login-hero {
            padding: 30px 20px;
            min-height: 200px;
          }

          .hero-title {
            font-size: 24px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .hero-features {
            display: none;
          }

          .login-form-container {
            padding: 30px 20px;
          }

          .system-status {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 10px;
          }

          .login-form-container {
            padding: 20px;
          }
        }
      `}</style>

      <div className="login-container">
        {/* Hero Section */}
        <div className="login-hero">
          <div className="hero-background"></div>
          <div className="hero-content">
            <h1 className="hero-title">
              IoT Sensor Dashboard
            </h1>
            <p className="hero-subtitle">
              Giám sát và phân tích dữ liệu cảm biến thời gian thực
            </p>
            
            <ul className="hero-features">
              <li>
                <span className="icon">📊</span>
                <span>Dashboard trực quan với biểu đồ real-time</span>
              </li>
              <li>
                <span className="icon">📱</span>
                <span>Tương thích với Raspberry Pi và IoT devices</span>
              </li>
              <li>
                <span className="icon">📈</span>
                <span>Phân tích và thống kê dữ liệu chi tiết</span>
              </li>
              <li>
                <span className="icon">🔒</span>
                <span>Bảo mật cao với JWT authentication</span>
              </li>
              <li>
                <span className="icon">📲</span>
                <span>Responsive design cho mobile và desktop</span>
              </li>
            </ul>

            {/* System Status */}
            <div className="system-status">
              <div className="status-title">Trạng thái hệ thống</div>
              <div className="status-item">
                <span>Backend API</span>
                <span className="status-indicator">
                  <span className="status-dot"></span>
                  <span>Hoạt động</span>
                </span>
              </div>
              <div className="status-item">
                <span>Database</span>
                <span className="status-indicator">
                  <span className="status-dot"></span>
                  <span>Kết nối</span>
                </span>
              </div>
              <div className="status-item">
                <span>MQTT Service</span>
                <span className="status-indicator">
                  <span className="status-dot unknown"></span>
                  <span>Sẵn sàng</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="login-form-container">
          {/* Show redirect message if available */}
          {location.state?.message && (
            <div className="status-message">
              ℹ️ {location.state.message}
            </div>
          )}

          {mode === 'login' ? (
            <LoginForm 
              onSwitchToRegister={switchToRegister}
              onLoginSuccess={handleAuthSuccess}
            />
          ) : (
            <RegisterForm 
              onSwitchToLogin={switchToLogin}
              onRegisterSuccess={handleAuthSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
