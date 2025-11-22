/**
 * CHARTS PAGE - Comprehensive sensor data visualization
 * Displays all sensor parameters with filtering options
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

import { useIMUData } from '../hooks/useSocket';

const ChartsPage = () => {
  const { connectionStatus, sidebarOpen } = useApp();
  
  // Real-time MQTT data connection - ONLY REAL DATA (deviceId = hwt905 từ topic)
  const { shmData, imuData, isConnected } = useIMUData('hwt905');
  
  const [selectedProject, setSelectedProject] = useState('hwt905-monitoring');
  const [timeWindow, setTimeWindow] = useState(60); // seconds of data to show
  const [updateInterval, setUpdateInterval] = useState(100); // ms
  const [isRealTime, setIsRealTime] = useState(true);
  const [chartOptions, setChartOptions] = useState({
    logScale: false,
    autoScale: true,
    showGrid: true,
    maxDataPoints: 600 // 60 seconds * 10Hz = 600 points max
  });

  // Only one real project with HWT905 sensor  
  const projects = [
    { id: 'hwt905-monitoring', name: 'HWT905 Sensor Monitoring' }
  ];

  const timeWindows = [
    { value: 30, label: '30 giây' },
    { value: 60, label: '1 phút' },
    { value: 300, label: '5 phút' },
    { value: 600, label: '10 phút' },
    { value: 1800, label: '30 phút' }
  ];

  // HWT905 metric configurations with proper units and colors
  const metricConfigs = {
    acceleration: {
      title: 'Gia tốc (g)',
      color: '#dc3545',
      fields: [
        { key: 'acc_x', label: 'Acc X', color: '#ff0000' },
        { key: 'acc_y', label: 'Acc Y', color: '#00ff00' }, 
        { key: 'acc_z', label: 'Acc Z', color: '#0000ff' }
      ],
      yRange: [-2, 2], // g units
      unit: 'g'
    },
    gyroscope: {
      title: 'Con quay hồi chuyển (°/s)',
      color: '#fd7e14', 
      fields: [
        { key: 'gyro_x', label: 'Gyro X', color: '#ff0000' },
        { key: 'gyro_y', label: 'Gyro Y', color: '#00ff00' },
        { key: 'gyro_z', label: 'Gyro Z', color: '#0000ff' }
      ],
      yRange: [-250, 250], // degrees/sec
      unit: '°/s'
    },
    angle: {
      title: 'Góc nghiêng (°)',
      color: '#6f42c1',
      fields: [
        { key: 'angle_x', label: 'Angle X', color: '#ff0000' },
        { key: 'angle_y', label: 'Angle Y', color: '#00ff00' },
        { key: 'angle_z', label: 'Angle Z', color: '#0000ff' }
      ],
      yRange: [-180, 180], // degrees
      unit: '°'
    },
    displacement: {
      title: 'Chuyển vị (mm)',
      color: '#28a745',
      fields: [
        { key: 'disp_x', label: 'Disp X', color: '#ff0000' },
        { key: 'disp_y', label: 'Disp Y', color: '#00ff00' },
        { key: 'disp_z', label: 'Disp Z', color: '#0000ff' }
      ],
      yRange: [-1e-6, 1e-6], // mm (very small values)
      unit: 'mm'
    },
    velocity: {
      title: 'Vận tốc (mm/s)',
      color: '#007bff',
      fields: [
        { key: 'vel_x', label: 'Vel X', color: '#ff0000' },
        { key: 'vel_y', label: 'Vel Y', color: '#00ff00' },
        { key: 'vel_z', label: 'Vel Z', color: '#0000ff' }
      ],
      yRange: [-0.001, 0.001], // mm/s
      unit: 'mm/s'
    },
    frequency: {
      title: 'Tần số đặc trưng (Hz)',
      color: '#20c997',
      fields: [
        { key: 'dominant_freq_x', label: 'Freq X', color: '#ff0000' },
        { key: 'dominant_freq_y', label: 'Freq Y', color: '#00ff00' },
        { key: 'dominant_freq_z', label: 'Freq Z', color: '#0000ff' }
      ],
      yRange: [0, 5], // Hz
      unit: 'Hz'
    }
  };

  const [chartData, setChartData] = useState({});
  

  // Initialize chart data
  useEffect(() => {
    const initChartData = () => {
      const newData = {};
      
      Object.entries(metricConfigs).forEach(([metricKey, config]) => {
        const maxPoints = Math.floor(timeWindow * (1000 / updateInterval));
        
        newData[metricKey] = {
          title: config.title,
          unit: config.unit,
          yRange: config.yRange,
          datasets: config.fields.map(field => ({
            ...field,
            data: [] // Start with empty data
          }))
        };
      });
      
      setChartData(newData);
    };

    initChartData();
  }, [timeWindow, updateInterval]);


  // ONLY REAL MQTT data processing - NO SIMULATION
  useEffect(() => {
    if (!isRealTime || !isConnected) return;

    console.log('MQTT Data received:', { 
      isConnected, 
      imuKeys: imuData ? Object.keys(imuData) : [], 
      shmKeys: shmData ? Object.keys(shmData) : [] 
    });

    // Only process when we have actual MQTT data
    if (imuData || shmData) {
      setChartData(prevData => {
        const newData = { ...prevData };
        const now = Date.now();
        const maxPoints = Math.floor(timeWindow * (1000 / updateInterval));

        // Real HWT905 data from MQTT
        const realData = {
          acceleration: {
            acc_x: imuData?.acc_x || 0,
            acc_y: imuData?.acc_y || 0, 
            acc_z: imuData?.acc_z || 0
          },
          gyroscope: {
            gyro_x: imuData?.gyro_x || 0,
            gyro_y: imuData?.gyro_y || 0,
            gyro_z: imuData?.gyro_z || 0
          },
          angle: {
            angle_x: imuData?.angle_x || 0,
            angle_y: imuData?.angle_y || 0,
            angle_z: imuData?.angle_z || 0
          },
          displacement: {
            disp_x: shmData?.disp_x || 0,
            disp_y: shmData?.disp_y || 0,
            disp_z: shmData?.disp_z || 0
          },
          velocity: {
            vel_x: shmData?.vel_x || 0,
            vel_y: shmData?.vel_y || 0,
            vel_z: shmData?.vel_z || 0
          },
          frequency: {
            dominant_freq_x: shmData?.dominant_freq_x || 0,
            dominant_freq_y: shmData?.dominant_freq_y || 0,
            dominant_freq_z: shmData?.dominant_freq_z || 0
          }
        };

        Object.entries(metricConfigs).forEach(([metricKey, config]) => {
          if (newData[metricKey]) {
            newData[metricKey] = {
              ...newData[metricKey],
              datasets: config.fields.map((field, index) => {
                const existingData = prevData[metricKey]?.datasets[index]?.data || [];
                
                // Use ONLY real MQTT data
                const realValue = realData[metricKey]?.[field.key] || 0;
                
                const newPoint = { x: now, y: realValue };
                const updatedData = [...existingData, newPoint];
                const trimmedData = updatedData.slice(-maxPoints);
                
                return {
                  ...field,
                  data: trimmedData
                };
              })
            };
          }
        });

        return newData;
      });
    }
  }, [imuData, shmData, isRealTime, isConnected, updateInterval, timeWindow]);

  // Debug: Real MQTT connection status
  useEffect(() => {
    console.log('MQTT Connection Status:', {
      isConnected,
      isRealTime,
      hasIMUData: !!imuData,
      hasSHMData: !!shmData,
      timestamp: new Date().toISOString()
    });
  }, [isConnected, isRealTime, imuData, shmData]);

  const handleChartOptionChange = (option, value) => {
    setChartOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const exportData = () => {
    const dataToExport = {};
    Object.entries(chartData).forEach(([metric, data]) => {
      dataToExport[metric] = data.datasets.map(dataset => ({
        label: dataset.label,
        data: dataset.data.map(point => ({
          timestamp: new Date(point.x).toISOString(),
          value: point.y
        }))
      }));
    });
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hwt905-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    setChartData(prev => {
      const newData = { ...prev };
      Object.keys(newData).forEach(metric => {
        newData[metric] = {
          ...newData[metric],
          datasets: newData[metric].datasets.map(dataset => ({
            ...dataset,
            data: []
          }))
        };
      });
      return newData;
    });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="layout-container">
        <Sidebar />
        
        <main className={`main-content ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
          <div className="charts-page">
            {/* Page Header */}
            <div className="page-header">
              <h1>Real-time HWT905 Sensor Data</h1>
              <p>6-DOF IMU với độ phân giải cao và cập nhật real-time</p>
              <div className="data-source-info">
                <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                  <div className="badge-dot"></div>
                  <span>
                    {isConnected ? 'MQTT Connected - Real Data' : 'MQTT Disconnected - Waiting for Data'}
                  </span>
                </div>
                {!isConnected && (
                  <small className="simulation-note">
                    * No data will be displayed until MQTT connection is established.
                  </small>
                )}
              </div>
            </div>

            {/* Advanced Controls */}
            <div className="charts-controls">
              <div className="control-row">
                <div className="control-group">
                  <label>Dự án:</label>
                  <select 
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="form-select"
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label>Cửa sổ thời gian:</label>
                  <select 
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(parseInt(e.target.value))}
                    className="form-select"
                  >
                    {timeWindows.map(window => (
                      <option key={window.value} value={window.value}>
                        {window.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label>Tần suất cập nhật (ms):</label>
                  <select 
                    value={updateInterval}
                    onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
                    className="form-select"
                  >
                    <option value={50}>50ms (20Hz)</option>
                    <option value={100}>100ms (10Hz)</option>
                    <option value={200}>200ms (5Hz)</option>
                    <option value={500}>500ms (2Hz)</option>
                  </select>
                </div>
              </div>

              <div className="control-row">
                <div className="control-group chart-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isRealTime}
                      onChange={(e) => setIsRealTime(e.target.checked)}
                    />
                    <span>Real-time</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={chartOptions.logScale}
                      onChange={(e) => handleChartOptionChange('logScale', e.target.checked)}
                    />
                    <span>Log Scale</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={chartOptions.autoScale}
                      onChange={(e) => handleChartOptionChange('autoScale', e.target.checked)}
                    />
                    <span>Auto Scale</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={chartOptions.showGrid}
                      onChange={(e) => handleChartOptionChange('showGrid', e.target.checked)}
                    />
                    <span>Grid</span>
                  </label>
                </div>

                <div className="control-actions">
                  <button className="btn btn-secondary btn-sm" onClick={clearData}>
                    Clear
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={exportData}>
                    Export
                  </button>
                  <div className="debug-info">
                    <small>MQTT Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</small>
                    {isConnected && (imuData || shmData) && (
                      <small className="data-indicator">📊 Receiving Data</small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Charts Grid - 6 Charts for HWT905 */}
            <div className="realtime-charts-grid">
              {Object.entries(metricConfigs).map(([metricKey, config]) => {
                const data = chartData[metricKey];
                if (!data) return null;

                return (
                  <div key={metricKey} className="realtime-chart-container">
                    <div className="chart-header">
                      <h3>{config.title}</h3>
                      <div className="chart-status">
                        {isRealTime && (
                          <div className="live-indicator">
                            <div className="live-dot"></div>
                            <span>LIVE</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="chart-legend">
                      {config.fields.map((field, index) => (
                        <div key={field.key} className="legend-item">
                          <div 
                            className="legend-color"
                            style={{ backgroundColor: field.color }}
                          />
                          <span>{field.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="chart-content">
                      <div className="chart-canvas">
                        <svg viewBox="0 0 820 220" className="chart-svg">
                          {/* Grid lines */}
                          {chartOptions.showGrid && (
                            <g className="grid">
                              {/* Vertical grid lines - aligned with time ticks */}
                              {Array.from({ length: 6 }, (_, i) => (
                                <line
                                  key={`v-${i}`}
                                  x1={65 + i * 145}
                                  y1="25"
                                  x2={65 + i * 145}
                                  y2="175"
                                  stroke="#e0e0e0"
                                  strokeWidth="0.5"
                                />
                              ))}
                              {/* Horizontal grid lines - within plot area */}
                              {Array.from({ length: 5 }, (_, i) => (
                                <line
                                  key={`h-${i}`}
                                  x1="65"
                                  y1={25 + i * 37.5}
                                  x2="790"
                                  y2={25 + i * 37.5}
                                  stroke="#e0e0e0"
                                  strokeWidth="0.5"
                                />
                              ))}
                            </g>
                          )}

                          {/* Data lines */}
                          {data.datasets.map((dataset, index) => {
                            if (!dataset.data || dataset.data.length < 2) return null;
                            
                            const points = dataset.data.map((point, i) => {
                              // Adjust plot area: x from 65 to 790, y from 25 to 175
                              const x = 65 + (i / (dataset.data.length - 1)) * 725;
                              let y;
                              
                              if (chartOptions.autoScale && dataset.data.length > 0) {
                                const allValues = data.datasets.flatMap(ds => ds.data.map(p => p.y));
                                if (allValues.length > 0) {
                                  const minVal = Math.min(...allValues);
                                  const maxVal = Math.max(...allValues);
                                  const range = Math.abs(maxVal - minVal) || 1e-10;
                                  y = 175 - ((point.y - minVal) / range) * 150;
                                } else {
                                  y = 100; // Center if no data
                                }
                              } else {
                                const [yMin, yMax] = config.yRange;
                                const range = yMax - yMin;
                                y = 175 - ((point.y - yMin) / range) * 150;
                              }
                              
                              if (chartOptions.logScale && point.y !== 0) {
                                const logVal = Math.log10(Math.abs(point.y) + 1e-10);
                                y = 175 - ((logVal + 10) / 20) * 150; // Normalize log scale
                              }
                              
                              // Clamp y values to plot area
                              y = Math.max(25, Math.min(175, y));
                              
                              return `${x},${y}`;
                            }).join(' ');

                            return (
                              <polyline
                                key={index}
                                points={points}
                                fill="none"
                                stroke={dataset.color}
                                strokeWidth="2"
                                strokeOpacity="0.8"
                              />
                            );
                          })}

                          {/* Y-axis with multiple labels */}
                          <g className="y-axis-labels">
                            {/* Y-axis line */}
                            <line x1="65" y1="20" x2="65" y2="180" stroke="#333" strokeWidth="1"/>
                            
                            {/* Y-axis tick marks and labels */}
                            {Array.from({ length: 5 }, (_, i) => {
                              let yValue, yPos = 20 + i * 40;
                              
                              if (chartOptions.autoScale && data.datasets.length > 0) {
                                const allValues = data.datasets.flatMap(ds => ds.data.map(p => p.y));
                                if (allValues.length > 0) {
                                  const minVal = Math.min(...allValues);
                                  const maxVal = Math.max(...allValues);
                                  yValue = maxVal - (i / 4) * (maxVal - minVal);
                                } else {
                                  yValue = config.yRange[1] - (i / 4) * (config.yRange[1] - config.yRange[0]);
                                }
                              } else {
                                yValue = config.yRange[1] - (i / 4) * (config.yRange[1] - config.yRange[0]);
                              }
                              
                              return (
                                <g key={i}>
                                  <line x1="60" y1={yPos} x2="65" y2={yPos} stroke="#333" strokeWidth="1"/>
                                  <text x="58" y={yPos + 3} fontSize="8" fill="#666" textAnchor="end">
                                    {Math.abs(yValue) < 0.001 ? yValue.toExponential(1) : yValue.toFixed(4)}
                                  </text>
                                </g>
                              );
                            })}
                            
                            {/* Unit label - Moved to TOP of Y-axis to avoid overlap */}
                            <text x="65" y="15" fontSize="9" fill="#333" textAnchor="middle" fontWeight="bold">
                              {config.unit}
                            </text>
                          </g>

                          {/* X-axis with time labels */}
                          <g className="x-axis-labels">
                            {/* X-axis line */}
                            <line x1="65" y1="180" x2="790" y2="180" stroke="#333" strokeWidth="1"/>
                            
                            {/* Time tick marks */}
                            {Array.from({ length: 6 }, (_, i) => {
                              const xPos = 65 + (i * 145);
                              const timeOffset = (timeWindow * 1000) * (i / 5);
                              const timeStr = new Date(Date.now() - timeWindow * 1000 + timeOffset).toLocaleTimeString('vi-VN', {
                                hour12: false,
                                minute: '2-digit',
                                second: '2-digit'
                              });
                              
                              return (
                                <g key={i}>
                                  <line x1={xPos} y1="180" x2={xPos} y2="185" stroke="#333" strokeWidth="1"/>
                                  <text x={xPos} y="196" fontSize="8" fill="#666" textAnchor="middle">
                                    {timeStr}
                                  </text>
                                </g>
                              );
                            })}
                            
                            <text x="427" y="210" fontSize="10" fill="#333" textAnchor="middle">
                              Time
                            </text>
                          </g>

                          {/* Current values with better formatting */}
                          <g className="current-values">
                            <rect x="590" y="10" width="190" height={data.datasets.length * 18 + 10} 
                                  fill="white" fillOpacity="0.9" stroke="#ddd" strokeWidth="1" rx="4"/>
                            <text x="600" y="25" fontSize="10" fill="#333" fontWeight="bold">Current Values:</text>
                            
                            {data.datasets.map((dataset, index) => {
                              const lastPoint = dataset.data[dataset.data.length - 1];
                              if (!lastPoint) return null;
                              
                              const formattedValue = Math.abs(lastPoint.y) < 0.001 
                                ? lastPoint.y.toExponential(3)
                                : lastPoint.y.toFixed(6);
                              
                              return (
                                <g key={index}>
                                  <circle cx="605" cy={40 + index * 18} r="4" fill={dataset.color}/>
                                  <text 
                                    x="615" 
                                    y={44 + index * 18}
                                    fontSize="9" 
                                    fill="#333"
                                  >
                                    {dataset.label}: {formattedValue}
                                  </text>
                                </g>
                              );
                            })}
                          </g>

                          {/* Connection Status Indicator */}
                          <g className="connection-status">
                            <circle 
                              cx="750" 
                              cy="30" 
                              r="6" 
                              fill={isConnected ? '#28a745' : '#dc3545'}
                            />
                            <text x="765" y="34" fontSize="10" fill="#333">
                              {isConnected ? 'MQTT' : 'SIM'}
                            </text>
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connection Status */}
            <div className="page-footer">
              <div className="connection-info">
                <div className={`status-dot ${connectionStatus}`} />
                <span>
                  Kết nối real-time: {connectionStatus === 'online' ? 'Hoạt động' : 'Mất kết nối'}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChartsPage;
