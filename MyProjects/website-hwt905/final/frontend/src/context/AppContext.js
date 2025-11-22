/**
 * GIAI ĐOẠN 3: APP CONTEXT - Chuyển từ global state object sang React Context
 * Chương 6: React Context API
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useIMUData, useNotifications } from '../hooks/useSocket';

// Initial State - Chuyển từ stage2 state object
const initialState = {
  // UI State
  sidebarOpen: false,
  loading: false,
  
  // Connection State  
  connectionStatus: 'online', // 'online' | 'offline' | 'connecting'
  lastUpdateTime: new Date(),
  
  // Data State - IMU hwt905 parameters for SHM với tần số đặc trưng
  sensorData: {
    totalAcceleration: { min: 0, max: 20, current: 1.2, trend: 'neutral', unit: 'm/s²', status: 'stable' },
    tiltAngle: { min: 0, max: 45, current: 2.3, trend: 'positive', unit: '°', status: 'normal' },
    vibrationIntensity: { min: 0, max: 100, current: 15.7, trend: 'negative', unit: 'mm/s', status: 'low' },
    structuralDisplacement: { min: 0, max: 50, current: 3.1, trend: 'neutral', unit: 'mm', status: 'safe' },
    dominantFrequency: { min: 0, max: 50, current: 1.75, trend: 'neutral', unit: 'Hz', status: 'normal' }
  },
  
  // Chart State
  currentTimeRange: '24h',
  chartData: [],
  
  // Table State
  currentPage: 1,
  totalPages: 250,
  pageLimit: 20,
  tableData: [],
  
  // Notifications
  notifications: []
};

// Action Types
const ActionTypes = {
  // UI Actions
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_LOADING: 'SET_LOADING',
  
  // Connection Actions
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  UPDATE_LAST_UPDATE_TIME: 'UPDATE_LAST_UPDATE_TIME',
  
  // Data Actions
  UPDATE_SENSOR_DATA: 'UPDATE_SENSOR_DATA',
  SET_CHART_DATA: 'SET_CHART_DATA',
  SET_TIME_RANGE: 'SET_TIME_RANGE',
  
  // Table Actions
  SET_TABLE_DATA: 'SET_TABLE_DATA',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_PAGE_LIMIT: 'SET_PAGE_LIMIT',
  
  // Notification Actions
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION'
};

// Reducer Function - Thay thế cho state mutations trong stage2
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case ActionTypes.SET_CONNECTION_STATUS:
      return {
        ...state,
        connectionStatus: action.payload
      };
      
    case ActionTypes.UPDATE_LAST_UPDATE_TIME:
      return {
        ...state,
        lastUpdateTime: new Date()
      };
      
    case ActionTypes.UPDATE_SENSOR_DATA:
      return {
        ...state,
        sensorData: {
          ...state.sensorData,
          ...action.payload
        }
      };
      
    case ActionTypes.SET_CHART_DATA:
      return {
        ...state,
        chartData: action.payload
      };
      
    case ActionTypes.SET_TIME_RANGE:
      return {
        ...state,
        currentTimeRange: action.payload
      };
      
    case ActionTypes.SET_TABLE_DATA:
      return {
        ...state,
        tableData: action.payload
      };
      
    case ActionTypes.SET_CURRENT_PAGE:
      return {
        ...state,
        currentPage: action.payload
      };
      
    case ActionTypes.SET_PAGE_LIMIT:
      return {
        ...state,
        pageLimit: action.payload,
        currentPage: 1 // Reset to first page
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    default:
      return state;
  }
}

// Create Context
const AppContext = createContext();

// Context Provider Component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Helper function to check authentication
  const checkAuth = () => {
    try {
      const token = localStorage.getItem('sensor_dashboard_token');
      return !!token;
    } catch {
      return false;
    }
  };
  
  // Data Actions - Define before useEffect
  const updateSensorData = () => {
    // Fallback function for manual updates when no real-time data
    // Only update if authenticated and no real-time connection
    try {
      const token = localStorage.getItem('sensor_dashboard_token');
      if (!token || isConnected) {
        return; // Don't update if not authenticated or real-time is available
      }
    } catch {
      return;
    }
    
    const newData = {};
    
    Object.keys(state.sensorData).forEach(key => {
      const { min, max } = state.sensorData[key];
      const newValue = parseFloat((Math.random() * (max - min) + min).toFixed(1));
      const trends = ['positive', 'negative', 'neutral'];
      const newTrend = trends[Math.floor(Math.random() * trends.length)];
      
      // Determine status based on value ranges for SHM
      let status = 'normal';
      if (key === 'totalAcceleration') {
        status = newValue > 15 ? 'high' : newValue > 5 ? 'medium' : 'stable';
      } else if (key === 'tiltAngle') {
        status = newValue > 30 ? 'critical' : newValue > 10 ? 'warning' : 'normal';
      } else if (key === 'vibrationIntensity') {
        status = newValue > 80 ? 'high' : newValue > 40 ? 'medium' : 'low';
      } else if (key === 'structuralDisplacement') {
        status = newValue > 40 ? 'critical' : newValue > 20 ? 'warning' : 'safe';
      } else if (key === 'dominantFrequency') {
        status = newValue > 20 ? 'high' : newValue > 5 ? 'medium' : 'normal';
      }
      
      newData[key] = {
        ...state.sensorData[key],
        current: newValue,
        trend: newTrend,
        status: status
      };
    });
    
    dispatch({ type: ActionTypes.UPDATE_SENSOR_DATA, payload: newData });
    dispatch({ type: ActionTypes.UPDATE_LAST_UPDATE_TIME });
    
    // Show notification (will check auth internally)
    showNotification('Dữ liệu đã được cập nhật (mô phỏng)', 'info');
  };
  
  // Connection Actions - Now managed by WebSocket connection
  const updateConnectionStatus = () => {
    // Connection status is now managed by WebSocket connection state
    // This function is kept for backward compatibility
    console.log('Connection status managed by WebSocket');
  };
  
  // Notification Actions - Define before useEffect
  const showNotification = (message, type = 'info', duration = 3000) => {
    // Only show notifications if user is authenticated
    try {
      const token = localStorage.getItem('sensor_dashboard_token');
      if (!token) {
        return; // Don't show notifications if not authenticated
      }
    } catch {
      return; // Don't show notifications if localStorage is not available
    }
    
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      timestamp: new Date()
    };
    
    dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
    
    // Auto remove
    setTimeout(() => {
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
    }, duration);
  };
  
  // Real-time data integration với WebSocket
  const { shmData, imuData, isConnected } = useIMUData('hwt905-device'); // Default device ID
  const { notifications } = useNotifications();
  
  // Update sensor data when real-time data arrives
  useEffect(() => {
    if (shmData && checkAuth()) {
      const newData = {
        totalAcceleration: {
          ...state.sensorData.totalAcceleration,
          current: shmData.totalAcceleration,
          trend: shmData.totalAcceleration > state.sensorData.totalAcceleration.current ? 'positive' : 
                 shmData.totalAcceleration < state.sensorData.totalAcceleration.current ? 'negative' : 'neutral',
          status: shmData.totalAcceleration > 15 ? 'high' : shmData.totalAcceleration > 5 ? 'medium' : 'stable'
        },
        tiltAngle: {
          ...state.sensorData.tiltAngle,
          current: shmData.tiltAngle,
          trend: shmData.tiltAngle > state.sensorData.tiltAngle.current ? 'positive' : 
                 shmData.tiltAngle < state.sensorData.tiltAngle.current ? 'negative' : 'neutral',
          status: shmData.tiltAngle > 30 ? 'critical' : shmData.tiltAngle > 10 ? 'warning' : 'normal'
        },
          vibrationIntensity: {
            ...state.sensorData.vibrationIntensity,
            current: shmData.vibrationIntensity,
            trend: shmData.vibrationIntensity > state.sensorData.vibrationIntensity.current ? 'positive' : 
                   shmData.vibrationIntensity < state.sensorData.vibrationIntensity.current ? 'negative' : 'neutral',
            status: shmData.vibrationIntensity > 80 ? 'high' : shmData.vibrationIntensity > 40 ? 'medium' : 'low'
          },
          structuralDisplacement: {
            ...state.sensorData.structuralDisplacement,
            current: shmData.structuralDisplacement,
            trend: shmData.structuralDisplacement > state.sensorData.structuralDisplacement.current ? 'positive' : 
                   shmData.structuralDisplacement < state.sensorData.structuralDisplacement.current ? 'negative' : 'neutral',
            status: shmData.structuralDisplacement > 40 ? 'critical' : shmData.structuralDisplacement > 20 ? 'warning' : 'safe'
          },
          dominantFrequency: {
            ...state.sensorData.dominantFrequency,
            current: shmData.dominantFrequency || 0,
            trend: shmData.dominantFrequency > state.sensorData.dominantFrequency.current ? 'positive' : 
                   shmData.dominantFrequency < state.sensorData.dominantFrequency.current ? 'negative' : 'neutral',
            status: shmData.dominantFrequency > 20 ? 'high' : shmData.dominantFrequency > 5 ? 'medium' : 'normal'
          }
      };
      
      dispatch({ type: ActionTypes.UPDATE_SENSOR_DATA, payload: newData });
      dispatch({ type: ActionTypes.UPDATE_LAST_UPDATE_TIME });
    }
  }, [shmData]);
  
  // Update connection status based on WebSocket connection
  useEffect(() => {
    const status = isConnected ? 'online' : 'offline';
    if (status !== state.connectionStatus) {
      dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: status });
    }
  }, [isConnected]);
  
  // Handle real-time notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      if (latestNotification && !latestNotification.read) {
        showNotification(latestNotification.message, latestNotification.type || 'info');
      }
    }
  }, [notifications]);
  
  // Action Creators - Chuyển từ stage2 functions thành React actions
  
  // UI Actions
  const toggleSidebar = () => {
    dispatch({ type: ActionTypes.TOGGLE_SIDEBAR });
  };
  
  const setLoading = (loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  };
  
  const setTimeRange = (range) => {
    dispatch({ type: ActionTypes.SET_TIME_RANGE, payload: range });
    
    // Simulate loading chart data
    generateChartData(range);
    showNotification(`Chuyển sang biểu đồ ${range}`, 'info');
  };
  
  const generateChartData = (range) => {
    const dataPoints = range === '24h' ? 24 : range === '7d' ? 7 : 30;
    const chartData = [];
    
    for (let i = dataPoints; i > 0; i--) {
      const timestamp = new Date();
      if (range === '24h') {
        timestamp.setHours(timestamp.getHours() - i);
      } else if (range === '7d') {
        timestamp.setDate(timestamp.getDate() - i);
      } else {
        timestamp.setDate(timestamp.getDate() - i);
      }
      
      chartData.push({
        time: timestamp,
        // Chỉ lưu dữ liệu chuyển vị cho biểu đồ
        structuralDisplacement: parseFloat((Math.random() * 50).toFixed(1)),
        displacementMagnitude: parseFloat((Math.random() * 0.0001).toFixed(8)), // Đơn vị mm
        // Thêm các thành phần chuyển vị
        disp_x: parseFloat((Math.random() * 0.00005 - 0.000025).toFixed(9)),
        disp_y: parseFloat((Math.random() * 0.00005 - 0.000025).toFixed(9)),
        disp_z: parseFloat((Math.random() * 0.00005 - 0.000025).toFixed(9))
      });
    }
    
    dispatch({ type: ActionTypes.SET_CHART_DATA, payload: chartData });
  };
  
  // Table Actions
  const setCurrentPage = (page) => {
    if (page >= 1 && page <= state.totalPages) {
      dispatch({ type: ActionTypes.SET_CURRENT_PAGE, payload: page });
      showNotification(`Chuyển đến trang ${page}`, 'info');
    }
  };
  
  const setPageLimit = (limit) => {
    dispatch({ type: ActionTypes.SET_PAGE_LIMIT, payload: parseInt(limit) });
    showNotification(`Hiển thị ${limit} dòng mỗi trang`, 'info');
  };
  
  const removeNotification = (id) => {
    dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
  };
  
  // Refresh Action - Chuyển từ stage2 handleRefresh
  const refreshData = async () => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update all data
      updateSensorData();
      generateChartData(state.currentTimeRange);
      
      showNotification('Dữ liệu đã được làm mới', 'success');
    } catch (error) {
      showNotification('Lỗi khi làm mới dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Context value
  const value = {
    // State
    ...state,
    
    // UI Actions
    toggleSidebar,
    setLoading,
    
    // Data Actions  
    updateSensorData,
    setTimeRange,
    generateChartData,
    refreshData,
    
    // Table Actions
    setCurrentPage,
    setPageLimit,
    
    // Connection Actions
    updateConnectionStatus,
    
    // Notification Actions
    showNotification,
    removeNotification
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
