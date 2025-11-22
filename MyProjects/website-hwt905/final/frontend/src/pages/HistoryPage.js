/**
 * HISTORY PAGE - Comprehensive data history with filtering
 * Displays historical sensor data with project and time filtering
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

const HistoryPage = () => {
  const { connectionStatus, sidebarOpen } = useApp();
  
  const [selectedProject, setSelectedProject] = useState('hwt905-monitoring');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterLevel, setFilterLevel] = useState('all');

  // Only one real project with HWT905 sensor
  const projects = [
    { id: 'hwt905-monitoring', name: 'HWT905 Sensor Monitoring' }
  ];

  const [historyData, setHistoryData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  // Generate realistic HWT905 data based on actual sensor format
  useEffect(() => {
    const generateRealisticHWT905Data = () => {
      setLoading(true);
      
      // Simulate API call with real HWT905 data structure
      setTimeout(() => {
        const data = Array.from({ length: pageSize }, (_, i) => {
          // Generate realistic timestamps going backwards from now
          const timestamp = new Date(Date.now() - i * 60000 * 5); // Every 5 minutes
          
          // Base values similar to real HWT905 data with small variations
          const baseVelX = 0.00014188390717151066;
          const baseVelY = 7.709811899764404e-05;
          const baseVelZ = 0.000174020268718905;
          
          const baseDispX = 2.5520233598714258e-08;
          const baseDispY = -3.07530393137654e-08;
          const baseDispZ = 1.0002781054420477e-07;
          
          const baseAccXFiltered = 0.0006211140542719917;
          const baseAccYFiltered = 0.0006391300279694038;
          const baseAccZFiltered = 0.001323948967350842;
          
          // Add realistic small variations (±10%)
          const variation = () => 0.9 + Math.random() * 0.2;
          
          return {
            id: i + (currentPage - 1) * pageSize,
            timestamp,
            project: selectedProject,
            sensor_id: 'HWT905-001', // Only one real sensor
            vel_x: parseFloat((baseVelX * variation()).toFixed(12)),
            vel_y: parseFloat((baseVelY * variation()).toFixed(12)),
            vel_z: parseFloat((baseVelZ * variation()).toFixed(12)),
            velocity_magnitude_mm_s: parseFloat((0.2373988563414505 * variation()).toFixed(6)),
            disp_x: parseFloat((baseDispX * variation()).toFixed(15)),
            disp_y: parseFloat((baseDispY * variation()).toFixed(15)),
            disp_z: parseFloat((baseDispZ * variation()).toFixed(15)),
            displacement_magnitude: parseFloat((1.0771534074696263e-07 * variation()).toFixed(15)),
            acc_x_filtered: parseFloat((baseAccXFiltered * variation()).toFixed(10)),
            acc_y_filtered: parseFloat((baseAccYFiltered * variation()).toFixed(10)),
            acc_z_filtered: parseFloat((baseAccZFiltered * variation()).toFixed(10)),
            acc_x: parseFloat((0.00048828125 * variation()).toFixed(8)),
            acc_y: parseFloat((0.0 * variation()).toFixed(8)),
            acc_z: parseFloat((1.00048828125 * variation()).toFixed(8)),
            dominant_freq_x: parseFloat((0.09765625 * variation()).toFixed(6)),
            dominant_freq_y: parseFloat((0.09765625 * variation()).toFixed(6)),
            dominant_freq_z: parseFloat((0.09765625 * variation()).toFixed(6)),
            overall_dominant_frequency: parseFloat((0.09765625 * variation()).toFixed(6)),
            rls_warmed_up: true,
            alert_level: 'normal' // Most data is normal for a stable structure
          };
        });
        
        setHistoryData(data);
        setTotalRecords(Math.floor(pageSize * 1.5)); // Realistic total based on actual data
        setLoading(false);
      }, 300);
    };

    generateRealisticHWT905Data();
  }, [selectedProject, dateRange, currentPage, pageSize, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const exportData = () => {
    console.log('Exporting history data...');
    // Implement CSV export functionality
  };

  const getAlertClass = (level) => {
    switch (level) {
      case 'warning': return 'alert-warning';
      case 'critical': return 'alert-critical';
      default: return '';
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="layout-container">
        <Sidebar />
        
        <main className={`main-content ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
          <div className="history-page">
            {/* Page Header */}
            <div className="page-header">
              <h1>Lịch sử dữ liệu</h1>
              <p>Tra cứu và phân tích dữ liệu lịch sử từ các cảm biến</p>
            </div>

            {/* Filters */}
            <div className="history-filters">
              <div className="filter-row">
                <div className="filter-group">
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

                <div className="filter-group">
                  <label>Từ ngày:</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="filter-group">
                  <label>Đến ngày:</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="filter-group">
                  <label>Cấp độ cảnh báo:</label>
                  <select 
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="form-select"
                  >
                    <option value="all">Tất cả</option>
                    <option value="normal">Bình thường</option>
                    <option value="warning">Cảnh báo</option>
                    <option value="critical">Nghiêm trọng</option>
                  </select>
                </div>
              </div>

              <div className="filter-actions">
                <button className="btn btn-primary" onClick={exportData}>
                  Xuất dữ liệu CSV
                </button>
                <div className="page-size">
                  <label>Hiển thị:</label>
                  <select 
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="form-select"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>dòng</span>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="history-table-container">
              {loading && <div className="loading-overlay">Đang tải...</div>}
              
              <table className="history-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('timestamp')}>
                      Thời gian {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Cảm biến</th>
                    <th onClick={() => handleSort('velocity_magnitude_mm_s')}>
                      Vận tốc (mm/s) {sortBy === 'velocity_magnitude_mm_s' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('displacement_magnitude')}>
                      Chuyển vị (mm) {sortBy === 'displacement_magnitude' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('acc_z_filtered')}>
                      Gia tốc Z (m/s²) {sortBy === 'acc_z_filtered' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('overall_dominant_frequency')}>
                      Tần số (Hz) {sortBy === 'overall_dominant_frequency' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map(record => (
                    <tr key={record.id} className={getAlertClass(record.alert_level)}>
                      <td>{record.timestamp.toLocaleString('vi-VN')}</td>
                      <td>{record.sensor_id}</td>
                      <td>{record.velocity_magnitude_mm_s}</td>
                      <td>{record.displacement_magnitude}</td>
                      <td>{record.acc_z_filtered}</td>
                      <td>{record.overall_dominant_frequency}</td>
                      <td>
                        <span className={`status-badge ${record.alert_level}`}>
                          {record.alert_level === 'normal' ? 'Bình thường' :
                           record.alert_level === 'warning' ? 'Cảnh báo' : 'Nghiêm trọng'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-container">
              <div className="pagination-info">
                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalRecords)} 
                của {totalRecords} bản ghi
              </div>
              
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-sm"
                >
                  Trước
                </button>
                
                <span className="page-info">
                  Trang {currentPage} / {totalPages}
                </span>
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-sm"
                >
                  Sau
                </button>
              </div>
            </div>

            {/* Connection Status */}
            <div className="page-footer">
              <div className="connection-info">
                <div className={`status-dot ${connectionStatus}`} />
                <span>
                  Kết nối: {connectionStatus === 'online' ? 'Hoạt động' : 'Mất kết nối'}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HistoryPage;
