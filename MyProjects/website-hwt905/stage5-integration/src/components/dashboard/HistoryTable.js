/**
 * GIAI ĐOẠN 3: HISTORY TABLE COMPONENT
 * Chương 6: React Component, useState, useEffect, Event Handling
 * Chuyển từ stage2 table logic sang React
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const HistoryTable = () => {
  const { 
    currentPage, 
    totalPages, 
    pageLimit, 
    setCurrentPage, 
    setPageLimit,
    showNotification 
  } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    deviceId: ''
  });
  
  // Mock table data - Giai đoạn 5 sẽ fetch từ API thật
  const [tableData] = useState([
    {
      id: 1,
      timestamp: '2024-11-15 14:30:25',
      temperature: 25.8,
      humidity: 62.3,
      pressure: 1013.2,
      light: 845,
      deviceId: 'RaspberryPi-001'
    },
    {
      id: 2,
      timestamp: '2024-11-15 14:25:25',
      temperature: 25.3,
      humidity: 63.5,
      pressure: 1013.0,
      light: 725,
      deviceId: 'RaspberryPi-001'
    },
    {
      id: 3,
      timestamp: '2024-11-15 14:20:25',
      temperature: 25.1,
      humidity: 64.1,
      pressure: 1012.8,
      light: 680,
      deviceId: 'RaspberryPi-001'
    },
    {
      id: 4,
      timestamp: '2024-11-15 14:15:25',
      temperature: 24.9,
      humidity: 65.0,
      pressure: 1012.5,
      light: 642,
      deviceId: 'RaspberryPi-001'
    },
    {
      id: 5,
      timestamp: '2024-11-15 14:10:25',
      temperature: 24.7,
      humidity: 65.8,
      pressure: 1012.2,
      light: 598,
      deviceId: 'RaspberryPi-001'
    }
  ]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    
    if (name !== 'deviceId') {
      showNotification(`Lọc dữ liệu theo ${name}: ${value}`, 'info');
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPageLimit(newLimit);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setLoading(true);
      
      // Simulate loading
      setTimeout(() => {
        setCurrentPage(newPage);
        setLoading(false);
      }, 500);
    }
  };

  const formatValue = (value, unit) => {
    if (value === null || value === undefined) return '--';
    return `${typeof value === 'number' ? value.toFixed(1) : value}${unit}`;
  };

  return (
    <section className="history-section">
      <div className="table-container">
        <div className="table-header">
          <h2>Lịch sử dữ liệu cảm biến</h2>
          
          <div className="table-controls">
            <input
              type="date"
              name="startDate"
              className="date-filter"
              value={filters.startDate}
              onChange={handleFilterChange}
              title="Từ ngày"
            />
            
            <input
              type="date"
              name="endDate"
              className="date-filter"
              value={filters.endDate}
              onChange={handleFilterChange}
              title="Đến ngày"
            />
            
            <select
              className="limit-select"
              value={pageLimit}
              onChange={handleLimitChange}
            >
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
              <option value={50}>50 dòng</option>
              <option value={100}>100 dòng</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          {loading && (
            <div style={{ position: 'relative', minHeight: '200px' }}>
              <div className="loading-overlay">
                <div className="spinner"></div>
                <span>Đang tải dữ liệu...</span>
              </div>
            </div>
          )}
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Nhiệt độ</th>
                <th>Độ ẩm</th>
                <th>Áp suất</th>
                <th>Ánh sáng</th>
                <th>Thiết bị</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((record) => (
                  <tr key={record.id}>
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {record.timestamp}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>
                      {formatValue(record.temperature, '°C')}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>
                      {formatValue(record.humidity, '%')}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>
                      {formatValue(record.pressure, ' hPa')}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>
                      {formatValue(record.light, ' lux')}
                    </td>
                    <td style={{ fontSize: '12px', color: '#666' }}>
                      {record.deviceId}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ 
                    textAlign: 'center', 
                    color: '#666', 
                    fontStyle: 'italic', 
                    padding: '40px' 
                  }}>
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="pagination-info">
            <span>
              Hiển thị {(currentPage - 1) * pageLimit + 1}-{Math.min(currentPage * pageLimit, tableData.length)} của {totalPages * pageLimit} bản ghi
            </span>
          </div>
          
          <div className="pagination-controls">
            <button
              className="btn btn-secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
            >
              Trước
            </button>
            
            <span className="page-info">
              Trang {currentPage} / {totalPages}
            </span>
            
            <button
              className="btn btn-secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
            >
              Tiếp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistoryTable;
