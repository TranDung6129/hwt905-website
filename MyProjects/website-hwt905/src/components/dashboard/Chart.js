/**
 * GIAI ĐOẠN 5: CHART COMPONENT với REAL API DATA
 * Chương 6: React với Recharts và API Integration
 * 
 * Component này hiển thị biểu đồ từ dữ liệu thật thay vì mock
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { LoadingSpinnerCSS } from '../common/LoadingSpinner';

const Chart = () => {
  const {
    chartData,
    loading,
    backendStatus,
    devices,
    fetchChartData,
    setChartPeriod,
    addNotification,
    errors
  } = useAppContext();

  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [autoRefresh, setAutoRefresh] = useState(true);

  /**
   * Fetch chart data when period or device changes
   */
  useEffect(() => {
    if (backendStatus.available) {
      fetchChartData(selectedPeriod, devices.selected);
    }
  }, [selectedPeriod, devices.selected, backendStatus.available, fetchChartData]);

  /**
   * Auto refresh every 2 minutes
   */
  useEffect(() => {
    if (!autoRefresh || !backendStatus.available) return;

    const interval = setInterval(() => {
      if (!loading.chart) {
        fetchChartData(selectedPeriod, devices.selected);
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, selectedPeriod, devices.selected, backendStatus.available, loading.chart, fetchChartData]);

  /**
   * Handle period change
   */
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setChartPeriod(period);
    
    addNotification({
      type: 'info',
      title: 'Biểu đồ cập nhật',
      message: `Đang hiển thị dữ liệu ${period === '24h' ? '24 giờ' : '7 ngày'} gần nhất`
    });
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = () => {
    fetchChartData(selectedPeriod, devices.selected);
    addNotification({
      type: 'info',
      title: 'Làm mới biểu đồ',
      message: 'Đang tải dữ liệu mới nhất...'
    });
  };

  /**
   * Get current chart data based on selected period
   */
  const getCurrentData = () => {
    if (selectedPeriod === '24h') {
      return chartData.data24h || [];
    } else {
      return chartData.data7d || [];
    }
  };

  /**
   * Format tooltip content
   */
  const formatTooltip = (value, name, props) => {
    const { payload } = props;
    if (!payload) return [value, name];

    const formatValue = (val, unit) => {
      if (val === null || val === undefined) return 'N/A';
      return `${typeof val === 'number' ? val.toFixed(1) : val}${unit}`;
    };

    switch (name) {
      case 'temperature':
        return [formatValue(value, '°C'), 'Nhiệt độ'];
      case 'humidity':
        return [formatValue(value, '%'), 'Độ ẩm'];
      case 'pressure':
        return [formatValue(value, ' hPa'), 'Áp suất'];
      case 'light':
        return [formatValue(value, ' lux'), 'Ánh sáng'];
      default:
        return [value, name];
    }
  };

  /**
   * Format X-axis label
   */
  const formatXAxisLabel = (tickItem) => {
    if (selectedPeriod === '24h') {
      return tickItem; // Already formatted as HH:MM in API
    } else {
      return tickItem; // Already formatted as DD/MM HH in API
    }
  };

  /**
   * Get chart configuration based on selected metric
   */
  const getChartConfig = () => {
    const configs = {
      temperature: {
        color: '#ff6b6b',
        unit: '°C',
        name: 'Nhiệt độ'
      },
      humidity: {
        color: '#4ecdc4',
        unit: '%',
        name: 'Độ ẩm'
      },
      pressure: {
        color: '#45b7d1',
        unit: 'hPa',
        name: 'Áp suất'
      },
      light: {
        color: '#f9ca24',
        unit: 'lux',
        name: 'Ánh sáng'
      }
    };

    return configs[selectedMetric] || configs.temperature;
  };

  const currentData = getCurrentData();
  const chartConfig = getChartConfig();
  const isLoading = loading.chart || loading.general;
  const hasError = errors.api || errors.connection;
  const hasData = currentData && currentData.length > 0;

  // Fallback data message
  const getEmptyMessage = () => {
    if (!backendStatus.available) {
      return 'Backend không khả dụ - không thể tải dữ liệu biểu đồ';
    }
    if (hasError) {
      return `Lỗi tải dữ liệu: ${hasError.message}`;
    }
    if (!hasData && !isLoading) {
      return 'Không có dữ liệu để hiển thị biểu đồ';
    }
    return 'Đang tải dữ liệu...';
  };

  return (
    <div className="chart-container">
      <style>{`
        .chart-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px;
          margin-bottom: 20px;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .chart-title {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
        }

        .chart-controls {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .period-buttons {
          display: flex;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .period-button {
          padding: 6px 12px;
          border: none;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          border-right: 1px solid #ddd;
        }

        .period-button:last-child {
          border-right: none;
        }

        .period-button.active {
          background: #3498db;
          color: white;
        }

        .period-button:hover:not(.active) {
          background: #f8f9fa;
        }

        .metric-select, .device-select {
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .refresh-button {
          padding: 6px 12px;
          border: 1px solid #3498db;
          background: white;
          color: #3498db;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .refresh-button:hover {
          background: #3498db;
          color: white;
        }

        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chart-status {
          margin-bottom: 10px;
          font-size: 13px;
          color: #666;
        }

        .status-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 6px;
        }

        .status-indicator.connected {
          background: #27ae60;
        }

        .status-indicator.disconnected {
          background: #e74c3c;
        }

        .chart-content {
          position: relative;
          height: 300px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #666;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 10px;
          opacity: 0.3;
        }

        .auto-refresh-toggle {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          color: #666;
        }

        @media (max-width: 768px) {
          .chart-header {
            flex-direction: column;
            align-items: stretch;
          }

          .chart-controls {
            justify-content: center;
          }

          .control-group {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>

      {/* Header */}
      <div className="chart-header">
        <h3 className="chart-title">
          Biểu đồ cảm biến - {chartConfig.name}
        </h3>
        
        <div className="chart-controls">
          {/* Period Selection */}
          <div className="control-group">
            <span className="control-label">Thời gian:</span>
            <div className="period-buttons">
              <button
                className={`period-button ${selectedPeriod === '24h' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('24h')}
                disabled={isLoading}
              >
                24 giờ
              </button>
              <button
                className={`period-button ${selectedPeriod === '7d' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('7d')}
                disabled={isLoading}
              >
                7 ngày
              </button>
            </div>
          </div>

          {/* Metric Selection */}
          <div className="control-group">
            <span className="control-label">Thông số:</span>
            <select
              className="metric-select"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              disabled={isLoading}
            >
              <option value="temperature">Nhiệt độ (°C)</option>
              <option value="humidity">Độ ẩm (%)</option>
              <option value="pressure">Áp suất (hPa)</option>
              <option value="light">Ánh sáng (lux)</option>
            </select>
          </div>

          {/* Device Selection */}
          {devices.list.length > 1 && (
            <div className="control-group">
              <span className="control-label">Thiết bị:</span>
              <select
                className="device-select"
                value={devices.selected || 'all'}
                onChange={(e) => {
                  const deviceId = e.target.value === 'all' ? null : e.target.value;
                  // This would trigger useEffect to refetch data
                }}
                disabled={isLoading}
              >
                <option value="all">Tất cả thiết bị</option>
                {devices.list.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.deviceId}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Refresh Button */}
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="chart-status">
        <span className={`status-indicator ${backendStatus.available ? 'connected' : 'disconnected'}`}></span>
        Backend: {backendStatus.available ? 'Đã kết nối' : 'Không khả dụng'} |
        Dữ liệu cuối: {chartData.lastUpdate ? 
          new Date(chartData.lastUpdate).toLocaleTimeString('vi-VN') : 'Chưa có'} |
        Số điểm dữ liệu: {currentData.length}
      </div>

      {/* Auto-refresh toggle */}
      <div className="auto-refresh-toggle">
        <input
          type="checkbox"
          id="auto-refresh"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
        />
        <label htmlFor="auto-refresh">Tự động làm mới (2 phút)</label>
      </div>

      {/* Chart Content */}
      <div className="chart-content">
        {isLoading && (
          <LoadingSpinnerCSS 
            overlay={true}
            message="Đang tải dữ liệu biểu đồ..."
          />
        )}

        {!isLoading && !hasData && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>{getEmptyMessage()}</p>
            {hasError && (
              <button
                className="refresh-button"
                onClick={handleRefresh}
                style={{ marginTop: '10px' }}
              >
                Thử lại
              </button>
            )}
          </div>
        )}

        {!isLoading && hasData && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time"
                tick={{ fontSize: 12 }}
                tickFormatter={formatXAxisLabel}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: chartConfig.unit, 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelStyle={{ color: '#2c3e50' }}
                contentStyle={{ 
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke={chartConfig.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name={chartConfig.name}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Chart;
