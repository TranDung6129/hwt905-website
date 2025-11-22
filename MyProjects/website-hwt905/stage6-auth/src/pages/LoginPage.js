/**
 * GIAI ĐOẠN 3: LOGIN PAGE COMPONENT
 * Chương 6: React Component, useState, useEffect, Form Handling
 * Chuyển từ stage2 login.html/js sang React
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  const [errors, setErrors] = useState({});

  // Check if already logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  // Validation rules - chuyển từ stage2
  const validateField = (name, value, form = 'login') => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'username':
        if (!value) {
          newErrors[name] = 'Tên đăng nhập không được để trống';
        } else if (form === 'register' && (value.length < 3 || value.length > 20)) {
          newErrors[name] = 'Tên đăng nhập phải có 3-20 ký tự';
        } else if (form === 'register' && !/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors[name] = 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'email':
        if (!value) {
          newErrors[name] = 'Email không được để trống';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[name] = 'Email không hợp lệ';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors[name] = 'Mật khẩu không được để trống';
        } else if (form === 'register' && value.length < 6) {
          newErrors[name] = 'Mật khẩu phải có ít nhất 6 ký tự';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'confirmPassword':
        if (value !== registerData.password) {
          newErrors[name] = 'Xác nhận mật khẩu không khớp';
        } else {
          delete newErrors[name];
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[name];
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      validateField(name, value, 'login');
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setRegisterData(prev => ({ ...prev, [name]: newValue }));
    
    if (errors[name] && name !== 'agreeTerms') {
      validateField(name, newValue, 'register');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    // Validate
    let isValid = true;
    ['username', 'password'].forEach(field => {
      if (!validateField(field, loginData[field], 'login')) {
        isValid = false;
      }
    });
    
    if (!isValid) return;
    
    setLoading(true);
    
    try {
      // Simulate API call - chuyển từ stage2
      const result = await simulateLogin(loginData);
      
      if (result.success) {
        // Store user data
        localStorage.setItem('user', JSON.stringify({ 
          username: loginData.username,
          loginTime: new Date().toISOString()
        }));
        
        setMessage({ type: 'success', text: 'Đăng nhập thành công! Đang chuyển hướng...' });
        
        setTimeout(() => {
          const from = location.state?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi kết nối. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    // Validate all fields
    let isValid = true;
    ['username', 'email', 'password', 'confirmPassword'].forEach(field => {
      if (!validateField(field, registerData[field], 'register')) {
        isValid = false;
      }
    });
    
    if (!registerData.agreeTerms) {
      setMessage({ type: 'error', text: 'Bạn phải đồng ý với Điều khoản sử dụng' });
      isValid = false;
    }
    
    if (!isValid) return;
    
    setLoading(true);
    
    try {
      const result = await simulateRegister(registerData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.' });
        setTimeout(() => {
          setIsLoginMode(true);
          setLoginData(prev => ({ ...prev, username: registerData.username }));
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi kết nối. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setMessage(null);
    setErrors({});
  };

  // Simulation functions - chuyển từ stage2
  const simulateLogin = (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if ((data.username === 'admin' && data.password === 'admin123') ||
            (data.username === 'demo' && data.password === 'demo123')) {
          resolve({ success: true });
        } else {
          resolve({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }
      }, 1500);
    });
  };

  const simulateRegister = (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (data.username === 'admin' || data.username === 'test') {
          resolve({ success: false, message: 'Tên đăng nhập đã tồn tại' });
        } else if (data.email === 'test@example.com') {
          resolve({ success: false, message: 'Email đã được sử dụng' });
        } else {
          resolve({ success: true });
        }
      }, 2000);
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Sensor Dashboard</h1>
            <p>Hệ thống giám sát IoT</p>
          </div>

          {message && (
            <div style={{
              padding: '15px 30px',
              backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '4px',
              margin: '0 30px 20px'
            }}>
              {message.text}
            </div>
          )}

          {isLoginMode ? (
            <form className="login-form" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="username">Tên đăng nhập hoặc Email:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  value={loginData.username}
                  onChange={handleLoginChange}
                  placeholder="Nhập tên đăng nhập hoặc email"
                  disabled={loading}
                />
                {errors.username && (
                  <div className="error-message">{errors.username}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Nhập mật khẩu"
                  disabled={loading}
                />
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>

              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                style={{ width: '100%', padding: '12px', fontSize: '16px', marginBottom: '20px' }}
                disabled={loading}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <p style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
                  Chưa có tài khoản?
                </p>
                <button
                  type="button"
                  onClick={switchMode}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  disabled={loading}
                >
                  Đăng ký ngay
                </button>
              </div>
            </form>
          ) : (
            <form className="register-form" onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label htmlFor="reg-username">Tên đăng nhập:</label>
                <input
                  type="text"
                  id="reg-username"
                  name="username"
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  placeholder="Nhập tên đăng nhập (3-20 ký tự)"
                  disabled={loading}
                />
                {errors.username && (
                  <div className="error-message">{errors.username}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="Nhập địa chỉ email"
                  disabled={loading}
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">Mật khẩu:</label>
                <input
                  type="password"
                  id="reg-password"
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                  disabled={loading}
                />
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Xác nhận mật khẩu:</label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Nhập lại mật khẩu"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <div className="error-message">{errors.confirmPassword}</div>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={registerData.agreeTerms}
                    onChange={handleRegisterChange}
                    style={{ marginRight: '8px' }}
                    disabled={loading}
                  />
                  <span style={{ fontSize: '14px' }}>
                    Tôi đồng ý với Điều khoản sử dụng
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                style={{ width: '100%', padding: '12px', fontSize: '16px', marginBottom: '20px' }}
                disabled={loading}
              >
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
              </button>

              <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <p style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
                  Đã có tài khoản?
                </p>
                <button
                  type="button"
                  onClick={switchMode}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  disabled={loading}
                >
                  Đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '12px'
        }}>
          <p>&copy; 2024 Sensor Dashboard. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
