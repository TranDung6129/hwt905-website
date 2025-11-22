/**
 * GIAI ĐOẠN 3: NOT FOUND PAGE COMPONENT  
 * Chương 6: React Component, React Router Link
 */

import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.errorCode}>404</div>
        <h1 style={styles.title}>Trang không tìm thấy</h1>
        <p style={styles.description}>
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        
        <div style={styles.actions}>
          <Link to="/dashboard" className="btn btn-primary" style={styles.button}>
            Về Dashboard
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="btn btn-secondary"
            style={styles.button}
          >
            Quay lại
          </button>
        </div>
        
        <div style={styles.helpText}>
          <p>Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với quản trị viên.</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  content: {
    background: 'white',
    padding: '60px 40px',
    borderRadius: '15px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%'
  },
  errorCode: {
    fontSize: '120px',
    fontWeight: 'bold',
    color: '#e74c3c',
    lineHeight: '1',
    marginBottom: '20px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px'
  },
  description: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '40px'
  },
  actions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '30px'
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    textDecoration: 'none',
    display: 'inline-block',
    borderRadius: '6px',
    minWidth: '140px',
    border: 'none',
    cursor: 'pointer'
  },
  helpText: {
    fontSize: '14px',
    color: '#888',
    borderTop: '1px solid #eee',
    paddingTop: '20px'
  }
};

export default NotFoundPage;
