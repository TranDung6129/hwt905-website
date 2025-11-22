/**
 * GIAI ĐOẠN 5: APP CONTEXT với REAL APIs
 * Chương 6: React Context với API Integration
 * 
 * Context này thay thế mock data bằng real backend APIs
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import apiService, { ApiError } from '../services/apiService';
import { useAuth } from './AuthContext';

// Create Context
const AppContext = createContext();

// Action Types
const ACTION_TYPES = {
  // UI State
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_LOADING: 'SET_LOADING',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  
  // API Data State
  SET_SENSOR_DATA: 'SET_SENSOR_DATA',
  SET_HISTORY_DATA: 'SET_HISTORY_DATA',
  SET_CHART_DATA: 'SET_CHART_DATA',
  SET_STATISTICS: 'SET_STATISTICS',
  SET_DEVICES: 'SET_DEVICES',
  
  // System State  
  SET_BACKEND_STATUS: 'SET_BACKEND_STATUS',
  SET_MQTT_STATUS: 'SET_MQTT_STATUS',
  
  // Error State
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Auth State (chuẩn bị cho giai đoạn 6)
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT'
};

// Initial State
const initialState = {
  // UI State
  sidebarOpen: false,
  loading: {
    sensor: false,
    history: false,
    chart: false,
    stats: false,
    general: false
  },
  notifications: [],
  
  // Data State - now from real APIs
  sensorData: {
    latest: null,
    lastUpdate: null,
    isStale: true
  },
  historyData: {
    records: [],
    pagination: null,
    lastFetch: null
  },
  chartData: {
    data24h: [],
    data7d: [],
    currentPeriod: '24h',
    lastUpdate: null
  },
  statistics: {
    temperature: { avg: 0, min: 0, max: 0 },
    humidity: { avg: 0, min: 0, max: 0 },
    pressure: { avg: 0 },
    light: { avg: 0 },
    totalReadings: 0,
    period: '24h'
  },
  devices: {
    list: [],
    selected: null,
    totalDevices: 0
  },
  
  // System State
  backendStatus: {
    available: false,
    lastCheck: null,
    version: null,
    uptime: 0
  },
  mqttStatus: {
    connected: false,
    messagesReceived: 0,
    lastMessage: null
  },
  
  // Error State
  errors: {
    api: null,
    connection: null,
    general: null
  },
  
  // Auth integration will be handled by AuthContext
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };

    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.value
        }
      };

    case ACTION_TYPES.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now() + Math.random(),
          timestamp: new Date(),
          ...action.payload
        }]
      };

    case ACTION_TYPES.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload.id)
      };

    case ACTION_TYPES.SET_SENSOR_DATA:
      return {
        ...state,
        sensorData: {
          latest: action.payload.data,
          lastUpdate: new Date(),
          isStale: false
        }
      };

    case ACTION_TYPES.SET_HISTORY_DATA:
      return {
        ...state,
        historyData: {
          records: action.payload.records,
          pagination: action.payload.pagination,
          lastFetch: new Date()
        }
      };

    case ACTION_TYPES.SET_CHART_DATA:
      return {
        ...state,
        chartData: {
          ...state.chartData,
          [`data${action.payload.period}`]: action.payload.data,
          currentPeriod: action.payload.period,
          lastUpdate: new Date()
        }
      };

    case ACTION_TYPES.SET_STATISTICS:
      return {
        ...state,
        statistics: action.payload
      };

    case ACTION_TYPES.SET_DEVICES:
      return {
        ...state,
        devices: {
          list: action.payload.devices,
          selected: action.payload.selected || state.devices.selected,
          totalDevices: action.payload.totalDevices
        }
      };

    case ACTION_TYPES.SET_BACKEND_STATUS:
      return {
        ...state,
        backendStatus: {
          ...action.payload,
          lastCheck: new Date()
        }
      };

    case ACTION_TYPES.SET_MQTT_STATUS:
      return {
        ...state,
        mqttStatus: action.payload
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.type]: action.payload.error
        }
      };

    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.type]: null
        }
      };

    case ACTION_TYPES.SET_USER:
      return {
        ...state,
        user: action.payload
      };

    case ACTION_TYPES.LOGOUT:
      return {
        ...state,
        user: {
          isAuthenticated: false,
          username: null,
          role: null,
          permissions: {}
        }
      };

    default:
      return state;
  }
}

// Context Provider Component
export const AppContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isAuthenticated, user, isInitialized } = useAuth();

  /**
   * UTILITY FUNCTIONS
   */
  
  const addNotification = useCallback((notification) => {
    dispatch({
      type: ACTION_TYPES.ADD_NOTIFICATION,
      payload: notification
    });

    // Auto remove after 5 seconds
    if (notification.autoRemove !== false) {
      setTimeout(() => {
        dispatch({
          type: ACTION_TYPES.REMOVE_NOTIFICATION,
          payload: { id: notification.id }
        });
      }, 5000);
    }
  }, []);

  const setLoading = useCallback((type, value) => {
    dispatch({
      type: ACTION_TYPES.SET_LOADING,
      payload: { type, value }
    });
  }, []);

  const setError = useCallback((type, error) => {
    dispatch({
      type: ACTION_TYPES.SET_ERROR,
      payload: { type, error }
    });
    
    // Show error notification
    addNotification({
      type: 'error',
      title: 'Lỗi API',
      message: error?.message || 'Đã xảy ra lỗi không xác định'
    });
  }, [addNotification]);

  const clearError = useCallback((type) => {
    dispatch({
      type: ACTION_TYPES.CLEAR_ERROR,
      payload: { type }
    });
  }, []);

  /**
   * API FUNCTIONS - thay thế mock data
   */

  // Fetch latest sensor data
  const fetchLatestSensorData = useCallback(async (deviceId = null) => {
    setLoading('sensor', true);
    clearError('api');
    
    try {
      const result = await apiService.sensor.getLatestData(deviceId);
      
      if (result.success) {
        dispatch({
          type: ACTION_TYPES.SET_SENSOR_DATA,
          payload: { data: result.data }
        });
        
        addNotification({
          type: 'success',
          title: 'Dữ liệu cập nhật',
          message: `Nhiệt độ: ${result.data.temperature}°C, Độ ẩm: ${result.data.humidity}%`
        });
        
        return result.data;
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setError('api', error);
      return null;
    } finally {
      setLoading('sensor', false);
    }
  }, [addNotification, setLoading, setError, clearError]);

  // Fetch history data
  const fetchHistoryData = useCallback(async (options = {}) => {
    setLoading('history', true);
    clearError('api');
    
    try {
      const result = await apiService.sensor.getHistoryData(options);
      
      if (result.success) {
        dispatch({
          type: ACTION_TYPES.SET_HISTORY_DATA,
          payload: {
            records: result.records,
            pagination: result.pagination
          }
        });
        
        return result;
      }
    } catch (error) {
      console.error('Error fetching history data:', error);
      setError('api', error);
      return null;
    } finally {
      setLoading('history', false);
    }
  }, [setLoading, setError, clearError]);

  // Fetch chart data
  const fetchChartData = useCallback(async (period = '24h', deviceId = null) => {
    setLoading('chart', true);
    clearError('api');
    
    try {
      let result;
      if (period === '24h') {
        result = await apiService.chart.getChartData24h(deviceId);
      } else if (period === '7d') {
        result = await apiService.chart.getChartData7d(deviceId);
      }
      
      if (result && result.success) {
        dispatch({
          type: ACTION_TYPES.SET_CHART_DATA,
          payload: {
            data: result.data,
            period: result.period
          }
        });
        
        return result.data;
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setError('api', error);
      return null;
    } finally {
      setLoading('chart', false);
    }
  }, [setLoading, setError, clearError]);

  // Fetch statistics
  const fetchStatistics = useCallback(async (deviceId = null, period = '24h') => {
    setLoading('stats', true);
    clearError('api');
    
    try {
      const result = await apiService.sensor.getStats(deviceId, period);
      
      if (result.success) {
        dispatch({
          type: ACTION_TYPES.SET_STATISTICS,
          payload: {
            ...result.statistics,
            period: result.period
          }
        });
        
        return result.statistics;
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('api', error);
      return null;
    } finally {
      setLoading('stats', false);
    }
  }, [setLoading, setError, clearError]);

  // Fetch devices
  const fetchDevices = useCallback(async () => {
    try {
      const result = await apiService.sensor.getDevices();
      
      if (result.success) {
        dispatch({
          type: ACTION_TYPES.SET_DEVICES,
          payload: {
            devices: result.devices,
            totalDevices: result.totalDevices
          }
        });
        
        return result.devices;
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError('api', error);
      return [];
    }
  }, [setError]);

  // Check backend status
  const checkBackendStatus = useCallback(async () => {
    try {
      const [healthResult, infoResult] = await Promise.allSettled([
        apiService.system.healthCheck(),
        apiService.system.getServerInfo()
      ]);
      
      const available = healthResult.status === 'fulfilled' && healthResult.value.success;
      const serverInfo = infoResult.status === 'fulfilled' ? infoResult.value : {};
      
      dispatch({
        type: ACTION_TYPES.SET_BACKEND_STATUS,
        payload: {
          available,
          version: serverInfo.version,
          uptime: serverInfo.uptime
        }
      });
      
      return available;
    } catch (error) {
      console.error('Error checking backend status:', error);
      dispatch({
        type: ACTION_TYPES.SET_BACKEND_STATUS,
        payload: {
          available: false,
          version: null,
          uptime: 0
        }
      });
      return false;
    }
  }, []);

  // Check MQTT status
  const checkMQTTStatus = useCallback(async () => {
    try {
      const result = await apiService.sensor.getMQTTStatus();
      
      if (result.success) {
        dispatch({
          type: ACTION_TYPES.SET_MQTT_STATUS,
          payload: {
            connected: result.mqtt.isConnected,
            messagesReceived: result.mqtt.messagesReceived,
            lastMessage: result.mqtt.lastMessageTime
          }
        });
        
        return result.mqtt;
      }
    } catch (error) {
      console.error('Error checking MQTT status:', error);
      dispatch({
        type: ACTION_TYPES.SET_MQTT_STATUS,
        payload: {
          connected: false,
          messagesReceived: 0,
          lastMessage: null
        }
      });
      return null;
    }
  }, []);

  // Create sensor data (for testing)
  const createSensorData = useCallback(async (sensorData) => {
    try {
      const result = await apiService.sensor.createSensorData(sensorData);
      
      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Tạo dữ liệu thành công',
          message: result.message
        });
        
        // Refresh latest data
        fetchLatestSensorData();
        
        return result.data;
      }
    } catch (error) {
      console.error('Error creating sensor data:', error);
      setError('api', error);
      return null;
    }
  }, [addNotification, setError, fetchLatestSensorData]);

  /**
   * INITIALIZATION EFFECT - only run when user is authenticated
   */
  useEffect(() => {
    // Don't initialize app data until auth is ready and user is authenticated
    if (!isInitialized || !isAuthenticated) return;

    const initializeApp = async () => {
      setLoading('general', true);
      
      try {
        // Check backend availability first
        const backendAvailable = await checkBackendStatus();
        
        if (backendAvailable) {
          // Fetch initial data in parallel
          await Promise.allSettled([
            fetchDevices(),
            fetchLatestSensorData(),
            fetchChartData('24h'),
            fetchStatistics(),
            checkMQTTStatus()
          ]);
          
          addNotification({
            type: 'success',
            title: 'Kết nối thành công',
            message: `Chào mừng ${user?.username || 'bạn'}! Backend APIs đã sẵn sàng`
          });
        } else {
          addNotification({
            type: 'warning',
            title: 'Backend không khả dụ',
            message: 'Vui lòng kiểm tra server backend.',
            autoRemove: false
          });
        }
      } catch (error) {
        console.error('App initialization error:', error);
        
        if (error.response?.status === 401) {
          addNotification({
            type: 'error',
            title: 'Lỗi xác thực',
            message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
            autoRemove: false
          });
        } else {
          addNotification({
            type: 'error',
            title: 'Lỗi khởi tạo ứng dụng',
            message: 'Không thể tải dữ liệu ban đầu',
            autoRemove: false
          });
        }
      } finally {
        setLoading('general', false);
      }
    };

    initializeApp();
  }, [isInitialized, isAuthenticated, user?.username]);

  /**
   * AUTO-REFRESH EFFECT
   */
  useEffect(() => {
    // Auto refresh data every 30 seconds if backend is available
    const interval = setInterval(async () => {
      if (state.backendStatus.available && !Object.values(state.loading).some(loading => loading)) {
        try {
          await fetchLatestSensorData(state.devices.selected);
          await checkMQTTStatus();
        } catch (error) {
          console.error('Auto refresh error:', error);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [state.backendStatus.available, state.devices.selected, state.loading, fetchLatestSensorData, checkMQTTStatus]);

  /**
   * CONTEXT VALUE
   */
  const contextValue = {
    // State
    ...state,
    
    // UI Actions
    toggleSidebar: () => dispatch({ type: ACTION_TYPES.TOGGLE_SIDEBAR }),
    addNotification,
    removeNotification: (id) => dispatch({ 
      type: ACTION_TYPES.REMOVE_NOTIFICATION, 
      payload: { id } 
    }),
    
    // API Actions
    fetchLatestSensorData,
    fetchHistoryData,
    fetchChartData,
    fetchStatistics,
    fetchDevices,
    createSensorData,
    
    // System Actions
    checkBackendStatus,
    checkMQTTStatus,
    
    // Device Selection
    selectDevice: (deviceId) => dispatch({
      type: ACTION_TYPES.SET_DEVICES,
      payload: {
        ...state.devices,
        selected: deviceId
      }
    }),
    
    // Chart Period
    setChartPeriod: (period) => {
      fetchChartData(period, state.devices.selected);
    },
    
    // Error Handling
    setError,
    clearError,
    
    // Auth integration with AuthContext
    isAuthenticated,
    currentUser: user
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

export default AppContext;
