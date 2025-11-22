/**
 * GIAI ĐOẠN 8: DASHBOARD PAGE - Real-time với WebSocket Integration
 * Kết nối với Stage 4 backend + WebSocket để hiển thị dữ liệu real-time
 */

import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useSocket, useSensorData } from '../hooks/useSocket';

// Import components
import DataCard from '../components/dashboard/DataCard';
import Chart from '../components/dashboard/Chart';
import HistoryTable from '../components/dashboard/HistoryTable';

const DashboardPage = () => {
  const { 
    latestData, 
    historicalData, 
    devices, 
    mqttStatus,
    loading, 
    error,
    refreshData,
    refreshStats 
  } = useAppContext();
  
  const { user, hasPermission, PERMISSIONS } = useAuth();
  const { isConnected: socketConnected, connectionStatus, socket } = useSocket();
  const { sensorData: realtimeData, lastUpdated } = useSensorData();
  
  const [activeTab, setActiveTab] = useState('24h');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [realTimeMode, setRealTimeMode] = useState(true);

  // Initialize dashboard on mount
  useEffect(() => {
    refreshData();
    refreshStats();
  }, [refreshData, refreshStats]);

  // Real-time data subscription effect
  useEffect(() => {
    if (socketConnected && realTimeMode && selectedDevice !== 'all') {
      socket.subscribeToDevice(selectedDevice);
      
      return () => {
        socket.unsubscribeFromDevice(selectedDevice);
      };
    } else if (socketConnected && realTimeMode && selectedDevice === 'all') {
      // Subscribe to all devices for admin
      if (hasPermission(PERMISSIONS.MANAGE_DEVICES)) {
        socket.subscribeToAllDevices();
      }
    }
  }, [socketConnected, realTimeMode, selectedDevice, socket, hasPermission, PERMISSIONS.MANAGE_DEVICES]);

  // Auto refresh effect (fallback when not in real-time mode)
  useEffect(() => {
    if (!autoRefresh || realTimeMode) return;

    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, realTimeMode, refreshData]);

  /**
   * Get display data for data cards (with real-time priority)
   */
  const getDisplayData = () => {
    // Priority 1: Real-time data (if available and recent)
    if (realTimeMode && realtimeData && realtimeData.data) {
      const data = realtimeData.data;
      return {
        temperature: data.temperature,
        humidity: data.humidity,
        timestamp: data.timestamp,
        deviceCount: devices.length,
        isRealTime: true,
        lastUpdated: lastUpdated
      };
    }

    // Priority 2: Latest API data (fallback)
    if (!latestData || Object.keys(latestData).length === 0) {
      return {
        temperature: '--',
        humidity: '--',
        timestamp: null,
        deviceCount: devices.length,
        isRealTime: false
      };
    }

    const selectedData = selectedDevice === 'all' 
      ? latestData[Object.keys(latestData)[0]] // First device
      : latestData[selectedDevice];

    if (!selectedData) {
      return {
        temperature: '--',
        humidity: '--',
        timestamp: null,
        deviceCount: devices.length,
        isRealTime: false
      };
    }

    return {
      temperature: selectedData.temperature,
      humidity: selectedData.humidity,
      timestamp: selectedData.timestamp,
      deviceCount: devices.length,
      isRealTime: false
    };
  };

  const displayData = getDisplayData();

  /**
   * Get chart data based on selected time range
   */
  const getChartData = () => {
    if (!historicalData || historicalData.length === 0) return [];
    
    const now = new Date();
    let timeLimit;
    
    switch (activeTab) {
      case '1h':
        timeLimit = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
        break;
      case '24h':
        timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
        break;
      case '7d':
        timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        break;
      default:
        timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    let filteredData = historicalData.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= timeLimit && (selectedDevice === 'all' || item.deviceId === selectedDevice);
    });

    // Sort by timestamp
    filteredData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return filteredData.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      timestamp: item.timestamp,
      temperature: item.temperature,
      humidity: item.humidity,
      deviceId: item.deviceId
    }));
  };

  /**
   * Get table data (recent entries)
   */
  const getTableData = () => {
    if (!historicalData || historicalData.length === 0) return [];
    
    let filteredData = selectedDevice === 'all' 
      ? historicalData 
      : historicalData.filter(item => item.deviceId === selectedDevice);
    
    // Sort by timestamp (newest first) and limit to 10 entries
    return filteredData
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  };

  // Loading state
  if (loading.initial) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <style>{`
        .dashboard-page {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }

        .dashboard-title {
          font-size: 28px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #7f8c8d;
        }

        .user-name {
          font-weight: 500;
          color: #2c3e50;
        }

        .user-role {
          background: #3498db;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .user-role.admin {
          background: #e74c3c;
        }

        .user-role.operator {
          background: #f39c12;
        }

        .dashboard-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .controls-left {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .controls-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .realtime-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toggle-switch {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .toggle-switch input {
          position: relative;
          width: 44px;
          height: 24px;
          appearance: none;
          background: #ccc;
          border-radius: 12px;
          outline: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .toggle-switch input:checked {
          background: #27ae60;
        }

        .toggle-switch input::before {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: left 0.2s;
        }

        .toggle-switch input:checked::before {
          left: 22px;
        }

        .toggle-label {
          font-size: 14px;
          font-weight: 500;
          color: #495057;
        }

        .device-filter {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .device-filter label {
          font-size: 14px;
          font-weight: 500;
          color: #495057;
        }

        .device-select {
          padding: 6px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          background: white;
          min-width: 140px;
        }

        .device-select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .status-indicator {
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 10px;
        }

        .status-indicator.connected {
          background: #d4edda;
          color: #155724;
        }

        .status-indicator.disconnected {
          background: #f8d7da;
          color: #721c24;
        }

        .last-update {
          color: #6c757d;
          font-size: 11px;
        }

        .refresh-button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background-color 0.2s;
        }

        .refresh-button:hover {
          background: #0056b3;
        }

        .refresh-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .data-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .chart-section {
          margin-bottom: 32px;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .chart-title {
          font-size: 20px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
        }

        .time-tabs {
          display: flex;
          gap: 8px;
        }

        .time-tab {
          padding: 8px 16px;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .time-tab.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .time-tab:hover:not(.active) {
          background: #f8f9fa;
        }

        .history-section {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 16px 0;
        }

        .error-container {
          padding: 20px;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 8px;
          color: #721c24;
          text-align: center;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #6c757d;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .mqtt-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #6c757d;
        }

        .mqtt-status.connected {
          color: #28a745;
        }

        .mqtt-status.disconnected {
          color: #dc3545;
        }

        .mqtt-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }

        @media (max-width: 768px) {
          .dashboard-page {
            padding: 16px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .dashboard-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .controls-left {
            justify-content: space-between;
          }

          .chart-header {
            flex-direction: column;
            gap: 12px;
          }

          .time-tabs {
            justify-content: center;
          }

          .data-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">IoT Sensor Dashboard</h1>
          <div className="user-info">
            <span className="user-name">{user?.username}</span>
            <span className={`user-role ${user?.role}`}>{user?.role}</span>
            <div className="mqtt-status">
              <div className="mqtt-indicator"></div>
              MQTT: {mqttStatus?.connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="dashboard-controls">
          <div className="controls-left">
            {/* Real-time Mode Toggle */}
            <div className="realtime-toggle">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={realTimeMode}
                  onChange={(e) => setRealTimeMode(e.target.checked)}
                />
                <span className="toggle-label">
                  Real-time Mode {socketConnected ? '🟢' : '🔴'}
                </span>
              </label>
            </div>

            {/* Device Filter */}
            <div className="device-filter">
              <label htmlFor="device-select">Device:</label>
              <select 
                id="device-select"
                value={selectedDevice} 
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="device-select"
              >
                <option value="all">All Devices</option>
                {devices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.name || device.deviceId} 
                    {realtimeData?.deviceId === device.deviceId ? ' 🟢' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto Refresh Toggle (only when not in real-time mode) */}
            {!realTimeMode && (
              <div className="auto-refresh">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  <span className="toggle-label">Auto Refresh</span>
                </label>
              </div>
            )}

            {/* Connection Status */}
            {realTimeMode && (
              <div className="connection-status">
                <span className={`status-indicator ${socketConnected ? 'connected' : 'disconnected'}`}>
                  {socketConnected ? 'Live' : 'Offline'}
                </span>
                {lastUpdated && (
                  <span className="last-update">
                    Last: {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="controls-right">
            <button 
              className="refresh-button" 
              onClick={refreshData}
              disabled={loading.data}
            >
              🔄 {loading.data ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-container">
          <p>⚠️ Error loading data: {error}</p>
          <button className="refresh-button" onClick={refreshData}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Data Cards */}
      <div className="data-cards">
        <DataCard
          title="Temperature"
          value={displayData.temperature}
          unit="°C"
          icon="🌡️"
          trend={displayData.isRealTime ? "Live" : "Latest"}
          timestamp={displayData.timestamp}
          isRealTime={displayData.isRealTime}
        />
        <DataCard
          title="Humidity"
          value={displayData.humidity}
          unit="%"
          icon="💧"
          trend={displayData.isRealTime ? "Live" : "Latest"}
          timestamp={displayData.timestamp}
          isRealTime={displayData.isRealTime}
        />
        <DataCard
          title="Devices Online"
          value={displayData.deviceCount}
          unit=""
          icon="📱"
          trend={`${mqttStatus?.connectedDevices || 0} connected`}
        />
        <DataCard
          title="Data Points"
          value={historicalData?.length || 0}
          unit=""
          icon="📊"
          trend={`${mqttStatus?.messagesReceived || 0} messages`}
        />
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h2 className="chart-title">Sensor Trends</h2>
          <div className="time-tabs">
            <button 
              className={`time-tab ${activeTab === '1h' ? 'active' : ''}`}
              onClick={() => setActiveTab('1h')}
            >
              1H
            </button>
            <button 
              className={`time-tab ${activeTab === '24h' ? 'active' : ''}`}
              onClick={() => setActiveTab('24h')}
            >
              24H
            </button>
            <button 
              className={`time-tab ${activeTab === '7d' ? 'active' : ''}`}
              onClick={() => setActiveTab('7d')}
            >
              7D
            </button>
          </div>
        </div>
        
        <Chart 
          data={getChartData()} 
          timeRange={activeTab}
          selectedDevice={selectedDevice}
        />
      </div>

      {/* History Table */}
      <div className="history-section">
        <h2 className="section-title">Recent Data</h2>
        <HistoryTable 
          data={getTableData()}
          showDeviceColumn={selectedDevice === 'all'}
        />
      </div>
    </div>
  );
};

export default DashboardPage;