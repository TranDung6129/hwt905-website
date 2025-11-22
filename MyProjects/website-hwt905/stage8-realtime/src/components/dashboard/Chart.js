/**
 * GIAI ĐOẠN 3: CHART COMPONENT với Recharts
 * Chương 6: React Component, useEffect, Props
 * Thay thế chart placeholder trong stage2 bằng thư viện thật
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useApp } from '../../context/AppContext';

const Chart = () => {
  const { 
    chartData, 
    currentTimeRange, 
    setTimeRange, 
    generateChartData 
  } = useApp();
  const [loading, setLoading] = useState(false);

  // Generate initial chart data
  useEffect(() => {
    generateChartData(currentTimeRange);
  }, []);

  const handleTimeRangeChange = async (e) => {
    const newRange = e.target.value;
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setTimeRange(newRange);
      setLoading(false);
    }, 1000);
  };

  // Format data cho Recharts
  const formattedData = chartData.map(item => ({
    time: formatTime(item.time, currentTimeRange),
    temperature: item.temperature,
    humidity: item.humidity,
    pressure: item.pressure,
    light: item.light
  }));

  function formatTime(date, range) {
    if (!date) return '';
    
    const d = new Date(date);
    
    if (range === '24h') {
      return d.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (range === '7d') {
      return d.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    } else {
      return d.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '5px',
          padding: '10px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '5px' }}>
            {`Thời gian: ${label}`}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
              {`${getMetricName(entry.dataKey)}: ${entry.value}${getUnit(entry.dataKey)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getMetricName = (key) => {
    const names = {
      temperature: 'Nhiệt độ',
      humidity: 'Độ ẩm',
      pressure: 'Áp suất',
      light: 'Ánh sáng'
    };
    return names[key] || key;
  };

  const getUnit = (key) => {
    const units = {
      temperature: '°C',
      humidity: '%',
      pressure: ' hPa',
      light: ' lux'
    };
    return units[key] || '';
  };

  return (
    <section className="chart-section">
      <div className="chart-container">
        <div className="chart-header">
          <h2>Biểu đồ theo dõi thời gian thực</h2>
          <div className="chart-controls">
            <select 
              className="time-range"
              value={currentTimeRange}
              onChange={handleTimeRangeChange}
              disabled={loading}
            >
              <option value="24h">24 giờ</option>
              <option value="7d">7 ngày</option>
              <option value="30d">30 ngày</option>
            </select>
            <button className="btn btn-secondary">
              Xuất dữ liệu
            </button>
          </div>
        </div>

        <div className="chart-content">
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '300px'
            }}>
              <div className="loading-overlay">
                <div className="spinner"></div>
                <span>Đang tải biểu đồ...</span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="time" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#e74c3c" 
                  strokeWidth={2}
                  name="Nhiệt độ (°C)"
                  dot={{ fill: '#e74c3c', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#e74c3c', strokeWidth: 2 }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3498db" 
                  strokeWidth={2}
                  name="Độ ẩm (%)"
                  dot={{ fill: '#3498db', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#3498db', strokeWidth: 2 }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="pressure" 
                  stroke="#9b59b6" 
                  strokeWidth={2}
                  name="Áp suất (hPa)"
                  dot={{ fill: '#9b59b6', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#9b59b6', strokeWidth: 2 }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="light" 
                  stroke="#f39c12" 
                  strokeWidth={2}
                  name="Ánh sáng (lux)"
                  dot={{ fill: '#f39c12', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#f39c12', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
};

export default Chart;
