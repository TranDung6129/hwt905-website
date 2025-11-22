/**
 * HISTORY TABLE COMPONENT cho dữ liệu SHM
 * Hiển thị lịch sử dữ liệu giám sát công trình xây dựng
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
  
  // Mock table data cho SHM - API thật sẽ fetch từ backend
  const [tableData] = useState([
    {
      id: 1,
      timestamp: '2024-11-15 14:30:25',
      totalAcceleration: 1.85,
      tiltAngle: 2.45,
      vibrationIntensity: 18.3,
      structuralDisplacement: 3.2,
      dominantFrequency: 1.75,
      displacementMagnitude: 0.000065,
      deviceId: 'HWT905-Bridge-01',
      location: 'Cầu ABC - Trụ 1'
    },
    {
      id: 2,
      timestamp: '2024-11-15 14:25:25',
      totalAcceleration: 1.92,
      tiltAngle: 2.38,
      vibrationIntensity: 19.7,
      structuralDisplacement: 3.5,
      dominantFrequency: 1.82,
      displacementMagnitude: 0.000071,
      deviceId: 'HWT905-Bridge-01',
      location: 'Cầu ABC - Trụ 1'
    },
    {
      id: 3,
      timestamp: '2024-11-15 14:20:25',
      totalAcceleration: 1.78,
      tiltAngle: 2.55,
      vibrationIntensity: 17.1,
      structuralDisplacement: 2.9,
      dominantFrequency: 1.68,
      displacementMagnitude: 0.000058,
      deviceId: 'HWT905-Bridge-01',
      location: 'Cầu ABC - Trụ 1'
    },
    {
      id: 4,
      timestamp: '2024-11-15 14:15:25',
      totalAcceleration: 2.15,
      tiltAngle: 2.61,
      vibrationIntensity: 21.4,
      structuralDisplacement: 4.1,
      dominantFrequency: 1.93,
      displacementMagnitude: 0.000082,
      deviceId: 'HWT905-Bridge-01',
      location: 'Cầu ABC - Trụ 1'
    },
    {
      id: 5,
      timestamp: '2024-11-15 14:10:25',
      totalAcceleration: 1.65,
      tiltAngle: 2.29,
      vibrationIntensity: 15.8,
      structuralDisplacement: 2.7,
      dominantFrequency: 1.52,
      displacementMagnitude: 0.000053,
      deviceId: 'HWT905-Bridge-01',
      location: 'Cầu ABC - Trụ 1'
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
    
    // Định dạng số thập phân tùy theo loại
    let formatted;
    if (typeof value === 'number') {
      if (value < 0.001) {
        formatted = value.toFixed(6); // Cho displacement magnitude
      } else if (value < 1) {
        formatted = value.toFixed(3);
      } else {
        formatted = value.toFixed(2);
      }
    } else {
      formatted = value;
    }
    
    return `${formatted}${unit}`;
  };

  const getStatusClass = (value, type) => {
    if (value === null || value === undefined) return '';
    
    const thresholds = {
      acceleration: { warning: 5, critical: 15 },
      tilt: { warning: 10, critical: 30 },
      vibration: { warning: 40, critical: 80 },
      displacement: { warning: 20, critical: 40 }
    };
    
    const threshold = thresholds[type];
    if (!threshold) return '';
    
    if (value >= threshold.critical) return 'status-critical';
    if (value >= threshold.warning) return 'status-warning';
    return 'status-safe';
  };

  return (
    <section className="history-section">
      <div className="table-container">
        <div className="table-header">
          <h2>Lịch sử dữ liệu giám sát SHM</h2>
          
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
                <th>Gia tốc (m/s²)</th>
                <th>Góc nghiêng (°)</th>
                <th>Rung (mm/s)</th>
                <th>Chuyển vị (mm)</th>
                <th>Tần số (Hz)</th>
                <th>Thiết bị</th>
                <th>Vị trí</th>
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
                      <span className={getStatusClass(record.totalAcceleration, 'acceleration')}>
                        {formatValue(record.totalAcceleration, '')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>
                      <span className={getStatusClass(record.tiltAngle, 'tilt')}>
                        {formatValue(record.tiltAngle, '')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>
                      <span className={getStatusClass(record.vibrationIntensity, 'vibration')}>
                        {formatValue(record.vibrationIntensity, '')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>
                      <span className={getStatusClass(record.structuralDisplacement, 'displacement')}>
                        {formatValue(record.structuralDisplacement, '')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>
                      {formatValue(record.dominantFrequency, '')}
                    </td>
                    <td style={{ fontSize: '12px', color: '#666' }}>
                      {record.deviceId}
                    </td>
                    <td style={{ fontSize: '11px', color: '#888', maxWidth: '120px' }}>
                      {record.location}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ 
                    textAlign: 'center', 
                    color: '#666', 
                    fontStyle: 'italic', 
                    padding: '40px' 
                  }}>
                    Không có dữ liệu SHM
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
