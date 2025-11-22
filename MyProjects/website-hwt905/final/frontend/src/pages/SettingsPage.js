/**
 * SETTINGS PAGE - System and user settings
 * Configuration for thresholds, notifications, and user preferences
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useIMUData } from '../hooks/useSocket';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

const SettingsPage = () => {
  const { showNotification, sidebarOpen } = useApp();
  const { shmData, imuData, isConnected } = useIMUData('hwt905');
  const [lastPacketTime, setLastPacketTime] = useState(null);
  const [packetCount, setPacketCount] = useState(0);

  useEffect(() => {
    if (imuData || shmData) {
      setLastPacketTime(new Date());
      setPacketCount(prev => prev + 1);
    }
  }, [imuData, shmData]);
  
  const [settings, setSettings] = useState({
    // Alert Thresholds
    thresholds: {
      acceleration: {
        warning: 5.0,
        critical: 15.0
      },
      displacement: {
        warning: 20.0,
        critical: 40.0
      },
      velocity: {
        warning: 40.0,
        critical: 80.0
      },
      frequency: {
        warning: 5.0,
        critical: 20.0
      }
    },
    
    // Notification Settings
    notifications: {
      email: true,
      realtime: true,
      dailyReport: false,
      weeklyReport: true
    },
    
    // Data Settings
    dataCollection: {
      samplingRate: 100, // Hz
      autoBackup: true,
      retentionPeriod: 365, // days
      compression: true
    },
    
    // Display Settings
    display: {
      theme: 'light',
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      chartRefreshRate: 5 // seconds
    },
    
    // System Settings
    system: {
      enableApi: true,
      enableExport: true,
      maxConcurrentUsers: 10,
      sessionTimeout: 480 // minutes
    }
  });

  const [activeTab, setActiveTab] = useState('thresholds');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const tabs = [
    { id: 'thresholds', label: 'Ngưỡng cảnh báo' },
    { id: 'notifications', label: 'Thông báo' },
    { id: 'data', label: 'Thu thập dữ liệu' },
    { id: 'display', label: 'Hiển thị' },
    { id: 'system', label: 'Hệ thống' },
    { id: 'mqtt', label: 'MQTT Debug' }
  ];

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const handleNestedSettingChange = (section, subsection, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [key]: value
        }
      }
    }));
    setUnsavedChanges(true);
  };

  const saveSettings = () => {
    // Simulate API call to save settings
    console.log('Saving settings:', settings);
    
    setTimeout(() => {
      setUnsavedChanges(false);
      showNotification('Cài đặt đã được lưu', 'success');
    }, 500);
  };

  const resetSettings = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục cài đặt mặc định?')) {
      // Reset to default values
      window.location.reload();
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'settings-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Cài đặt đã được xuất', 'success');
  };

  const renderThresholdsTab = () => (
    <div className="settings-section">
      <h3>Ngưỡng cảnh báo</h3>
      <p>Thiết lập các giá trị ngưỡng để kích hoạt cảnh báo tự động</p>
      
      {Object.entries(settings.thresholds).map(([metric, values]) => (
        <div key={metric} className="threshold-group">
          <h4>{
            metric === 'acceleration' ? 'Gia tốc (m/s²)' :
            metric === 'displacement' ? 'Chuyển vị (mm)' :
            metric === 'velocity' ? 'Vận tốc (mm/s)' :
            'Tần số (Hz)'
          }</h4>
          
          <div className="threshold-inputs">
            <div className="input-group">
              <label>Cảnh báo:</label>
              <input
                type="number"
                value={values.warning}
                onChange={(e) => handleNestedSettingChange('thresholds', metric, 'warning', parseFloat(e.target.value))}
                className="form-input"
                step="0.1"
              />
            </div>
            
            <div className="input-group">
              <label>Nghiêm trọng:</label>
              <input
                type="number"
                value={values.critical}
                onChange={(e) => handleNestedSettingChange('thresholds', metric, 'critical', parseFloat(e.target.value))}
                className="form-input"
                step="0.1"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="settings-section">
      <h3>Cài đặt thông báo</h3>
      
      <div className="setting-group">
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={settings.notifications.email}
            onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
          />
          <span>Thông báo qua email</span>
        </label>
      </div>
      
      <div className="setting-group">
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={settings.notifications.realtime}
            onChange={(e) => handleSettingChange('notifications', 'realtime', e.target.checked)}
          />
          <span>Thông báo real-time</span>
        </label>
      </div>
      
      <div className="setting-group">
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={settings.notifications.dailyReport}
            onChange={(e) => handleSettingChange('notifications', 'dailyReport', e.target.checked)}
          />
          <span>Báo cáo hàng ngày</span>
        </label>
      </div>
      
      <div className="setting-group">
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={settings.notifications.weeklyReport}
            onChange={(e) => handleSettingChange('notifications', 'weeklyReport', e.target.checked)}
          />
          <span>Báo cáo hàng tuần</span>
        </label>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="settings-section">
      <h3>Thu thập dữ liệu</h3>
      
      <div className="setting-group">
        <label>Tần số lấy mẫu (Hz):</label>
        <input
          type="number"
          value={settings.dataCollection.samplingRate}
          onChange={(e) => handleSettingChange('dataCollection', 'samplingRate', parseInt(e.target.value))}
          className="form-input"
          min="1"
          max="1000"
        />
      </div>
      
      <div className="setting-group">
        <label>Thời gian lưu trữ (ngày):</label>
        <input
          type="number"
          value={settings.dataCollection.retentionPeriod}
          onChange={(e) => handleSettingChange('dataCollection', 'retentionPeriod', parseInt(e.target.value))}
          className="form-input"
          min="30"
          max="3650"
        />
      </div>
      
      <div className="setting-group">
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={settings.dataCollection.autoBackup}
            onChange={(e) => handleSettingChange('dataCollection', 'autoBackup', e.target.checked)}
          />
          <span>Tự động sao lưu</span>
        </label>
      </div>
      
      <div className="setting-group">
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={settings.dataCollection.compression}
            onChange={(e) => handleSettingChange('dataCollection', 'compression', e.target.checked)}
          />
          <span>Nén dữ liệu</span>
        </label>
      </div>
    </div>
  );

  const renderDisplayTab = () => (
    <div className="settings-section">
      <h3>Hiển thị</h3>
      
      <div className="setting-group">
        <label>Giao diện:</label>
        <select
          value={settings.display.theme}
          onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
          className="form-select"
        >
          <option value="light">Sáng</option>
          <option value="dark">Tối</option>
          <option value="auto">Tự động</option>
        </select>
      </div>
      
      <div className="setting-group">
        <label>Ngôn ngữ:</label>
        <select
          value={settings.display.language}
          onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
          className="form-select"
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>
      
      <div className="setting-group">
        <label>Tần suất cập nhật biểu đồ (giây):</label>
        <input
          type="number"
          value={settings.display.chartRefreshRate}
          onChange={(e) => handleSettingChange('display', 'chartRefreshRate', parseInt(e.target.value))}
          className="form-input"
          min="1"
          max="60"
        />
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="settings-section">
      <h3>Hệ thống</h3>
      
      <div className="setting-group">
        <label>Số người dùng đồng thời tối đa:</label>
        <input
          type="number"
          value={settings.system.maxConcurrentUsers}
          onChange={(e) => handleSettingChange('system', 'maxConcurrentUsers', parseInt(e.target.value))}
          className="form-input"
          min="1"
          max="100"
        />
      </div>
      
      <div className="setting-group">
        <label>Thời gian timeout phiên (phút):</label>
        <input
          type="number"
          value={settings.system.sessionTimeout}
          onChange={(e) => handleSettingChange('system', 'sessionTimeout', parseInt(e.target.value))}
          className="form-input"
          min="30"
          max="1440"
        />
      </div>
      
      <div className="setting-group">
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={settings.system.enableApi}
            onChange={(e) => handleSettingChange('system', 'enableApi', e.target.checked)}
          />
          <span>Bật API</span>
        </label>
      </div>
      
      <div className="setting-group">
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={settings.system.enableExport}
            onChange={(e) => handleSettingChange('system', 'enableExport', e.target.checked)}
          />
          <span>Cho phép xuất dữ liệu</span>
        </label>
      </div>
    </div>
  );

  const renderMqttDebugTab = () => (
    <div className="settings-section">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>MQTT Raw Data Inspector</h3>
        <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
          <div className="badge-dot"></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="mqtt-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <div className="stat-card" style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666' }}>Status</label>
          <span style={{ fontSize: '18px', fontWeight: '600', color: isConnected ? '#28a745' : '#dc3545' }}>
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <div className="stat-card" style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666' }}>Total Packets</label>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>{packetCount}</span>
        </div>
        <div className="stat-card" style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666' }}>Last Update</label>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>
            {lastPacketTime ? lastPacketTime.toLocaleTimeString() : 'Waiting...'}
          </span>
        </div>
      </div>
      
      <div className="raw-data-view" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="data-block" style={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '600px'
        }}>
          <h4 style={{ marginBottom: '10px', color: '#444' }}>Latest IMU Packet (Raw)</h4>
          <pre style={{ 
            background: '#1e1e1e', 
            color: '#00ff00', 
            padding: '15px', 
            borderRadius: '8px', 
            fontSize: '12px',
            overflow: 'auto',
            flex: 1,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {imuData ? JSON.stringify(imuData, null, 2) : '// Waiting for IMU data...'}
          </pre>
        </div>

        <div className="data-block" style={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '600px'
        }}>
          <h4 style={{ marginBottom: '10px', color: '#444' }}>Latest SHM Packet (Calculated)</h4>
          <pre style={{ 
            background: '#1e1e1e', 
            color: '#569cd6', 
            padding: '15px', 
            borderRadius: '8px', 
            fontSize: '12px',
            overflow: 'auto',
            flex: 1,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {shmData ? JSON.stringify(shmData, null, 2) : '// Waiting for SHM data...'}
          </pre>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="layout-container">
        <Sidebar />
        
        <main className={`main-content ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
          <div className="settings-page">
            {/* Page Header */}
            <div className="page-header">
              <h1>Cài đặt hệ thống</h1>
              <div className="header-actions">
                <button className="btn btn-secondary" onClick={exportSettings}>
                  Xuất cài đặt
                </button>
                <button className="btn btn-secondary" onClick={resetSettings}>
                  Khôi phục mặc định
                </button>
                <button 
                  className={`btn btn-primary ${!unsavedChanges ? 'disabled' : ''}`}
                  onClick={saveSettings}
                  disabled={!unsavedChanges}
                >
                  {unsavedChanges ? 'Lưu thay đổi' : 'Đã lưu'}
                </button>
              </div>
            </div>

            {/* Settings Tabs */}
            <div className="settings-tabs">
              <div className="tab-list">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="tab-content">
                {activeTab === 'thresholds' && renderThresholdsTab()}
                {activeTab === 'notifications' && renderNotificationsTab()}
                {activeTab === 'data' && renderDataTab()}
                {activeTab === 'display' && renderDisplayTab()}
                {activeTab === 'system' && renderSystemTab()}
                {activeTab === 'mqtt' && renderMqttDebugTab()}
              </div>
            </div>

            {/* Unsaved Changes Warning */}
            {unsavedChanges && (
              <div className="unsaved-warning">
                <span>Bạn có thay đổi chưa được lưu</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
