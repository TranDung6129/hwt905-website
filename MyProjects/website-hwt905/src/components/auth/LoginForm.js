/**
 * GIAI ĐOẠN 6: LOGIN FORM COMPONENT
 * Chương 9: Authentication UI với Form Validation
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinnerCSS } from '../common/LoadingSpinner';

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Vui lòng nhập username hoặc email';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        console.log('✅ Login successful');
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.response?.status === 401) {
        setErrors({
          general: 'Username/email hoặc mật khẩu không đúng'
        });
      } else if (error.response?.status === 429) {
        setErrors({
          general: 'Quá nhiều lần thử. Vui lòng thử lại sau.'
        });
      } else {
        setErrors({
          general: error.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle demo login
   */
  const handleDemoLogin = async () => {
    setFormData({
      usernameOrEmail: 'admin',
      password: 'admin123',
      rememberMe: false
    });
    
    // Trigger login after a short delay to show the form update
    setTimeout(async () => {
      try {
        setIsSubmitting(true);
        const result = await login({
          usernameOrEmail: 'admin',
          password: 'admin123',
          rememberMe: false
        });
        
        if (result.success && onLoginSuccess) {
          onLoginSuccess(result.user);
        }
      } catch (error) {
        setErrors({
          general: 'Demo login thất bại: ' + (error.message || 'Vui lòng thử lại')
        });
      } finally {
        setIsSubmitting(false);
      }
    }, 100);
  };

  return (
    <div className="login-form">
      <style>{`
        .login-form {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }

        .form-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .form-title {
          font-size: 28px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .form-subtitle {
          font-size: 16px;
          color: #7f8c8d;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: #34495e;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .form-input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .form-input.error {
          border-color: #e74c3c;
          background-color: #fdf2f2;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: #7f8c8d;
          padding: 4px;
        }

        .password-toggle:hover {
          color: #34495e;
        }

        .form-error {
          color: #e74c3c;
          font-size: 14px;
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .general-error {
          background: #fdf2f2;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 20px;
          color: #721c24;
          font-size: 14px;
          text-align: center;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          font-size: 14px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #34495e;
          cursor: pointer;
        }

        .remember-me input {
          cursor: pointer;
        }

        .forgot-password {
          color: #3498db;
          text-decoration: none;
          font-weight: 500;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .form-submit {
          width: 100%;
          padding: 14px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 15px;
          position: relative;
        }

        .form-submit:hover:not(:disabled) {
          background: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .form-submit:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .demo-login {
          width: 100%;
          padding: 12px;
          background: #f39c12;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }

        .demo-login:hover:not(:disabled) {
          background: #e67e22;
        }

        .demo-login:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .form-footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e1e8ed;
          color: #7f8c8d;
          font-size: 14px;
        }

        .switch-form {
          color: #3498db;
          cursor: pointer;
          font-weight: 600;
        }

        .switch-form:hover {
          text-decoration: underline;
        }

        .loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .form-options {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .form-input {
            font-size: 16px; /* Prevent zoom on iOS */
          }
        }
      `}</style>

      <div className="form-header">
        <h1 className="form-title">Đăng nhập</h1>
        <p className="form-subtitle">
          Truy cập Dashboard Cảm biến IoT
        </p>
      </div>

      {errors.general && (
        <div className="general-error">
          ⚠️ {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="usernameOrEmail" className="form-label">
            Username hoặc Email
          </label>
          <input
            type="text"
            id="usernameOrEmail"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            className={`form-input ${errors.usernameOrEmail ? 'error' : ''}`}
            placeholder="Nhập username hoặc email"
            disabled={isSubmitting}
          />
          {errors.usernameOrEmail && (
            <div className="form-error">
              ❌ {errors.usernameOrEmail}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Mật khẩu
          </label>
          <div className="form-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Nhập mật khẩu"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && (
            <div className="form-error">
              ❌ {errors.password}
            </div>
          )}
        </div>

        <div className="form-options">
          <label className="remember-me">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Ghi nhớ đăng nhập
          </label>
          
          <a href="#" className="forgot-password">
            Quên mật khẩu?
          </a>
        </div>

        <button
          type="submit"
          className="form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <div className="loading-overlay">
              <LoadingSpinnerCSS size="small" />
            </div>
          )}
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <button
        type="button"
        className="demo-login"
        onClick={handleDemoLogin}
        disabled={isSubmitting}
      >
        🚀 Demo Login (admin/admin123)
      </button>

      <div className="form-footer">
        Chưa có tài khoản?{' '}
        <span 
          className="switch-form"
          onClick={onSwitchToRegister}
        >
          Đăng ký ngay
        </span>
      </div>
    </div>
  );
};

export default LoginForm;
