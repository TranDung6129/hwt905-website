/**
 * GIAI ĐOẠN 5: HISTORY TABLE với REAL API DATA
 * Chương 6: React Component với Pagination và API Integration
 * 
 * Component này hiển thị bảng lịch sử từ backend APIs
 */

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { LoadingSpinnerCSS } from '../common/LoadingSpinner';

const HistoryTable = () => {
  const {
    historyData,
    devices,
    loading,
    backendStatus,
    fetchHistoryData,
    addNotification,
    errors
  } = useAppContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState({
    key: 'timestamp',
    direction: 'desc'
  });
  const [filters, setFilters] = useState({
    deviceId: null,
    startDate: '',
    endDate: '',
    temperatureMin: '',
    temperatureMax: '',
    humidityMin: '',
    humidityMax: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  /**
   * Fetch data when filters, pagination, or sorting changes
   */
  useEffect(() => {
    if (backendStatus.available) {
      const options = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...filters
      };

      // Remove empty filters
      Object.keys(options).forEach(key => {
        if (options[key] === '' || options[key] === null) {
          delete options[key];
        }
      });

      fetchHistoryData(options);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortConfig,
    filters,
    backendStatus.available,
    fetchHistoryData
  ]);

  /**
   * Handle sorting
   */
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  /**
   * Reset filters
   */
  const resetFilters = () => {
    setFilters({
      deviceId: null,
      startDate: '',
      endDate: '',
      temperatureMin: '',
      temperatureMax: '',
      humidityMin: '',
      humidityMax: ''
    });
    setCurrentPage(1);
  };

  /**
   * Export data function (placeholder for future implementation)
   */
  const handleExport = () => {
    addNotification({
      type: 'info',
      title: 'Xuất dữ liệu',
      message: 'Tính năng xuất dữ liệu sẽ được triển khai trong tương lai'
    });
  };

  /**
   * Refresh data
   */
  const handleRefresh = () => {
    fetchHistoryData({
      page: currentPage,
      limit: itemsPerPage,
      sortBy: sortConfig.key,
      sortOrder: sortConfig.direction,
      ...filters
    });
  };

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  /**
   * Format numeric values
   */
  const formatValue = (value, decimals = 1) => {
    if (value === null || value === undefined) return '--';
    return typeof value === 'number' ? value.toFixed(decimals) : value;
  };

  /**
   * Get sort icon
   */
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  /**
   * Generate page numbers for pagination
   */
  const getPageNumbers = () => {
    if (!historyData.pagination) return [];
    
    const { currentPage, totalPages } = historyData.pagination;
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const isLoading = loading.history || loading.general;
  const hasError = errors.api || errors.connection;
  const hasData = historyData.records && historyData.records.length > 0;
  const pagination = historyData.pagination;

  return (
    <div className="history-table-container">
      <style>{`
        .history-table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px;
          margin-bottom: 20px;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .table-title {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
        }

        .table-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .action-button {
          padding: 8px 12px;
          border: 1px solid #3498db;
          background: white;
          color: #3498db;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .action-button:hover {
          background: #3498db;
          color: white;
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-button.primary {
          background: #3498db;
          color: white;
        }

        .action-button.primary:hover {
          background: #2980b9;
        }

        .filters-panel {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
          display: ${showFilters ? 'block' : 'none'};
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .filter-label {
          font-size: 13px;
          font-weight: 600;
          color: #495057;
        }

        .filter-input, .filter-select {
          padding: 6px 8px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }

        .filter-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .table-header-cell {
          background: #f8f9fa;
          padding: 12px 8px;
          text-align: left;
          border-bottom: 2px solid #dee2e6;
          font-weight: 600;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s;
          position: relative;
        }

        .table-header-cell:hover {
          background: #e9ecef;
        }

        .table-header-cell.sortable::after {
          content: attr(data-sort-icon);
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
        }

        .table-cell {
          padding: 10px 8px;
          border-bottom: 1px solid #dee2e6;
          font-size: 14px;
        }

        .table-row:hover {
          background: #f8f9fa;
        }

        .device-badge {
          display: inline-block;
          padding: 2px 8px;
          background: #e3f2fd;
          color: #1976d2;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .value-cell {
          text-align: right;
          font-family: 'Courier New', monospace;
        }

        .timestamp-cell {
          font-size: 13px;
          color: #6c757d;
        }

        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .pagination-info {
          font-size: 14px;
          color: #6c757d;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
        }

        .page-size-select {
          padding: 4px 8px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }

        .pagination-buttons {
          display: flex;
          gap: 2px;
        }

        .pagination-button {
          padding: 6px 10px;
          border: 1px solid #dee2e6;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .pagination-button:hover:not(:disabled) {
          background: #e9ecef;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-button.active {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 15px;
          opacity: 0.3;
        }

        .loading-container {
          position: relative;
          min-height: 300px;
        }

        @media (max-width: 768px) {
          .table-header {
            flex-direction: column;
            align-items: stretch;
          }

          .table-actions {
            justify-content: center;
          }

          .data-table {
            font-size: 12px;
          }

          .table-header-cell, .table-cell {
            padding: 8px 4px;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .pagination-container {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 600px) {
          .data-table, .table-header-cell, .table-cell {
            display: block;
            width: 100%;
          }

          .table-row {
            border: 1px solid #dee2e6;
            margin-bottom: 10px;
            border-radius: 4px;
          }

          .table-header-cell {
            display: none;
          }

          .table-cell {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            border-bottom: 1px solid #f1f3f4;
          }

          .table-cell::before {
            content: attr(data-label);
            font-weight: 600;
            color: #495057;
          }
        }
      `}</style>

      {/* Header */}
      <div className="table-header">
        <h3 className="table-title">Lịch sử dữ liệu</h3>
        <div className="table-actions">
          <button
            className="action-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
          </button>
          <button
            className="action-button"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Làm mới
          </button>
          <button
            className="action-button"
            onClick={handleExport}
            disabled={!hasData}
          >
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-panel">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Thiết bị</label>
            <select
              className="filter-select"
              value={filters.deviceId || ''}
              onChange={(e) => handleFilterChange('deviceId', e.target.value || null)}
            >
              <option value="">Tất cả thiết bị</option>
              {devices.list.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.deviceId}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Từ ngày</label>
            <input
              type="datetime-local"
              className="filter-input"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Đến ngày</label>
            <input
              type="datetime-local"
              className="filter-input"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Nhiệt độ (°C)</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="number"
                className="filter-input"
                placeholder="Min"
                value={filters.temperatureMin}
                onChange={(e) => handleFilterChange('temperatureMin', e.target.value)}
              />
              <input
                type="number"
                className="filter-input"
                placeholder="Max"
                value={filters.temperatureMax}
                onChange={(e) => handleFilterChange('temperatureMax', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Độ ẩm (%)</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="number"
                className="filter-input"
                placeholder="Min"
                value={filters.humidityMin}
                onChange={(e) => handleFilterChange('humidityMin', e.target.value)}
              />
              <input
                type="number"
                className="filter-input"
                placeholder="Max"
                value={filters.humidityMax}
                onChange={(e) => handleFilterChange('humidityMax', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="filter-actions">
          <button className="action-button primary" onClick={handleRefresh}>
            Áp dụng bộ lọc
          </button>
          <button className="action-button" onClick={resetFilters}>
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="loading-container">
        {isLoading && (
          <LoadingSpinnerCSS 
            overlay={true}
            message="Đang tải dữ liệu lịch sử..."
          />
        )}

        {!isLoading && !backendStatus.available && (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h4>Backend không khả dụng</h4>
            <p>Không thể tải dữ liệu lịch sử. Vui lòng kiểm tra kết nối server.</p>
          </div>
        )}

        {!isLoading && backendStatus.available && !hasData && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h4>Không có dữ liệu</h4>
            <p>Không tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.</p>
            <button className="action-button" onClick={resetFilters}>
              Xóa bộ lọc
            </button>
          </div>
        )}

        {!isLoading && hasData && (
          <>
            {/* Data Table */}
            <table className="data-table">
              <thead>
                <tr>
                  <th 
                    className="table-header-cell sortable"
                    data-sort-icon={getSortIcon('timestamp')}
                    onClick={() => handleSort('timestamp')}
                  >
                    Thời gian
                  </th>
                  <th 
                    className="table-header-cell sortable"
                    data-sort-icon={getSortIcon('deviceId')}
                    onClick={() => handleSort('deviceId')}
                  >
                    Thiết bị
                  </th>
                  <th 
                    className="table-header-cell sortable"
                    data-sort-icon={getSortIcon('temperature')}
                    onClick={() => handleSort('temperature')}
                  >
                    Nhiệt độ (°C)
                  </th>
                  <th 
                    className="table-header-cell sortable"
                    data-sort-icon={getSortIcon('humidity')}
                    onClick={() => handleSort('humidity')}
                  >
                    Độ ẩm (%)
                  </th>
                  <th 
                    className="table-header-cell sortable"
                    data-sort-icon={getSortIcon('pressure')}
                    onClick={() => handleSort('pressure')}
                  >
                    Áp suất (hPa)
                  </th>
                  <th 
                    className="table-header-cell sortable"
                    data-sort-icon={getSortIcon('light')}
                    onClick={() => handleSort('light')}
                  >
                    Ánh sáng (lux)
                  </th>
                  <th className="table-header-cell">
                    Pin (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyData.records.map((record, index) => (
                  <tr key={record._id || index} className="table-row">
                    <td className="table-cell timestamp-cell" data-label="Thời gian">
                      {formatTimestamp(record.timestamp)}
                    </td>
                    <td className="table-cell" data-label="Thiết bị">
                      <span className="device-badge">{record.deviceId}</span>
                    </td>
                    <td className="table-cell value-cell" data-label="Nhiệt độ">
                      {formatValue(record.temperature)}
                    </td>
                    <td className="table-cell value-cell" data-label="Độ ẩm">
                      {formatValue(record.humidity)}
                    </td>
                    <td className="table-cell value-cell" data-label="Áp suất">
                      {formatValue(record.pressure, 0)}
                    </td>
                    <td className="table-cell value-cell" data-label="Ánh sáng">
                      {formatValue(record.light, 0)}
                    </td>
                    <td className="table-cell value-cell" data-label="Pin">
                      {formatValue(record.batteryLevel, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Hiển thị {((pagination.currentPage - 1) * itemsPerPage) + 1} đến{' '}
                  {Math.min(pagination.currentPage * itemsPerPage, pagination.totalRecords)} trong{' '}
                  {pagination.totalRecords} bản ghi
                </div>

                <div className="pagination-controls">
                  <div className="page-size-selector">
                    <span>Hiển thị:</span>
                    <select
                      className="page-size-select"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="pagination-buttons">
                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.currentPage === 1}
                    >
                      ««
                    </button>
                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      ‹
                    </button>

                    {getPageNumbers().map(pageNum => (
                      <button
                        key={pageNum}
                        className={`pagination-button ${pageNum === pagination.currentPage ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      ›
                    </button>
                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      »»
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryTable;
