/**
 * GIAI ĐOẠN 3: NAVBAR COMPONENT
 * Chương 6: React Component, Props, State
 * Chuyển từ stage2 HTML/JS sang React
 */

import React from 'react';
import { useApp } from '../../context/AppContext';

const Navbar = () => {
  const { toggleSidebar } = useApp();

  const handleLogout = () => {
    // Simulate logout - Giai đoạn 6 sẽ có JWT logout thật
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Simulate user data - Giai đoạn 6 sẽ lấy từ AuthContext
  const user = JSON.parse(localStorage.getItem('user') || '{"username": "Demo User"}');

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Sensor Dashboard</h1>
      </div>

      <div className="navbar-menu">
        <button 
          className="menu-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className="user-info">
          <span className="welcome-text">
            Chào mừng, <strong>{user.username}</strong>
          </span>
          <button 
            className="btn btn-secondary"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
