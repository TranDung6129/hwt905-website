/**
 * GIAI ĐOẠN 3: DASHBOARD PAGE COMPONENT
 * Chương 6: React Component composition, useEffect, useState
 * Chuyển từ stage2 dashboard.html sang React page
 */

import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

// Components
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import DataCard from '../components/dashboard/DataCard';
import Chart from '../components/dashboard/Chart';
import HistoryTable from '../components/dashboard/HistoryTable';
import ProjectSummary from '../components/dashboard/ProjectSummary';

const DashboardPage = () => {
  const { 
    connectionStatus, 
    lastUpdateTime, 
    loading, 
    refreshData,
    sidebarOpen
  } = useApp();

  // Keyboard shortcuts - chuyển từ stage2
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + R = Refresh (prevent default and use custom)
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshData();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [refreshData]);

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="layout-container">
        <Sidebar />
        
        <main className={`main-content ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
          {/* Status Bar - Compact */}
          <section className="status-bar-compact">
            <div className="connection-info">
              <div className="status-indicator">
                <div className={`status-dot ${connectionStatus}`} />
                <span className="status-text">
                  {connectionStatus === 'online' ? 'Đang hoạt động' : 'Mất kết nối'}
                </span>
              </div>
            </div>
            
            <div className="last-update">
              <span>{lastUpdateTime.toLocaleString('vi-VN')}</span>
            </div>
            
            <button 
              className={`btn btn-sm ${loading ? 'loading' : ''}`}
              onClick={refreshData}
              disabled={loading}
            >
              {loading ? 'Đang tải...' : 'Làm mới'}
            </button>
          </section>

          {/* Main Dashboard Content */}
          <div className="dashboard-content">
            {/* Left Panel - Main Data */}
            <div className="dashboard-main">
              {/* Data Overview - IMU hwt905 SHM Parameters */}
              <section className="data-overview">
                <h2 className="section-title">Thông số giám sát (HWT905 Sensor)</h2>
                <div className="data-cards">
                  <DataCard
                    type="totalAcceleration"
                    title="Gia tốc tổng hợp"
                    unit="m/s²"
                    className="total-acceleration"
                  />
                  
                  <DataCard
                    type="tiltAngle"
                    title="Góc nghiêng"
                    unit="°"
                    className="tilt-angle"
                  />
                  
                  <DataCard
                    type="vibrationIntensity"
                    title="Cường độ rung"
                    unit="mm/s"
                    className="vibration-intensity"
                  />
                  
                  <DataCard
                    type="structuralDisplacement"
                    title="Chuyển vị cấu trúc"
                    unit="mm"
                    className="structural-displacement"
                  />
                  
                  <DataCard
                    type="dominantFrequency"
                    title="Tần số đặc trưng"
                    unit="Hz"
                    className="dominant-frequency"
                  />
                </div>
              </section>

              {/* Chart Section */}
              <Chart />

              {/* History Table */}
              <HistoryTable />
            </div>

            {/* Right Panel - Project Summary */}
            <aside className="dashboard-sidebar">
              <ProjectSummary />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
