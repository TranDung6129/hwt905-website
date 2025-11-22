/**
 * GIAI ĐOẠN 5: DATA CARD COMPONENT với REAL API DATA
 * Chương 6: React Component với API Integration
 * 
 * Component này hiển thị sensor cards từ dữ liệu thật
 */

import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { LoadingSpinnerCSS } from '../common/LoadingSpinner';

const DataCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  color = '#3498db',
  type = 'temperature',
  showTrend = true 
}) => {
  const {
    sensorData,
    statistics,
    loading,
    backendStatus,
    fetchLatestSensorData,
    fetchStatistics
  } = useAppContext();

  const [trend, setTrend] = useState({ direction: 'stable', percentage: 0 });
  const [previousValue, setPreviousValue] = useState(null);

  /**
   * Get current value from latest sensor data or props
   */
  const getCurrentValue = () => {
    if (value !== undefined) return value; // Use prop value if provided
    
    if (sensorData.latest) {
      switch (type) {
        case 'temperature':
          return sensorData.latest.temperature;
        case 'humidity':
          return sensorData.latest.humidity;
        case 'pressure':
          return sensorData.latest.pressure;
        case 'light':
          return sensorData.latest.light;
        case 'battery':
          return sensorData.latest.batteryLevel;
        default:
          return 0;
      }
    }
    return null;
  };

  /**
   * Get statistics for the card type
   */
  const getStats = () => {
    if (statistics && statistics[type]) {
      return statistics[type];
    }
    return { avg: 0, min: 0, max: 0 };
  };

  /**
   * Calculate trend based on current vs average
   */
  useEffect(() => {
    const currentVal = getCurrentValue();
    const stats = getStats();

    if (currentVal !== null && stats.avg > 0) {
      if (previousValue !== null) {
        const change = ((currentVal - previousValue) / previousValue) * 100;
        setTrend({
          direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
          percentage: Math.abs(change)
        });
      }
      setPreviousValue(currentVal);
    }
  }, [sensorData.latest, previousValue]);

  /**
   * Format value display
   */
  const formatValue = (val) => {
    if (val === null || val === undefined) return '--';
    
    if (typeof val === 'number') {
      // Different precision for different types
      switch (type) {
        case 'temperature':
        case 'humidity':
          return val.toFixed(1);
        case 'pressure':
          return val.toFixed(0);
        case 'light':
          return Math.round(val);
        case 'battery':
          return Math.round(val);
        default:
          return val.toFixed(1);
      }
    }
    return val.toString();
  };

  /**
   * Get status color based on value ranges
   */
  const getStatusColor = (val) => {
    if (val === null || val === undefined) return '#95a5a6';

    switch (type) {
      case 'temperature':
        if (val < 15 || val > 35) return '#e74c3c'; // Danger
        if (val < 18 || val > 30) return '#f39c12'; // Warning
        return '#27ae60'; // Good
      
      case 'humidity':
        if (val < 30 || val > 80) return '#e74c3c';
        if (val < 40 || val > 70) return '#f39c12';
        return '#27ae60';
      
      case 'battery':
        if (val < 20) return '#e74c3c';
        if (val < 40) return '#f39c12';
        return '#27ae60';
      
      default:
        return color;
    }
  };

  /**
   * Get trend icon
   */
  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '➡️';
    }
  };

  const currentValue = getCurrentValue();
  const stats = getStats();
  const statusColor = getStatusColor(currentValue);
  const isLoading = loading.sensor || loading.general;
  const isStale = sensorData.isStale;
  const lastUpdate = sensorData.lastUpdate;

  return (
    <div className="data-card" style={{ borderLeft: `4px solid ${statusColor}` }}>
      <style>{`
        .data-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
          min-height: 140px;
        }

        .data-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .data-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .data-card-title {
          color: #2c3e50;
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }

        .data-card-icon {
          font-size: 24px;
          opacity: 0.7;
        }

        .data-card-value {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 10px;
        }

        .value-number {
          font-size: 28px;
          font-weight: 700;
          color: #2c3e50;
          line-height: 1;
        }

        .value-unit {
          font-size: 16px;
          color: #7f8c8d;
          font-weight: 500;
        }

        .data-card-stats {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #7f8c8d;
          margin-bottom: 10px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stat-label {
          font-weight: 600;
        }

        .stat-value {
          color: #34495e;
        }

        .data-card-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #7f8c8d;
        }

        .trend-indicator {
          font-size: 14px;
        }

        .data-card-footer {
          position: absolute;
          bottom: 8px;
          right: 12px;
          font-size: 10px;
          color: #bdc3c7;
        }

        .status-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #27ae60;
        }

        .status-badge.stale {
          background: #f39c12;
        }

        .status-badge.error {
          background: #e74c3c;
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #e74c3c;
          text-align: center;
        }

        .error-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        @media (max-width: 768px) {
          .data-card {
            padding: 16px;
            min-height: 120px;
          }

          .value-number {
            font-size: 24px;
          }

          .value-unit {
            font-size: 14px;
          }
        }
      `}</style>

      {/* Status indicator */}
      <div className={`status-badge ${isStale ? 'stale' : !backendStatus.available ? 'error' : ''}`}></div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <LoadingSpinnerCSS size="small" />
        </div>
      )}

      {/* Error state */}
      {!isLoading && !backendStatus.available && currentValue === null && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <div>Không có dữ liệu</div>
        </div>
      )}

      {/* Normal content */}
      {(!isLoading && (backendStatus.available || currentValue !== null)) && (
        <>
          {/* Header */}
          <div className="data-card-header">
            <h4 className="data-card-title">{title}</h4>
            <span className="data-card-icon">{icon}</span>
          </div>

          {/* Main value */}
          <div className="data-card-value">
            <span className="value-number">{formatValue(currentValue)}</span>
            <span className="value-unit">{unit}</span>
          </div>

          {/* Statistics */}
          {backendStatus.available && stats.avg > 0 && (
            <div className="data-card-stats">
              <div className="stat-item">
                <span className="stat-label">Min</span>
                <span className="stat-value">{formatValue(stats.min)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg</span>
                <span className="stat-value">{formatValue(stats.avg)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Max</span>
                <span className="stat-value">{formatValue(stats.max)}</span>
              </div>
            </div>
          )}

          {/* Trend */}
          {showTrend && trend.percentage > 0 && (
            <div className="data-card-trend">
              <span className="trend-indicator">{getTrendIcon()}</span>
              <span>{trend.percentage.toFixed(1)}% vs trước đó</span>
            </div>
          )}

          {/* Footer timestamp */}
          <div className="data-card-footer">
            {lastUpdate ? (
              <>Cập nhật: {new Date(lastUpdate).toLocaleTimeString('vi-VN')}</>
            ) : (
              <>Chưa có dữ liệu</>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Predefined card configurations
export const TemperatureCard = (props) => (
  <DataCard
    title="Nhiệt độ"
    unit="°C"
    icon="🌡️"
    color="#e74c3c"
    type="temperature"
    {...props}
  />
);

export const HumidityCard = (props) => (
  <DataCard
    title="Độ ẩm"
    unit="%"
    icon="💧"
    color="#3498db"
    type="humidity"
    {...props}
  />
);

export const PressureCard = (props) => (
  <DataCard
    title="Áp suất"
    unit="hPa"
    icon="🌬️"
    color="#9b59b6"
    type="pressure"
    {...props}
  />
);

export const LightCard = (props) => (
  <DataCard
    title="Ánh sáng"
    unit="lux"
    icon="☀️"
    color="#f39c12"
    type="light"
    {...props}
  />
);

export const BatteryCard = (props) => (
  <DataCard
    title="Pin"
    unit="%"
    icon="🔋"
    color="#27ae60"
    type="battery"
    {...props}
  />
);

export default DataCard;
