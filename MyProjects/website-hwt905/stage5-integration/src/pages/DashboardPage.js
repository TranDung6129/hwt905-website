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

const DashboardPage = () => {
  const { 
    connectionStatus, 
    lastUpdateTime, 
    loading, 
    refreshData 
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
        
        <main className="main-content">
          {/* Status Bar */}
          <section className="status-bar">
            <div className="connection-info">
              <div className={`status-dot ${connectionStatus}`} />
              <span>
                Real-time: {connectionStatus === 'online' ? 'Đang hoạt động' : 'Mất kết nối'}
              </span>
            </div>
            
            <div className="last-update">
              <span>
                Cập nhật cuối: {lastUpdateTime.toLocaleString('vi-VN')}
              </span>
            </div>
            
            <button 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              onClick={refreshData}
              disabled={loading}
            >
              {loading ? 'Đang tải...' : 'Làm mới'}
            </button>
          </section>

          {/* Data Overview */}
          <section className="data-overview">
            <h2 className="section-title">Thông số hiện tại</h2>
            <div className="data-cards">
              <DataCard
                type="temperature"
                title="Nhiệt độ"
                unit="°C"
                className="temperature"
              />
              
              <DataCard
                type="humidity"
                title="Độ ẩm"
                unit="%"
                className="humidity"
              />
              
              <DataCard
                type="pressure"
                title="Áp suất"
                unit=" hPa"
                className="pressure"
              />
              
              <DataCard
                type="light"
                title="Ánh sáng"
                unit=" lux"
                className="light"
              />
            </div>
          </section>

          {/* Chart Section */}
          <Chart />

          {/* History Table */}
          <HistoryTable />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
