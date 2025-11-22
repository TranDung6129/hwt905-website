/**
 * GIAI ĐOẠN 3: DATA CARD COMPONENT
 * Chương 6: React Component, Props, useState, useEffect
 * Chuyển từ stage2 HTML/JS sang React với animation
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const DataCard = ({ type, title, unit, className }) => {
  const { sensorData, showNotification } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const data = sensorData[type];
  
  // Animation effect khi data thay đổi (chuyển từ stage2 animateValueChange)
  useEffect(() => {
    setIsUpdating(true);
    const timer = setTimeout(() => {
      setIsUpdating(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [data?.current]);

  const handleCardClick = () => {
    showNotification(`Đã click vào thẻ ${title}`, 'info');
  };

  const getTrendDisplay = (trend) => {
    const trendTexts = {
      'positive': 'Tăng',
      'negative': 'Giảm', 
      'neutral': 'Ổn định'
    };
    return trendTexts[trend] || 'Không xác định';
  };

  const getStatusDisplay = (status) => {
    const statusTexts = {
      // For totalAcceleration
      'stable': 'Ổn định',
      'medium': 'Trung bình',
      'high': 'Cao',
      // For tiltAngle  
      'normal': 'Bình thường',
      'warning': 'Cảnh báo',
      'critical': 'Nguy hiểm',
      // For vibrationIntensity
      'low': 'Thấp',
      // For structuralDisplacement
      'safe': 'An toàn',
      // For dominantFrequency
      'normal': 'Bình thường'
    };
    return statusTexts[status] || status;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'stable': 'green',
      'normal': 'green', 
      'safe': 'green',
      'low': 'green',
      'medium': 'orange',
      'warning': 'orange',
      'high': 'red',
      'critical': 'red'
    };
    return statusColors[status] || 'gray';
  };

  const getDisplayValue = (value, type) => {
    if (value === undefined || value === null) return '--';
    
    // Định dạng hiển thị theo loại thông số
    if (type === 'dominantFrequency') {
      return value.toFixed(2); // 2 chữ số thập phân cho tần số
    } else if (type === 'structuralDisplacement') {
      return value.toFixed(3); // 3 chữ số thập phân cho chuyển vị
    }
    return value.toFixed(1); // Mặc định 1 chữ số thập phân
  };

  if (!data) {
    return (
      <div className={`data-card ${className}`}>
        <div className="card-header">
          <h3>{title}</h3>
        </div>
        <div className="card-content">
          <div className="value">--</div>
          <div className="unit">{unit}</div>
        </div>
        <div className="card-footer">
          <span className="trend neutral">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`data-card ${className}`}
      onClick={handleCardClick}
    >
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      
      <div className="card-content">
        <div className={`value ${isUpdating ? 'updating' : ''}`}>
          {getDisplayValue(data.current, type)}
        </div>
        <div className="unit">{unit}</div>
      </div>
      
      <div className="card-footer">
        <div className="footer-content">
          <span className={`trend ${data.trend || 'neutral'}`}>
            Xu hướng: {getTrendDisplay(data.trend)}
          </span>
          <span className={`status status-${getStatusColor(data.status)}`}>
            {getStatusDisplay(data.status)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DataCard;
