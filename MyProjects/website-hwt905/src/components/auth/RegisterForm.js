/**
 * GIAI ĐOẠN 6: REGISTER FORM COMPONENT  
 * Chương 9: User Registration với Validation
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinnerCSS } from '../common/LoadingSpinner';

const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập username';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username phải có ít nhất 3 ký tự';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Username không được vượt quá 30 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username chỉ chứa chữ, số và dấu gạch dưới';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (formData.password.length > 50) {
      newErrors.password = 'Mật khẩu không được vượt quá 50 ký tự';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Get password strength
   */
  const getPasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 'weak', text: 'Yếu', color: '#e74c3c' };
    if (strength <= 4) return { level: 'medium', text: 'Trung bình', color: '#f39c12' };
    return { level: 'strong', text: 'Mạnh', color: '#27ae60' };
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        console.log('✅ Registration successful');
        if (onRegisterSuccess) {
          onRegisterSuccess(result.user);
        }
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      if (error.code?.errors) {
        // Server-side validation errors
        const serverErrors = {};
        error.code.errors.forEach(err => {
          serverErrors[err.field] = err.message;
        });
        setErrors(serverErrors);
      } else if (error.message.includes('Email đã được sử dụng')) {
        setErrors({ email: 'Email đã được sử dụng bởi tài khoản khác' });
      } else if (error.message.includes('Username đã được sử dụng')) {
        setErrors({ username: 'Username đã được sử dụng bởi tài khoản khác' });
      } else {
        setErrors({
          general: error.message || 'Đăng ký thất bại. Vui lòng thử lại.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  return (
    <div className="register-form">
      <style>{`
        .register-form {
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

        .form-input.success {
          border-color: #27ae60;
          background-color: #f0fff4;
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

        .password-strength {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: #e1e8ed;
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: all 0.3s ease;
        }

        .strength-fill.weak {
          width: 33%;
          background: #e74c3c;
        }

        .strength-fill.medium {
          width: 66%;
          background: #f39c12;
        }

        .strength-fill.strong {
          width: 100%;
          background: #27ae60;
        }

        .strength-text {
          font-weight: 600;
          min-width: 80px;
        }

        .form-error {
          color: #e74c3c;
          font-size: 14px;
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .form-success {
          color: #27ae60;
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

        .requirements {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 12px;
          margin-top: 10px;
          font-size: 13px;
          color: #6c757d;
        }

        .requirements-title {
          font-weight: 600;
          margin-bottom: 8px;
          color: #495057;
        }

        .requirements-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .requirements-list li {
          padding: 2px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .requirement-check {
          font-size: 12px;
        }

        .requirement-check.valid {
          color: #27ae60;
        }

        .requirement-check.invalid {
          color: #e74c3c;
        }

        .form-submit {
          width: 100%;
          padding: 14px;
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
          position: relative;
        }

        .form-submit:hover:not(:disabled) {
          background: #229954;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
        }

        .form-submit:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
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
          .form-input {
            font-size: 16px; /* Prevent zoom on iOS */
          }

          .password-strength {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
        }
      `}</style>

      <div className="form-header">
        <h1 className="form-title">Đăng ký</h1>
        <p className="form-subtitle">
          Tạo tài khoản Dashboard Cảm biến IoT
        </p>
      </div>

      {errors.general && (
        <div className="general-error">
          ⚠️ {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`form-input ${
              errors.username ? 'error' : 
              formData.username && !errors.username ? 'success' : ''
            }`}
            placeholder="Nhập username (3-30 ký tự)"
            disabled={isSubmitting}
          />
          {errors.username && (
            <div className="form-error">
              ❌ {errors.username}
            </div>
          )}
          {formData.username && !errors.username && formData.username.length >= 3 && (
            <div className="form-success">
              ✅ Username hợp lệ
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${
              errors.email ? 'error' : 
              formData.email && !errors.email && /^\S+@\S+\.\S+$/.test(formData.email) ? 'success' : ''
            }`}
            placeholder="Nhập email"
            disabled={isSubmitting}
          />
          {errors.email && (
            <div className="form-error">
              ❌ {errors.email}
            </div>
          )}
          {formData.email && !errors.email && /^\S+@\S+\.\S+$/.test(formData.email) && (
            <div className="form-success">
              ✅ Email hợp lệ
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Mật khẩu
          </label>
          <div className="form-input-wrapper">
            <input
              type={showPasswords.password ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPasswords(prev => ({
                ...prev,
                password: !prev.password
              }))}
              disabled={isSubmitting}
            >
              {showPasswords.password ? '🙈' : '👁️'}
            </button>
          </div>
          
          {passwordStrength && (
            <div className="password-strength">
              <div className="strength-bar">
                <div className={`strength-fill ${passwordStrength.level}`}></div>
              </div>
              <span 
                className="strength-text" 
                style={{ color: passwordStrength.color }}
              >
                {passwordStrength.text}
              </span>
            </div>
          )}
          
          {errors.password && (
            <div className="form-error">
              ❌ {errors.password}
            </div>
          )}

          {formData.password && (
            <div className="requirements">
              <div className="requirements-title">Yêu cầu mật khẩu:</div>
              <ul className="requirements-list">
                <li>
                  <span className={`requirement-check ${formData.password.length >= 6 ? 'valid' : 'invalid'}`}>
                    {formData.password.length >= 6 ? '✅' : '❌'}
                  </span>
                  Ít nhất 6 ký tự
                </li>
                <li>
                  <span className={`requirement-check ${/[A-Z]/.test(formData.password) ? 'valid' : 'invalid'}`}>
                    {/[A-Z]/.test(formData.password) ? '✅' : '❌'}
                  </span>
                  Chữ hoa (A-Z)
                </li>
                <li>
                  <span className={`requirement-check ${/[0-9]/.test(formData.password) ? 'valid' : 'invalid'}`}>
                    {/[0-9]/.test(formData.password) ? '✅' : '❌'}
                  </span>
                  Số (0-9)
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Xác nhận mật khẩu
          </label>
          <div className="form-input-wrapper">
            <input
              type={showPasswords.confirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${
                errors.confirmPassword ? 'error' : 
                formData.confirmPassword && formData.password === formData.confirmPassword ? 'success' : ''
              }`}
              placeholder="Nhập lại mật khẩu"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPasswords(prev => ({
                ...prev,
                confirmPassword: !prev.confirmPassword
              }))}
              disabled={isSubmitting}
            >
              {showPasswords.confirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="form-error">
              ❌ {errors.confirmPassword}
            </div>
          )}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <div className="form-success">
              ✅ Mật khẩu khớp
            </div>
          )}
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
          {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>

      <div className="form-footer">
        Đã có tài khoản?{' '}
        <span 
          className="switch-form"
          onClick={onSwitchToLogin}
        >
          Đăng nhập ngay
        </span>
      </div>
    </div>
  );
};

export default RegisterForm;
