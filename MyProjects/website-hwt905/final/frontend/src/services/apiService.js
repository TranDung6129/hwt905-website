/**
 * GIAI ĐOẠN 5: API SERVICE - Kết nối với Backend
 * Chương 7: Axios HTTP Client và Async/Await
 * 
 * Service này thay thế mock data bằng real API calls
 */

import axios from 'axios';

// Base configuration
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Axios instance với default config
 */
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - thêm auth token
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage
    const token = localStorage.getItem('sensor_dashboard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle errors globally including auth errors
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle different error types
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      localStorage.removeItem('sensor_dashboard_token');
      localStorage.removeItem('sensor_dashboard_user');
      
      if (error.response.data?.code === 'TOKEN_EXPIRED') {
        error.message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
      } else {
        error.message = 'Bạn cần đăng nhập để truy cập';
      }
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      error.message = 'Bạn không có quyền truy cập tính năng này';
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - server không phản hồi';
    } else if (error.response?.status === 404) {
      error.message = 'API endpoint không tìm thấy';
    } else if (error.response?.status >= 500) {
      error.message = 'Server error - vui lòng thử lại sau';
    } else if (!error.response) {
      error.message = 'Không thể kết nối server - kiểm tra backend có chạy không';
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Error class cho custom error handling
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * SENSOR DATA APIs - thay thế mock data
 */
export const sensorApi = {
  
  /**
   * Lấy dữ liệu sensor mới nhất
   * Replaces: mockSensorData in AppContext
   */
  async getLatestData(deviceId = null) {
    try {
      const params = deviceId ? { deviceId } : {};
      const response = await apiClient.get('/sensors/latest', { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          timestamp: new Date(response.data.data?.timestamp)
        };
      } else {
        throw new ApiError(response.data.message || 'Không thể lấy dữ liệu mới nhất');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Lỗi khi lấy dữ liệu mới nhất', error.response?.status);
    }
  },

  /**
   * Lấy lịch sử dữ liệu với pagination
   * Replaces: mockHistoryData in HistoryTable
   */
  async getHistoryData(options = {}) {
    try {
      const {
        deviceId = null,
        page = 1,
        limit = 50,
        startDate = null,
        endDate = null,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = options;

      const params = {
        page,
        limit,
        sortBy,
        sortOrder
      };

      if (deviceId) params.deviceId = deviceId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get('/sensors/history', { params });

      if (response.data.success) {
        return {
          success: true,
          records: response.data.data.records,
          pagination: response.data.data.pagination,
          filter: response.data.data.filter
        };
      } else {
        throw new ApiError(response.data.message || 'Không thể lấy lịch sử dữ liệu');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Lỗi khi lấy lịch sử dữ liệu', error.response?.status);
    }
  },

  /**
   * Lấy thống kê dữ liệu sensor
   * Replaces: calculated stats in Chart component
   */
  async getStats(deviceId = null, period = '24h') {
    try {
      const params = { period };
      if (deviceId) params.deviceId = deviceId;

      const response = await apiClient.get('/sensors/stats', { params });

      if (response.data.success) {
        return {
          success: true,
          statistics: response.data.data.statistics,
          period: response.data.data.period,
          timeRange: response.data.data.timeRange,
          dataQuality: response.data.data.dataQuality
        };
      } else {
        throw new ApiError(response.data.message || 'Không thể lấy thống kê');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Lỗi khi lấy thống kê', error.response?.status);
    }
  },

  /**
   * Lấy danh sách devices
   * New feature - không có trong mock
   */
  async getDevices() {
    try {
      const response = await apiClient.get('/sensors/devices');

      if (response.data.success) {
        return {
          success: true,
          devices: response.data.data.devices,
          totalDevices: response.data.data.totalDevices
        };
      } else {
        throw new ApiError(response.data.message || 'Không thể lấy danh sách devices');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Lỗi khi lấy danh sách devices', error.response?.status);
    }
  },

  /**
   * Tạo dữ liệu sensor mới (manual entry)
   * For testing purposes
   */
  async createSensorData(sensorData) {
    try {
      const response = await apiClient.post('/sensors/data', sensorData);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new ApiError(response.data.message || 'Không thể tạo dữ liệu sensor');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Lỗi khi tạo dữ liệu sensor', error.response?.status);
    }
  },

  /**
   * Lấy trạng thái MQTT service
   * System monitoring feature
   */
  async getMQTTStatus() {
    try {
      const response = await apiClient.get('/sensors/mqtt-status');

      if (response.data.success) {
        return {
          success: true,
          mqtt: response.data.data.mqtt,
          server: response.data.data.server
        };
      } else {
        throw new ApiError(response.data.message || 'Không thể lấy trạng thái MQTT');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Lỗi khi lấy trạng thái MQTT', error.response?.status);
    }
  }
};

/**
 * SYSTEM APIs
 */
export const systemApi = {
  
  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
      return {
        success: true,
        status: response.data.status,
        services: response.data.services
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Health check failed'
      };
    }
  },

  /**
   * Server info
   */
  async getServerInfo() {
    try {
      const response = await axios.get(`${BASE_URL}/`, { timeout: 5000 });
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      throw new ApiError(error.message || 'Không thể lấy thông tin server', error.response?.status);
    }
  }
};

/**
 * CHART DATA APIs - specific cho Chart component
 */
export const chartApi = {
  
  /**
   * Lấy dữ liệu cho biểu đồ 24 giờ
   */
  async getChartData24h(deviceId = null) {
    try {
      const historyData = await sensorApi.getHistoryData({
        deviceId,
        limit: 100,
        sortBy: 'timestamp',
        sortOrder: 'asc',
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      });

      // Transform data for Recharts format
      const chartData = historyData.records.map(record => ({
        time: new Date(record.timestamp).toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        timestamp: record.timestamp,
        temperature: record.temperature,
        humidity: record.humidity,
        pressure: record.pressure || null,
        light: record.light || null
      }));

      return {
        success: true,
        data: chartData,
        period: '24h'
      };
    } catch (error) {
      throw new ApiError(error.message || 'Lỗi khi lấy dữ liệu biểu đồ', error.status);
    }
  },

  /**
   * Lấy dữ liệu cho biểu đồ 7 ngày
   */
  async getChartData7d(deviceId = null) {
    try {
      const historyData = await sensorApi.getHistoryData({
        deviceId,
        limit: 200,
        sortBy: 'timestamp', 
        sortOrder: 'asc',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Group by hour for 7-day view
      const groupedData = {};
      historyData.records.forEach(record => {
        const hour = new Date(record.timestamp).toISOString().slice(0, 13) + ':00:00';
        if (!groupedData[hour]) {
          groupedData[hour] = {
            time: new Date(hour).toLocaleDateString('vi-VN', { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit' 
            }),
            timestamp: hour,
            temperature: [],
            humidity: [],
            pressure: [],
            light: []
          };
        }
        groupedData[hour].temperature.push(record.temperature);
        groupedData[hour].humidity.push(record.humidity);
        if (record.pressure) groupedData[hour].pressure.push(record.pressure);
        if (record.light) groupedData[hour].light.push(record.light);
      });

      // Calculate averages
      const chartData = Object.values(groupedData).map(group => ({
        ...group,
        temperature: group.temperature.reduce((a, b) => a + b, 0) / group.temperature.length,
        humidity: group.humidity.reduce((a, b) => a + b, 0) / group.humidity.length,
        pressure: group.pressure.length > 0 ? 
          group.pressure.reduce((a, b) => a + b, 0) / group.pressure.length : null,
        light: group.light.length > 0 ?
          group.light.reduce((a, b) => a + b, 0) / group.light.length : null
      }));

      return {
        success: true,
        data: chartData,
        period: '7d'
      };
    } catch (error) {
      throw new ApiError(error.message || 'Lỗi khi lấy dữ liệu biểu đồ 7 ngày', error.status);
    }
  }
};

/**
 * Utility functions
 */
export const apiUtils = {
  
  /**
   * Check if backend is available
   */
  async isBackendAvailable() {
    try {
      const health = await systemApi.healthCheck();
      return health.success && health.status === 'healthy';
    } catch {
      return false;
    }
  },

  /**
   * Get API base URL for display
   */
  getBaseUrl() {
    return BASE_URL;
  },

  /**
   * Format API error for user display
   */
  formatError(error) {
    if (error instanceof ApiError) {
      return {
        message: error.message,
        status: error.status,
        type: 'api_error'
      };
    } else if (error.code === 'ECONNREFUSED') {
      return {
        message: 'Không thể kết nối server. Vui lòng kiểm tra backend có chạy không.',
        status: 0,
        type: 'connection_error'
      };
    } else {
      return {
        message: error.message || 'Lỗi không xác định',
        status: null,
        type: 'unknown_error'
      };
    }
  }
};

// Export default for convenience
export default {
  sensor: sensorApi,
  system: systemApi,
  chart: chartApi,
  utils: apiUtils
};
