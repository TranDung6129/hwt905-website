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
      'positive': '+0.5 so với trước',
      'negative': '-0.3 so với trước', 
      'neutral': 'Ổn định'
    };
    return trendTexts[trend] || 'Không xác định';
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
          {data.current?.toFixed(1) || '--'}
        </div>
        <div className="unit">{unit}</div>
      </div>
      
      <div className="card-footer">
        <span className={`trend ${data.trend || 'neutral'}`}>
          {getTrendDisplay(data.trend)}
        </span>
      </div>
    </div>
  );
};

export default DataCard;
