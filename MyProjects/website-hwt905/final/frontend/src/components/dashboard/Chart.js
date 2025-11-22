/**
 * CHART COMPONENT cho dữ liệu chuyển vị SHM
 * Hiển thị duy nhất dữ liệu chuyển vị cấu trúc
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

  // Format data cho Recharts - Chỉ hiển thị dữ liệu chuyển vị
  const formattedData = chartData.map(item => ({
    time: formatTime(item.time, currentTimeRange),
    structuralDisplacement: item.structuralDisplacement,
    displacementMagnitude: item.displacementMagnitude * 1000000, // Chuyển đổi sang µm để hiển thị
    disp_x: (item.disp_x || 0) * 1000000, // µm
    disp_y: (item.disp_y || 0) * 1000000, // µm
    disp_z: (item.disp_z || 0) * 1000000  // µm
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
      structuralDisplacement: 'Chuyển vị cấu trúc',
      displacementMagnitude: 'Độ lớn chuyển vị',
      disp_x: 'Chuyển vị X',
      disp_y: 'Chuyển vị Y',
      disp_z: 'Chuyển vị Z'
    };
    return names[key] || key;
  };

  const getUnit = (key) => {
    const units = {
      structuralDisplacement: ' mm',
      displacementMagnitude: ' µm',
      disp_x: ' µm',
      disp_y: ' µm',
      disp_z: ' µm'
    };
    return units[key] || '';
  };

  return (
    <section className="chart-section">
      <div className="chart-container">
        <div className="chart-header">
          <h2>Biểu đồ chuyển vị cấu trúc SHM</h2>
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
                  dataKey="structuralDisplacement" 
                  stroke="#f39c12" 
                  strokeWidth={3}
                  name="Chuyển vị cấu trúc (mm)"
                  dot={{ fill: '#f39c12', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f39c12', strokeWidth: 2 }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="displacementMagnitude" 
                  stroke="#e74c3c" 
                  strokeWidth={2}
                  name="Độ lớn chuyển vị (µm)"
                  dot={{ fill: '#e74c3c', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#e74c3c', strokeWidth: 2 }}
                  strokeDasharray="5 5"
                />
                
                <Line 
                  type="monotone" 
                  dataKey="disp_x" 
                  stroke="#3498db" 
                  strokeWidth={1.5}
                  name="Chuyển vị X (µm)"
                  dot={{ fill: '#3498db', strokeWidth: 1, r: 2 }}
                  activeDot={{ r: 4, stroke: '#3498db', strokeWidth: 2 }}
                  opacity={0.7}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="disp_y" 
                  stroke="#27ae60" 
                  strokeWidth={1.5}
                  name="Chuyển vị Y (µm)"
                  dot={{ fill: '#27ae60', strokeWidth: 1, r: 2 }}
                  activeDot={{ r: 4, stroke: '#27ae60', strokeWidth: 2 }}
                  opacity={0.7}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="disp_z" 
                  stroke="#9b59b6" 
                  strokeWidth={1.5}
                  name="Chuyển vị Z (µm)"
                  dot={{ fill: '#9b59b6', strokeWidth: 1, r: 2 }}
                  activeDot={{ r: 4, stroke: '#9b59b6', strokeWidth: 2 }}
                  opacity={0.7}
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
